/* =========================================================
   BRAND PAGES — brand-nav.js (shared) FINAL v2
   - Hamburger menu (drawer on <=900px) + backdrop
   - Top brand navigator (arrows + current label)
   - Left nav active state (scrollspy) + TOP LOCK for first section
   - Right people list swap per section via #mmBrandData JSON
   - Lightbox carousel:
       Desktop/Tablet: arrows + keyboard
       Phone: vertical TikTok scroll (snap) full-bleed on black
   - Experts drawer:
       <=900px only: vertical folder tab, slide-out panel
       No page blur (ever)
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  if (!body || !body.classList.contains("brand-page")) return;
  // ============================================================



// ============================================================
// PATH BASE (works for BOTH):
// - Cloudflare Pages: https://maison-magnoliagroup.pages.dev/   (SITE_BASE = "")
// - GitHub Pages:     https://j0sephanders0n.github.io/maison-magnolia/ (SITE_BASE = "/maison-magnolia")
// And it auto-detects whether brand pages live in "/projects" or root.
// ============================================================

const SITE_BASE = (() => {
  if (location.hostname.endsWith("github.io")) {
    const seg = location.pathname.split("/").filter(Boolean)[0] || "";
    return seg ? `/${seg}` : "";
  }
  return "";
})();

// Are we currently inside /projects/... ?
const BRAND_DIR = location.pathname.includes("/projects/") ? "/projects" : "";

// Helper to build a correct absolute URL for brand pages
const H = (file) => {
  const path = `${SITE_BASE}${BRAND_DIR}/${file}`.replace(/\/{2,}/g, "/");
  return path;
};

const BRANDS = [
  { name: "ASOS", href: H("asos.html") },
  { name: "AMI", href: H("ami.html") },
  { name: "AMIRI", href: H("amiri.html") },
  { name: "BALMAIN", href: H("balmain.html") },
  { name: "BMW", href: H("bmw.html") },
  { name: "BOSS", href: H("boss.html") },
  { name: "BREITLING", href: H("breitling.html") },
  { name: "DAVID YURMAN", href: H("david-yurman.html") },
  { name: "GIVENCHY", href: H("givenchy.html") },
  { name: "GOOGLE PIXEL", href: H("google-pixel.html") },
  { name: "HERMES", href: H("hermes.html") },
  { name: "HUGO", href: H("hugo.html") },
  { name: "H&M", href: H("hm.html") },
  { name: "JIMMY CHOO", href: H("jimmy-choo.html") },
  { name: "LORO PIANA", href: H("loro-piana.html") },
  { name: "LOUIS VUITTON", href: H("louis-vuitton.html") },
  { name: "MARC JACOBS", href: H("marc-jacobs.html") },
  { name: "MARKS & SPENCER", href: H("marks-spencers.html") },
  { name: "MESHKI", href: H("meshki.html") },
  { name: "MICHAEL KORS", href: H("michael-kors.html") },
  { name: "MIU MIU", href: H("miumiu.html") },
  { name: "MOSCHINO", href: H("moschino.html") },
  { name: "NIKE JORDAN", href: H("nikejordan.html") },
  { name: "PANDORA", href: H("pandora.html") },
  { name: "PRADA", href: H("prada.html") },
  { name: "PRADA BEAUTY", href: H("prada-beauty.html") },
  { name: "RABANNE", href: H("rabanne.html") },
  { name: "RENT THE RUNWAY", href: H("rent-the-runway.html") },
  { name: "SPENCE", href: H("spence.html") },
  { name: "SANDRO", href: H("sandro.html") },
  { name: "TORY BURCH", href: H("toryburch.html") },
  { name: "TUMI", href: H("tumi.html") },
  { name: "VERONICA BEARD", href: H("veronica-beard.html") },
];
  /* =========================================================
     HAMBURGER MENU (details/summary)
     ========================================================= */
  const detailsWrap = document.querySelector("details.brandMenuWrap");
  const menuBtn = document.querySelector(".brandMenuBtn"); // summary
  const menu = document.querySelector(".brandMenu");

  const setMenuOpen = (open) => {
    if (detailsWrap) detailsWrap.open = !!open;
    if (menuBtn) menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (menu) menu.setAttribute("aria-hidden", open ? "false" : "true");
  };

  const isMenuOpen = () => (detailsWrap ? !!detailsWrap.open : false);

  if (menuBtn) menuBtn.setAttribute("aria-expanded", isMenuOpen() ? "true" : "false");
  if (menu) menu.setAttribute("aria-hidden", isMenuOpen() ? "false" : "true");

  // Bulletproof summary toggle (capture)
  if (menuBtn) {
    menuBtn.addEventListener(
      "click",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        setMenuOpen(!isMenuOpen());
      },
      true
    );
  }

  // Drawer backdrop for <=900px (created always, shown only when open + media applies in CSS)
  const syncMenuBackdrop = () => {
    const open = isMenuOpen();
    let bd = document.querySelector(".mmMenuBackdrop");
    if (open && !bd) {
      bd = document.createElement("div");
      bd.className = "mmMenuBackdrop";
      document.body.appendChild(bd);
      bd.addEventListener("click", () => setMenuOpen(false));
    }
    if (!open && bd) bd.remove();
  };

  if (detailsWrap) {
    detailsWrap.addEventListener("toggle", syncMenuBackdrop);
    syncMenuBackdrop();
  }

  // Close on outside click (capture)
  document.addEventListener(
    "click",
    (e) => {
      if (!isMenuOpen()) return;
      if (detailsWrap && detailsWrap.contains(e.target)) return;
      setMenuOpen(false);
    },
    true
  );

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenuOpen(false);
  });

  /* =========================================================
     BRAND ROLODEX (arrows + current brand label)
     ========================================================= */
  const navList = document.querySelector(".brandNavList");
  const prevBtn = document.querySelector(".brandNavPrev");
  const nextBtn = document.querySelector(".brandNavNext");

  const getCurrentBrandName = () => {
    const explicit = body.getAttribute("data-brand");
    if (explicit) return explicit.trim();

    const currentPath = (location.pathname.split("/").pop() || "").toLowerCase();
    const byHref = BRANDS.findIndex((b) => ((b.href || "").toLowerCase()).includes(currentPath));
    if (byHref >= 0) return BRANDS[byHref].name;

    return BRANDS[0]?.name || "";
  };

  const currentPath = (location.pathname.split("/").pop() || "").toLowerCase();
  let currentIndex = BRANDS.findIndex(
    (b) => String(b.href || "").toLowerCase().endsWith(currentPath)
  );
  if (currentIndex < 0) currentIndex = 0;

  const renderBrandNav = () => {
    if (!navList) return;
    navList.innerHTML = "";

    const b = BRANDS[currentIndex] || BRANDS[0];
    if (!b) return;

    const a = document.createElement("a");
    a.href = b.href;
    a.textContent = String(b.name || "").toUpperCase();
    a.classList.add("is-current");
    navList.appendChild(a);
  };

  const stepBrand = (dir) => {
    if (!BRANDS.length) return;
    const next = (currentIndex + dir + BRANDS.length) % BRANDS.length;
    const target = BRANDS[next];
    if (target && target.href) window.location.href = target.href;
  };

  if (prevBtn) prevBtn.addEventListener("click", () => stepBrand(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => stepBrand(1));
  renderBrandNav();

  /* =========================================================
     PER-PAGE DATA (JSON in HTML)
     ========================================================= */
  const readBrandData = () => {
    const tag = document.getElementById("mmBrandData");
    if (!tag) return { sections: {} };

    const raw = (tag.textContent || "").trim();
    if (!raw) return { sections: {} };

    try {
      const json = JSON.parse(raw);
      return json && typeof json === "object" ? json : { sections: {} };
    } catch (err) {
      console.warn("[brand-nav] Invalid mmBrandData JSON", err);
      return { sections: {} };
    }
  };

  const BRAND_DATA = readBrandData();
  const SECTION_PEOPLE = (BRAND_DATA && BRAND_DATA.sections) || {};

  /* =========================================================
     LEFT NAV ACTIVE STATE + PEOPLE SWAP
     ========================================================= */
  const leftLinks = Array.from(document.querySelectorAll(".brand-left-link[data-anchor]"));
  const anchors = Array.from(document.querySelectorAll(".brand-anchor[id]"));
  const peopleList = document.getElementById("collabPeople");
  const defaultPeopleHTML = peopleList ? peopleList.innerHTML : "";

  let activeSectionId = "";

  const setActiveLeftLink = (anchorId) => {
    if (!anchorId) return;
    leftLinks.forEach((a) => a.classList.toggle("is-active", a.dataset.anchor === anchorId));
  };

  const renderPeopleFor = (anchorId) => {
    if (!peopleList) return;

    const people = SECTION_PEOPLE[anchorId];

    if (!Array.isArray(people) || !people.length) {
      if (peopleList.innerHTML !== defaultPeopleHTML) peopleList.innerHTML = defaultPeopleHTML;
      return;
    }

    peopleList.classList.add("is-fading");
    setTimeout(() => {
      if (activeSectionId !== anchorId) return;
      peopleList.innerHTML = people
        .map(
          (p) => `
          <li class="expert">
            <span class="expert-name">${String(p.name || "")}</span>
            <span class="expert-meta">${String(p.meta || "")}</span>
          </li>`
        )
        .join("");
      peopleList.classList.remove("is-fading");
    }, 140);
  };

  const activateSection = (anchorId) => {
    if (!anchorId) return;
    if (anchorId === activeSectionId) return;
    activeSectionId = anchorId;
    setActiveLeftLink(anchorId);
    renderPeopleFor(anchorId);
  };

  leftLinks.forEach((a) => {
    a.addEventListener("click", () => {
      const id = a.dataset.anchor;
      if (id) activateSection(id);
    });
  });

  const initScrollSpy = () => {
    if (!anchors.length) return;

    const initial = location.hash ? location.hash.replace("#", "") : anchors[0].id;
    if (initial) activateSection(initial);

    // TOP LOCK: ensures first section re-activates near top without changing other triggers
    const firstId = anchors[0]?.id || "";
    const TOP_LOCK_PX = 180;

    const topLock = () => {
      if (!firstId) return;
      if (window.scrollY <= TOP_LOCK_PX) activateSection(firstId);
    };
    window.addEventListener("scroll", topLock, { passive: true });
    topLock();

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

          if (visible.length) activateSection(visible[0].target.id);
        },
        {
          root: null,
          rootMargin: "-25% 0px -65% 0px",
          threshold: 0
        }
      );

      anchors.forEach((el) => io.observe(el));
      return;
    }
  };

  initScrollSpy();

  /* =========================================================
     EXPERTS DRAWER TAB (ONLY <= 900px)
     - No blur. Just slide in/out.
     ========================================================= */
  const expertsPanel = document.querySelector(".brand-people");
  const mqExperts = window.matchMedia("(max-width: 1100px)");
  let expertsTab = null;

  const setExpertsOpen = (open) => {
    if (!expertsPanel) return;
    expertsPanel.classList.toggle("is-open", !!open);
  };

  const ensureExpertsTab = () => {
    if (!expertsPanel) return;

    // Desktop: remove tab + close
    if (!mqExperts.matches) {
      setExpertsOpen(false);
      const existing = expertsPanel.querySelector(".expertsTab");
      if (existing) existing.remove();
      expertsTab = null;
      return;
    }

    // Mobile/tablet: create tab if missing
    if (!expertsPanel.querySelector(".expertsTab")) {
      expertsTab = document.createElement("button");
      expertsTab.type = "button";
      expertsTab.className = "expertsTab";
expertsTab.innerHTML = "<span>Experts</span>";
      expertsPanel.prepend(expertsTab);

      expertsTab.addEventListener("click", () => {
        setExpertsOpen(!expertsPanel.classList.contains("is-open"));
      });

      // Swipe right to close when open
      let sx = 0, sy = 0, tracking = false;

      expertsPanel.addEventListener(
        "touchstart",
        (e) => {
          if (!expertsPanel.classList.contains("is-open")) return;
          const t = e.touches && e.touches[0];
          if (!t) return;
          sx = t.clientX;
          sy = t.clientY;
          tracking = true;
        },
        { passive: true }
      );

      expertsPanel.addEventListener(
        "touchmove",
        (e) => {
          if (!tracking) return;
          const t = e.touches && e.touches[0];
          if (!t) return;

          const dx = t.clientX - sx;
          const dy = t.clientY - sy;

          if (dx > 70 && Math.abs(dy) < 40) {
            tracking = false;
            setExpertsOpen(false);
          }
        },
        { passive: true }
      );

      expertsPanel.addEventListener(
        "touchend",
        () => {
          tracking = false;
        },
        { passive: true }
      );
    }

    // Always keep the experts list scrollable (supports 30+ names)
    const list = expertsPanel.querySelector(".brand-people-list");
    if (list) {
      list.style.overflowY = "auto";
      list.style.webkitOverflowScrolling = "touch";
      list.style.maxHeight = "calc(100vh - 140px)";
    }
  };

  ensureExpertsTab();
  mqExperts.addEventListener?.("change", ensureExpertsTab);


});

