/**
 * Accessible Project Case Study Modal Drawer
 * Full WCAG AA focus trap, keyboard navigation, and ARIA dialog semantics.
 */

export const projectData = {
  "ghumo-ai": {
    title: "Ghumo AI — Intelligent Travel Engine",
    tag: "AI TRAVEL PLATFORM",
    tech: "TypeScript • React • OpenStreetMap • Web APIs",
    desc: "An AI-driven travel planning and destination tracking platform designed to automate travel research, map navigation, itemized budgeting, and dynamic activity checklists.",
    highlights: [
      "Interactive destination mapping and location-based recommendations.",
      "Automated travel expense calculator and currency tracking.",
      "Dynamic, customizable checklist generator per trip activity.",
      "Responsive, offline-capable progressive web architecture."
    ],
    repo: "https://github.com/mahendrapratap23/ghumo-ai"
  },
  "trackly": {
    title: "Trackly — Universal Graph Analytics",
    tag: "ANALYTICS & METRICS",
    tech: "TypeScript • Chart Engine • Local Storage • CSS System",
    desc: "A minimal, visual metrics tracker designed to record habits, productivity counters, and project milestones with real-time graph visualization.",
    highlights: [
      "Visual timeline and streak analytics graphs.",
      "Custom metric creation with multi-category filtering.",
      "Instant local storage persistence and CSV data export.",
      "Ultra-fast render speed with zero external UI framework dependencies."
    ],
    repo: "https://github.com/mahendrapratap23/trackly"
  },
  "college-practical-codes": {
    title: "AI & ML Practical Suite",
    tag: "ALGORITHMS & ML LAB",
    tech: "Python • Jupyter Notebooks • Scikit-learn • Pandas",
    desc: "An extensive engineering repository containing practical implementations of Artificial Intelligence models, Machine Learning algorithms, and DAA (Design & Analysis of Algorithms) problems.",
    highlights: [
      "Supervised and unsupervised ML algorithms written from scratch.",
      "Algorithmic analysis (Divide & Conquer, Dynamic Programming, Greedy).",
      "Model evaluation scripts with confusion matrix & accuracy plots.",
      "Well-documented Jupyter Notebooks for computer science education."
    ],
    repo: "https://github.com/mahendrapratap23/college-practical-codes"
  },
  "memora": {
    title: "MEMORA — Personal AI Assistant & Autonomous Agent",
    tag: "AUTONOMOUS AI AGENT • ACTIVE BUILD",
    tech: "Python • OpenAI • Pydantic • LLM Orchestration • CLI REPL",
    desc: "A production-grade personal AI assistant and autonomous agent architecture engineered incrementally from scratch in Python. Built with decoupled LLM provider interfaces, Pydantic runtime settings validation, custom domain exceptions, and an interactive terminal CLI REPL.",
    highlights: [
      "Active development with v0.1 released, complete architectural blueprints and 9-phase roadmap.",
      "Decoupled LLM client interface supporting OpenAI, Groq, Ollama, and OpenRouter without vendor lock-in.",
      "Strict Pydantic configuration validation with automated API key credential masking.",
      "Comprehensive Pytest automated test suite with 20 passing unit tests and 100% mocked LLM coverage.",
      "Multi-phase agent architecture engineered for semantic memory, vector databases, and autonomous tool calling."
    ],
    repo: "https://github.com/mahendrapratap23/MEMORA"
  },
  "boundless-canvas": {
    title: "The Boundless Canvas — Infinite Multiplayer Digital Void",
    tag: "MULTIPLAYER 2D VOID • LIVE APP",
    tech: "HTML5 Canvas • JavaScript (ES6+) • Firebase Firestore • Firebase Realtime DB • CSS3",
    desc: "An infinite, borderless 2D digital plane where users place anonymous thoughts at spatial coordinates, watch notes decay into ash unless saved (+2h / -10% fire mechanic), and track authentic live ghost cursors across a procedural glowing blue horizon.",
    highlights: [
      "Endless 2D pan with inertia damping, cursor-centric zoom (0.1x to 3.0x), and frustum culling at 60 FPS.",
      "Ephemeral graffiti notes with decay physics, ash particle bursts, and atomic +2h / -10% life saving mechanics.",
      "100% authentic realtime multiplayer presence tracking live ghost cursors with smooth linear interpolation (lerping).",
      "Decoupled Firebase architecture combining Realtime Database for live presence and Cloud Firestore for persistent spatial notes."
    ],
    repo: "https://github.com/mahendrapratap23/Boundless-Canvas",
    liveUrl: "https://boundless-canvas.vercel.app"
  },
  "airqr": {
    title: "AirQR — Zero-Install Screen-to-Mobile WebRTC Bridge",
    tag: "P2P PROTOCOL • LIVE APP",
    tech: "WebRTC DataChannels • STUN/NAT Traversal • JavaScript (ES6+) • HTML5 • Ephemeral P2P",
    desc: "A zero-install, zero-cloud-footprint peer-to-peer data bridge that streams links, raw text, images, and files up to 50MB directly from your desktop screen to your mobile device in-memory via encrypted WebRTC DataChannels.",
    highlights: [
      "100% Zero-Install & universal cross-platform transfer across iOS, Android, macOS, Windows, and Linux via standard web browsers.",
      "True volatile memory architecture with zero cloud storage, zero server database, and automatic teardown on session exit.",
      "Encrypted WebRTC DataChannel transport using Google & Twilio STUN/NAT traversal with DTLS 1.2/1.3 protocol security.",
      "High-throughput binary chunker slicing files into 16KB ArrayBuffer streams with backpressure control and live transfer metrics."
    ],
    repo: "https://github.com/mahendrapratap23/airqr",
    liveUrl: "https://airqr-cyan.vercel.app/"
  }
};

