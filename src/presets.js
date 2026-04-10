// ─── LAYOUT DEFINITIONS ──────────────────────────────────────────────
// Each layout defines the visual structure: which zones appear and in what order.
// zones: 'title' | 'subtitle' | 'bullets' | 'paragraph1' | 'paragraph2' | 'stat' | 'image' | 'ctaLead' | 'ctaMain' | 'ctaSub'

export const LAYOUTS = [
  {
    id: 'hook',
    name: 'Hook',
    label: 'A — Titolo + Sottotitolo',
    zones: ['title', 'subtitle'],
    hasImage: false,
    imagePosition: null,
    defaultContent: {
      title: 'Stai perdendo\nsoldi così.',
      subtitle: 'Ecco cosa non ti stanno dicendo.',
    },
  },
  {
    id: 'bullets_img',
    name: 'Bullets + Immagine',
    label: 'B — Titolo + Bullets + Immagine',
    zones: ['title', 'bullets', 'image'],
    hasImage: true,
    imagePosition: 'center', // center | right | bottom
    defaultContent: {
      title: 'Perché il tuo\nportafoglio perde.',
      bullets: [
        'Costi nascosti che non vedi nel prospetto.',
        'Mancanza di diversificazione geografica.',
        'Troppa liquidità ferma sul conto corrente.',
        'Nessuna revisione annuale del rischio.',
      ],
    },
  },
  {
    id: 'bullets_para',
    name: 'Bullets + Paragrafo',
    label: 'C — Titolo + Bullets + Paragrafo',
    zones: ['title', 'bullets', 'paragraph1'],
    hasImage: false,
    imagePosition: null,
    defaultContent: {
      title: '3 verità sul\ntuo denaro.',
      bullets: [
        'I fondi comuni costano in media l\'1,8% l\'anno.',
        'Un ETF equivalente costa lo 0,15%.',
        'Su 10 anni, la differenza è enorme.',
      ],
      paragraph1: 'La consulenza indipendente non vende prodotti. Ti aiuta a costruire un patrimonio reale nel tempo.',
    },
  },
  {
    id: 'data',
    name: 'Dato + Testo',
    label: 'D — Statistica + Label + Descrizione',
    zones: ['stat', 'label', 'paragraph1'],
    hasImage: false,
    imagePosition: null,
    defaultContent: {
      stat: '+23%',
      label: 'Il rendimento medio degli ETF bilanciati nel 2024.',
      paragraph1: 'Scopri se il tuo portafoglio tiene il passo rispetto al mercato.',
    },
  },
  {
    id: 'img_text',
    name: 'Immagine + Testo',
    label: 'E — Immagine + Titolo + Paragrafo',
    zones: ['image', 'title', 'paragraph1'],
    hasImage: true,
    imagePosition: 'top',
    defaultContent: {
      title: 'Il rischio che non\ncalcoli mai.',
      paragraph1: 'Non è la volatilità del mercato. È il costo dell\'inazione. Ogni anno che aspetti è un anno di capitalizzazione che perdi.',
    },
  },
  {
    id: 'text_only',
    name: 'Solo Testo',
    label: 'F — Titolo + Par1 + Par2',
    zones: ['title', 'paragraph1', 'paragraph2'],
    hasImage: false,
    imagePosition: null,
    defaultContent: {
      title: 'Una cosa che\ncambia tutto.',
      paragraph1: 'La maggior parte degli investitori paga troppo e diversifica troppo poco. Non è colpa loro — nessuno gliel\'ha mai spiegato.',
      paragraph2: 'Con una strategia basata sugli ETF e una guida indipendente, puoi fare meglio. E non ci vuole molto.',
    },
  },
  {
    id: 'cta',
    name: 'CTA',
    label: 'G — Call To Action',
    zones: ['ctaLead', 'ctaMain', 'ctaSub'],
    hasImage: false,
    imagePosition: null,
    defaultContent: {
      ctaLead: 'Hai letto fino qui?',
      ctaMain: 'Richiedi una\nconsulenza gratuita.',
      ctaSub: 'Link in bio →',
    },
  },
  {
    id: 'title_para_img',
    name: 'Titolo + Corpo + Immagine',
    label: 'H — Titolo + Paragrafo + Immagine',
    zones: ['title', 'paragraph1', 'image'],
    hasImage: true,
    imagePosition: 'bottom',
    defaultContent: {
      title: 'Strategie per un\nritorno reale.',
      paragraph1: 'Assicurati di comprendere i rischi e di escludere costi occulti dai tuoi investimenti a lungo termine.',
    },
  },
];

// ─── TEMPLATE BACKGROUNDS ────────────────────────────────────────────
export const TEMPLATES = [
  {
    id: 'dark',
    name: 'Dark Navy',
    bg: '#101628',
    bgImage: '/sfondo-dark.png', // The user's provided template image
    textColor: '#ffffff',
    mutedColor: 'rgba(255,255,255,0.7)',
    accentColor: '#f5ff85',
    logoColor: '#ffffff',
    isDark: true,
  },
  {
    id: 'light',
    name: 'Light White',
    bg: '#ffffff',
    bgImage: '/sfondo-light.png', // The user's provided template image
    textColor: '#101628',
    mutedColor: 'rgba(16,22,40,0.65)',
    accentColor: '#27509e',
    logoColor: '#101628',
    isDark: false,
  },
];

// ─── BRAND CONSTANTS ─────────────────────────────────────────────────
export const BRAND = {
  name: "RICCARDO DELL'ORLETTA",
  tagline: 'Consulente finanziario evoluto',
  disclaimer:
    "Qualsiasi investimento comporta il rischio di perdita permanente di capitale. Questa pagina ha solo scopo educativo e formativo. Niente di ciò che viene pubblicato è un consiglio finanziario, i risultati passati non sono garanzia di risultati futuri.",
};

// ─── INITIAL STATE ────────────────────────────────────────────────────
export const DEFAULT_STATE = {
  layoutId: 'hook',
  templateId: 'dark',
  backgroundImage: null,
  viewMode: 'split', // 'editor' | 'split' | 'preview'
  content: LAYOUTS[0].defaultContent,
  imageBox: {
    src: null,
    size: 65,
    roundness: 12,
  },
  customLogo: null, // Holds a base64 or URL for the real logo
  groqApiKey: '',   // API key for the AI Copilot (stored locally)
  // Font sizes at 1080×1920 canvas resolution (px)
  sizes: {
    title:     100,
    subtitle:   48,
    stat:      220,
    label:      52,
    paragraph1: 42,
    paragraph2: 40,
    ctaLead:    50,
    ctaMain:   110,
    ctaSub:     48,
    bullets:    44,
  },
};
