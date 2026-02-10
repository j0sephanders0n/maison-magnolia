/* =========================================================
   mm-media.js
   - Centralizes media URL routing (local now, hosted later)
   - Supports:
       [data-src] (img/video/source/anything)
       [data-bg]  (background images)
       src="assets/media/..." rewriting when a base is provided
       brand tiles via data-src (works with brand-nav.js lightbox)
   ========================================================= */

(() => {
  const docEl = document.documentElement;

  // Set this later to your hosted media root, e.g.
  // https://YOUR-CDN-DOMAIN.com/mm-media/
  // Leave blank to use local/relative URLs.
  const RAW_BASE =
    docEl.getAttribute("data-media-base") ||
    window.MM_MEDIA_BASE ||
    "";

  const BASE = normalizeBase(RAW_BASE);

  // Preconnect for faster media fetches (only if BASE is an http(s) URL)
  if (BASE && /^https?:\/\//i.test(BASE)) {
    try {
      const u = new URL(BASE);
      addHint("dns-prefetch", u.origin);
      addHint("preconnect", u.origin);
    } catch (_) {}
  }

  const resolve = (path) => {
    if (!path) return "";
    // Don’t touch absolute URLs, blob:, data:, etc.
    if (/^(https?:)?\/\//i.test(path)) return path;
    if (/^(data:|blob:)/i.test(path)) return path;

    if (!BASE) return path;

    // Strip leading ./ and leading slashes
    const clean = String(path)
      .replace(/^\.\//, "")
      .replace(/^\/+/, "");

    return BASE + clean;
  };

  // 1) Upgrade elements that explicitly opt-in with data-src
  const hydrateDataSrc = () => {
    const nodes = document.querySelectorAll("[data-src]");
    nodes.forEach((el) => {
      const raw = el.getAttribute("data-src") || "";
      if (!raw) return;

      const url = resolve(raw);

      // If this is a <source>, set src
      if (el.tagName === "SOURCE") {
        // Only set if not already set (so you can override manually if needed)
        if (!el.getAttribute("src")) el.setAttribute("src", url);
        return;
      }

      // If this is <img>, set src
      if (el.tagName === "IMG") {
        if (!el.getAttribute("src")) el.setAttribute("src", url);
        return;
      }

      // If this is <video>, set src (rare; usually you use <source>)
      if (el.tagName === "VIDEO") {
        if (!el.getAttribute("src")) el.setAttribute("src", url);
        return;
      }

      // Otherwise: also support brand tiles, etc.
      // If element has dataset.src (brand-nav.js reads this), ensure it becomes the resolved URL.
      if (el.dataset) el.dataset.src = url;
    });
  };

  // 2) Upgrade background images via data-bg
  const hydrateDataBg = () => {
    const nodes = document.querySelectorAll("[data-bg]");
    nodes.forEach((el) => {
      const raw = el.getAttribute("data-bg") || "";
      if (!raw) return;
      const url = resolve(raw);

      // Only set once unless you change attributes manually
      if (!el.style.backgroundImage) {
        el.style.backgroundImage = `url("${url}")`;
        el.style.backgroundSize = "cover";
        el.style.backgroundPosition = "center";
        el.style.backgroundRepeat = "no-repeat";
      }
    });
  };

  // 3) Optional: if BASE is set, rewrite src="assets/media/..." automatically
  const rewriteAssetsMediaSrc = () => {
    if (!BASE) return;

    const nodes = document.querySelectorAll("img[src], video[src], source[src]");
    nodes.forEach((el) => {
      const src = el.getAttribute("src") || "";
      if (!src) return;

      // Only rewrite your local convention
      if (!src.startsWith("assets/media/")) return;

      // Convert assets/media/... → ... (relative to BASE)
      const relativeToMediaRoot = src.replace(/^assets\/media\//, "");
      el.setAttribute("src", resolve(relativeToMediaRoot));
    });
  };

  // Run when DOM is ready (safe even if deferred)
  const run = () => {
    hydrateDataSrc();
    hydrateDataBg();
    rewriteAssetsMediaSrc();

    // If we changed <source> tags after videos were created, reload them.
    // (This is safe even if you didn’t change anything.)
    document.querySelectorAll("video").forEach((v) => {
      const hasSources = v.querySelector("source[src]");
      if (hasSources) v.load();
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }

  // Helpers
  function normalizeBase(b) {
    const base = String(b || "").trim();
    if (!base) return "";
    // Ensure trailing slash
    return base.endsWith("/") ? base : base + "/";
  }

  function addHint(rel, href) {
    // Don’t duplicate
    const existing = document.querySelector(`link[rel="${rel}"][href="${href}"]`);
    if (existing) return;
    const l = document.createElement("link");
    l.rel = rel;
    l.href = href;
    document.head.appendChild(l);
  }
})();
