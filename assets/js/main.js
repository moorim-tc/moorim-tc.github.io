(() => {
  const SITE_NAME = "MOORIM EDS";

  function normalizePathname(pathname) {
    if (!pathname) return "/";
    const path = pathname.replace(/\/+/g, "/");
    return path.endsWith("/") ? path : `${path}/`;
  }

  function getPathParts() {
    const raw = (location.pathname || "").split("/").filter(Boolean);
    return raw;
  }

  function findLangInPathParts(parts) {
    const idx = parts.findIndex((p) => p === "ko" || p === "en");
    if (idx === -1) return null;
    return { lang: parts[idx], langIndex: idx };
  }

  function computeRootPrefixForFileProtocol() {
    if (location.protocol !== "file:") return "";

    const parts = getPathParts();
    const langInfo = findLangInPathParts(parts);
    if (!langInfo) {
      // /index.html at repo root
      return "";
    }

    const rootIndex = Math.max(0, langInfo.langIndex - 1);
    const fileDirParts = parts.slice(0, -1);
    const ups = Math.max(0, fileDirParts.length - (rootIndex + 1));
    return "../".repeat(ups);
  }

  function getLangFromLocation() {
    const parts = getPathParts();
    const langInfo = findLangInPathParts(parts);
    return langInfo ? langInfo.lang : null;
  }

  function getSubpathAfterLang() {
    const parts = getPathParts();
    const langInfo = findLangInPathParts(parts);
    if (!langInfo) return null;

    const after = parts.slice(langInfo.langIndex + 1);
    // If current file is index.html, drop it
    if (after.length && after[after.length - 1].toLowerCase() === "index.html") {
      after.pop();
    }
    return after.join("/");
  }

  function setNavLinks(lang) {
    const links = document.querySelectorAll("[data-nav]");
    if (!links.length) return;

    const rootPrefix = computeRootPrefixForFileProtocol();

    const map = {
      about: `/${lang}/`,
      projects: `/${lang}/projects/`,
      products: `/${lang}/products/`,
      contact: `/${lang}/contact/`,
    };

    links.forEach((a) => {
      const key = a.getAttribute("data-nav");
      const href = map[key];
      if (!href) return;

      a.setAttribute("href", location.protocol === "file:" ? `${rootPrefix}${href.replace(/^\//, "")}` : href);
    });
  }

  function setActiveNav(lang) {
    const path = normalizePathname(location.pathname);

    const rootPrefix = computeRootPrefixForFileProtocol();
    const effectivePath = location.protocol === "file:" ? (() => {
      // Try to extract /ko/... or /en/... from a file path
      const match = path.match(/\/(ko|en)\/(.*)$/);
      if (!match) return "/";
      const rest = match[2] || "";
      return `/${match[1]}/${rest}`;
    })() : path;

    const pageKey = (() => {
      if (effectivePath === `/${lang}/` || effectivePath === `/${lang}/index.html/`) return "about";
      if (effectivePath.startsWith(`/${lang}/projects/`)) return "projects";
      if (effectivePath.startsWith(`/${lang}/products/`)) return "products";
      if (effectivePath.startsWith(`/${lang}/contact/`)) return "contact";
      return null;
    })();

    if (!pageKey) return;

    const active = document.querySelector(`[data-nav="${pageKey}"]`);
    if (active) {
      active.classList.add("active");
      active.setAttribute("aria-current", "page");
    }
  }

  function setLangSwitch(currentLang) {
    const el = document.querySelector("[data-lang-switch]");
    if (!el) return;

    const targetLang = currentLang === "ko" ? "en" : "ko";
    const sub = getSubpathAfterLang();
    const dest = sub ? `/${targetLang}/${sub.replace(/\/$/, "")}/` : `/${targetLang}/`;

    const rootPrefix = computeRootPrefixForFileProtocol();

    el.textContent = currentLang === "ko" ? "EN" : "KO";
    el.setAttribute(
      "href",
      location.protocol === "file:" ? `${rootPrefix}${dest.replace(/^\//, "")}` : dest
    );
    el.setAttribute(
      "aria-label",
      currentLang === "ko" ? "Switch to English" : "한국어로 전환"
    );
  }

  function fixLogoForFileProtocol() {
    const img = document.querySelector("img[data-logo]");
    if (!img) return;

    const onError = () => {
      img.style.display = "none";
      const fallback = document.querySelector("[data-logo-fallback]");
      if (fallback) fallback.style.display = "inline";
    };

    img.addEventListener("error", onError, { once: true });

    if (location.protocol !== "file:") return;
    const rootPrefix = computeRootPrefixForFileProtocol();
    img.src = `${rootPrefix}assets/img/logo.png`;
  }

  function enhanceRootLanguageGate() {
    const gate = document.querySelector("[data-lang-gate]");
    if (!gate) return;

    const userLang = (navigator.language || "").toLowerCase();
    const recommended = userLang.startsWith("ko") ? "ko" : "en";

    const recommendedEl = gate.querySelector("[data-recommended]");
    const countdownEl = gate.querySelector("[data-countdown]");
    const cancelBtn = gate.querySelector("[data-cancel-auto]");

    if (recommendedEl) {
      recommendedEl.textContent = recommended === "ko" ? "한국어" : "English";
    }

    const rootPrefix = computeRootPrefixForFileProtocol();
    const dest = `/${recommended}/`;
    const href = location.protocol === "file:" ? `${rootPrefix}${dest.replace(/^\//, "")}` : dest;

    const btn = gate.querySelector(`[data-lang-btn="${recommended}"]`);
    if (btn) btn.classList.add("primary");

    if (countdownEl) countdownEl.textContent = "0";
    if (cancelBtn) cancelBtn.style.display = "none";

    // Redirect immediately based on detected browser language.
    location.replace(href);
  }

  function patchRootRelativeAnchorsForFileProtocol() {
    if (location.protocol !== "file:") return;

    const rootPrefix = computeRootPrefixForFileProtocol();
    document.querySelectorAll('a[href^="/"]').forEach((a) => {
      const href = a.getAttribute("href");
      if (!href) return;
      if (href.startsWith("//")) return;
      a.setAttribute("href", `${rootPrefix}${href.replace(/^\//, "")}`);
    });
  }

  function init() {
    patchRootRelativeAnchorsForFileProtocol();

    const lang = getLangFromLocation();
    if (lang === "ko" || lang === "en") {
      setNavLinks(lang);
      setActiveNav(lang);
      setLangSwitch(lang);
      fixLogoForFileProtocol();

      const footerName = document.querySelector("[data-company-name]");
      if (footerName) footerName.textContent = SITE_NAME;
      return;
    }

    // Root gate
    enhanceRootLanguageGate();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