/* =========================================================
   LIGHTBOX v4 — Carousel (REAL MEDIA + REAL RATIO)
   - Click tile opens lightbox
   - Prev/Next arrows work
   - Auto-ratio from actual video metadata (videoWidth/videoHeight)
   - Autoplay on open (muted for iOS), controls visible
   ========================================================= */

(() => {
  if (!document.body.classList.contains("brand-page")) return;

  const body = document.body;

  const ensureLightbox = () => {
    let lb = document.querySelector(".mmLightbox");
    if (lb) return lb;

    lb = document.createElement("div");
    lb.className = "mmLightbox";
    lb.innerHTML = `
      <div class="mmLightbox-backdrop" aria-hidden="true"></div>

      <div class="mmLightbox-ui" role="dialog" aria-modal="true" aria-label="Media viewer">
        <button class="mmLightbox-nav mmLightbox-prev" type="button" aria-label="Previous">‹</button>

        <div class="mmLightbox-stage">
          <div class="mmLightbox-frame" aria-live="polite"></div>
        </div>

        <button class="mmLightbox-nav mmLightbox-next" type="button" aria-label="Next">›</button>
      </div>

      <button class="mmLightbox-close" type="button" aria-label="Close">×</button>
    `;
    document.body.appendChild(lb);
    return lb;
  };

  const getTileMedia = (tile) => {
    // VIDEO tile
    const vSource = tile.querySelector("video source");
    if (vSource) {
      const src = vSource.getAttribute("src") || vSource.getAttribute("data-src") || "";
      return { kind: "video", src };
    }

    // IMAGE tile
    const img = tile.querySelector("img");
    if (img) {
      const src = img.getAttribute("src") || img.getAttribute("data-src") || "";
      return { kind: "image", src };
    }

    return { kind: "unknown", src: "" };
  };

  let lbState = { isOpen: false, tiles: [], index: 0 };

  const render = () => {
    const lb = document.querySelector(".mmLightbox");
    if (!lb) return;

    const frame = lb.querySelector(".mmLightbox-frame");
    if (!frame) return;

    const tile = lbState.tiles[lbState.index];
    if (!tile) return;

    const media = getTileMedia(tile);
    frame.innerHTML = "";
    if (!media.src) return;

    // Default ratio while metadata loads (prevents jump)
    frame.style.setProperty("--lb-ar", "9 / 16");

    if (media.kind === "image") {
      const img = document.createElement("img");
      img.alt = "";
      img.decoding = "async";
      img.loading = "eager";
      img.src = media.src;

      img.addEventListener("load", () => {
        const w = img.naturalWidth || 0;
        const h = img.naturalHeight || 0;
        if (w > 0 && h > 0) frame.style.setProperty("--lb-ar", `${w} / ${h}`);
      });

      frame.appendChild(img);
      return;
    }

    // VIDEO (default)
    const v = document.createElement("video");
    v.setAttribute("playsinline", "");
    v.setAttribute("controls", "");
    v.setAttribute("preload", "metadata");

    // Autoplay rules: iPhone requires muted to autoplay
    v.autoplay = true;
    v.muted = true;

    // Optional: loop in lightbox too
    v.loop = true;

    v.src = media.src;

    v.addEventListener("loadedmetadata", () => {
      const w = v.videoWidth || 0;
      const h = v.videoHeight || 0;
      if (w > 0 && h > 0) {
        frame.style.setProperty("--lb-ar", `${w} / ${h}`);
      }
    });

    frame.appendChild(v);

    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  };

  const openFor = (gridEl, clickedTile) => {
    const tiles = Array.from(gridEl.querySelectorAll(".brand-tile"));
    const index = Math.max(0, tiles.indexOf(clickedTile));

    lbState = { isOpen: true, tiles, index };

    const lb = ensureLightbox();
    body.classList.add("mmLightbox-open");
    lb.classList.add("is-open");

    render();
  };

  const close = () => {
    const lb = document.querySelector(".mmLightbox");
    if (!lb) return;

    lb.classList.remove("is-open");
    body.classList.remove("mmLightbox-open");

    const frame = lb.querySelector(".mmLightbox-frame");
    if (frame) frame.innerHTML = "";

    lbState.isOpen = false;
  };

  const step = (dir) => {
    if (!lbState.isOpen || !lbState.tiles.length) return;
    const n = lbState.tiles.length;
    lbState.index = (lbState.index + dir + n) % n;
    render();
  };

  document.addEventListener("click", (e) => {
    const tile = e.target.closest(".brand-tile");
    if (!tile) return;

    const grid = tile.closest(".brand-grid");
    if (!grid) return;

    e.preventDefault();
    openFor(grid, tile);
  });

  const bindControls = () => {
    const lb = ensureLightbox();
    const prev = lb.querySelector(".mmLightbox-prev");
    const next = lb.querySelector(".mmLightbox-next");

    if (prev) prev.addEventListener("click", () => step(-1));
    if (next) next.addEventListener("click", () => step(1));

    lb.addEventListener("click", (e) => {
      if (e.target.closest(".mmLightbox-close")) close();
      if (e.target.closest(".mmLightbox-backdrop")) close();
    });

    document.addEventListener("keydown", (e) => {
      if (!lbState.isOpen) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
  };

  bindControls();
})();
