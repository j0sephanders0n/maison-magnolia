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

  /* -------------------------
     CONFIG: brand list
     ------------------------- */
  const BRANDS = [
    { name: "Pandora", href: "./pandora.html" },
    { name: "Kilian", href: "./kilian.html" },
    { name: "Frederic Malle", href: "./frederic-malle.html" },
    { name: "Rabanne", href: "./rabanne.html" },
    { name: "Too Faced", href: "./too-faced.html" }
    // add more...
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

  const currentName = getCurrentBrandName();
  let currentIndex = Math.max(0, BRANDS.findIndex((b) => b.name === currentName));

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
   LIGHTBOX v3 — Step 1 (RED TEST ONLY)
   - Creates overlay DOM once
   - Click any .brand-tile -> opens lightbox with a red test block
   - Close via X, backdrop, Escape
   ========================================================= */

(() => {
  // Only run on brand pages
  if (!document.body.classList.contains("brand-page")) return;

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

  const openTestLightbox = () => {
    const lb = ensureLightbox();
    const frame = lb.querySelector(".mmLightbox-frame");
    if (!frame) return;

    // Force a known ratio for the test (you can change this)
    frame.style.setProperty("--lb-ar", "9 / 16");

    // RED TEST BLOCK
    frame.innerHTML = `
      <div style="
        width: 100%;
        height: 100%;
        background: red;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 800;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        font-size: 14px;
      ">
        Lightbox Test
      </div>
    `;

    document.body.classList.add("mmLightbox-open");
    lb.classList.add("is-open");
  };

  const closeLightbox = () => {
    const lb = document.querySelector(".mmLightbox");
    if (!lb) return;

    lb.classList.remove("is-open");
    document.body.classList.remove("mmLightbox-open");

    const frame = lb.querySelector(".mmLightbox-frame");
    if (frame) frame.innerHTML = "";
  };

  // Click any tile -> open test
  document.addEventListener("click", (e) => {
    const tile = e.target.closest(".brand-tile");
    if (!tile) return;

    const grid = tile.closest(".brand-grid");
    if (!grid) return;

    e.preventDefault();
    openTestLightbox();
    
  });

  // Close controls
  document.addEventListener("click", (e) => {
    if (!document.body.classList.contains("mmLightbox-open")) return;

    if (e.target.closest(".mmLightbox-close")) closeLightbox();
    if (e.target.closest(".mmLightbox-backdrop")) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (!document.body.classList.contains("mmLightbox-open")) return;
    if (e.key === "Escape") closeLightbox();
  });

  // NOTE: arrows do nothing yet on purpose (Step 3)
})();
