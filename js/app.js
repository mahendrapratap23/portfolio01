import { initModal } from "./modal.js";
import { initViewsCounter } from "./views-counter.js";
import { initStickyNotes } from "./sticky-notes.js";

// Toast Notification Manager
const toastEl = document.getElementById("toast");
let toastTimer = null;

export const showToast = (message) => {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 2600);
};

// Theme Controller (Dark / Light mode with persistence)
const initTheme = () => {
  const themeBtn = document.getElementById("themeBtn");
  if (!themeBtn) return;

  const savedTheme = localStorage.getItem("portfolio_theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const applyTheme = (isDark) => {
    document.body.classList.toggle("dark-mode", isDark);
    themeBtn.textContent = isDark ? "LIGHT MODE" : "DARK MODE";
    themeBtn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  };

  if (savedTheme) {
    applyTheme(savedTheme === "dark");
  } else {
    // Default to system preference or dark mode
    applyTheme(prefersDark);
  }

  themeBtn.addEventListener("click", () => {
    const isDark = !document.body.classList.contains("dark-mode");
    applyTheme(isDark);
    localStorage.setItem("portfolio_theme", isDark ? "dark" : "light");
  });
};

// Custom Cursor (Only on pointing devices supporting hover)
const initCursor = () => {
  const cursor = document.querySelector(".cursor");
  if (!cursor || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    if (cursor) cursor.style.display = "none";
    return;
  }

  let rafId = null;
  let mouseX = -100, mouseY = -100;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!rafId) {
      rafId = requestAnimationFrame(() => {
        cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        rafId = null;
      });
    }
  });

  const bindCursorHover = () => {
    document
      .querySelectorAll("a, button, .project, .skills span, .metric-card, .view-counter-badge")
      .forEach((el) => {
        if (el.dataset.cursorBound) return;
        el.dataset.cursorBound = "true";
        el.addEventListener("mouseenter", () => cursor.classList.add("active"));
        el.addEventListener("mouseleave", () => cursor.classList.remove("active"));
      });
  };

  bindCursorHover();
  window.addEventListener("load", bindCursorHover);
};

// Magnetic Button Micro-Interaction
const initMagnetic = () => {
  if (!window.matchMedia("(hover: hover)").matches) return;

  document.querySelectorAll(".magnetic").forEach((el) => {
    if (el.dataset.magneticBound) return;
    el.dataset.magneticBound = "true";

    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.18;
      const y = (e.clientY - r.top - r.height / 2) * 0.18;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });

    el.addEventListener("mouseleave", () => {
      el.style.transform = "translate(0, 0)";
    });
  });
};

// Scroll Reveal Observer
const initScrollReveal = () => {
  const targets = document.querySelectorAll(
    ".project, .about-grid, .statement, .contact, .metric-card, .cert-card"
  );

  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  targets.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(28px)";
    el.style.transition = "opacity .8s ease, transform .8s cubic-bezier(.16, 1, .3, 1)";
    observer.observe(el);
  });
};

// Copy Email Functionality
const initCopyEmail = () => {
  const copyEmailBtn = document.getElementById("copyEmailBtn");
  if (!copyEmailBtn) return;

  copyEmailBtn.addEventListener("click", () => {
    const emailToCopy = "mp498343@gmail.com";
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(emailToCopy)
        .then(() => {
          showToast(`Copied ${emailToCopy} to clipboard`);
        })
        .catch(() => {
          showToast(`Email: ${emailToCopy}`);
        });
    } else {
      showToast(`Email: ${emailToCopy}`);
    }
  });
};

// App Initialization
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initCursor();
  initMagnetic();
  initScrollReveal();
  initCopyEmail();
  initModal();
  initViewsCounter();
  initStickyNotes(showToast);
});
