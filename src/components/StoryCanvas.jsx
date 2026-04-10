import React from 'react';
import { TEMPLATES, BRAND } from '../presets.js';

/* ─────────────────────────────────────────────────────────────────────
   BRAND HEADER
───────────────────────────────────────────────────────────────────── */
function BrandHeader({ color, mutedColor, customLogo }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center', // Centered horizontally
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
          {/* Default SVG closer to real logo (no circle) */}
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
      borderTop: `2px solid ${isDark ? '#f5ff85' : '#27509e'}`, // Yellow line for dark, Blue line for light
    }}>
      <p style={{
        fontSize: 18, fontWeight: 400, color, opacity: 0.8,
        lineHeight: 1.4, fontFamily: "'Inter', sans-serif", textAlign: 'center',
      }}>{BRAND.disclaimer}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   DARK TEMPLATE BACKGROUND
───────────────────────────────────────────────────────────────────── */
function DarkTemplateBg() {
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.25 }}
      viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon points="720,80 1080,80 1080,600" fill="#27509e" />
      <polygon points="900,0 1080,0 1080,300" fill="#3461b8" opacity="0.5" />
      <polygon points="600,1600 1080,1200 1080,1920" fill="#1b3a72" opacity="0.4" />
    </svg>
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
   EDITABLE TEXT NODE
───────────────────────────────────────────────────────────────────── */
function EditableText({ field, style, placeholder, onFieldChange, setActiveField, activeField, content }) {
  const isActive = activeField === field;
  const value = content?.[field] || '';
  return (
    <div
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
      onBlur={(e) => { onFieldChange(field, e.currentTarget.innerText); setActiveField(null); }}
      dangerouslySetInnerHTML={{ __html: value.replace(/\n/g, '<br>') }}
      data-placeholder={placeholder}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────
   LAYOUT CONTENT RENDERER
───────────────────────────────────────────────────────────────────── */
function LayoutContent({ layout, state, tpl, onFieldChange, activeField, setActiveField }) {
  const { textColor, mutedColor, accentColor } = tpl;
  const { content, imageBox, sizes } = state;
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {(content.bullets || []).map((bullet, i) => (
            <div key={i} style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: accentColor, flexShrink: 0, marginTop: 14,
              }} />
              <div
                contentEditable suppressContentEditableWarning
                style={{
                  fontSize: bulletFontSize, fontWeight: 500, lineHeight: 1.42,
                  color: textColor, outline: 'none', flex: 1,
                  wordBreak: 'break-word', whiteSpace: 'pre-wrap',
                  borderRadius: 8,
                  paddingTop: 4, paddingBottom: 4, paddingLeft: 8, paddingRight: 8,
                  marginTop: -4, marginBottom: -4, marginLeft: -8, marginRight: -8,
                  boxShadow: activeField === `bullet_${i}` ? '0 0 0 3px rgba(245,255,133,0.35)' : undefined,
                }}
                onFocus={() => setActiveField(`bullet_${i}`)}
                onBlur={(e) => { onFieldChange(`bullet_${i}`, e.currentTarget.innerText); setActiveField(null); }}
                dangerouslySetInnerHTML={{ __html: bullet }}
              />
            </div>
          ))}
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
   STORY CANVAS — main export
───────────────────────────────────────────────────────────────────── */
const StoryCanvas = React.forwardRef(function StoryCanvas(
  { state, layout, onFieldChange, activeField, setActiveField, viewMode },
  ref
) {
  const tpl = TEMPLATES.find((t) => t.id === state.templateId) || TEMPLATES[0];

  // If the user uploaded a custom background, use it. Otherwise, use the template's built-in background image.
  const currentBgImage = state.backgroundImage || tpl.bgImage;

  // We ONLY hide our generated CSS header & footer if we are using the user's baked-in template images.
  // If they upload a custom background (e.g. a photo), we MUST show the generated header & footer on top of it.
  const usingBakedTemplate = !state.backgroundImage && !!tpl.bgImage;

  const canvasBg = {
    backgroundColor: tpl.bg,
    ...(currentBgImage
      ? { backgroundImage: `url(${currentBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : {}),
  };

  return (
    <div
      ref={ref} id="story-canvas-export"
      style={{
        width: 1080, height: 1920,
        position: 'relative', overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
        display: 'flex', flexDirection: 'column',
        ...canvasBg,
      }}
    >


      {/* If using a custom photo background, overlay a dark tint to make text readable */}
      {state.backgroundImage && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,14,26,0.65)', zIndex: 0 }} />
      )}

      {/* Top accent line (only needed if NOT using the baked templates which already have it) */}
      {!usingBakedTemplate && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: `linear-gradient(90deg, ${tpl.accentColor}, transparent)`, zIndex: 3 }} />
      )}

      {/* We use visibility: hidden to preserve the exact spacing that the header would take up, so content doesn't overlap the baked-in logo */}
      <div className="canvas-header" style={{ position: 'relative', zIndex: 2, visibility: usingBakedTemplate ? 'hidden' : 'visible' }}>
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

      <div className="canvas-footer" style={{ position: 'relative', zIndex: 2, visibility: usingBakedTemplate ? 'hidden' : 'visible' }}>
        <BrandFooter color={tpl.logoColor} isDark={tpl.isDark} />
      </div>
    </div>
  );
});

export default StoryCanvas;
