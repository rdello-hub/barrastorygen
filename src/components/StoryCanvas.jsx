import React, { useRef, useLayoutEffect, useEffect, useState } from 'react';
import { TEMPLATES, BRAND } from '../presets.js';

// ─── HIGHLIGHT COLORS (high contrast vs Dark Navy / Royal Blue / Pale Yellow) ─
export const HIGHLIGHT_COLORS = [
  { name: 'Giallo Neon',   color: 'rgba(255,230,0,0.78)',   text: '#000' },
  { name: 'Corallo',       color: 'rgba(255,75,75,0.75)',    text: '#fff' },
  { name: 'Verde Menta',   color: 'rgba(40,215,155,0.72)',   text: '#000' },
  { name: 'Arancio',       color: 'rgba(255,145,20,0.80)',   text: '#000' },
  { name: 'Viola Neon',    color: 'rgba(195,75,255,0.75)',   text: '#fff' },
  { name: 'Azzurro',       color: 'rgba(20,185,255,0.72)',   text: '#000' },
  { name: 'Rimuovi',       color: 'transparent',             text: '#fff' },
];

/* ─────────────────────────────────────────────────────────────────────
   HIGHLIGHT TOOLBAR — floats at viewport coords when text is selected
───────────────────────────────────────────────────────────────────── */
export function HighlightToolbar() {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    function onSelectionChange() {
      const sel = document.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setVisible(false);
        return;
      }
      const range = sel.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const canvasEl = document.getElementById('story-canvas-export');
      if (!canvasEl || !canvasEl.contains(container)) {
        setVisible(false);
        return;
      }
      const rect = range.getBoundingClientRect();
      if (rect.width === 0) { setVisible(false); return; }
      setPos({ top: rect.top - 52, left: rect.left + rect.width / 2 });
      setVisible(true);
    }
    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, []);

  function applyHighlight(color) {
    if (color === 'transparent') {
      document.execCommand('removeFormat', false, null);
    } else {
      document.execCommand('hiliteColor', false, color);
    }
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        transform: 'translateX(-50%)',
        zIndex: 9999,
        background: '#0d1324',
        border: '1px solid rgba(255,255,255,0.18)',
        borderRadius: 10,
        padding: '6px 10px',
        display: 'flex',
        gap: 6,
        alignItems: 'center',
        boxShadow: '0 6px 24px rgba(0,0,0,0.6)',
        pointerEvents: 'auto',
      }}
    >
      <span style={{
        fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.45)',
        letterSpacing: '0.08em', textTransform: 'uppercase', marginRight: 4,
        fontFamily: 'Inter, sans-serif',
      }}>
        Evidenzia
      </span>
      {HIGHLIGHT_COLORS.map((c) => (
        <button
          key={c.name}
          title={c.name}
          onMouseDown={(e) => {
            e.preventDefault(); // keep text selection alive
            applyHighlight(c.color);
          }}
          style={{
            width: 26, height: 26,
            borderRadius: 5,
            border: c.color === 'transparent'
              ? '1.5px solid rgba(255,255,255,0.3)'
              : '1.5px solid rgba(0,0,0,0.2)',
            background: c.color === 'transparent' ? 'rgba(255,255,255,0.07)' : c.color,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, color: c.text, fontWeight: 800,
            fontFamily: 'Inter, sans-serif',
            transition: 'transform 0.1s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.18)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {c.color === 'transparent' ? '✕' : ''}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   BRAND HEADER
───────────────────────────────────────────────────────────────────── */
function BrandHeader({ color, mutedColor, customLogo }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
      paddingTop: 44, paddingBottom: 24, paddingLeft: 40, paddingRight: 40,
      flexShrink: 0,
      width: '100%',
    }}>
      {customLogo ? (
        <img src={customLogo} alt="Logo" style={{ height: 85, objectFit: 'contain', flexShrink: 0 }} />
      ) : (
        <div style={{
          width: 85, height: 85,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="25" y="80" fontSize="80" fontWeight="900" fontFamily="'Inter', sans-serif" fill={color} letterSpacing="-0.05em">R</text>
            <path d="M 15 85 A 45 45 0 0 0 95 55" stroke={color} strokeWidth="6" strokeLinecap="round" />
            <path d="M 85 50 L 98 55 L 90 65" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <span style={{
          fontSize: 42, fontWeight: 700, color,
          letterSpacing: '0.02em', textTransform: 'uppercase',
          lineHeight: 1, fontFamily: "'Inter', sans-serif",
        }}>RICCARDO DELL'ORLETTA</span>
        <span style={{
          fontSize: 18, fontWeight: 500, color: mutedColor,
          letterSpacing: '0.01em', fontFamily: "'Inter', sans-serif",
        }}>Consulente finanziario evoluto</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   BRAND FOOTER
───────────────────────────────────────────────────────────────────── */
function BrandFooter({ color, isDark }) {
  return (
    <div style={{
      paddingTop: 20, paddingBottom: 24, paddingLeft: 32, paddingRight: 32,
      flexShrink: 0,
      borderTop: `2px solid ${isDark ? '#f5ff85' : '#27509e'}`,
    }}>
      <p style={{
        fontSize: 18, fontWeight: 400, color, opacity: 0.8,
        lineHeight: 1.4, fontFamily: "'Inter', sans-serif", textAlign: 'center',
      }}>{BRAND.disclaimer}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   INLINE IMAGE BOX
───────────────────────────────────────────────────────────────────── */
function ImageBox({ imageBox }) {
  if (!imageBox?.src) return null;
  const widthPx = Math.round((imageBox.size / 100) * 1080);
  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', flexShrink: 0 }}>
      <img
        src={imageBox.src} alt="content"
        style={{
          width: widthPx, maxWidth: '100%', height: 'auto',
          borderRadius: imageBox.roundness ?? 12,
          objectFit: 'cover', display: 'block',
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   EDITABLE TEXT NODE — supports rich HTML (highlights)
   Uses a ref to imperatively set innerHTML, avoiding React re-render
   conflicts with contentEditable.
───────────────────────────────────────────────────────────────────── */
function EditableText({ field, style, placeholder, onFieldChange, setActiveField, activeField, content, contentHtml }) {
  const isActive = activeField === field;
  const ref = useRef(null);

  const plainText = content?.[field] || '';
  const richHtml = contentHtml?.[field] || plainText.replace(/\n/g, '<br>');

  // Only update DOM when NOT actively editing (avoids cursor jumps)
  useLayoutEffect(() => {
    if (ref.current && !isActive) {
      if (ref.current.innerHTML !== richHtml) {
        ref.current.innerHTML = richHtml;
      }
    }
  }, [richHtml, isActive, field]);

  return (
    <div
      ref={ref}
      contentEditable suppressContentEditableWarning
      style={{
        outline: 'none', cursor: 'text', borderRadius: 10,
        paddingTop: 6, paddingBottom: 6, paddingLeft: 10, paddingRight: 10,
        marginTop: -6, marginBottom: -6, marginLeft: -10, marginRight: -10,
        wordBreak: 'break-word', whiteSpace: 'pre-wrap',
        transition: 'box-shadow 0.15s', minHeight: '1em',
        boxShadow: isActive ? '0 0 0 3px rgba(245,255,133,0.4)' : undefined,
        ...style,
      }}
      onFocus={() => setActiveField(field)}
      onBlur={(e) => {
        const html = e.currentTarget.innerHTML;
        const text = e.currentTarget.innerText;
        onFieldChange(field, text, html);
        setActiveField(null);
      }}
      data-placeholder={placeholder}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────
   LAYOUT CONTENT RENDERER
───────────────────────────────────────────────────────────────────── */
function LayoutContent({ layout, state, tpl, onFieldChange, activeField, setActiveField }) {
  const { textColor, mutedColor, accentColor } = tpl;
  const { content, contentHtml, imageBox, sizes } = state;
  const s = sizes || {};

  // Helper for editable text with dynamic font size from state.sizes
  const T = (field, baseStyle, placeholder) => (
    <EditableText
      key={field} field={field}
      style={{ ...baseStyle, fontSize: s[field] || baseStyle.fontSize }}
      placeholder={placeholder}
      onFieldChange={onFieldChange}
      activeField={activeField}
      setActiveField={setActiveField}
      content={content}
      contentHtml={contentHtml}
    />
  );

  const zones = layout.zones;
  const alignments = {
    hook:        { justifyContent: 'flex-start', paddingTop: 60 },
    bullets_img: { justifyContent: 'flex-start', paddingTop: 40 },
    bullets_para:{ justifyContent: 'center' },
    title_para_img: { justifyContent: 'flex-start', paddingTop: 50 },
    data:        { justifyContent: 'center' },
    img_text:    { justifyContent: 'center' },
    text_only:   { justifyContent: 'center' },
    cta:         { justifyContent: 'flex-end', paddingBottom: 80 },
  };

  const bulletFontSize = s.bullets || 44;

  // Build flattened content map so EditableText can look up bulletDesc_N keys
  const flatContent = {
    ...content,
    ...Object.fromEntries((content.bulletsDesc || []).map((d, i) => [`bulletDesc_${i}`, d])),
  };
  const flatHtml = contentHtml || {};

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      paddingLeft: 72, paddingRight: 72, gap: 52,
      overflow: 'hidden',
      ...alignments[layout.id],
    }}>

      {zones.includes('title') &&
        T('title', { fontWeight: 900, lineHeight: 1.05, color: textColor, letterSpacing: '-0.02em', fontSize: 100 }, 'Titolo…')}

      {zones.includes('subtitle') &&
        T('subtitle', { fontWeight: 400, lineHeight: 1.4, color: mutedColor, fontSize: 48 }, 'Sottotitolo…')}

      {zones.includes('stat') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {T('stat', { fontWeight: 900, lineHeight: 0.88, color: accentColor, letterSpacing: '-0.04em', fontSize: 220 }, '+0%')}
          <div style={{ width: 80, height: 5, background: accentColor, borderRadius: 3 }} />
        </div>
      )}

      {zones.includes('label') &&
        T('label', { fontWeight: 600, lineHeight: 1.25, color: textColor, fontSize: 52 }, 'Descrizione…')}

      {zones.includes('image') && layout.imagePosition !== 'bottom' && <ImageBox imageBox={imageBox} />}

      {zones.includes('bullets') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {(content.bullets || []).map((bullet, i) => {
            const desc = content.bulletsDesc?.[i];
            const bulletFieldKey = `bullet_${i}`;
            const descFieldKey = `bulletDesc_${i}`;
            const bulletHtml = flatHtml[bulletFieldKey] || bullet || '';

            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* ── Bullet row ── */}
                <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: accentColor, flexShrink: 0, marginTop: 14,
                  }} />
                  <BulletEditable
                    index={i}
                    bulletHtml={bulletHtml}
                    bulletFontSize={bulletFontSize}
                    textColor={textColor}
                    activeField={activeField}
                    setActiveField={setActiveField}
                    onFieldChange={onFieldChange}
                  />
                </div>

                {/* ── Sub-description (shown when bulletsDesc[i] is non-empty) ── */}
                {(desc !== undefined && desc !== null) && (
                  <div style={{
                    marginLeft: 52,
                    paddingLeft: 16,
                    borderLeft: `3px solid ${accentColor}`,
                    opacity: desc ? 1 : 0.35,
                  }}>
                    <EditableText
                      field={descFieldKey}
                      style={{
                        fontSize: Math.round(bulletFontSize * 0.72),
                        fontWeight: 400,
                        lineHeight: 1.55,
                        color: mutedColor,
                      }}
                      placeholder="Aggiungi descrizione al punto…"
                      onFieldChange={onFieldChange}
                      activeField={activeField}
                      setActiveField={setActiveField}
                      content={flatContent}
                      contentHtml={flatHtml}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {zones.includes('paragraph1') &&
        T('paragraph1', { fontWeight: 400, lineHeight: 1.65, color: mutedColor, fontSize: 42 }, 'Paragrafo…')}

      {zones.includes('paragraph2') &&
        T('paragraph2', { fontWeight: 400, lineHeight: 1.65, color: mutedColor, fontSize: 40 }, 'Paragrafo aggiuntivo…')}

      {zones.includes('image') && layout.imagePosition === 'bottom' && <ImageBox imageBox={imageBox} />}

      {zones.includes('ctaLead') &&
        T('ctaLead', { fontWeight: 400, lineHeight: 1.35, color: mutedColor, fontSize: 50 }, 'Frase introduttiva…')}

      {zones.includes('ctaMain') &&
        T('ctaMain', { fontWeight: 900, lineHeight: 1.0, color: accentColor, letterSpacing: '-0.02em', fontSize: 110 }, 'Call to action…')}

      {zones.includes('ctaSub') &&
        T('ctaSub', { fontWeight: 500, lineHeight: 1.3, color: textColor, fontSize: 48 }, 'Link / istruzione…')}

    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   BULLET EDITABLE — separate component so useLayoutEffect ref is stable
───────────────────────────────────────────────────────────────────── */
function BulletEditable({ index, bulletHtml, bulletFontSize, textColor, activeField, setActiveField, onFieldChange }) {
  const isActive = activeField === `bullet_${index}`;
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (ref.current && !isActive) {
      if (ref.current.innerHTML !== bulletHtml) {
        ref.current.innerHTML = bulletHtml;
      }
    }
  }, [bulletHtml, isActive]);

  return (
    <div
      ref={ref}
      contentEditable suppressContentEditableWarning
      style={{
        fontSize: bulletFontSize, fontWeight: 500, lineHeight: 1.42,
        color: textColor, outline: 'none', flex: 1,
        wordBreak: 'break-word', whiteSpace: 'pre-wrap',
        borderRadius: 8,
        paddingTop: 4, paddingBottom: 4, paddingLeft: 8, paddingRight: 8,
        marginTop: -4, marginBottom: -4, marginLeft: -8, marginRight: -8,
        boxShadow: isActive ? '0 0 0 3px rgba(245,255,133,0.35)' : undefined,
        transition: 'box-shadow 0.15s',
      }}
      onFocus={() => setActiveField(`bullet_${index}`)}
      onBlur={(e) => {
        const html = e.currentTarget.innerHTML;
        const text = e.currentTarget.innerText;
        onFieldChange(`bullet_${index}`, text, html);
        setActiveField(null);
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────
   STORY CANVAS — main export
───────────────────────────────────────────────────────────────────── */
const StoryCanvas = React.forwardRef(function StoryCanvas(
  { state, layout, onFieldChange, activeField, setActiveField },
  ref
) {
  const tpl = TEMPLATES.find((t) => t.id === state.templateId) || TEMPLATES[0];

  const currentBgImage = state.backgroundImage || tpl.bgImage;
  const usingBakedTemplate = !state.backgroundImage && !!tpl.bgImage;

  return (
    <div
      ref={ref} id="story-canvas-export"
      style={{
        width: 1080, height: 1920,
        position: 'relative', overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
        display: 'flex', flexDirection: 'column',
        backgroundColor: tpl.bg,
      }}
    >
      {/* Real <img> background for resilient export */}
      {currentBgImage && (
        <img 
          src={currentBgImage} 
          alt="" 
          style={{ 
            position: 'absolute', inset: 0, width: '100%', height: '100%', 
            objectFit: 'cover', zIndex: 0 
          }} 
        />
      )}

      {state.backgroundImage && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,14,26,0.65)', zIndex: 1 }} />
      )}

      {!usingBakedTemplate && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: `linear-gradient(90deg, ${tpl.accentColor}, transparent)`, zIndex: 3 }} />
      )}

      <div className="canvas-header" style={{ position: 'relative', zIndex: 2 }}>
        <BrandHeader color={tpl.logoColor} mutedColor={tpl.mutedColor} customLogo={state.customLogo} />
      </div>

      <div className="canvas-content" style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <LayoutContent
          layout={layout} state={state} tpl={tpl}
          onFieldChange={onFieldChange}
          activeField={activeField}
          setActiveField={setActiveField}
        />
      </div>

      <div className="canvas-footer" style={{ position: 'relative', zIndex: 2 }}>
        <BrandFooter color={tpl.logoColor} isDark={tpl.isDark} />
      </div>
    </div>
  );
});

export default StoryCanvas;
