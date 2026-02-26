document.addEventListener("DOMContentLoaded", () => {
  // ============================================================
  // ALWAYS START AT TOP ON REFRESH
  // ============================================================
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  // some browsers restore scroll after DOMContentLoaded, force again next tick
  setTimeout(() => window.scrollTo(0, 0), 0);

  // ============================================================
  // GLOBAL: MOBILE DETECT (used for Projects-only Stream swap)
  // ============================================================
  const MM_IS_MOBILE = window.matchMedia("(max-width: 520px)").matches;


  // ============================================================
  // PROJECTS: Wrap .video-track in a mask layer (AE-style matte)
  // - Masks ONLY videos + black backing
  // - Keeps phone SVG overlay visible above it
  // ============================================================
  (function ensurePhoneMaskWrapper(){
    const container = document.querySelector("#projects .video-container");
    if (!container) return;

    // Prevent double-wrap
    if (container.querySelector(".phoneMask")) return;

    const track = container.querySelector(".video-track");
    if (!track) return;

    const mask = document.createElement("div");
    mask.className = "phoneMask";

    // Insert wrapper and move track into it
    container.insertBefore(mask, track);
    mask.appendChild(track);
  })();
  // ============================================================
  // PROJECTS: HYDRATE <source data-src> -> src (but do NOT autoplay-manage)
  // Needed because mm-media.js now ignores #projects to prevent iOS crashes.
  // ============================================================
  (function hydrateProjectsSources(){
    const projects = document.getElementById("projects");
    if (!projects) return;
    if (MM_IS_MOBILE) return; // mobile uses Stream iframes instead of <video>
    if (MM_IS_MOBILE) return; // mobile uses Stream iframes instead of <video>

    const vids = Array.from(projects.querySelectorAll("video"));
    if (!vids.length) return;

    // Use mm-media's hydrator if available (keeps base router behavior)
    const hydrate = window.MM_MEDIA && window.MM_MEDIA.hydrateVideoSources
      ? window.MM_MEDIA.hydrateVideoSources
      : null;

    vids.forEach((v) => {
      if (!v) return;

      if (hydrate) {
        hydrate(v);
        return;
      }

      // Fallback: manual attach (no base routing)
      const sources = Array.from(v.querySelectorAll("source[data-src]"));
      sources.forEach((s) => {
        if (!s.getAttribute("src")) {
          s.setAttribute("src", s.getAttribute("data-src"));
        }
      });
      try { v.load(); } catch (_) {}
    });
  })();


// ============================================================
// PROJECTS (MOBILE ONLY): Replace <video> with Cloudflare Stream <iframe>
// - Scope: ONLY #projects, ONLY <=520px
// - Leaves desktop/iPad behavior untouched
// - iframe pointer-events disabled so vertical scroll + link tap still work
// ============================================================
(function initProjectsStreamMobile(){
  if (!MM_IS_MOBILE) return;

  const projects = document.getElementById("projects");
  if (!projects) return;

  // Map overlay-title text -> Stream iframe src
  // (Uses your provided Stream UIDs; cleaned params for stability.)
  const STREAM = {
    "BOSS": "https://customer-s2q8ja8z5hc4bkqr.cloudflarestream.com/a6fdac5e0e9383dcbcd8084041e12c9e/iframe?muted=true&loop=true&controls=false",
    "PRADA BEAUTY": "https://customer-s2q8ja8z5hc4bkqr.cloudflarestream.com/d073143daf19b4c26140c67206323bf6/iframe?muted=true&loop=true&controls=false",
    "HUGO": "https://customer-s2q8ja8z5hc4bkqr.cloudflarestream.com/67e1740cf05a2d117ba3d6467dad565f/iframe?muted=true&loop=true&controls=false",
    "SANDRO": "https://customer-s2q8ja8z5hc4bkqr.cloudflarestream.com/75043d494a95dd24a0514b99ae490fa9/iframe?muted=true&loop=true&controls=false",
    "BALMAIN": "https://customer-s2q8ja8z5hc4bkqr.cloudflarestream.com/462900da7b972e0ad311e87306c5f627/iframe?muted=true&loop=true&controls=false",
    "NIKE JORDAN": "https://customer-s2q8ja8z5hc4bkqr.cloudflarestream.com/d1509e3424d2092ea90df3d2275a86b9/iframe?muted=true&loop=true&controls=false",
    "SPENCE": "https://customer-s2q8ja8z5hc4bkqr.cloudflarestream.com/d00625c17ce305d02bab4d80254d51c2/iframe?muted=true&loop=true&controls=false",
    "DAVID YURMAN": "https://customer-s2q8ja8z5hc4bkqr.cloudflarestream.com/f9479589839b68d3529e3c72df8c858c/iframe?muted=true&loop=true&controls=false",
    "MARC JACOBS": "https://customer-s2q8ja8z5hc4bkqr.cloudflarestream.com/28d8f0bf0ae210d3b3052148211c8e1a/iframe?muted=true&loop=true&controls=false",
    "MOSCHINO": "https://customer-s2q8ja8z5hc4bkqr.cloudflarestream.com/7a7c2f9060a71e933b583b407c2c9ad4/iframe?muted=true&loop=true&controls=false",
    "LOUIS VUITTON": "https://customer-s2q8ja8z5hc4bkqr.cloudflarestream.com/06cb160a0ccc48db0a83ce61c09fbd31/iframe?muted=true&loop=true&controls=false",
    "AMI": "https://customer-s2q8ja8z5hc4bkqr.cloudflarestream.com/238d0ea6ca71b114d4778f8b04d6df48/iframe?muted=true&loop=true&controls=false",
    "MESHKI": "https://customer-s2q8ja8z5hc4bkqr.cloudflarestream.com/050c58009b466de9193719249a273bb8/iframe?muted=true&loop=true&controls=false",
    "MARKS AND SPENCER": "https://customer-s2q8ja8z5hc4bkqr.cloudflarestream.com/ef7cccd01ba353aa692f368fd161b973/iframe?muted=true&loop=true&controls=false",
    "GIVENCHY": "https://customer-s2q8ja8z5hc4bkqr.cloudflarestream.com/0aa65e104e99346f00a2b42f5c0e8cb8/iframe?muted=true&loop=true&controls=false",
    "ASOS": "https://customer-s2q8ja8z5hc4bkqr.cloudflarestream.com/131682473c06ce7723d45ab09f6d15f5/iframe?muted=true&loop=true&controls=false",
    "RENT THE RUNWAY": "https://customer-s2q8ja8z5hc4bkqr.cloudflarestream.com/0390e92240176258263953b1c483e55d/iframe?muted=true&loop=true&controls=false",
    "JIMMYCHOO": "https://customer-s2q8ja8z5hc4bkqr.cloudflarestream.com/7b7b14d634ab43de3bb43eaf0fb34b8d/iframe?muted=true&loop=true&controls=false",
    "BMW": "https://customer-s2q8ja8z5hc4bkqr.cloudflarestream.com/1dc780411d3c8c11d137f193156fffac/iframe?muted=true&loop=true&controls=false",
    "RABANNE": "https://customer-s2q8ja8z5hc4bkqr.cloudflarestream.com/1f46ff94f750650b155582168cc2ef2c/iframe?muted=true&loop=true&controls=false",
    "VERONICA BEARD": "https://customer-s2q8ja8z5hc4bkqr.cloudflarestream.com/7fffc0e8b2f747e39b296e71d3e4e653/iframe?muted=true&loop=true&controls=false",
    "PANDORA": "https://customer-s2q8ja8z5hc4bkqr.cloudflarestream.com/4bbda47550ec67be1ff9f272d5352556/iframe?muted=true&loop=true&controls=false",
    "MIUMIU": "https://customer-s2q8ja8z5hc4bkqr.cloudflarestream.com/914fa804bdf91fcf88f3a92cefcecb4f/iframe?muted=true&loop=true&controls=false",
    "AMIRI": "https://customer-s2q8ja8z5hc4bkqr.cloudflarestream.com/e36f4112cfe01630a34d82bd47aedec3/iframe?muted=true&loop=true&controls=false",
    "BREITLING": "https://customer-s2q8ja8z5hc4bkqr.cloudflarestream.com/929c3e2fbb037e16e3a7c7c1a2f6984a/iframe?muted=true&loop=true&controls=false",
    "TUMI": "https://customer-s2q8ja8z5hc4bkqr.cloudflarestream.com/c4b8dfd95422ac177c93fd0c2cbcb71c/iframe?muted=true&loop=true&controls=false",
    "TORY BURCH": "https://customer-s2q8ja8z5hc4bkqr.cloudflarestream.com/375745214d1b1c53ef9cf1df09014f3e/iframe?muted=true&loop=true&controls=false",
    "LORO PIANA": "https://customer-s2q8ja8z5hc4bkqr.cloudflarestream.com/c1b41fab506ab39b91108a1d8c80428a/iframe?muted=true&loop=true&controls=false",
    "PRADA": "https://customer-s2q8ja8z5hc4bkqr.cloudflarestream.com/3fe8ff87e362d39d579065591df3f040/iframe?muted=true&loop=true&controls=false",
    "H & M": "https://customer-s2q8ja8z5hc4bkqr.cloudflarestream.com/17dfc6deaef693b14613011ac248c72b/iframe?muted=true&loop=true&controls=false",
    "MICHAEL KORS": "https://customer-s2q8ja8z5hc4bkqr.cloudflarestream.com/c9490320bdba4959838c2f77f7cf6f7c/iframe?muted=true&loop=true&controls=false",
    "HERMES": "https://customer-s2q8ja8z5hc4bkqr.cloudflarestream.com/8d40940579ee259e6826bd5f7dd718a7/iframe?muted=true&loop=true&controls=false",
    "GOOGLE PIXLE": "https://customer-s2q8ja8z5hc4bkqr.cloudflarestream.com/efd46d5408e442dc7038442c78224dbb/iframe?muted=true&loop=true&controls=false"
  };

  const slides = Array.from(projects.querySelectorAll("a.slide"));
  slides.forEach((slide) => {
    // Identify which stream to use via existing overlay title text.
    const titleEl = slide.querySelector(".overlay-title");
    const label = (titleEl?.textContent || "").trim().toUpperCase();
    const src = STREAM[label];
    if (!src) return;

    if (slide.querySelector("iframe.mm-project-stream")) return;

    // Hide the original <video> (and keep it inert on mobile).
    const v = slide.querySelector("video");
    if (v) {
      try { v.pause(); } catch (_) {}
      v.style.display = "none";
      v.preload = "none";
      v.setAttribute("preload", "none");
    }

    const iframe = document.createElement("iframe");
    iframe.className = "mm-project-stream";
    iframe.src = src;
    iframe.loading = "lazy";
    iframe.allow = "autoplay; encrypted-media; picture-in-picture";
    iframe.allowFullscreen = true;

    // Critical: do not steal scroll gestures or taps; the <a> remains clickable.
    iframe.style.pointerEvents = "none";

    const overlay = slide.querySelector(".overlay");
    if (overlay) slide.insertBefore(iframe, overlay);
    else slide.appendChild(iframe);
  });
})();


  // ============================================================
  // PROJECTS: AUTOPLAY (visibility-based) — without mm-media control
  // - Ensures autoplay attributes are asserted for #projects videos
  // - Plays when visible, pauses when not
  // - Lightweight: does NOT call load() repeatedly (prevents iOS tab-kill)
  // ============================================================
  (function initProjectsAutoplay(){
    const projects = document.getElementById("projects");
    if (!projects) return;

    const vids = Array.from(projects.querySelectorAll("video"));
    if (!vids.length) return;

    const isLightboxVideo = (v) => !!v.closest(".mmLightbox");

    // Normalize attributes (matches your old "it just plays" behavior)
    vids.forEach((v) => {
      if (!v || isLightboxVideo(v)) return;

      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      v.autoplay = true;

      v.setAttribute("muted", "");
      v.setAttribute("loop", "");
      v.setAttribute("playsinline", "");
      v.setAttribute("webkit-playsinline", "");
      v.setAttribute("autoplay", "");

      // keep lightweight unless another controller sets otherwise
      if (!v.getAttribute("preload")) {
        v.preload = "none";
        v.setAttribute("preload", "none");
      }
    });

    const safePlay = (v) => {
      if (!v || isLightboxVideo(v)) return;
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

        const p = v.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      } catch (_) {}
    };

    const safePause = (v) => {
      if (!v || isLightboxVideo(v)) return;
      try { v.pause(); } catch (_) {}
    };

    // If no IO support, just try to play what's on screen after first gesture.
    if (!("IntersectionObserver" in window)) {
      const unlock = () => {
        vids.forEach((v) => {
          if (!v || isLightboxVideo(v)) return;
          const r = v.getBoundingClientRect();
          if (r.bottom > 0 && r.top < window.innerHeight) safePlay(v);
        });
      };
      window.addEventListener("touchstart", unlock, { once: true, passive: true });
      window.addEventListener("pointerdown", unlock, { once: true, passive: true });
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) safePlay(e.target);
        else safePause(e.target);
      });
    }, { root: null, rootMargin: "250px 0px", threshold: 0.2 });

    vids.forEach((v) => {
      if (!v || isLightboxVideo(v)) return;
      io.observe(v);
    });

    // iOS/WebKit unlock
    const unlock = () => {
      vids.forEach((v) => {
        if (!v || isLightboxVideo(v)) return;
        const r = v.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) safePlay(v);
      });
    };
    window.addEventListener("touchstart", unlock, { once: true, passive: true });
    window.addEventListener("touchmove", unlock, { once: true, passive: true });
    window.addEventListener("pointerdown", unlock, { once: true, passive: true });
  })();


  // ============================================================
  // INTRO ANIMATION (keeps your existing behavior, but smoother)
  // - adds a SMALL DELAY before the logo starts moving
  // - avoids heavy work competing with the animation
  // ============================================================
  const logoBtn = document.getElementById("logoBtn");
  const logoText = document.getElementById("logoText");
  const header = document.getElementById("siteHeader");

  const params = new URLSearchParams(window.location.search);
  const skipIntro = params.get("skipIntro") === "1";

  const revealInstant = () => {
    if (logoText) logoText.textContent = "MM";
    if (logoBtn) {
      logoBtn.classList.add("is-home");
      logoBtn.style.transform = "translateX(0px)";
    }
    if (header) {
      header.style.opacity = "1";
      header.style.pointerEvents = "auto";
    }
    document.body.style.overflowY = "auto";
document.body.classList.remove("preload");
document.body.classList.add("intro-done");
  };