export const initModal = () => {
  const modal = document.getElementById("projectModal");
  const modalTag = document.getElementById("modalTag");
  const modalTitle = document.getElementById("modalTitle");
  const modalTech = document.getElementById("modalTech");
  const modalDesc = document.getElementById("modalDesc");
  const modalHighlights = document.getElementById("modalHighlights");
  const modalRepoBtn = document.getElementById("modalRepoBtn");
  const modalLiveBtn = document.getElementById("modalLiveBtn");
  const modalClose = document.getElementById("modalClose");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const modalOverlay = document.getElementById("modalOverlay");

  if (!modal) return;

  let lastFocusedElement = null;

  // Accessible focus trap query
  const getFocusableElements = () => {
    return modal.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
  };

  const openModal = (projectId, triggerElement) => {
    const data = projectData[projectId];
    if (!data) return;

    lastFocusedElement = triggerElement || document.activeElement;

    if (modalTag) modalTag.textContent = data.tag || "FEATURED PROJECT";
    if (modalTitle) modalTitle.textContent = data.title;
    if (modalTech) modalTech.textContent = data.tech;
    if (modalDesc) modalDesc.textContent = data.desc;
    if (modalRepoBtn) modalRepoBtn.href = data.repo;

    if (modalLiveBtn) {
      if (data.liveUrl) {
        modalLiveBtn.href = data.liveUrl;
        modalLiveBtn.style.display = "inline-flex";
        if (modalRepoBtn) modalRepoBtn.className = "modal-btn secondary";
      } else {
        modalLiveBtn.style.display = "none";
        if (modalRepoBtn) modalRepoBtn.className = "modal-btn primary";
      }
    }

    if (modalHighlights) {
      modalHighlights.innerHTML = "";
      data.highlights.forEach((h) => {
        const li = document.createElement("li");
        li.textContent = h;
        modalHighlights.appendChild(li);
      });
    }

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // Focus first interactive control inside modal
    setTimeout(() => {
      const focusables = getFocusableElements();
      if (focusables.length > 0) {
        focusables[0].focus();
      }
    }, 50);
  };

  const closeModal = () => {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    // Return focus to originating element
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  };

  // Bind project cards
  document.querySelectorAll(".project").forEach((project) => {
    project.setAttribute("tabindex", "0");
    project.setAttribute("role", "button");
    project.setAttribute("aria-haspopup", "dialog");

    const handleTrigger = (e) => {
      if (e.target.closest("a") || e.target.closest("button")) return;
      e.preventDefault();
      const id = project.getAttribute("data-project");
      if (id) openModal(id, project);
    };

    project.addEventListener("click", handleTrigger);
    project.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        handleTrigger(e);
      }
    });
  });

  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
  if (modalOverlay) modalOverlay.addEventListener("click", closeModal);

  // Keydown listener for Esc and Tab trapping
  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("active")) return;

    if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
      return;
    }

    if (e.key === "Tab") {
      const focusables = Array.from(getFocusableElements()).filter(
        (el) => el.offsetParent !== null
      );
      if (focusables.length === 0) return;

      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }
  });

  return { openModal, closeModal };
};
