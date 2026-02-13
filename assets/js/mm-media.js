/* =========================================================
   mm-media.js — MEDIA BASE ROUTER (v3)
   Purpose:
   - You should NOT have to store 500 Cloudflare links in JS.
   - Instead, you set ONE base URL and keep HTML using relative paths.

   How to use:
   1) In HTML <html data-media-base="https://YOUR-CLOUDFLARE_DOMAIN/">
      Example:
      <html lang="en" data-media-base="https://pub-xxxxx.r2.dev/">

   2) In HTML use:
      <img data-src="brands/ami/img01.webp">
      <video muted playsinline preload="none">
        <source data-src="brands/ami/video01.mp4" type="video/mp4">
      </video>

   What this file does:
   - Hydrates [data-src] -> src for non-video stuff immediately (images etc)
   - Hydrates [data-bg] -> style.backgroundImage
   - DOES NOT auto-hydrate <video><source data-src> because that defeats lazy video.
   - Exposes helpers so brand-nav.js can hydrate video sources only when visible.
   ========================================================= */

(() => {
  const docEl = document.documentElement;

  const RAW_BASE =
    docEl.getAttribute("data-media-base") ||
    window.MM_MEDIA_BASE ||
    "";

  const BASE = normalizeBase(RAW_BASE);

  // ---------------------------------------------
  // Utility
  // ---------------------------------------------
  function normalizeBase(base) {
    if (!base) return "";
    let b = String(base).trim();
    // Allow either with or without trailing slash
    if (b && !b.endsWith("/")) b += "/";
    return b;
  }

  function isAbsUrl(url) {
    return /^https?:\/\//i.test(url) || /^data:/i.test(url) || /^blob:/i.test(url);
  }

  function resolveUrl(raw) {
    if (!raw) return raw;
    const v = String(raw).trim();
    if (!BASE || isAbsUrl(v) || v.startsWith("/")) return v;
    return BASE + v.replace(/^\.\//, "");
  }

  function addHint(href, rel) {
    if (!href) return;
    try {
      const existing = document.querySelector(`link[rel="${rel}"][href="${href}"]`);
      if (existing) return;
      const link = document.createElement("link");
      link.rel = rel;
      link.href = href;
      document.head.appendChild(link);
    } catch (_) {}
  }

  function tryPreconnect() {
    if (!BASE) return;
    try {
      const u = new URL(BASE);
      addHint(u.origin, "dns-prefetch");
      addHint(u.origin, "preconnect");
    } catch (_) {}
  }

  // ---------------------------------------------
  // Hydrators
  // ---------------------------------------------

  // Hydrate [data-src] for non-video elements immediately.
  // IMPORTANT: We intentionally SKIP:
  // - <source> inside <video>
  // - <video data-src> (if you ever add it)
  function hydrateDataSrc(root = document) {
    const nodes = Array.from(root.querySelectorAll("[data-src]"));
    nodes.forEach((el) => {
      const tag = el.tagName;

      // Skip video sources; brand-nav.js will hydrate when visible.
      if (tag === "SOURCE" && el.closest("video")) return;
      if (tag === "VIDEO") return;

      const raw = el.getAttribute("data-src");
      if (!raw) return;

      // Avoid double-hydrate
      if (el.getAttribute("src")) return;

      const url = resolveUrl(raw);
      el.setAttribute("src", url);
    });
  }

  function hydrateDataBg(root = document) {
    const nodes = Array.from(root.querySelectorAll("[data-bg]"));
    nodes.forEach((el) => {
      const raw = el.getAttribute("data-bg");
      if (!raw) return;
      const url = resolveUrl(raw);
      el.style.backgroundImage = `url("${url}")`;
    });
  }

  // Optional: rewrite legacy src="assets/media/..." to BASE + same path
  // (keeps old pages working if you still have local paths in markup)
  function rewriteLegacySrc(root = document) {
    if (!BASE) return;
    const nodes = Array.from(root.querySelectorAll("[src]"));
    nodes.forEach((el) => {
      const src = el.getAttribute("src");
      if (!src) return;
      if (isAbsUrl(src)) return;
      if (!src.startsWith("assets/media/")) return;
      el.setAttribute("src", resolveUrl(src));
    });
  }

  // ---------------------------------------------
  // Video helpers (called by brand-nav.js / main.js)
  // ---------------------------------------------
  function hydrateVideoSources(videoEl) {
    if (!videoEl) return false;
    const sources = Array.from(videoEl.querySelectorAll("source[data-src]"));
    if (!sources.length) return false;

    let changed = false;
    sources.forEach((s) => {
      if (s.getAttribute("src")) return;
      const raw = s.getAttribute("data-src");
      if (!raw) return;
      s.setAttribute("src", resolveUrl(raw));
      changed = true;
    });

    if (changed) {
      try { videoEl.load(); } catch (_) {}
    }
    return changed;
  }

  function detachVideoSources(videoEl) {
    if (!videoEl) return;
    const sources = Array.from(videoEl.querySelectorAll("source"));
    let changed = false;

    sources.forEach((s) => {
      const cur = s.getAttribute("src");
      if (!cur) return;

      // Preserve original in data-src for later reattach
      if (!s.getAttribute("data-src")) s.setAttribute("data-src", cur);

      s.removeAttribute("src");
      changed = true;
    });

    if (changed) {
      try { videoEl.load(); } catch (_) {}
    }
  }

  // ---------------------------------------------
  // Boot
  // ---------------------------------------------
  tryPreconnect();
  hydrateDataSrc(document);
  hydrateDataBg(document);
  rewriteLegacySrc(document);

  // Expose API
  window.MM_MEDIA = {
    BASE,
    resolveUrl,
    hydrateDataSrc,
    hydrateDataBg,
    rewriteLegacySrc,
    hydrateVideoSources,
    detachVideoSources,
  };
})();