// ============================================================
// BOTTOM CONTACT BAR (show when user reaches page bottom)
// - Uses a real end-of-page sentinel (no scrollHeight guessing)
// - Pops a hair LATER (closer to true bottom)
// - When visible: prevents scrolling further DOWN (acts as hard page end)
// ============================================================
(function initContactBar(){
  const bar = document.getElementById("contactBar");
  if (!bar) return;

const THRESHOLD_PX = 2;      // tiny tolerance for rounding
const SHOW_LATER_PX = 0;     // keep 0 so it triggers at the true end
  // Create / reuse a sentinel that sits at the *real* end of the page
  let sentinel = document.getElementById("contactBarSentinel");
  if (!sentinel) {
    sentinel = document.createElement("div");
    sentinel.id = "contactBarSentinel";
    sentinel.setAttribute("aria-hidden", "true");
    sentinel.style.cssText = "position:relative;width:100%;height:1px;";
    document.body.appendChild(sentinel);
  }

  // Scroll lock state (when bar is visible)
  let lockY = null;

  function setVisible(on){
    const isOn = !!on;
    bar.classList.toggle("is-visible", isOn);

    if (isOn) {
      // Lock the "bottom" at the moment it becomes visible
      if (lockY === null) lockY = window.scrollY || window.pageYOffset;

      // Clamp immediately in case we crossed the lock point
      requestAnimationFrame(() => {
        const y = window.scrollY || window.pageYOffset;
        if (y > lockY) window.scrollTo(0, lockY);
      });
    } else {
      // Unlock when hidden (so user can scroll normally again)
      lockY = null;
    }
  }

  // Clamp any attempt to scroll further down while locked
  window.addEventListener("scroll", () => {
    if (lockY === null) return;
    const y = window.scrollY || window.pageYOffset;
    if (y > lockY) window.scrollTo(0, lockY);
  }, { passive: true });

  // Fallback (if IntersectionObserver is unavailable)
  function fallbackUpdate(){
    const scrollY = window.scrollY || window.pageYOffset;
    const viewportH = window.innerHeight || document.documentElement.clientHeight;
    const docH = document.documentElement.scrollHeight;

    const atBottom = (scrollY + viewportH) >= (docH - THRESHOLD_PX);
    setVisible(atBottom);
  }

  if (!("IntersectionObserver" in window)) {
    window.addEventListener("scroll", fallbackUpdate, { passive: true });
    window.addEventListener("resize", fallbackUpdate);
    fallbackUpdate();
    return;
  }

  let io;

  function setupObserver(){
    if (io) io.disconnect();

    // We want "later", so we *don't* add barH here.
    // Using a negative SHOW_LATER_PX makes the sentinel need to be closer to the viewport bottom.
io = new IntersectionObserver(
  (entries) => setVisible(entries[0]?.isIntersecting),
  {
    root: null,
    threshold: 0,
    // True-bottom: no early margin. Sentinel must actually hit the viewport.
    rootMargin: `0px 0px 0px 0px`
  }
);
    io.observe(sentinel);
  }

  setupObserver();
  window.addEventListener("resize", setupObserver);
  window.addEventListener("orientationchange", setupObserver);
})();
  // ============================================================
  // PROJECTS PRELOAD (lightweight + staged)
  // - metadata for all immediately
  // - load all when Projects is near viewport
  // - warmStart only AFTER intro completes (prevents glitch)
  // ============================================================
  const projectsPreload = (() => {
    const root = document.getElementById("projects");
    if (!root) return null;

    const videos = Array.from(root.querySelectorAll(".slide video"));

// ============================================================
// CAPTIONS (TikTok scroll) — handles links + 2-line clamp + show more routing
// ============================================================

const toIgUrl = (handle) => `https://www.instagram.com/${handle.replace(/^@/, "")}/`;

const linkifyCaption = (raw) => {
  // Wrap @handles as IG links. Also supports plain domains like "isaacdektor.com".
  // Keeps everything else as text.
  const parts = [];
  const re = /(@[a-zA-Z0-9._]+)|((?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;

  let last = 0;
  let m;
  while ((m = re.exec(raw)) !== null) {
    if (m.index > last) parts.push(document.createTextNode(raw.slice(last, m.index)));

    const token = m[0];

    if (token.startsWith("@")) {
      const a = document.createElement("a");
      a.href = toIgUrl(token);
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = token;
      parts.push(a);
    } else {
      // domain-ish: make it a link (assume https)
      const a = document.createElement("a");
      a.href = token.startsWith("http") ? token : `https://${token}`;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = token;
      parts.push(a);
    }

    last = m.index + token.length;
  }
  if (last < raw.length) parts.push(document.createTextNode(raw.slice(last)));

  return parts;
};

const ensureShowMoreBtn = (slide) => {
  const overlay = slide.querySelector(".overlay");
  if (!overlay) return null;

  let btn = overlay.querySelector(".overlay-more");
  if (btn) return btn;

  btn = document.createElement("button");
  btn.type = "button";
  btn.className = "overlay-more";
  btn.textContent = "… Show more";
  overlay.appendChild(btn);

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Route to the project page for THIS slide.
    // Optional: if you later add data-anchor="some-section" on the slide, we’ll deep-link it.
    const href = slide.getAttribute("href") || "";
    const anchor = slide.dataset.anchor ? `#${slide.dataset.anchor}` : "";
    if (href) window.location.href = href + anchor;
  });

  return btn;
};

const prepareCaption = (slide) => {
  const meta = slide.querySelector(".overlay-meta");
  if (!meta || meta.dataset.linkified === "1") return;

  const raw = meta.textContent || "";
  meta.innerHTML = "";
  linkifyCaption(raw).forEach((node) => meta.appendChild(node));
  meta.dataset.linkified = "1";
};

const setCaptionClampAndMore = (slide, isActive) => {
  const meta = slide.querySelector(".overlay-meta");
  if (!meta) return;

  prepareCaption(slide);

  // Always clamp on active slide; non-active doesn’t matter but keep clean
  meta.classList.toggle("is-clamped", isActive);

  const btn = ensureShowMoreBtn(slide);
  if (!btn) return;

  if (!isActive) {
    btn.classList.remove("is-visible");
    return;
  }

  // Detect overflow: temporarily remove clamp to measure natural height
  const was = meta.classList.contains("is-clamped");
  meta.classList.remove("is-clamped");
  const natural = meta.getBoundingClientRect().height;
  meta.classList.toggle("is-clamped", was);
  const clamped = meta.getBoundingClientRect().height;

  const needsMore = natural > clamped + 2;
  btn.classList.toggle("is-visible", needsMore);
};

    if (!videos.length) return null;

    const warmCount = 3;

    function applyLightDefaults() {
  // Let mm-media.js be the single boss for autoplay + lazy behavior.
  // Here we only set safe attributes and DO NOT preload everything.
  videos.forEach((v) => {
    v.muted = true;
    v.loop = true;
    v.playsInline = true;

    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    v.setAttribute("webkit-playsinline", "");

    // important: don't load all videos on mobile
    v.preload = "none";
    v.setAttribute("preload", "none");

    // never show controls in-feed
    v.controls = false;
    v.removeAttribute("controls");
  });
}

    function warmStart() {
      videos.slice(0, warmCount).forEach((v) => {
        v.preload = "auto";
        try { v.load(); } catch {}
      });
    }

    function loadAllWhenNear() {
      const io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;

          videos.forEach((v) => {
            v.preload = "auto";
            try { v.load(); } catch {}
          });

          io.disconnect();
        },
        { root: null, rootMargin: "900px 0px", threshold: 0.01 }
      );

      io.observe(root);
    }

