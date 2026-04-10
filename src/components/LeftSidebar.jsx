import { useState, useRef, useEffect } from 'react';
import { LAYOUTS, TEMPLATES } from '../presets.js';
import { callCopilot } from '../ai.js';

export default function LeftSidebar({
  state, setLayout, setTemplate, setBg, setImageBox, setCustomLogo, setAiProp, setContent, onAutoParse, activeTabOverride
}) {
  const [activeTab, setActiveTab] = useState('layout');

  // Sync tab with external control (mobile nav)
  useEffect(() => {
    if (activeTabOverride) setActiveTab(activeTabOverride);
  }, [activeTabOverride]);
  const bgInputRef = useRef();
  const imgInputRef = useRef();
  const logoInputRef = useRef();
  const currentLayout = LAYOUTS.find((l) => l.id === state.layoutId) || LAYOUTS[0];

  function handleBgUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setBg(ev.target.result);
    reader.readAsDataURL(file);
  }

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImageBox({ src: ev.target.result });
    reader.readAsDataURL(file);
  }

  function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCustomLogo(ev.target.result);
    reader.readAsDataURL(file);
  }

  // AI Copilot Logic
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiTextPaste, setAiTextPaste] = useState('');

    async function handleAI(actionType) {
    if (!state.groqApiKey) return;
    setIsGenerating(true);
    setAiResponse('');
    
    let systemPrompt = "Sei un esperto copywriter finanziario (consulenza indipendente). Usa il framework A.I.D.A. (Attenzione, Interesse, Desiderio, Azione) e P.A.S.A. per creare testi magnetici, professionali ma diretti.";
    let userMessage = "";

    if (actionType === 'hook') {
      userMessage = `Migliora questo Hook (Titolo) per renderlo più magnetico e ingaggiante per Instagram (max 7-8 parole): "${state.content.title || 'Investire oggi'}"`;
    } else if (actionType === 'body') {
      userMessage = `Riscrivi questa descrizione per renderla più chiara e persuasiva, ideale per una Instagram Story: "${state.content.description || ''}"`;
    } else if (actionType === 'bullets') {
      userMessage = `Scrivi 3 bullet points perfetti e concisi (max 10 parole l'uno) basandoti su questo titolo: "${state.content.title || ''}"`;
    } else if (actionType === 'magic') {
      systemPrompt = `Sei un esperto copywriter finanziario e art director. 
      DEVI rispondere ESCLUSIVAMENTE con un oggetto JSON valido, senza testo prima o dopo.
      
      Struttura JSON richiesta:
      {
        "layoutId": "uno tra: hook, bullets_img, bullets_para, data, img_text, text_only, cta",
        "templateId": "uno tra: dark, light",
        "content": {
          "title": "...",
          "subtitle": "...",
          "paragraph1": "...",
          "stat": "...",
          "label": "...",
          "bullets": ["...", "...", "..."],
          "ctaLead": "...",
          "ctaMain": "...",
          "ctaSub": "..."
        },
        "sizes": {
          "title": numero_font_size,
          "subtitle": numero_font_size,
          "label": numero_font_size,
          "stat": numero_font_size,
          "bullets": numero_font_size,
          "paragraph1": numero_font_size,
          "paragraph2": numero_font_size,
          "ctaMain": numero_font_size
        }
      }
      
      Le dimensioni dei font devono essere ottimizzate per il testo generato (range 30-220px). 
      Usa la logica del consulente finanziario indipendente serio ma moderno.`;
      userMessage = `Crea una storia Instagram completa basata su questa idea: "${aiPrompt}"`;
    } else if (actionType === 'custom') {
      userMessage = aiPrompt;
    } else if (actionType === 'parse_paste') {
      systemPrompt = `Sei un esperto editor. Il tuo compito è prendere il testo incollato e strutturarlo per una storia Instagram.
      DEVI rispondere ESCLUSIVAMENTE con un oggetto JSON valido.
      
      Struttura JSON:
      {
        "content": {
          "title": "Titolo principale estratto (max 6 parole)",
          "paragraph1": "Il corpo del testo sintetizzato o estratto...",
          "bullets": ["Punto chiave 1", "Punto chiave 2", "Punto chiave 3"]
        }
      }
      Se i bullets non servono lasciali vuoti. Assicurati che paragraph1 sia un paragrafo testuale logico.`;
      userMessage = "Testo incollato:\n" + aiTextPaste;
    }

    try {
      const config = {
        provider: state.aiProvider || 'groq',
        model: state.aiModel || (state.aiProvider === 'openrouter' ? 'anthropic/claude-3.5-sonnet' : 'llama-3.3-70b-versatile')
      };
      
      const result = await callCopilot(state.groqApiKey, systemPrompt, userMessage, config);
      
      if (actionType === 'magic' || actionType === 'parse_paste') {
        try {
          // Clean possible markdown wrappers
          const jsonStr = result.replace(/```json/g, '').replace(/```/g, '').trim();
          const magic = JSON.parse(jsonStr);
          
          if (actionType === 'magic') {
            if (magic.layoutId) setLayout(magic.layoutId, magic.content || {});
            if (magic.templateId) setTemplate(magic.templateId);
          }
          
          if (magic.content) {
            Object.entries(magic.content).forEach(([k, v]) => {
              if (k !== 'bullets') setContent(k, v);
            });
            if (Array.isArray(magic.content.bullets) && magic.content.bullets.length > 0) {
              magic.content.bullets.forEach((b, i) => setContent(`bullet_${i}`, b));
            }
          }
          
          // Note: sizes are managed by RightSidebar, not set here directly
          
          setAiResponse(actionType === 'magic' ? "✨ Storia Generata con Successo! Ho scelto il layout '" + magic.layoutId + "' e ottimizzato i testi." : "✅ Testo analizzato e strutturato nei campi!");
        } catch (parseErr) {
          console.error("Errore parse JSON:", parseErr, result);
          setAiResponse(result); // Fallback to raw text
        }
      } else {
        setAiResponse(result);
      }
    } catch (err) {
      setAiResponse("L'AI ha riscontrato un errore: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-tabs desktop-only">
        {['layout', 'design', 'image', 'copilot'].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'layout' ? 'Layout' : tab === 'design' ? 'Design' : tab === 'image' ? 'Immagine' : '🤖 AI'}
          </button>
        ))}
      </div>

      <div className="sidebar-body">

        {/* ── LAYOUT TAB ── */}
        {activeTab === 'layout' && (
          <div>
            <div className="section-label">Seleziona Layout</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              {LAYOUTS.map((l) => (
                <div
                  key={l.id}
                  onClick={() => setLayout(l.id, l.defaultContent)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 8,
                    border: `1.5px solid ${state.layoutId === l.id ? 'var(--yellow)' : 'var(--white-20)'}`,
                    background: state.layoutId === l.id ? 'rgba(245,255,133,0.06)' : 'var(--white-10)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                  onMouseEnter={(e) => {
                    if (state.layoutId !== l.id) e.currentTarget.style.borderColor = 'var(--blue-light)';
                  }}
                  onMouseLeave={(e) => {
                    if (state.layoutId !== l.id) e.currentTarget.style.borderColor = 'var(--white-20)';
                  }}
                >
                  <LayoutThumbnail id={l.id} active={state.layoutId === l.id} />
                  <div>
                    <div style={{
                      fontSize: 12, fontWeight: 600,
                      color: state.layoutId === l.id ? 'var(--yellow)' : 'var(--white)',
                    }}>
                      {l.name}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--white-60)', marginTop: 2 }}>
                      {l.label.split('—')[1]?.trim()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DESIGN TAB ── */}
        {activeTab === 'design' && (
          <>
            <div className="control-group">
              <div className="section-label">Sfondo Template</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
                {TEMPLATES.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={`theme-row${state.templateId === t.id ? ' active' : ''}`}
                  >
                    <div className="theme-dot" style={{
                      background: t.bg,
                      border: t.id === 'light' ? '1.5px solid #ccc' : 'none',
                    }} />
                    <span className="theme-name">{t.name}</span>
                    {state.templateId === t.id && (
                      <span style={{ marginLeft: 'auto', color: 'var(--yellow)', fontSize: 14 }}>✓</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="divider" />

            <div className="control-group">
              <div className="section-label">Sfondo Personalizzato</div>
              <div style={{ fontSize: 11, color: 'var(--white-60)', lineHeight: 1.5, marginBottom: 8 }}>
                Carica una foto per sostituire il template di sfondo.
              </div>
              <label className="upload-zone" style={{ cursor: 'pointer' }}>
                <span className="upload-icon">🖼</span>
                <span>{state.backgroundImage ? 'Cambia sfondo…' : 'Carica PNG / JPG'}</span>
                <input ref={bgInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBgUpload} />
              </label>
              {state.backgroundImage && (
                <button className="btn btn-ghost" style={{ fontSize: 11, marginTop: 6 }} onClick={() => setBg(null)}>
                  ✕ Rimuovi sfondo
                </button>
              )}
            </div>

            <div className="divider" />

            <div className="control-group">
              <div className="section-label">Logo Brand</div>
              <div style={{ fontSize: 11, color: 'var(--white-60)', lineHeight: 1.5, marginBottom: 8 }}>
                Sostituisci la 'R' temporanea con il tuo vero logo (si consiglia SVG o PNG senza sfondo).
              </div>
              <label className="upload-zone" style={{ cursor: 'pointer' }}>
                <span className="upload-icon">Ⓜ️</span>
                <span>{state.customLogo ? 'Cambia logo…' : 'Carica Logo (PNG/SVG)'}</span>
                <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
              </label>
              {state.customLogo && (
                <button className="btn btn-ghost" style={{ fontSize: 11, marginTop: 6 }} onClick={() => setCustomLogo(null)}>
                  ✕ Rimuovi logo
                </button>
              )}
            </div>
          </>
        )}

        {/* ── IMAGE TAB ── */}
        {activeTab === 'image' && (
          <>
            {!currentLayout.hasImage && (
              <div style={{
                padding: '14px', borderRadius: 10,
                background: 'rgba(245,255,133,0.06)',
                border: '1px solid rgba(245,255,133,0.2)',
                fontSize: 12, color: 'var(--yellow)', lineHeight: 1.7,
              }}>
                ⚡ Il layout attuale non include una zona immagine. Passa a "Bullets + Immagine" o "Immagine + Testo" per attivarlo.
              </div>
            )}

            {currentLayout.hasImage && (
              <>
                <div className="control-group">
                  <div className="section-label">Immagine Contenuto</div>
                  <label className="upload-zone" style={{ cursor: 'pointer' }}>
                    <span className="upload-icon">📸</span>
                    <span>{state.imageBox?.src ? 'Cambia immagine…' : 'Carica immagine'}</span>
                    <input ref={imgInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                  </label>
                  {state.imageBox?.src && (
                    <button className="btn btn-ghost" style={{ fontSize: 11, marginTop: 6 }}
                      onClick={() => setImageBox({ src: null })}>
                      ✕ Rimuovi immagine
                    </button>
                  )}
                </div>

                {state.imageBox?.src && (
                  <>
                    <div className="divider" />
                    <div className="control-group">
                      <div className="control-label">Larghezza — {state.imageBox.size}%</div>
                      <input
                        type="range" min="30" max="100" step="1"
                        value={state.imageBox.size}
                        onChange={(e) => setImageBox({ size: Number(e.target.value) })}
                        style={{ width: '100%', accentColor: 'var(--yellow)', cursor: 'pointer' }}
                      />
                    </div>

                    <div className="control-group">
                      <div className="control-label">Arrotondamento — {state.imageBox.roundness}px</div>
                      <input
                        type="range" min="0" max="80" step="2"
                        value={state.imageBox.roundness}
                        onChange={(e) => setImageBox({ roundness: Number(e.target.value) })}
                        style={{ width: '100%', accentColor: 'var(--yellow)', cursor: 'pointer' }}
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* ── COPILOT TAB ── */}
        {activeTab === 'copilot' && (
          <>
            <div className="control-group">
              <div className="section-label">Configurazione AI</div>
              
              <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                <button 
                  className={`btn ${state.aiProvider === 'groq' ? 'btn-primary' : 'btn-ghost'}`} 
                  style={{ flex: 1, fontSize: 11, padding: '6px' }}
                  onClick={() => {
                    setAiProp('aiProvider', 'groq');
                    setAiProp('aiModel', 'llama-3.3-70b-versatile');
                  }}
                >
                  Groq (Llama)
                </button>
                <button 
                  className={`btn ${state.aiProvider === 'openrouter' ? 'btn-primary' : 'btn-ghost'}`} 
                  style={{ flex: 1, fontSize: 11, padding: '6px' }}
                  onClick={() => {
                    setAiProp('aiProvider', 'openrouter');
                    setAiProp('aiModel', 'anthropic/claude-3.5-sonnet');
                  }}
                >
                  OpenRouter (Claude)
                </button>
              </div>

              <div style={{ fontSize: 11, color: 'var(--white-60)', marginBottom: 8 }}>
                Inserisci la chiave API {state.aiProvider === 'openrouter' ? 'OpenRouter' : 'Groq'}.
              </div>
              <input
                type="password"
                placeholder={state.aiProvider === 'openrouter' ? "sk-or-..." : "gsk_..."}
                value={state.groqApiKey || ''}
                onChange={(e) => setAiProp('groqApiKey', e.target.value)}
              />
              
              {state.aiProvider === 'openrouter' && (
                <div style={{ marginTop: 12 }}>
                  <div className="control-label">Modello Premium</div>
                  <select 
                    style={{ width: '100%', padding: '8px', background: 'var(--white-10)', color: 'white', border: '1px solid var(--white-20)', borderRadius: 4, fontSize: 12 }}
                    value={state.aiModel}
                    onChange={(e) => setAiProp('aiModel', e.target.value)}
                  >
                    <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (Best Copy)</option>
                    <option value="google/gemini-2.0-flash-001">Gemini 2.0 Flash (Fast & Smart)</option>
                    <option value="openai/gpt-4o">GPT-4o (Standard Pro)</option>
                  </select>
                </div>
              )}

              {!state.groqApiKey && (
                <div style={{ fontSize: 11, color: 'var(--yellow)', marginTop: 8 }}>
                  ☝️ Inserisci la chiave per abilitare il Copilot.
                </div>
              )}
            </div>

            <div className="divider" />

            <div className="control-group" style={{ opacity: state.groqApiKey ? 1 : 0.5 }}>
              <div className="section-label">Azioni Rapide Modello</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button className="btn btn-secondary" onClick={() => handleAI('hook')} disabled={isGenerating || !state.groqApiKey}>
                  ⚡ Genera un Hook migliore
                </button>
                <button className="btn btn-secondary" onClick={() => handleAI('body')} disabled={isGenerating || !state.groqApiKey}>
                  ✍️ Riscrivi Paragrafo (AIDA)
                </button>
                <button className="btn btn-secondary" onClick={() => handleAI('bullets')} disabled={isGenerating || !state.groqApiKey}>
                  ✅ Scrivi 3 Bullet Points
                </button>
              </div>
            </div>

            <div className="divider" />

            <div className="control-group" style={{ opacity: state.groqApiKey ? 1 : 0.5 }}>
              <div className="section-label" style={{ color: 'var(--yellow)' }}>🪄 Magic Story Creator</div>
              <div style={{ fontSize: 11, color: 'var(--white-60)', marginBottom: 8 }}>
                Descrivi l'argomento e l'AI sceglierà layout, tema e testi perfetti.
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input 
                  className="magic-input"
                  style={{ flex: 1, background: 'rgba(245,255,133,0.05)', borderColor: 'rgba(245,255,133,0.2)' }}
                  placeholder="Es: I vantaggi dei PAC..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '6px 12px' }}
                  onClick={() => handleAI('magic')} 
                  disabled={isGenerating || !state.groqApiKey || !aiPrompt.trim()}
                >
                  {isGenerating ? '...' : 'Crea'}
                </button>
              </div>
            </div>

            <div className="divider" />

            <div className="control-group" style={{ opacity: state.groqApiKey ? 1 : 0.5 }}>
              <div className="section-label">Richiesta Libera</div>
              <textarea
                placeholder="Es. Scrivi un testo da 10 parole per cliccare il link in bio..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={3}
              />
              <button className="btn btn-secondary" onClick={() => handleAI('custom')} disabled={isGenerating || !state.groqApiKey || !aiPrompt.trim()}>
                {isGenerating ? 'Generazione...' : '🔮 Chiedi a LLaMA-3'}
              </button>
            </div>

            <div className="divider" />

            <div className="control-group">
              <div className="section-label" style={{ color: 'var(--yellow)' }}>📋 Incolla Testo Esterno</div>
              <div style={{ fontSize: 11, color: 'var(--white-60)', marginBottom: 8 }}>
                Incolla una trascrizione o un articolo; l'AI organizzerà titoli e paragrafi automaticamente.
              </div>
              <textarea
                placeholder="Incolla qui il tuo testo..."
                value={aiTextPaste}
                onChange={(e) => setAiTextPaste(e.target.value)}
                rows={5}
                style={{ 
                  background: 'rgba(245,255,133,0.03)', 
                  borderColor: 'rgba(245,255,133,0.15)',
                  fontSize: 12,
                  lineHeight: 1.5
                }}
              />
              <button 
                className="btn btn-primary" 
                style={{ marginTop: 8, width: '100%' }}
                onClick={() => {
                  handleAI('parse_paste');
                }}
                disabled={!aiTextPaste.trim() || isGenerating}
              >
                {isGenerating ? 'Generazione...' : '✨ Analizza e Applica'}
              </button>
            </div>

            <div className="divider" />

            {aiResponse && (
              <div className="control-group" style={{ marginTop: 8 }}>
                <div className="section-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Risposta AI 🤖</span>
                  <button className="btn btn-ghost" style={{ padding: '2px 6px', fontSize: 10, color: 'var(--yellow)' }} onClick={() => setAiResponse('')}>Chiudi</button>
                </div>
                <div style={{ background: 'var(--white-10)', padding: 12, borderRadius: 6, fontSize: 12, color: 'var(--white)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                  {aiResponse}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <button className="btn btn-secondary" style={{ flex: 1, padding: '6px', fontSize: 11 }} onClick={() => setContent('title', aiResponse.replace(/"/g, ''))}>
                    Applica come Titolo
                  </button>
                  <button className="btn btn-secondary" style={{ flex: 1, padding: '6px', fontSize: 11 }} onClick={() => setContent('description', aiResponse.replace(/"/g, ''))}>
                    Applica come Testo
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </aside>
  );
}

/* ── Layout thumbnail previews ──────────────────────────────────────── */
function LayoutThumbnail({ id, active }) {
  const c = active ? '#f5ff85' : 'rgba(255,255,255,0.45)';
  const dim = active ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)';
  const bar = (w, h = 3, col = dim) => (
    <div style={{ width: w, height: h, background: col, borderRadius: 2, flexShrink: 0 }} />
  );
  const dot = <div style={{ width: 5, height: 5, borderRadius: '50%', background: c, flexShrink: 0 }} />;
  const imgBox = (h = 20) => (
    <div style={{ width: '100%', height: h, background: 'rgba(39,80,158,0.4)', borderRadius: 3 }} />
  );

  const wrap = (children) => (
    <div style={{
      width: 36, height: 64, background: active ? 'rgba(39,80,158,0.3)' : 'rgba(16,22,40,0.7)',
      borderRadius: 4, padding: '6px 5px', display: 'flex', flexDirection: 'column',
      gap: 4, flexShrink: 0,
    }}>
      {children}
    </div>
  );

  if (id === 'hook') return wrap(<>{bar('75%', 5, c)}{bar('50%')}</>);
  if (id === 'bullets_img') return wrap(<>{bar('65%', 4, c)}{dot}{dot}{dot}{imgBox(14)}</>);
  if (id === 'bullets_para') return wrap(<>{bar('65%', 4, c)}{dot}{dot}{dot}{bar('90%')}{bar('80%')}</>);
  if (id === 'data') return wrap(<>{bar('40%', 9, c)}{bar('70%')}{bar('55%')}</>);
  if (id === 'img_text') return wrap(<>{imgBox(18)}{bar('70%', 4, c)}{bar('90%')}</>);
  if (id === 'text_only') return wrap(<>{bar('70%', 4, c)}{bar('90%')}{bar('85%')}{bar('90%')}{bar('75%')}</>);
  if (id === 'cta') return wrap(<>{bar('50%')}{bar('80%', 7, c)}{bar('40%')}</>);
  return null;
}
