import { useState } from 'react';
import { LAYOUTS } from '../presets.js';

// Font size range limits per field type (px at 1080 canvas width)
const SIZE_RANGES = {
  title:     { min: 50, max: 160, step: 2 },
  subtitle:  { min: 28, max: 80,  step: 2 },
  stat:      { min: 100, max: 300, step: 5 },
  label:     { min: 30, max: 80,  step: 2 },
  paragraph1:{ min: 24, max: 70,  step: 2 },
  paragraph2:{ min: 24, max: 70,  step: 2 },
  ctaLead:   { min: 28, max: 80,  step: 2 },
  ctaMain:   { min: 60, max: 180, step: 2 },
  ctaSub:    { min: 28, max: 80,  step: 2 },
  bullets:   { min: 24, max: 70,  step: 2 },
};

export default function RightSidebar({ state, setContent, setSize, addBullet, removeBullet, setBullet, setBulletDesc }) {
  const [activeTab, setActiveTab] = useState('testo');
  // track which bullets have their description input expanded
  const [expandedDescs, setExpandedDescs] = useState(() => new Set());

  const layout = LAYOUTS.find((l) => l.id === state.layoutId) || LAYOUTS[0];
  const { content, sizes = {} } = state;
  const zones = layout.zones;

  function toggleDesc(i) {
    setExpandedDescs((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
        // Clear the description value when collapsing (optional UX choice)
        // setBulletDesc(i, '');
      } else {
        next.add(i);
      }
      return next;
    });
  }

  const fieldLabels = {
    title: 'Titolo',
    subtitle: 'Sottotitolo',
    stat: 'Statistica',
    label: 'Label del dato',
    paragraph1: 'Paragrafo 1',
    paragraph2: 'Paragrafo 2',
    ctaLead: 'Testo introduttivo',
    ctaMain: 'Call to Action',
    ctaSub: 'Istruzione finale',
  };

  const fieldRows = {
    title: 3, ctaMain: 3, paragraph1: 4, paragraph2: 4,
    stat: 2, subtitle: 2, label: 3, ctaLead: 2, ctaSub: 2,
  };

  // Text fields from layout (excluding bullets & image zones)
  const textFields = zones.filter(
    (z) => z !== 'bullets' && z !== 'image' && Object.keys(fieldLabels).includes(z)
  );

  return (
    <aside className="sidebar sidebar-right">
      <div className="sidebar-tabs desktop-only">
        {['testo', 'bullets', 'tips'].map((tab) => {
          if (tab === 'bullets' && !zones.includes('bullets')) return null;
          return (
            <button key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >{tab === 'testo' ? 'Testo' : tab === 'bullets' ? 'Bullets' : 'Tips'}</button>
          );
        })}
      </div>

      <div className="sidebar-body">

        {/* ── TEXT FIELDS + SIZE SLIDERS ── */}
        {activeTab === 'testo' && (
          <>
            <div>
              <div className="section-label" style={{ marginBottom: 12 }}>
                {layout.name} — {layout.label.split('—')[1]?.trim()}
              </div>
              {textFields.length === 0 && (
                <p style={{ fontSize: 12, color: 'var(--white-60)', lineHeight: 1.6 }}>
                  Nessun campo testo in questo layout. Vai al tab "Bullets".
                </p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {textFields.map((field) => {
                  const range = SIZE_RANGES[field] || { min: 24, max: 120, step: 2 };
                  const currentSize = sizes[field] || range.min;
                  return (
                    <div key={field} style={{
                      background: 'var(--white-10)',
                      borderRadius: 10,
                      border: '1px solid var(--white-20)',
                      overflow: 'hidden',
                    }}>
                      {/* Field header with size badge */}
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        paddingTop: 10, paddingBottom: 6, paddingLeft: 14, paddingRight: 14,
                      }}>
                        <span className="control-label" style={{ margin: 0 }}>{fieldLabels[field]}</span>
                        <span style={{
                          fontSize: 10, fontWeight: 700, color: 'var(--yellow)',
                          background: 'rgba(245,255,133,0.1)',
                          borderRadius: 4,
                          paddingTop: 2, paddingBottom: 2, paddingLeft: 7, paddingRight: 7,
                        }}>{currentSize}px</span>
                      </div>

                      {/* Text input */}
                      <div style={{ paddingLeft: 14, paddingRight: 14, paddingBottom: 8 }}>
                        <textarea
                          rows={fieldRows[field] || 2}
                          value={content[field] || ''}
                          placeholder={`${fieldLabels[field]}…`}
                          onChange={(e) => setContent(field, e.target.value)}
                          style={{ resize: 'vertical', lineHeight: 1.55, width: '100%' }}
                        />
                      </div>

                      {/* Size slider */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        paddingTop: 6, paddingBottom: 10, paddingLeft: 14, paddingRight: 14,
                        borderTop: '1px solid var(--white-20)',
                        background: 'rgba(0,0,0,0.15)',
                      }}>
                        <span style={{ fontSize: 9, color: 'var(--white-60)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                          Testo
                        </span>
                        <input
                          type="range"
                          min={range.min} max={range.max} step={range.step}
                          value={currentSize}
                          onChange={(e) => setSize(field, Number(e.target.value))}
                          style={{ flex: 1, accentColor: 'var(--yellow)', cursor: 'pointer', height: 4 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ── BULLETS ── */}
        {activeTab === 'bullets' && zones.includes('bullets') && (
          <>
            <div>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 12,
              }}>
                <div className="section-label" style={{ margin: 0 }}>Bullet Points</div>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: 'var(--yellow)',
                  background: 'rgba(245,255,133,0.1)',
                  borderRadius: 4,
                  paddingTop: 2, paddingBottom: 2, paddingLeft: 7, paddingRight: 7,
                }}>{sizes.bullets || 44}px</span>
              </div>

              {/* Bullet size slider */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                marginBottom: 14,
                background: 'var(--white-10)',
                border: '1px solid var(--white-20)',
                borderRadius: 8,
                paddingTop: 8, paddingBottom: 8, paddingLeft: 12, paddingRight: 12,
              }}>
                <span style={{ fontSize: 9, color: 'var(--white-60)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  Testo
                </span>
                <input
                  type="range"
                  min={SIZE_RANGES.bullets.min} max={SIZE_RANGES.bullets.max} step={SIZE_RANGES.bullets.step}
                  value={sizes.bullets || 44}
                  onChange={(e) => setSize('bullets', Number(e.target.value))}
                  style={{ flex: 1, accentColor: 'var(--yellow)', cursor: 'pointer', height: 4 }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(content.bullets || []).map((bullet, i) => {
                  const isExpanded = expandedDescs.has(i);
                  const descValue = content.bulletsDesc?.[i] ?? '';

                  return (
                    <div key={i} style={{
                      background: 'var(--white-10)',
                      border: '1px solid var(--white-20)',
                      borderRadius: 10,
                      overflow: 'hidden',
                    }}>
                      {/* ── Bullet text row ── */}
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 10px 8px 10px' }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: 'var(--yellow)', flexShrink: 0, marginTop: 16,
                        }} />
                        <textarea
                          rows={2}
                          value={bullet}
                          placeholder={`Punto ${i + 1}…`}
                          onChange={(e) => setBullet(i, e.target.value)}
                          style={{ flex: 1, resize: 'vertical', lineHeight: 1.5, fontSize: 12 }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                          {/* Description toggle checkbox */}
                          <button
                            title={isExpanded ? 'Nascondi descrizione' : 'Aggiungi descrizione al punto'}
                            onClick={() => toggleDesc(i)}
                            style={{
                              width: 26, height: 26,
                              borderRadius: 5,
                              border: `1.5px solid ${isExpanded ? 'var(--yellow)' : 'var(--white-20)'}`,
                              background: isExpanded ? 'rgba(245,255,133,0.15)' : 'transparent',
                              cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 14,
                              color: isExpanded ? 'var(--yellow)' : 'var(--white-60)',
                              transition: 'all 0.15s',
                            }}
                          >
                            {isExpanded ? '−' : '+'}
                          </button>
                          {/* Remove bullet */}
                          <button
                            className="btn btn-ghost"
                            style={{ width: 26, height: 26, padding: 0, fontSize: 13, color: 'rgba(255,80,80,0.7)', flexShrink: 0 }}
                            onClick={() => removeBullet(i)} title="Rimuovi punto"
                          >✕</button>
                        </div>
                      </div>

                      {/* ── Description row (collapsible) ── */}
                      {isExpanded && (
                        <div style={{
                          borderTop: '1px solid rgba(245,255,133,0.15)',
                          background: 'rgba(245,255,133,0.03)',
                          padding: '8px 10px 10px 26px',
                        }}>
                          <div style={{
                            fontSize: 9, fontWeight: 700, color: 'var(--yellow)',
                            letterSpacing: '0.07em', textTransform: 'uppercase',
                            marginBottom: 6,
                          }}>
                            Descrizione aggiuntiva
                          </div>
                          <textarea
                            rows={2}
                            value={descValue}
                            placeholder="Testo descrittivo sotto il punto…"
                            onChange={(e) => setBulletDesc(i, e.target.value)}
                            style={{
                              width: '100%', resize: 'vertical', lineHeight: 1.5, fontSize: 11,
                              background: 'rgba(245,255,133,0.04)',
                              borderColor: 'rgba(245,255,133,0.2)',
                            }}
                          />
                          <div style={{ fontSize: 10, color: 'var(--white-60)', marginTop: 4, lineHeight: 1.5 }}>
                            Appare sul canvas sotto il punto, in carattere più piccolo.
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button className="btn btn-secondary" style={{ width: '100%', marginTop: 4 }}
              onClick={addBullet}>+ Aggiungi punto</button>

            <div className="divider" />
            <p style={{ fontSize: 11, color: 'var(--white-60)', lineHeight: 1.65 }}>
              Clicca <strong style={{ color: 'var(--yellow)' }}>+</strong> accanto a un punto per aggiungere una descrizione. Puoi modificare i testi anche direttamente sul canvas.
            </p>
          </>
        )}

        {/* ── TIPS ── */}
        {activeTab === 'tips' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="section-label">Copywriting Tips</div>
            <TipCard n="01" t="Hook forte" b="Inizia con un numero, una domanda o un'affermazione che crea curiosità nei primi 2 secondi." />
            <TipCard n="02" t="Un dato, un punto" b="Non sovraccaricare la story. Una sola informazione per slide converte meglio." />
            <TipCard n="03" t="CTA chiaro" b="Ogni storia deve finire con un'azione precisa. 'Scorri su', 'Link in bio', 'Rispondimi'." />
            <TipCard n="04" t="Bullets corti" b="Ogni bullet deve contenere una sola idea. Max 10-12 parole per punto." />
            <TipCard n="05" t="Evidenziazione" b="Seleziona parole chiave sul canvas per applicare un colore di evidenziazione contrastante con la palette." />
          </div>
        )}
      </div>
    </aside>
  );
}

function TipCard({ n, t, b }) {
  return (
    <div style={{
      background: 'var(--white-10)', border: '1px solid var(--white-20)',
      borderRadius: 10, paddingTop: 14, paddingBottom: 14, paddingLeft: 14, paddingRight: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--yellow)', letterSpacing: '0.06em' }}>{n}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--white)' }}>{t}</span>
      </div>
      <p style={{ fontSize: 12, color: 'var(--white-60)', lineHeight: 1.65 }}>{b}</p>
    </div>
  );
}