applyLightDefaults();

// Let mm-media.js handle source attach + play/pause + unload.
// Do NOT preload/load everything for Projects here (mobile will crash).
return { warmStart: null };
  })();

  // ============================================================
  // PLAY INTRO OR SKIP
  // ============================================================
  if (skipIntro) {
    revealInstant();

    // Clean URL
    params.delete("skipIntro");
    const clean =
      window.location.pathname +
      (params.toString() ? `?${params.toString()}` : "") +
      window.location.hash;
    history.replaceState({}, "", clean);

    // no intro animation, safe to warm immediately
  } else {
    const full = "MAISON MAGNOLIA";
    const secondMIndex = full.indexOf("MAGNOLIA");
    const keepIndices = new Set([0, secondMIndex]);

    if (!logoText || !logoBtn || !header) {
      revealInstant();
    } else {
      const chars = Array.from(full);
      logoText.textContent = "";

      const spans = chars.map((ch, i) => {
        const s = document.createElement("span");
        s.className = "char";
        s.textContent = ch;
        s.dataset.index = String(i);
        s.dataset.keep = keepIndices.has(i) ? "1" : "0";
        logoText.appendChild(s);
        return s;
      });

      document.body.classList.remove("preload");

      // ✅ double RAF = paint first, then measure (reduces jank)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const widths = spans.map((s) => s.getBoundingClientRect().width);
          spans.forEach((s, i) => {
            s.style.width = `${widths[i]}px`;
            s.style.opacity = "1";
            s.style.transform = "rotateY(0deg)";
          });

          const pad =
            parseFloat(
              getComputedStyle(document.documentElement).getPropertyValue("--pad")
            ) || 40;

          const totalWidth = logoBtn.getBoundingClientRect().width;
          const startX = Math.max(0, window.innerWidth - pad * 2 - totalWidth);
          logoBtn.style.transform = `translateX(${startX}px)`;

          const easeAE = "cubic-bezier(0.45, 0.50, 0.55, 1.00)";
          const moveDuration = 2000;

          // ✅ this is what you asked for: a SLIGHT DELAY before movement begins
          const introDelayMs = 180;

          // collapse timing
          const collapseDuration = 1500;
          const perCharStagger = 32;

          const removable = spans
            .map((s, i) => ({ s, i, ch: s.textContent, keep: s.dataset.keep === "1" }))
            .filter((o) => !o.keep || o.ch === " ")
            .sort((a, b) => b.i - a.i);

          const totalStagger = (removable.length - 1) * perCharStagger;
          const collapseStart = Math.max(
            0,
            moveDuration - collapseDuration - totalStagger
          );

          // run everything after slight delay
          setTimeout(() => {
            // logo move
            logoBtn.animate(
              [
                { transform: `translateX(${startX}px)` },
                { transform: "translateX(0px)" },
              ],
              { duration: moveDuration, easing: easeAE, fill: "forwards" }
            );

            // letter collapse
            removable.forEach((o, n) => {
              const delay = collapseStart + n * perCharStagger;

              o.s.animate(
                [
                  {
                    width: o.s.style.width,
                    opacity: 1,
                    transform: "rotateY(0deg)",
                  },
                  {
                    offset: 0.86,
                    width: "0px",
                    opacity: 1,
                    transform: "rotateY(90deg)",
                  },
                  { width: "0px", opacity: 0, transform: "rotateY(90deg)" },
                ],
                {
                  duration: collapseDuration,
                  delay,
                  easing: easeAE,
                  fill: "forwards",
                }
              );
            });

            // header reveal at end of movement
            setTimeout(() => {
              header.animate([{ opacity: 0 }, { opacity: 1 }], {
                duration: 900,
                easing: easeAE,
                fill: "forwards",
              });

              header.style.pointerEvents = "auto";
              document.body.style.overflowY = "auto";
              logoBtn.classList.add("is-home");
              document.body.classList.add("intro-done");
              // ✅ warm projects AFTER intro is done (prevents glitch)
            }, moveDuration);
          }, introDelayMs);
        });
      });
    }
  }

  // ============================================================
  // ACTIVE NAV (only in-page anchors)
  // NOTE: you said you’ll handle labels, so this only sets .is-active
  // ============================================================
  (function initActiveNav() {

    let lastScrollY = window.scrollY;
let scrollDir = "down";

window.addEventListener("scroll", () => {
  const y = window.scrollY;
  scrollDir = y > lastScrollY ? "down" : "up";
  lastScrollY = y;
}, { passive: true });

    const navLinks = Array.from(document.querySelectorAll(".nav a[href^='#']"));
const sideTitle = document.getElementById("sideTitle");
    
    const sideTitleText = sideTitle ? sideTitle.querySelector(".sideTitleText") : null;
let lastSideTitle = "";
let sideTitleTimer = null;


    if (!navLinks.length) return;

    const sections = navLinks
      .map((a) => document.querySelector(a.getAttribute("href")))
      .filter(Boolean);

    if (!sections.length) return;

    function updateActiveNav() {
      // probe line: upper-middle (you can adjust this)
      const probeY = window.innerHeight * 0.35;

      let activeId = null;
      for (const sec of sections) {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= probeY && rect.bottom >= probeY) {
          activeId = sec.id;
          break;
        }
      }

      navLinks.forEach((a) => {
        const id = a.getAttribute("href").slice(1);
        a.classList.toggle("is-active", id === activeId);
      });

      // Right-side section title (Intro only for now)
// Right-side section title (all main sections)
// Right-side section title (all main sections) with animated swap
if (sideTitle && sideTitleText) {
  const titles = {
    introduction: "INTRODUCTION",
    gallery: "EXPLORE",
    about: "ABOUT",
    projects: "COLLABORATIONS",
    team: "EXPERTS",
  };

  const nextTitle = activeId ? titles[activeId] : "";

  const clearClasses = () => {
    sideTitle.classList.remove(
      "exit-up",
      "exit-down",
      "enter-from-top",
      "enter-from-bottom",
      "entering"
    );
  };

  if (!nextTitle) {
    sideTitle.classList.remove("is-visible");
    sideTitleText.textContent = "";
    lastSideTitle = "";
    clearClasses();
    return;
  }

  sideTitle.classList.add("is-visible");

  // First render
  if (!lastSideTitle) {
    sideTitleText.textContent = nextTitle;
    lastSideTitle = nextTitle;
    clearClasses();
    return;
  }

  // Same title → do nothing
  if (nextTitle === lastSideTitle) return;

// EXIT current title (do NOT clear classes until after we prep the next one)
clearClasses();
sideTitle.classList.add(scrollDir === "down" ? "exit-up" : "exit-down");

// FAST swap
setTimeout(() => {
  // Keep it hidden while swapping
  clearClasses();
  sideTitle.classList.add(scrollDir === "down" ? "enter-from-bottom" : "enter-from-top");

  // swap text while hidden (prep state has transition: none + opacity 0)
  sideTitleText.textContent = nextTitle;

  // force layout so prep state "sticks"
  void sideTitleText.offsetHeight;

  // ENTER next
  clearClasses();
  sideTitle.classList.add("entering");
  lastSideTitle = nextTitle;
}, 160);  // slower fade/settle (same behavior)
}

    }

    window.addEventListener("scroll", updateActiveNav, { passive: true });
    window.addEventListener("resize", updateActiveNav);
    updateActiveNav();
  })();

  // ============================================================
