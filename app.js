/* ============================================================
   GigaSpeak — app.js
   Header scroll durumu, dil seçici menüsü, scroll-reveal
   animasyonları, dil rozeti grid'i ve arka plan parçacıkları.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Header scroll state ---------- */
  const header = document.getElementById("siteHeader");
  const onScroll = () => {
    if (window.scrollY > 12) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Background sparkles ---------- */
  const bgField = document.getElementById("bgField");
  const SPARK_COUNT = window.innerWidth < 640 ? 10 : 18;
  for (let i = 0; i < SPARK_COUNT; i++) {
    const s = document.createElement("div");
    s.className = "spark";
    const size = 2 + Math.random() * 3;
    s.style.width = `${size}px`;
    s.style.height = `${size}px`;
    s.style.left = `${Math.random() * 100}%`;
    s.style.top = `${60 + Math.random() * 40}%`;
    s.style.animationDuration = `${14 + Math.random() * 16}s`;
    s.style.animationDelay = `${Math.random() * 12}s`;
    bgField.appendChild(s);
  }

  /* ---------- Language menu ---------- */
  const langSelect = document.getElementById("langSelect");
  const langBtn = document.getElementById("langBtn");
  const langMenu = document.getElementById("langMenu");
  const langBtnFlag = document.getElementById("langBtnFlag");
  const langBtnCode = document.getElementById("langBtnCode");

  function renderLangMenu(activeCode) {
    langMenu.innerHTML = "";
    SUPPORTED_LANGS.forEach(l => {
      const opt = document.createElement("div");
      opt.className = "lang-option" + (l.code === activeCode ? " active" : "");
      opt.setAttribute("role", "option");
      opt.setAttribute("data-code", l.code);
      opt.innerHTML = `<span class="flag">${l.flag}</span><span>${l.name}</span>`;
      opt.addEventListener("click", () => {
        I18N.setLang(l.code);
        updateLangButton(l.code);
        closeLangMenu();
      });
      langMenu.appendChild(opt);
    });
  }

  function updateLangButton(code) {
    const l = SUPPORTED_LANGS.find(x => x.code === code) || SUPPORTED_LANGS[0];
    langBtnFlag.textContent = l.flag;
    langBtnCode.textContent = l.code.toUpperCase();
    document.querySelectorAll(".lang-option").forEach(o => {
      o.classList.toggle("active", o.getAttribute("data-code") === code);
    });
  }

  function openLangMenu() {
    langSelect.classList.add("open");
    langBtn.setAttribute("aria-expanded", "true");
  }
  function closeLangMenu() {
    langSelect.classList.remove("open");
    langBtn.setAttribute("aria-expanded", "false");
  }

  langBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    langSelect.classList.contains("open") ? closeLangMenu() : openLangMenu();
  });
  document.addEventListener("click", (e) => {
    if (!langSelect.contains(e.target)) closeLangMenu();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLangMenu();
  });

  /* ---------- Language roster grid (öğretilen 14 dil) ---------- */
  /* ---------- Dil Kartları Grid'ini Oluşturma ---------- */
  const langGrid = document.getElementById("langGrid");
  function renderLangGrid() {
    langGrid.innerHTML = "";
    TAUGHT_LANGS.forEach(l => {
      const chip = document.createElement("div");
      chip.className = "lang-chip";
      
      // Üstte kısa kod (büyük harfle), altta ise dilin uzun ismi yer alacak şekilde güncellendi
      chip.innerHTML = `
        <span class="code">${l.code.toUpperCase()}</span>
        <span class="name">${l.name}</span>
      `;
      langGrid.appendChild(chip);
    });
  }
  renderLangGrid();

  /* ---------- Init i18n ---------- */
  renderLangMenu(DEFAULT_LANG);
  I18N.init();
  updateLangButton(I18N.current);

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
    revealEls.forEach(el => io.observe(el));
  } else {
    /* IntersectionObserver desteklenmiyorsa hepsini direkt göster */
    revealEls.forEach(el => el.classList.add("in"));
  }

  /* Güvenlik ağı: bir sebeple gözlemci tetiklenmezse elemanları görünür yap */
  window.addEventListener("load", () => {
    setTimeout(() => {
      document.querySelectorAll(".reveal:not(.in)").forEach(el => el.classList.add("in"));
    }, 1500);
  });

  /* Hero elements are already visible on load (class "in" set in HTML) */
});
