document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;

  // ========================================
  // 1. Light-/Night-Mode
  // ========================================

  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  const themeColorMeta = document.querySelector(
    'meta[name="theme-color"]'
  );

  function applyTheme(theme) {
    const isDark = theme === "dark";

    root.dataset.theme = theme;

    themeIcon.textContent = isDark ? "☀" : "☾";

    themeToggle.setAttribute(
      "aria-label",
      isDark
        ? "Helles Design aktivieren"
        : "Dunkles Design aktivieren"
    );

    themeToggle.title = isDark
      ? "Zum Light Mode wechseln"
      : "Zum Night Mode wechseln";

    if (themeColorMeta) {
      themeColorMeta.setAttribute(
        "content",
        isDark ? "#11131b" : "#f7f8fc"
      );
    }
  }

  // Gespeichertes Theme laden; andernfalls Systemeinstellung nutzen.
  let savedTheme = null;

  try {
    savedTheme = localStorage.getItem("alex-theme");
  } catch {
    // Die Seite funktioniert auch ohne verfügbaren Speicher.
  }

  const initialTheme =
    savedTheme === "light" || savedTheme === "dark"
      ? savedTheme
      : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

  applyTheme(initialTheme);

  themeToggle.addEventListener("click", () => {
    const nextTheme =
      root.dataset.theme === "dark" ? "light" : "dark";

    applyTheme(nextTheme);

    try {
      localStorage.setItem("alex-theme", nextTheme);
    } catch {
      // Der Theme-Wechsel bleibt auch ohne Speicherung aktiv.
    }
  });

  // ========================================
  // 2. Animierte Tabs
  // ========================================

  const tabs = Array.from(
    document.querySelectorAll(".nav-tab")
  );

  const panels = Array.from(
    document.querySelectorAll(".tab-panel")
  );

  function activateTab(tab, moveFocus = false) {
    const targetId = tab.getAttribute("aria-controls");
    const targetPanel = document.getElementById(targetId);

    if (!targetPanel) return;

    // Alle Tabs aktualisieren.
    tabs.forEach((item) => {
      const isActive = item === tab;

      item.classList.toggle("active", isActive);
      item.setAttribute("aria-selected", String(isActive));
      item.tabIndex = isActive ? 0 : -1;
    });

    // Vorherige Animationen und Panels zurücksetzen.
    panels.forEach((panel) => {
      panel.classList.remove("active");
      panel.hidden = true;
    });

    // Gewünschtes Panel einblenden.
    targetPanel.hidden = false;

    // Animation durch erneutes Setzen der CSS-Klasse starten.
    void targetPanel.offsetWidth;
    targetPanel.classList.add("active");

    if (moveFocus) {
      tab.focus();
    }
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      activateTab(tab);
    });

    // Tastaturbedienung nach dem ARIA-Tab-Muster.
    tab.addEventListener("keydown", (event) => {
      let nextIndex = index;

      switch (event.key) {
        case "ArrowRight":
          nextIndex = (index + 1) % tabs.length;
          break;

        case "ArrowLeft":
          nextIndex = (index - 1 + tabs.length) % tabs.length;
          break;

        case "Home":
          nextIndex = 0;
          break;

        case "End":
          nextIndex = tabs.length - 1;
          break;

        default:
          return;
      }

      event.preventDefault();
      activateTab(tabs[nextIndex], true);
    });
  });

  // ========================================
  // 3. Button "Meine Projekte entdecken"
  // ========================================

  document.querySelectorAll("[data-go-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      const requestedTab = button.dataset.goTab;

      const tab = tabs.find(
        (item) => item.dataset.tab === requestedTab
      );

      if (tab) {
        activateTab(tab);
        document.getElementById("panel-projects").scrollIntoView({
          behavior: window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          ).matches
            ? "auto"
            : "smooth",
          block: "start"
        });
      }
    });
  });

  // ========================================
  // 4. Aktuelles Jahr im Footer
  // ========================================

  document.getElementById("current-year").textContent =
    new Date().getFullYear();
});