// HOME: MOBILE HAMBURGER (brand-nav style) + show only after nav scrolls away
// - Reuses your "bulletproof summary toggle" approach
// - Outside click closes
// - ESC closes
// - Shows only when nav area is offscreen (via #navSentinel)
// ============================================================
// ============================================================
// HOME: MOBILE HAMBURGER (brand-nav style) + show only after header scrolls off
// ============================================================
(function initHomeHamburger(){
  const detailsWrap = document.querySelector("details.homeMenuWrap");
  const menuBtn = document.querySelector("#siteHeader .homeMenuBtn"); // summary
  const menu = document.querySelector("#siteHeader .homeMenu");
  const header = document.getElementById("siteHeader");

  if (!detailsWrap || !menuBtn || !menu || !header) return;

  const mq = window.matchMedia("(max-width: 900px)");

  const setMenuOpen = (open) => {
    detailsWrap.open = !!open;
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menu.setAttribute("aria-hidden", open ? "false" : "true");
  };

  const isMenuOpen = () => !!detailsWrap.open;

  // init aria
  menuBtn.setAttribute("aria-expanded", isMenuOpen() ? "true" : "false");
  menu.setAttribute("aria-hidden", isMenuOpen() ? "false" : "true");

  // Bulletproof summary toggle (capture)
  menuBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(!isMenuOpen());
  }, true);

  // Backdrop (matches brand behavior)
  const syncMenuBackdrop = () => {
    const open = isMenuOpen();
    let bd = document.querySelector(".mmMenuBackdrop.home");
    if (open && !bd) {
      bd = document.createElement("div");
      bd.className = "mmMenuBackdrop home";
      document.body.appendChild(bd);
      bd.addEventListener("click", () => setMenuOpen(false));
    }
    if (!open && bd) bd.remove();
  };

  detailsWrap.addEventListener("toggle", syncMenuBackdrop);
  syncMenuBackdrop();

  // Close on outside click (capture)
  document.addEventListener("click", (e) => {
    if (!isMenuOpen()) return;
    if (detailsWrap.contains(e.target)) return;
    setMenuOpen(false);
  }, true);

  // ESC closes
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenuOpen(false);
  });

  // Tap a link closes
  menu.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    setMenuOpen(false);
  });

  // Show hamburger EXACTLY when header is offscreen
  const setOff = (off) => {
    if (!mq.matches) off = false;
    document.body.classList.toggle("mmNavOff", !!off);
    if (!off) setMenuOpen(false);
  };

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(([entry]) => {
      // immediate + precise: header is "off" when its bottom is above viewport top
      const off = entry.boundingClientRect.bottom <= 0;
      setOff(off);
    }, { root: null, threshold: 0, rootMargin: "0px" });

    io.observe(header);

    mq.addEventListener?.("change", () => setOff(false));
    setOff(false);
    return;
  }

  // Fallback (no IO): scroll check
  const onScroll = () => {
    const r = header.getBoundingClientRect();
    setOff(r.bottom <= 0);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

  // ============================================================
  // PROJECTS CONTROLLER
  // - NO wheel hijacking
  // - hover/click on the list updates the phone
  // - plays active + neighbors only
  // - does not change page scrolling at all
  // ============================================================
  (function initProjects() {
    const root = document.getElementById("projects");
    if (!root) return;

      // MOBILE: Projects becomes a horizontal swipe row (CSS-driven).
  // Prevent the vertical TikTok controller from forcing translateY().
  if (window.matchMedia("(max-width: 520px)").matches) return;

        // MOBILE: Projects becomes a native horizontal scroller (CSS-driven)
    // Skip the desktop "client list ↔ phone" controller so it doesn't fight touch scrolling.
    const mqProjectsMobile = window.matchMedia("(max-width: 520px)");
    if (mqProjectsMobile.matches) return;

const container = root.querySelector(".video-container");
    const track = root.querySelector(".video-track");
    const slides = Array.from(root.querySelectorAll(".slide"));
    const clients = Array.from(root.querySelectorAll(".client"));
    const videos = Array.from(root.querySelectorAll(".slide video"));

// ============================================================
// CAPTIONS (TikTok scroll) — handles links + 2-line clamp + show more routing
// ============================================================

const toIgUrl = (handle) => `https://www.instagram.com/${handle.replace(/^@/, "")}/`;

const linkifyCaption = (raw) => {
  // Wrap @handles as IG links. Also supports plain domains like "isaacdektor.com".
  // Keeps everything else as text.
  const parts = [];
  const re = /(@[a-zA-Z0-9._]+)|((?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;

  let last = 0;
  let m;
  while ((m = re.exec(raw)) !== null) {
    if (m.index > last) parts.push(document.createTextNode(raw.slice(last, m.index)));

    const token = m[0];

    if (token.startsWith("@")) {
      const a = document.createElement("a");
      a.href = toIgUrl(token);
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = token;
      parts.push(a);
    } else {
      // domain-ish: make it a link (assume https)
      const a = document.createElement("a");
      a.href = token.startsWith("http") ? token : `https://${token}`;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = token;
      parts.push(a);
    }

    last = m.index + token.length;
  }
  if (last < raw.length) parts.push(document.createTextNode(raw.slice(last)));

  return parts;
};

const ensureShowMoreBtn = (slide) => {
  const overlay = slide.querySelector(".overlay");
  if (!overlay) return null;

  let btn = overlay.querySelector(".overlay-more");
  if (btn) return btn;

  btn = document.createElement("button");
  btn.type = "button";
  btn.className = "overlay-more";
  btn.textContent = "… Show more";
  overlay.appendChild(btn);

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Route to the project page for THIS slide.
    // Optional: if you later add data-anchor="some-section" on the slide, we’ll deep-link it.
    const href = slide.getAttribute("href") || "";
    const anchor = slide.dataset.anchor ? `#${slide.dataset.anchor}` : "";
    if (href) window.location.href = href + anchor;
  });

  return btn;
};

const prepareCaption = (slide) => {
  const meta = slide.querySelector(".overlay-meta");
  if (!meta || meta.dataset.linkified === "1") return;

  const raw = meta.textContent || "";
  meta.innerHTML = "";
  linkifyCaption(raw).forEach((node) => meta.appendChild(node));
  meta.dataset.linkified = "1";
};

const setCaptionClampAndMore = (slide, isActive) => {
  const meta = slide.querySelector(".overlay-meta");
  if (!meta) return;

  prepareCaption(slide);

  // Always clamp on active slide; non-active doesn’t matter but keep clean
  meta.classList.toggle("is-clamped", isActive);

  const btn = ensureShowMoreBtn(slide);
  if (!btn) return;

  if (!isActive) {
    btn.classList.remove("is-visible");
    return;
  }

  // Detect overflow: temporarily remove clamp to measure natural height
  const was = meta.classList.contains("is-clamped");
  meta.classList.remove("is-clamped");
  const natural = meta.getBoundingClientRect().height;
  meta.classList.toggle("is-clamped", was);
  const clamped = meta.getBoundingClientRect().height;

  const needsMore = natural > clamped + 2;
  btn.classList.toggle("is-visible", needsMore);
};


    if (!container || !track || !slides.length || !clients.length || !videos.length) {
      console.warn("Projects: Missing elements", {
        container: !!container,
        track: !!track,
        slides: slides.length,
        clients: clients.length,
        videos: videos.length,
      });
      return;
    }

    let activeIndex = 0;

    function slideHeight() {
      const h = Math.round(container.getBoundingClientRect().height);
      container.style.setProperty("--slide-h", `${h}px`);
      return h;
    }

    function clampIndex(i) {
      return Math.max(0, Math.min(i, slides.length - 1));
    }

    function setActiveClient(rawIndex, clampedIndex) {
      clients.forEach((c) => c.classList.remove("is-active"));
      const exact = clients.find((c) => Number(c.dataset.index) === rawIndex);
      (exact || clients[clampedIndex] || clients[0])?.classList.add("is-active");
    }

    videos.forEach((v) => {
      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      if (!v.preload) v.preload = "metadata";
    });

    async function tryPlay(v) {
      try {
        await v.play();
        return true;
      } catch {
        return false;
      }
    }

function primeAround(i) {
  const idxs = [i - 2, i - 1, i, i + 1, i + 2].filter((n) => n >= 0 && n < videos.length);

  // ensure current + nearby vids have frames ready
  idxs.forEach((n) => {
    const v = videos[n];
    v.preload = "auto";
    try { v.load(); } catch {}
  });

  // Desktop/iPad: pause non-neighbors for performance
  // Phone: DON'T aggressively pause during scrubs (prevents black gaps)
  if (!isPhone()) {
    videos.forEach((v, n) => {
      if (!idxs.includes(n) && !v.paused) {
        try { v.pause(); } catch {}
      }
    });
  }

  tryPlay(videos[i]);
}

    // unlock autoplay on first gesture
// unlock autoplay on first gesture (let mm-media.js do the real work)
const unlockOnce = () => {
  primeAround(activeIndex);
};
window.addEventListener("pointerdown", unlockOnce, { once: true, passive: true });
window.addEventListener("touchstart", unlockOnce, { once: true, passive: true });
window.addEventListener("touchmove", unlockOnce, { once: true, passive: true });

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) primeAround(activeIndex);
    });

