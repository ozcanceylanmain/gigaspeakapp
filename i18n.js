/* ============================================================
   GigaSpeak — i18n system
   Dil listesi, bayraklar, RTL kontrolü ve ceviri uygulama mantigi.
   Ceviri verileri translations.js icinde TRANSLATIONS objesinde.
   Bu dosya file:// protokolunde de calisir (fetch kullanmaz).
   ============================================================ */

/* Arayüz (site) dilleri — 14 dilin tamamı artık destekleniyor. */
const SUPPORTED_LANGS = [
  { code: "tr", name: "Türkçe",    flag: "🇹🇷", rtl: false },
  { code: "en", name: "English",   flag: "🇬🇧", rtl: false },
  { code: "de", name: "Deutsch",   flag: "🇩🇪", rtl: false },
  { code: "fr", name: "Français",  flag: "🇫🇷", rtl: false },
  { code: "ar", name: "العربية",   flag: "🇸🇦", rtl: true  },
  { code: "ru", name: "Русский",   flag: "🇷🇺", rtl: false },
  { code: "zh", name: "中文",       flag: "🇨🇳", rtl: false },
  { code: "ja", name: "日本語",     flag: "🇯🇵", rtl: false },
  { code: "ko", name: "한국어",     flag: "🇰🇷", rtl: false },
  { code: "es", name: "Español",   flag: "🇪🇸", rtl: false },
  { code: "pt", name: "Português", flag: "🇵🇹", rtl: false },
  { code: "it", name: "Italiano",  flag: "🇮🇹", rtl: false },
  { code: "hi", name: "हिन्दी",     flag: "🇮🇳", rtl: false },
  { code: "id", name: "Indonesia", flag: "🇮🇩", rtl: false },
];

/* Uygulama içinde ÖĞRETİLEN diller — 14 dil. */
const TAUGHT_LANGS = [...SUPPORTED_LANGS];

const DEFAULT_LANG = "en";
const LANG_STORAGE_KEY = "gigaspeak_lang";

const I18N = {
  current: DEFAULT_LANG,
  dict: {},

  /** Tarayıcı dilini destekli dillerle eşleştir, yoksa DEFAULT_LANG döner */
  detectBrowserLang() {
    let stored = null;
    try { stored = localStorage.getItem(LANG_STORAGE_KEY); } catch (e) { /* file:// bazı tarayıcılarda kısıtlı olabilir */ }
    if (stored && SUPPORTED_LANGS.some(l => l.code === stored)) return stored;

    const navLangs = navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language || navigator.userLanguage || DEFAULT_LANG];

    for (const nl of navLangs) {
      const short = nl.slice(0, 2).toLowerCase();
      if (SUPPORTED_LANGS.some(l => l.code === short)) return short;
    }
    return DEFAULT_LANG;
  },

  /** translations.js icindeki gomulu objeden veriyi al (fetch yok) */
  loadLang(code) {
    if (typeof TRANSLATIONS === "undefined") {
      console.error("[i18n] TRANSLATIONS objesi bulunamadi. translations.js dosyasi yuklendi mi kontrol et.");
      return {};
    }
    if (TRANSLATIONS[code]) return TRANSLATIONS[code];
    console.warn(`[i18n] "${code}" bulunamadi, "${DEFAULT_LANG}" kullanilacak.`);
    return TRANSLATIONS[DEFAULT_LANG] || {};
  },

  /** "a.b.c" gibi bir yolu obje içinden çözümler */
  resolve(path, obj) {
    return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), obj);
  },

  applyToDOM() {
    document.documentElement.lang = this.current;
    const langMeta = SUPPORTED_LANGS.find(l => l.code === this.current);
    document.documentElement.dir = langMeta && langMeta.rtl ? "rtl" : "ltr";

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const val = this.resolve(key, this.dict);
      if (val) el.textContent = val;
    });

    const titleVal = this.resolve("meta.title", this.dict);
    if (titleVal) document.title = titleVal;

    const descVal = this.resolve("meta.description", this.dict);
    const metaDescEl = document.querySelector('meta[name="description"]');
    if (descVal && metaDescEl) metaDescEl.setAttribute("content", descVal);
  },

  setLang(code) {
    this.current = code;
    try { localStorage.setItem(LANG_STORAGE_KEY, code); } catch (e) { /* yoksay */ }
    this.dict = this.loadLang(code);
    this.applyToDOM();
    document.dispatchEvent(new CustomEvent("gigaspeak:langchange", { detail: { code } }));
  },

  init() {
    const detected = this.detectBrowserLang();
    this.setLang(detected);
  }
};