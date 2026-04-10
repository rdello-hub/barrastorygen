import './index.css';
import { useRef, useState, useEffect } from 'react';
import { LAYOUTS, DEFAULT_STATE } from './presets.js';
import { useStoryState } from './useStoryState.js';
import StoryCanvas, { HighlightToolbar } from './components/StoryCanvas.jsx';
import LeftSidebar from './components/LeftSidebar.jsx';
import RightSidebar from './components/RightSidebar.jsx';
import TopBar, { exportToPng } from './components/TopBar.jsx';

export default function App() {
  const canvasRef   = useRef(null);
  const stageRef    = useRef(null);
  const scaleRef    = useRef(null);
  const [scale, setScale]             = useState(0.5);
  const [activeField, setActiveField] = useState(null);
  const [isDragging, setIsDragging]   = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState('layout');

  const {
    state,
    update,
    setContent,
    setFieldHtml,
    setLayout,
    setTemplate,
    setBg,
    setViewMode,
    addBullet,
    removeBullet,
    setBullet,
    setBulletDesc,
    setImageBox,
    setSize,
    setCustomLogo,
    setAiProp,
    saved,
  } = useStoryState(DEFAULT_STATE);

  const layout = LAYOUTS.find((l) => l.id === state.layoutId) || LAYOUTS[0];

  // ── Field change: routes canvas edits to correct state updater ──────
  function handleFieldChange(field, value, html) {
    if (field.startsWith('bulletDesc_')) {
      const idx = parseInt(field.split('_')[1], 10);
      setBulletDesc(idx, value);
      if (html) setFieldHtml(field, html);
    } else if (field.startsWith('bullet_')) {
      const idx = parseInt(field.split('_')[1], 10);
      setBullet(idx, value);
      if (html) setFieldHtml(`bullet_${idx}`, html);
    } else {
      setContent(field, value);
      if (html) setFieldHtml(field, html);
    }
  }

  // ── Global Drag & Drop + Paste ──────────────────────────────────────
  useEffect(() => {
    function handlePaste(e) {
      if (!e.clipboardData) return;
      const file = Array.from(e.clipboardData.items).find(item => item.type.startsWith('image/'))?.getAsFile();
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => setImageBox({ src: ev.target.result });
        reader.readAsDataURL(file);
      }
    }

    function handleDragOver(e) {
      e.preventDefault();
      setIsDragging(true);
    }

    function handleDragLeave(e) {
      e.preventDefault();
      if (e.clientX === 0 || e.clientY === 0) setIsDragging(false);
    }

    function handleDrop(e) {
      e.preventDefault();
      setIsDragging(false);
      if (!e.dataTransfer) return;
      const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'));
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => setImageBox({ src: ev.target.result });
        reader.readAsDataURL(file);
      }
    }

    window.addEventListener('paste', handlePaste);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [setImageBox]);

  // ── Canvas scale: fit 1080×1920 into available stage area ──────────
  useEffect(() => {
    function computeScale() {
      if (!stageRef.current) return;
      const { width, height } = stageRef.current.getBoundingClientRect();
      const scaleX = width  / 1080;
      const scaleY = height / 1920;
      setScale(Math.min(scaleX, scaleY) * 0.93);
    }
    computeScale();
    const ro = new ResizeObserver(computeScale);
    if (stageRef.current) ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, [state.viewMode]);

  // ── Reset to layout defaults ────────────────────────────────────────
  function handleReset() {
    update(() => ({ ...DEFAULT_STATE, layoutId: state.layoutId, content: layout.defaultContent }));
  }

  // ── AI Auto-Parse Logic ─────────────────────────────────────────────
  function handleAutoParse(rawText) {
    if (!rawText.trim()) return;

    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return;

    const newContent = { ...state.content };
    const bullets = [];

    newContent.title = lines[0];
    let startIdx = 1;

    if (lines[1] && lines[1].length < 100 && !lines[1].match(/^[-•*]/)) {
      newContent.subtitle = lines[1];
      startIdx = 2;
    }

    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i];
      if (line.match(/^[-•*]/)) {
        bullets.push(line.replace(/^[-•*]\s*/, ''));
      } else if (!newContent.paragraph1) {
        newContent.paragraph1 = line;
      } else if (!newContent.paragraph2) {
        newContent.paragraph2 = line;
      }
    }

    if (bullets.length > 0) {
      newContent.bullets = bullets;
      newContent.bulletsDesc = bullets.map(() => '');
    }

    let bestLayoutId = state.layoutId;
    const hasImage = !!state.imageBox?.src;

    if (bullets.length >= 2) {
      bestLayoutId = hasImage ? 'bullets_img' : 'bullets_para';
    } else if (newContent.paragraph2) {
      bestLayoutId = 'text_only';
    } else if (newContent.paragraph1) {
      bestLayoutId = hasImage ? 'img_text' : 'bullets_para';
    } else if (newContent.title && newContent.subtitle) {
      bestLayoutId = 'hook';
    }

    update(prev => ({
      ...prev,
      layoutId: bestLayoutId,
      content: { ...prev.content, ...newContent },
      contentHtml: {},
    }));
  }

  // ── Export ──────────────────────────────────────────────────────────
  async function handleExportDownload() {
    setIsExporting(true);
    try {
      await exportToPng(canvasRef, { forceDownload: true });
    } catch (err) {
      console.error("Export failed:", err);
      alert("Si è verificato un errore durante l'esportazione. Riprova.");
    } finally {
      setIsExporting(false);
    }
  }

  async function handleExportShare() {
    setIsExporting(true);
    try {
      await exportToPng(canvasRef, { forceDownload: false });
    } catch (err) {
      console.error("Export failed:", err);
      alert("Si è verificato un errore durante l'esportazione. Riprova.");
    } finally {
      setIsExporting(false);
    }
  }

  // ── Derived view flags ──────────────────────────────────────────────
  const vm = state.viewMode || 'split';
  const showLeft   = vm !== 'preview';
  const showRight  = vm !== 'preview';
  const sidebarsOn = vm === 'split' || vm === 'editor';

  return (
    <div className={`app-container layout-${vm}`}>

      {/* ── HIGHLIGHT TOOLBAR (floats over canvas selection) ──────── */}
      <HighlightToolbar />

      {/* ── DRAG OVERLAY ────────────────────────────────────────── */}
      {isDragging && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(39,80,158,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)',
          border: '6px dashed var(--yellow)',
          pointerEvents: 'none',
        }}>
          <div style={{ textAlign: 'center', transform: 'translateY(-20px)' }}>
            <div style={{ fontSize: 100, marginBottom: 20 }}>📥</div>
            <h2 style={{ color: 'white', fontSize: 40, fontWeight: 800, fontFamily: 'var(--font)' }}>Rilascia l'immagine qui</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 20, marginTop: 12, fontFamily: 'var(--font)' }}>
              Verrà inserita nel box immagine del layout!
            </p>
          </div>
        </div>
      )}

      {/* ── TOP BAR ─────────────────────────────────────────────── */}
      <div style={{ gridColumn: '1 / -1' }}>
        <TopBar
          saved={saved}
          viewMode={vm}
          onViewMode={setViewMode}
          onExportShare={handleExportShare}
          onExportDownload={handleExportDownload}
          onReset={handleReset}
        />
      </div>

      {/* ── LEFT SIDEBAR ────────────────────────────────────────── */}
      {showLeft && sidebarsOn && (
        <div className="sidebar-container" style={{ display: 'contents' }}>
          {(activeMobileTab === 'layout' || activeMobileTab === 'design' || activeMobileTab === 'image' || activeMobileTab === 'ai') && (
            <LeftSidebar
              state={state}
              setLayout={setLayout}
              setTemplate={setTemplate}
              setBg={setBg}
              setImageBox={setImageBox}
              setCustomLogo={setCustomLogo}
              setAiProp={setAiProp}
              setContent={setContent}
              onAutoParse={handleAutoParse}
              activeTabOverride={activeMobileTab === 'ai' ? 'copilot' : activeMobileTab === 'design' ? 'design' : activeMobileTab === 'image' ? 'image' : 'layout'}
            />
          )}
        </div>
      )}

      {/* ── CANVAS STAGE ────────────────────────────────────────── */}
      <main
        ref={stageRef}
        className="canvas-stage"
        style={{ gridColumn: vm === 'preview' ? '1' : undefined, position: 'relative' }}
      >
        {isExporting && (
          <div style={{
            position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
            background: 'var(--yellow)', color: 'var(--bg)', padding: '8px 16px', borderRadius: 20,
            fontSize: 14, fontWeight: 700, zIndex: 1000, boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
          }}>
            ⏳ Preparazione immagine in corso...
          </div>
        )}
        <div style={{
          width:  1080 * scale,
          height: 1920 * scale,
          boxShadow: '0 40px 100px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.07)',
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
          flexShrink: 0,
        }}>
          <div
            ref={scaleRef}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              width:  1080,
              height: 1920,
            }}
          >
            <StoryCanvas
              ref={canvasRef}
              state={state}
              layout={layout}
              onFieldChange={handleFieldChange}
              activeField={activeField}
              setActiveField={setActiveField}
            />
          </div>
        </div>
        <span style={{
          position: 'absolute', bottom: 12, right: 16,
          fontSize: 10, color: 'var(--white-60)', letterSpacing: '0.06em',
          pointerEvents: 'none',
        }}>
          {Math.round(scale * 100)}%
        </span>
      </main>

      {/* ── RIGHT SIDEBAR ───────────────────────────────────────── */}
      {(showRight && vm === 'split') || (activeMobileTab === 'content') ? (
        <RightSidebar
          state={state}
          setContent={setContent}
          setSize={setSize}
          addBullet={addBullet}
          removeBullet={removeBullet}
          setBullet={setBullet}
          setBulletDesc={setBulletDesc}
        />
      ) : null}

      {/* ── MOBILE NAV ──────────────────────────────────────────── */}
      <nav className="mobile-nav">
        <MobileNavItem
          active={activeMobileTab === 'layout'}
          onClick={() => setActiveMobileTab('layout')}
          icon="📐" label="Layout"
        />
        <MobileNavItem
          active={activeMobileTab === 'content'}
          onClick={() => setActiveMobileTab('content')}
          icon="📝" label="Testo"
        />
        <MobileNavItem
          active={activeMobileTab === 'design'}
          onClick={() => setActiveMobileTab('design')}
          icon="🎨" label="Design"
        />
        <MobileNavItem
          active={activeMobileTab === 'image'}
          onClick={() => setActiveMobileTab('image')}
          icon="🖼️" label="Image"
        />
        <MobileNavItem
          active={activeMobileTab === 'ai'}
          onClick={() => setActiveMobileTab('ai')}
          icon="🤖" label="AI"
        />
      </nav>
    </div>
  );
}

function MobileNavItem({ active, icon, label, onClick }) {
  return (
    <button className={`mobile-nav-item ${active ? 'active' : ''}`} onClick={onClick}>
      <span className="mobile-nav-icon">{icon}</span>
      <span className="mobile-nav-label">{label}</span>
    </button>
  );
}
