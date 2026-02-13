/* =========================================================
   mm-media.js — MEDIA BASE ROUTER + GLOBAL VIDEO CONTROLLER (v4)
   Purpose:
   - Base URL router for media via data-media-base
   - Global lazy video autoplay controller (social-feed behavior)
     for EVERY page / EVERY video:
       - No inline play button (because videos actually play)
       - Lazy attach sources (data-src -> src only when near)
       - Play when visible, pause when out of view
       - iOS/WebKit safe: muted + playsinline + autoplay asserted
       - Does NOT affect lightbox videos (those can have controls)
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
  function hydrateDataSrc(root = document) {
    const nodes = Array.from(root.querySelectorAll("[data-src]"));
    nodes.forEach((el) => {
      const tag = el.tagName;

      // Skip video sources; video controller hydrates when needed.
      if (tag === "SOURCE" && el.closest("video")) return;
      if (tag === "VIDEO") return;

      const raw = el.getAttribute("data-src");
      if (!raw) return;
      if (el.getAttribute("src")) return;

      el.setAttribute("src", resolveUrl(raw));
    });
  }

  function hydrateDataBg(root = document) {
    const nodes = Array.from(root.querySelectorAll("[data-bg]"));
    nodes.forEach((el) => {
      const raw = el.getAttribute("data-bg");
      if (!raw) return;
      el.style.backgroundImage = `url("${resolveUrl(raw)}")`;
    });
  }

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
  // Video helpers
  // ---------------------------------------------
  function hydrateVideoSources(videoEl) {
    if (!videoEl) return false;

    // Support BOTH:
    // - <source data-src="...">
    // - <source src="..."> already present (legacy)
    const sources = Array.from(videoEl.querySelectorAll("source"));
    if (!sources.length) return false;

    let changed = false;

    sources.forEach((s) => {
      const hasSrc = !!s.getAttribute("src");
      const ds = s.getAttribute("data-src");

      // If already has src, keep it, but also store it as data-src for later detach/re-attach.
      if (hasSrc) {
        if (!s.getAttribute("data-src")) s.setAttribute("data-src", s.getAttribute("src"));
        return;
      }

      // If missing src but has data-src, attach.
      if (ds) {
        s.setAttribute("src", resolveUrl(ds));
        changed = true;
      }
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

      if (!s.getAttribute("data-src")) s.setAttribute("data-src", cur);
      s.removeAttribute("src");
      changed = true;
    });

    if (changed) {
      try { videoEl.load(); } catch (_) {}
    }
  }

  // ---------------------------------------------
  // GLOBAL VIDEO CONTROLLER (the social-feed fix)
  // ---------------------------------------------
  function initGlobalVideoAutoplay() {
    const allVideos = Array.from(document.querySelectorAll("video"));
    if (!allVideos.length) return;

    // Don’t touch lightbox videos (they can have controls/play UI)
    const isLightboxVideo = (v) => !!v.closest(".mmLightbox");

    // Your requirement: NO play button unless lightbox.
    // That means: no controls on inline videos, ever.
    const normalizeInlineVideo = (v) => {
      if (isLightboxVideo(v)) return;

      // Remove controls so WebKit doesn't show UI
      v.controls = false;
      v.removeAttribute("controls");

      // WebKit autoplay requirements
      v.muted = true;
      v.playsInline = true;
      v.autoplay = true;
      v.loop = true;

      v.setAttribute("muted", "");
      v.setAttribute("playsinline", "");
      v.setAttribute("webkit-playsinline", "");
      v.setAttribute("autoplay", "");
      v.setAttribute("loop", "");

      // Prevent loading everything
      v.preload = "none";
      v.setAttribute("preload", "none");
    };

    allVideos.forEach(normalizeInlineVideo);

const safePlay = (v) => {
  if (!v) return;

  try {
    v.muted = true;
    v.playsInline = true;
    v.autoplay = true;
    v.loop = true;

    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    v.setAttribute("webkit-playsinline", "");
    v.setAttribute("autoplay", "");
    v.setAttribute("loop", "");

    const onPlaying = () => {
      v.classList.add("is-playing");
      v.removeEventListener("playing", onPlaying);
    };

    v.addEventListener("playing", onPlaying);

    const p = v.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {});
    }
  } catch (_) {}
};

const safePause = (v) => {
  if (!v || isLightboxVideo(v)) return;
  try { v.pause(); } catch (_) {}
  try { v.classList.remove("is-playing"); } catch (_) {}
};

    const ensureAttached = (v) => {
      if (!v || isLightboxVideo(v)) return;
      hydrateVideoSources(v);
    };

    const unloadIfFar = (v) => {
      if (!v || isLightboxVideo(v)) return;
      safePause(v);
      detachVideoSources(v);
    };

    // Which videos do we manage?
    // Everything except lightbox.
    const managed = allVideos.filter((v) => !isLightboxVideo(v));
    if (!managed.length) return;

    // Attach sources early to avoid black flashes while scrolling
    const ioAttach = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) ensureAttached(e.target);
      });
    }, { root: null, rootMargin: "1200px 0px", threshold: 0.01 });

    // Play anything visible enough (your requirement)
    const ioVisible = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          ensureAttached(e.target);
          safePlay(e.target);
        } else {
          safePause(e.target);
        }
      });
    }, { root: null, rootMargin: "250px 0px", threshold: 0.12 });

    // Unload far away to keep iPhone RAM sane
    const ioUnload = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) unloadIfFar(e.target);
      });
    }, { root: null, rootMargin: "3200px 0px", threshold: 0.0 });

    managed.forEach((v) => {
      ioAttach.observe(v);
      ioVisible.observe(v);
      ioUnload.observe(v);
    });

    // iOS/WebKit unlock (Chrome iOS included)
    const unlock = () => {
      managed.forEach((v) => {
        // Try to kick-start anything currently on screen
        const r = v.getBoundingClientRect();
        const onScreen = r.bottom > 0 && r.top < window.innerHeight;
        if (onScreen) {
          ensureAttached(v);
          safePlay(v);
        }
      });
    };

    window.addEventListener("touchstart", unlock, { once: true, passive: true });
    window.addEventListener("touchmove", unlock, { once: true, passive: true });
    window.addEventListener("pointerdown", unlock, { once: true, passive: true });

    // If tab hidden, pause all (battery/perf)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) managed.forEach(safePause);
    });
  }

  // ---------------------------------------------
  // Boot
  // ---------------------------------------------
  tryPreconnect();
  hydrateDataSrc(document);
  hydrateDataBg(document);
  rewriteLegacySrc(document);

  // Run controller after DOM is ready (works with defer scripts too)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGlobalVideoAutoplay, { once: true });
  } else {
    initGlobalVideoAutoplay();
  }

  // Expose API
  window.MM_MEDIA = {
    BASE,
    resolveUrl,
    hydrateDataSrc,
    hydrateDataBg,
    rewriteLegacySrc,
    hydrateVideoSources,
    detachVideoSources,
    initGlobalVideoAutoplay
  };
})();