function goTo(rawIndex) {
  const i = clampIndex(rawIndex);
  activeIndex = i;

  const h = slideHeight();
  track.style.transform = `translateY(${-i * h}px)`;

  slides.forEach((s, idx) => {
      const active = idx === i;
      s.classList.toggle("is-active", active);
      setCaptionClampAndMore(s, active);
    });
setActiveClient(rawIndex, i);
  primeAround(i);
}

    clients.forEach((el) => {
  el.addEventListener("mouseenter", () => {
    const raw = Number(el.dataset.index);
    if (!Number.isFinite(raw)) return;
    goTo(raw);
  });

  el.addEventListener("click", (e) => {
    // If it's a real link to a brand page, let it navigate.
    if (el.tagName === "A" && el.getAttribute("href")) return;

    const raw = Number(el.dataset.index);
    if (!Number.isFinite(raw)) return;
    e.preventDefault();
    goTo(raw);
  });
});
// Mobile: horizontal thumb scroll updates the active slide
const listEl = root.querySelector(".client-list");
const isMobile = () => window.matchMedia("(max-width: 520px)").matches;

let raf = 0;
const onThumbScroll = () => {
  if (!isMobile() || !listEl) return;

  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => {
    const items = clients;
    if (!items.length) return;

    const listRect = listEl.getBoundingClientRect();
    const centerX = listRect.left + listRect.width / 2;

    let bestIdx = 0;
    let bestDist = Infinity;

    items.forEach((it) => {
      const r = it.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const d = Math.abs(cx - centerX);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = Number(it.dataset.index) || 0;
      }
    });

    goTo(bestIdx);
  });
};

