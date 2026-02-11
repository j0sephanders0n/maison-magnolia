document.addEventListener("DOMContentLoaded", () => {
  // ============================================================
  // ALWAYS START AT TOP ON REFRESH
  // ============================================================
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  // some browsers restore scroll after DOMContentLoaded, force again next tick
  setTimeout(() => window.scrollTo(0, 0), 0);

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
  };

  // ============================================================
// BOTTOM CONTACT BAR (show when user reaches page bottom)
// ============================================================
(function initContactBar(){
  const bar = document.getElementById("contactBar");
  if (!bar) return;

  const THRESHOLD_PX = 24; // how close to bottom counts as "at bottom"

  function atBottom(){
    const scrollY = window.scrollY || window.pageYOffset;
    const viewportH = window.innerHeight || document.documentElement.clientHeight;
    const docH = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );

    return (scrollY + viewportH) >= (docH - THRESHOLD_PX);
  }

  function update(){
    bar.classList.toggle("is-visible", atBottom());
  }

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
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
      videos.forEach((v) => {
        v.muted = true;
        v.loop = true;
        v.playsInline = true;
        v.preload = "metadata";
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
    loadAllWhenNear();

    return { warmStart };
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
    if (projectsPreload?.warmStart) projectsPreload.warmStart();
  } else {
    const full = "MAISON MAGNOLIA";
    const secondMIndex = full.indexOf("MAGNOLIA");
    const keepIndices = new Set([0, secondMIndex]);

    if (!logoText || !logoBtn || !header) {
      revealInstant();
      if (projectsPreload?.warmStart) projectsPreload.warmStart();
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

              // ✅ warm projects AFTER intro is done (prevents glitch)
              if (projectsPreload?.warmStart) projectsPreload.warmStart();
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
  // PROJECTS CONTROLLER
  // - NO wheel hijacking
  // - hover/click on the list updates the phone
  // - plays active + neighbors only
  // - does not change page scrolling at all
  // ============================================================
  (function initProjects() {
    const root = document.getElementById("projects");
    if (!root) return;

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
      const idxs = [i - 1, i, i + 1].filter((n) => n >= 0 && n < videos.length);

      idxs.forEach((n) => {
        const v = videos[n];
        v.preload = "auto";
        try { v.load(); } catch {}
      });

      videos.forEach((v, n) => {
        if (!idxs.includes(n) && !v.paused) {
          try { v.pause(); } catch {}
        }
      });

      tryPlay(videos[i]);
    }

    // unlock autoplay on first gesture
    const unlockOnce = () => primeAround(activeIndex);
    window.addEventListener("pointerdown", unlockOnce, { once: true });
    window.addEventListener("keydown", unlockOnce, { once: true });
    window.addEventListener("touchstart", unlockOnce, { once: true });

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
}

window.addEventListener("resize", () => goTo(activeIndex));

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

  const SVG_URL = "assets/media/phone-frame.svg";

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
