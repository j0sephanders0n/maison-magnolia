document.addEventListener("DOMContentLoaded", () => {
  const links = [...document.querySelectorAll(".manual-nav a")];
  const sections = [...document.querySelectorAll("main section[id]")];

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (!visible) return;
        links.forEach(link => {
          link.classList.toggle(
            "is-active",
            link.getAttribute("href") === `#${visible.target.id}`
          );
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    sections.forEach(section => observer.observe(section));
  }
});


document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-homepage-map]").forEach((map) => {
    const viewport = map.querySelector(".homepage-window");
    const image = viewport?.querySelector("img");
    const buttons = [...map.querySelectorAll("[data-home-start]")];
    const current = map.querySelector("[data-home-current]");
    if (!viewport || !image || !buttons.length) return;

    const entries = buttons.map((button) => ({
      button,
      start: Number(button.dataset.homeStart || 0),
      label: button.dataset.homeLabel || button.textContent.trim()
    }));

    const update = () => {
      const height = viewport.scrollHeight || 1;
      const focusPoint = viewport.scrollTop + viewport.clientHeight * 0.32;
      const ratio = Math.max(0, Math.min(1, focusPoint / height));
      let active = entries[0];

      entries.forEach((entry) => {
        if (ratio >= entry.start) active = entry;
      });

      entries.forEach((entry) => {
        entry.button.classList.toggle("is-active", entry === active);
        entry.button.setAttribute("aria-current", entry === active ? "true" : "false");
      });

      if (current) current.textContent = active.label;
    };

    entries.forEach((entry) => {
      entry.button.addEventListener("click", () => {
        const target = entry.start * viewport.scrollHeight - viewport.clientHeight * 0.16;
        viewport.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
      });
    });

    viewport.addEventListener("scroll", update, { passive: true });
    image.addEventListener("load", update);
    window.addEventListener("resize", update);
    update();
  });
});


document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-site-preview]").forEach((preview) => {
    const viewport = preview.querySelector(".site-preview-window");
    const sections = [...preview.querySelectorAll(".mini-site-section[data-preview-label]")];
    const buttons = [...preview.querySelectorAll("[data-preview-target]")];
    const current = preview.querySelector("[data-preview-current]");
    if (!viewport || !sections.length) return;

    const setActive = (section) => {
      const id = section.id;
      const label = section.dataset.previewLabel || id;
      buttons.forEach((button) => {
        const active = button.dataset.previewTarget === id;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-current", active ? "true" : "false");
      });
      if (current) current.textContent = label;
    };

    const update = () => {
      const focus = viewport.scrollTop + viewport.clientHeight * 0.32;
      let active = sections[0];
      sections.forEach((section) => {
        if (section.offsetTop <= focus) active = section;
      });
      setActive(active);
    };

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const section = preview.querySelector(`#${button.dataset.previewTarget}`);
        if (!section) return;
        viewport.scrollTo({ top: section.offsetTop, behavior: "smooth" });
      });
    });

    viewport.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  });

  document.querySelectorAll("[data-copy-command]").forEach((button) => {
    button.addEventListener("click", async () => {
      const command = button.closest(".command-row")?.querySelector("code")?.textContent?.trim();
      if (!command) return;
      try {
        await navigator.clipboard.writeText(command);
        button.textContent = "Copied";
        button.classList.add("is-copied");
        setTimeout(() => {
          button.textContent = "Copy";
          button.classList.remove("is-copied");
        }, 1300);
      } catch {
        button.textContent = "Select";
      }
    });
  });
});