if (listEl) {
  listEl.addEventListener("scroll", onThumbScroll, { passive: true });

  // ============================================================
  // MOBILE: MOVE CLIENT LIST INTO VIDEO CONTAINER (MASKED)
  // ============================================================
  const container = root.querySelector(".video-container");
  const originalParent = listEl.parentElement;
  const originalNext = listEl.nextSibling;

  let overlayWrap = null;

  const mountIntoVideo = () => {
    if (!container || overlayWrap) return;

    overlayWrap = document.createElement("div");
    overlayWrap.className = "clientOverlay";
    container.appendChild(overlayWrap);
    overlayWrap.appendChild(listEl);
  };

  const restoreToRight = () => {
    if (!overlayWrap) return;

    if (originalParent) {
      if (originalNext) originalParent.insertBefore(listEl, originalNext);
      else originalParent.appendChild(listEl);
    }

    overlayWrap.remove();
    overlayWrap = null;
  };

  const syncClientListPosition = () => {
    const isMobile = window.matchMedia("(max-width: 520px)").matches;
    if (isMobile) mountIntoVideo();
    else restoreToRight();
  };

  syncClientListPosition();
  window.addEventListener("resize", syncClientListPosition);
}

window.addEventListener("resize", () => {
  goTo(activeIndex);

  // Force CSS mask to re-rasterize (fixes iPad/responsive mismatch)
  const mask = root.querySelector(".phoneMask");
  if (mask) {
    // tiny size nudge -> repaint -> restore
    mask.style.webkitMaskSize = "99.9% 99.9%";
    mask.style.maskSize = "99.9% 99.9%";
    requestAnimationFrame(() => {
      mask.style.webkitMaskSize = "100% 100%";
      mask.style.maskSize = "100% 100%";
    });
  }
});
    // init
    slideHeight();
    goTo(0);
  })();
});

