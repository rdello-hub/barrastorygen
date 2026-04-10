import { toBlob, toPng } from 'html-to-image';

export default function TopBar({ saved, viewMode, onViewMode, onExportShare, onExportDownload, onReset }) {
  return (
    <header className="topbar">
      {/* Brand */}
      <div className="topbar-brand">
        <span className="brand-full">Story<span>Studio</span></span>
        <span className="brand-mini">S<span>S</span></span>
        <span className="topbar-subtitle">
          Instagram Stories Builder
        </span>
      </div>

      {/* View mode toggle */}
      <div className="view-mode-toggle" style={{
        display: 'flex',
        background: 'var(--white-10)',
        border: '1px solid var(--white-20)',
        borderRadius: 8,
        overflow: 'hidden',
        gap: 0,
      }}>
        {[
          { id: 'editor', label: 'Editor' },
          { id: 'split',  label: 'Split' },
          { id: 'preview', label: 'Preview' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onViewMode(id)}
            style={{
              padding: '7px 16px',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'var(--font)',
              letterSpacing: '0.03em',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s',
              background: viewMode === id ? 'var(--blue)' : 'transparent',
              color: viewMode === id ? '#ffffff' : 'var(--white-60)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="topbar-actions">
        <span className={`save-indicator ${saved ? 'saved' : ''}`}>
          {saved ? '✓ Salvato' : 'Salvataggio…'}
        </span>
        <div style={{ width: 1, height: 22, background: 'var(--white-20)', margin: '0 6px' }} />
        <button className="btn btn-secondary topbar-reset-btn" onClick={onReset} title="Reset">
          <span className="btn-text">↺ Reset</span>
          <span className="btn-icon-only">↺</span>
        </button>
        <button className="btn btn-secondary" onClick={onExportDownload} id="btn-export-download">
          <span className="btn-text">↓ Download PNG</span>
          <span className="btn-icon-only">↓ PNG</span>
        </button>
        <button className="btn btn-primary" onClick={onExportShare} id="btn-export-png">
          <span className="btn-text">📱 Save to iPhone</span>
          <span className="btn-icon-only">📱 Salva</span>
        </button>
      </div>
    </header>
  );
}

/* ── Export function ────────────────────────────────────────────────── */
export async function exportToPng(canvasRef, { forceDownload = false } = {}) {
  const node = canvasRef.current;
  if (!node) return;
  
  // Temporarily reset parent transform for full-resolution bounds check
  const parent = node.parentElement;
  const savedTransform = parent?.style.transform || '';
  const savedWidth = parent?.style.width || '';
  const savedHeight = parent?.style.height || '';
  if (parent) {
    parent.style.transform = 'scale(1)';
    parent.style.width = '1080px';
    parent.style.height = '1920px';
  }

  try {
    // Wait for fonts to be ready
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    // Give browser a moment to apply layout changes
    await new Promise(r => setTimeout(r, 200));

    // iOS/Mobile Fix: First render is buggy because Safari unloads canvas elements, run dry-run
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      await toBlob(node, { width: 1080, height: 1920, pixelRatio: 1, style: { transform: 'none' } }).catch(() => {});
      await new Promise(r => setTimeout(r, 100)); // allow render frame
    }

    // Hide "guide" overlays that are only for editor reference (baked into bg template)
    const guideEls = node.querySelectorAll('[data-export-hide="true"]');
    guideEls.forEach(el => { el.style.opacity = '0'; });

    const dataUrl = await toPng(node, {
      pixelRatio: 2,
      width: 1080,
      height: 1920,
      style: {
        transform: 'none',
      }
    });

    if (!dataUrl) throw new Error("Generazione immagine fallita");

    // Convert dataUrl backwards to file for native sharing
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mime });

    const fileName = `story-${Date.now()}.png`;
    const file = new File([blob], fileName, { type: 'image/png' });

    // iOS/Mobile Primary Flow (skip if forceDownload is true)
    if (!forceDownload && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Instagram Story'
        });
        return; // Success, shared natively
      } catch (err) {
        // AbortError is thrown when user dismisses the share sheet
        if (err.name !== 'AbortError') {
          console.error("Native share failed, falling back to download", err);
        } else {
          return; // User cancelled
        }
      }
    }

    // Secondary Flow: Desktop or unsupported devices (or forceDownload)
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = fileName;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
  } finally {
    if (parent) {
      parent.style.transform = savedTransform;
      parent.style.width = savedWidth;
      parent.style.height = savedHeight;
    }
    // Restore guide overlays
    if (node) {
      node.querySelectorAll('[data-export-hide="true"]').forEach(el => {
        el.style.opacity = '';
      });
    }
  }
}