(function initPhoneFrameOverlay(){
  const root = document.getElementById("projects");
  if (!root) return;

  const container = root.querySelector(".video-container");
  if (!container) return;

  const SVG_URL = "assets/iphonec.svg";

  const overlayEl = document.createElement("div");
  overlayEl.className = "phoneFrameOverlay";
  container.appendChild(overlayEl);

  fetch(SVG_URL)
    .then(res => res.text())
    .then(svgText => {
      overlayEl.innerHTML = svgText;
    })
    .catch(() => {
      // fail silently — doesn't break layout
    });
})();



/* ============================================================
   PATCH: Make each expert row clickable WITHOUT changing markup
   - For normal experts: click anywhere on the row => same URL as the @ handle
   - For Frannie (featured): click anywhere EXCEPT the name link => Instagram handle URL
   - If you click an actual <a>, default behavior wins (no interference)
   ============================================================ */
(function initExpertRowLinks(){
  const list = document.querySelector(".experts-list");
  if (!list) return;

  // Add affordance
  list.querySelectorAll("li.expert").forEach(li => {
    li.style.cursor = "pointer";
    li.setAttribute("role", "link");
    if (!li.hasAttribute("tabindex")) li.setAttribute("tabindex", "0");
  });

  function getDestination(li){
    if (!li) return null;

    // Featured: preserve name => bio link; row click uses handle link.
    if (li.classList.contains("expert-featured")){
      const handle = li.querySelector("a.expert-handle[href]");
      return handle ? handle.getAttribute("href") : null;
    }

    const handle = li.querySelector("a.expert-handle[href]");
    if (handle) return handle.getAttribute("href");

    // Fallback: first link in row
    const any = li.querySelector("a[href]");
    return any ? any.getAttribute("href") : null;
  }

  function navigateTo(href){
    if (!href) return;
    const isExternal = /^https?:\/\//i.test(href);
    if (isExternal) window.open(href, "_blank", "noopener,noreferrer");
    else window.location.href = href;
  }

  list.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a) return; // let real links behave normally

    const li = e.target.closest("li.expert");
    if (!li) return;

    const href = getDestination(li);
    if (!href) return;

    e.preventDefault();
    navigateTo(href);
  });

  list.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const li = e.target.closest("li.expert");
    if (!li) return;

    // If focused element is a real link, let it handle Enter naturally
    if (e.target.closest("a")) return;

    const href = getDestination(li);
    if (!href) return;

    e.preventDefault();
    navigateTo(href);
  });
})();

// ============================================================
// FRANNIE BIO MODAL (FINAL — centered + nav stays green + no jump)
// ============================================================
(function initFrannieBioModal(){
  function boot(){
    const modal = document.getElementById("frannieModal");
    if (!modal) return;

    const closeEls = modal.querySelectorAll("[data-close]");
    let scrollY = 0;

    function openModal(){
      scrollY = window.scrollY || window.pageYOffset;

      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");

      // ✅ keep Experts nav green while open (CSS targets this)
      document.body.classList.add("bioModal-open");

      // lock scroll WITHOUT touching overflow
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
    }

    function closeModal(){
      // 1) restore body first (modal still covering everything)
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";

      // ✅ remove green-nav override class
      document.body.classList.remove("bioModal-open");

      // 2) force instant scroll restore (override smooth scrolling temporarily)
      const html = document.documentElement;
      const prevScrollBehavior = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      window.scrollTo(0, scrollY);

      // 3) next frame: restore scroll behavior + then hide modal (no visible movement)
      requestAnimationFrame(() => {
        html.style.scrollBehavior = prevScrollBehavior;
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
      });
    }

    // OPEN (capture phase so IG click never fires)
    document.addEventListener("click", (e) => {
      const trigger = e.target.closest(
        ".expert-featured .expert-link, .expert-featured .expert-bio-trigger"
      );
      if (!trigger) return;

      e.preventDefault();
      e.stopPropagation();
      openModal();
    }, true);

    // CLOSE (X + backdrop)
    closeEls.forEach(el =>
      el.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      })
    );

    // ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();