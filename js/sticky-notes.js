import { db, ref, onValue, push, set, update, remove } from "./firebase-config.js";

/**
 * Interactive Multiplayer Sticky Notes Layer & Dock
 * Features: Spatial canvas pinning, 60fps drag physics, Notes Box gather/scatter,
 * and secure DOM-based rendering to prevent XSS.
 */
export const initStickyNotes = (showToast) => {
  const stickyNotesLayer = document.getElementById("stickyNotesLayer");
  const snTrigger = document.getElementById("snTrigger");
  const snBoxTrigger = document.getElementById("snBoxTrigger");
  const snBoxText = document.getElementById("snBoxText");
  const snBoxCount = document.getElementById("snBoxCount");

  if (!stickyNotesLayer || !snTrigger || !snBoxTrigger || !db) return;

  const notesRef = ref(db, "portfolio/notes");
  let isPlacementMode = false;
  let areNotesScattered = false;
  let activeDraftEl = null;
  let snPlacementBanner = null;

  // Active in-memory registry of notes (noteId -> data)
  const activeNotes = new Map();

  // Dynamically synchronize the sticky notes canvas layer to full document height
  const syncLayerHeight = () => {
    const docHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.body.clientHeight,
      document.documentElement.clientHeight
    );
    stickyNotesLayer.style.height = `${docHeight}px`;
  };

  syncLayerHeight();
  window.addEventListener("load", syncLayerHeight);
  window.addEventListener("resize", syncLayerHeight);
  if (window.ResizeObserver) {
    new ResizeObserver(() => syncLayerHeight()).observe(document.body);
  }

  // Filter out any stale mock notes
  const isFakeNote = (id, data) => {
    if (!data || typeof data !== "object") return true;
    if (
      typeof id === "string" &&
      (id.startsWith("note_seed_") ||
        id.startsWith("note_hero_") ||
        id.startsWith("note_ghumo_") ||
        id.startsWith("note_trackly_") ||
        id.startsWith("note_memora_") ||
        id.startsWith("note_contact_"))
    ) {
      return true;
    }
    const text = (data.text || "").trim();
    const author = (data.author || "").trim();
    return (
      text === "Great hero presentation and aesthetic!" ||
      text === "Loving the Trackly mobile UI demo!" ||
      text === "Memora multimodal agent architecture is brilliant!" ||
      author === "Alex Designer" ||
      author === "AI Engineer" ||
      author === "Recruiter / Dev"
    );
  };

  // Local storage caching for genuine notes
  const getCachedNotes = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("portfolio_notes_cache") || "{}");
      if (stored && typeof stored === "object") {
        const genuine = {};
        Object.entries(stored).forEach(([k, v]) => {
          if (!isFakeNote(k, v)) genuine[k] = v;
        });
        return genuine;
      }
    } catch (e) {}
    return {};
  };

  const updateCachedNote = (noteId, noteData) => {
    const cache = getCachedNotes();
    if (noteData) {
      cache[noteId] = noteData;
    } else {
      delete cache[noteId];
    }
    try {
      localStorage.setItem("portfolio_notes_cache", JSON.stringify(cache));
    } catch (e) {}
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return "just now";
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 45) return "just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    return `${diffDays}d ago`;
  };

  const NOTE_COLORS = [
    "#e6ff3f", // signature neon lime
    "#facc15", // warm yellow
    "#38bdf8", // electric cyan
    "#f472b6", // neon magenta
    "#4ade80"  // emerald green
  ];

  const updateNotesBoxUI = () => {
    const count = activeNotes.size;
    if (snBoxCount) snBoxCount.textContent = count;
    if (snBoxText) {
      snBoxText.textContent = areNotesScattered ? "Gather Notes" : "Notes Box";
    }
    snBoxTrigger.classList.toggle("is-active", areNotesScattered);
    snBoxTrigger.setAttribute(
      "title",
      areNotesScattered
        ? "Click to gather notes back into box"
        : "Click to scatter notes across portfolio"
    );
  };

  const toggleNotesScatter = (forceState) => {
    if (activeNotes.size === 0 && forceState !== false) {
      showToast('No notes in box yet! Click "Leave a note" to pin one.');
      return;
    }

    const nextState = typeof forceState === "boolean" ? forceState : !areNotesScattered;
    areNotesScattered = nextState;

    const cards = stickyNotesLayer.querySelectorAll(".sn-card");
    cards.forEach((card) => {
      if (areNotesScattered) {
        card.classList.remove("is-gathered");
      } else {
        card.classList.add("is-gathered");
      }
    });

    updateNotesBoxUI();
    if (areNotesScattered) {
      showToast(`Scattered ${activeNotes.size} note${activeNotes.size === 1 ? "" : "s"} across portfolio.`);
    } else {
      showToast("All notes gathered into box.");
    }
  };

  const setPlacementMode = (active) => {
    isPlacementMode = active;
    if (activeDraftEl) {
      activeDraftEl.remove();
      activeDraftEl = null;
    }

    document.body.classList.toggle("sn-placement-active", isPlacementMode);
    snTrigger.classList.toggle("is-active", isPlacementMode);
    const icon = snTrigger.querySelector(".sn-trigger-icon");
    const text = snTrigger.querySelector(".sn-trigger-text");
    if (icon) icon.textContent = isPlacementMode ? "✕" : "📝";
    if (text) text.textContent = isPlacementMode ? "Cancel" : "Leave a note";

    if (isPlacementMode) {
      if (!snPlacementBanner) {
        snPlacementBanner = document.createElement("div");
        snPlacementBanner.id = "snPlacementBanner";
        snPlacementBanner.className = "sn-placement-banner";
        snPlacementBanner.textContent = "Click anywhere on page to place note";
        document.body.appendChild(snPlacementBanner);
      }
    } else if (snPlacementBanner) {
      snPlacementBanner.remove();
      snPlacementBanner = null;
    }
  };

  snTrigger.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPlacementMode(!isPlacementMode);
  });

  snBoxTrigger.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleNotesScatter();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (isPlacementMode) {
        setPlacementMode(false);
      } else if (activeDraftEl) {
        activeDraftEl.remove();
        activeDraftEl = null;
      }
    }
  });

  // Spawn Draft Note Form Card
  const spawnDraftCard = (xPercent, yAbsolute) => {
    if (activeDraftEl) {
      activeDraftEl.remove();
      activeDraftEl = null;
    }

    syncLayerHeight();
    const docWidth = document.documentElement.clientWidth;
    const draftWidth = Math.min(270, docWidth - 32);
    const leftPx = Math.max(16, Math.min(docWidth - draftWidth - 16, (xPercent / 100) * docWidth));

    let selectedColor = NOTE_COLORS[0];

    const draftCard = document.createElement("div");
    draftCard.className = "sn-draft-card";
    draftCard.style.left = `${leftPx}px`;
    draftCard.style.top = `${Math.max(80, yAbsolute - 30)}px`;

    // Secure DOM construction
    const header = document.createElement("div");
    header.className = "sn-draft-header";
    const headerTitle = document.createElement("span");
    headerTitle.textContent = "Leave a sticky note";
    const btnClose = document.createElement("button");
    btnClose.className = "sn-card-delete";
    btnClose.setAttribute("aria-label", "Close draft");
    btnClose.textContent = "✕";
    header.append(headerTitle, btnClose);

    const textarea = document.createElement("textarea");
    textarea.className = "sn-draft-textarea";
    textarea.maxLength = 140;
    textarea.placeholder = "Leave a thought, critique, or hello...";

    const charCountEl = document.createElement("div");
    charCountEl.className = "sn-draft-char-count";
    charCountEl.textContent = "0/140";

    const authorInput = document.createElement("input");
    authorInput.type = "text";
    authorInput.className = "sn-draft-input";
    authorInput.maxLength = 30;
    authorInput.placeholder = "Your name or @handle (optional)";

    const swatchesContainer = document.createElement("div");
    swatchesContainer.className = "sn-draft-colors";

    NOTE_COLORS.forEach((color) => {
      const swatch = document.createElement("div");
      swatch.className = `sn-color-swatch ${color === selectedColor ? "is-selected" : ""}`;
      swatch.style.background = color;
      swatch.dataset.color = color;
      swatch.addEventListener("click", (e) => {
        e.stopPropagation();
        swatchesContainer.querySelectorAll(".sn-color-swatch").forEach((s) => s.classList.remove("is-selected"));
        swatch.classList.add("is-selected");
        selectedColor = color;
      });
      swatchesContainer.appendChild(swatch);
    });

    const actions = document.createElement("div");
    actions.className = "sn-draft-actions";
    const btnPin = document.createElement("button");
    btnPin.className = "sn-btn-pin";
    btnPin.textContent = "Pin Note";
    const btnCancel = document.createElement("button");
    btnCancel.className = "sn-btn-cancel";
    btnCancel.textContent = "Discard";
    actions.append(btnPin, btnCancel);

    draftCard.append(header, textarea, charCountEl, authorInput, swatchesContainer, actions);

    draftCard.addEventListener("click", (e) => e.stopPropagation());
    draftCard.addEventListener("pointerdown", (e) => e.stopPropagation());

    stickyNotesLayer.appendChild(draftCard);
    activeDraftEl = draftCard;

    setTimeout(() => textarea.focus(), 50);

    textarea.addEventListener("input", () => {
      charCountEl.textContent = `${textarea.value.length}/140`;
    });

    const closeDraft = () => {
      draftCard.remove();
      if (activeDraftEl === draftCard) activeDraftEl = null;
    };

    btnCancel.addEventListener("click", closeDraft);
    btnClose.addEventListener("click", closeDraft);

    btnPin.addEventListener("click", () => {
      const text = textarea.value.trim();
      if (!text) {
        textarea.style.borderColor = "#ef4444";
        textarea.focus();
        return;
      }

      const author = authorInput.value.trim() || "Anonymous";
      const finalXPercent = parseFloat(((leftPx / docWidth) * 100).toFixed(2));
      const finalYAbsolute = Math.round(yAbsolute);

      const noteData = {
        text,
        author,
        xPercent: finalXPercent,
        yAbsolute: finalYAbsolute,
        timestamp: Date.now(),
        color: selectedColor
      };

      const newNoteRef = push(notesRef);
      const noteId = newNoteRef.key || `local_${Date.now()}`;
      closeDraft();

      activeNotes.set(noteId, noteData);
      updateCachedNote(noteId, noteData);

      areNotesScattered = true;
      stickyNotesLayer.querySelectorAll(".sn-card").forEach((c) => c.classList.remove("is-gathered"));

      renderNote(noteId, noteData);
      updateNotesBoxUI();
      showToast("Note permanently pinned to portfolio.");

      set(newNoteRef, noteData).catch((err) => {
        console.warn("Firebase note save notice:", err.message || err);
      });
    });
  };

  // Full-document canvas click interceptor for Placement Mode
  document.addEventListener(
    "click",
    (e) => {
      if (!isPlacementMode) return;
      if (e.target.closest("#snDock") || e.target.closest(".sn-draft-card")) return;

      e.preventDefault();
      e.stopPropagation();

      const docWidth = document.documentElement.clientWidth;
      const xPercent = (e.pageX / docWidth) * 100;
      const yAbsolute = e.pageY;

      setPlacementMode(false);
      spawnDraftCard(xPercent, yAbsolute);
    },
    true
  );

  // Render Draggable Note Card with tamper-proof DOM elements
  const renderNote = (noteId, data) => {
    if (!stickyNotesLayer || !data) return;

    syncLayerHeight();
    let card = stickyNotesLayer.querySelector(`.sn-card[data-note-id="${noteId}"]`);

    if (!card) {
      card = document.createElement("div");
      card.className = "sn-card";
      card.setAttribute("data-note-id", noteId);
      if (!areNotesScattered) card.classList.add("is-gathered");
      stickyNotesLayer.appendChild(card);
    } else {
      if (!areNotesScattered) {
        card.classList.add("is-gathered");
      } else {
        card.classList.remove("is-gathered");
      }
    }

    const docWidth = document.documentElement.clientWidth;
    const cardWidth = Math.min(230, docWidth - 30);
    const leftPx = Math.max(12, Math.min(docWidth - cardWidth - 12, (data.xPercent / 100) * docWidth));

    if (!card.classList.contains("is-dragging") && !card.classList.contains("is-gathered")) {
      card.style.left = `${leftPx}px`;
      card.style.top = `${data.yAbsolute}px`;
    }

    // Clean, secure DOM element population (XSS safe)
    card.innerHTML = "";

    const accent = document.createElement("div");
    accent.className = "sn-card-accent";
    accent.style.background = data.color || "#e6ff3f";

    const header = document.createElement("div");
    header.className = "sn-card-header";

    const grip = document.createElement("div");
    grip.className = "sn-card-grip";
    grip.title = "Drag note";
    grip.innerHTML = "<span></span><span></span><span></span>";

    const pinBadge = document.createElement("span");
    pinBadge.className = "sn-card-pin-badge";
    pinBadge.title = "Pinned note";
    pinBadge.textContent = "📌";

    header.append(grip, pinBadge);

    const body = document.createElement("div");
    body.className = "sn-card-body";
    body.textContent = data.text || "";

    const footer = document.createElement("div");
    footer.className = "sn-card-footer";

    const authorSpan = document.createElement("span");
    authorSpan.className = "sn-card-author";
    authorSpan.textContent = data.author || "Anonymous";

    const timeSpan = document.createElement("span");
    timeSpan.className = "sn-card-time";
    timeSpan.textContent = formatRelativeTime(data.timestamp);

    footer.append(authorSpan, timeSpan);

    card.append(accent, header, body, footer);

    // Drag-and-drop mechanics with pointer capture
    if (!card.dataset.dragBound) {
      card.dataset.dragBound = "true";

      let isDragging = false;
      let startX = 0, startY = 0;
      let origX = 0, origY = 0;
      let curX = 0, curY = 0;

      card.addEventListener("pointerdown", (e) => {
        if (e.button !== 0) return;
        if (card.classList.contains("is-gathered")) return;

        card.setPointerCapture(e.pointerId);
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        origX = parseFloat(card.style.left) || leftPx;
        origY = parseFloat(card.style.top) || data.yAbsolute;
        curX = origX;
        curY = origY;
        card.classList.add("is-dragging");
      });

      card.addEventListener("pointermove", (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        const currentDocWidth = document.documentElement.clientWidth;
        const currentDocHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        const cWidth = card.offsetWidth || 230;
        const cHeight = card.offsetHeight || 100;

        curX = Math.max(10, Math.min(currentDocWidth - cWidth - 10, origX + dx));
        curY = Math.max(65, Math.min(currentDocHeight - cHeight - 20, origY + dy));

        card.style.left = `${curX}px`;
        card.style.top = `${curY}px`;
      });

      const handlePointerUp = (e) => {
        if (!isDragging) return;
        isDragging = false;
        card.classList.remove("is-dragging");
        try {
          card.releasePointerCapture(e.pointerId);
        } catch (err) {}

        const currentDocWidth = document.documentElement.clientWidth;
        const newXPercent = parseFloat(((curX / currentDocWidth) * 100).toFixed(2));
        const newYAbsolute = Math.round(curY);

        data.xPercent = newXPercent;
        data.yAbsolute = newYAbsolute;
        activeNotes.set(noteId, data);
        updateCachedNote(noteId, data);

        update(ref(db, `portfolio/notes/${noteId}`), {
          xPercent: newXPercent,
          yAbsolute: newYAbsolute
        }).catch((err) => console.warn("Firebase position update notice:", err.message || err));
      };

      card.addEventListener("pointerup", handlePointerUp);
      card.addEventListener("pointercancel", handlePointerUp);
    }
  };

  // Hydrate initial notes from local cache
  const initialCached = getCachedNotes();
  if (initialCached && typeof initialCached === "object") {
    Object.entries(initialCached).forEach(([id, item]) => {
      if (item && typeof item === "object") {
        activeNotes.set(id, item);
        renderNote(id, item);
      }
    });
    updateNotesBoxUI();
  }

  // Real-time synchronization with Firebase RTDB
  onValue(
    notesRef,
    (snapshot) => {
      const notesData = snapshot.val();
      const liveIds = new Set();
      if (notesData && typeof notesData === "object") {
        Object.entries(notesData).forEach(([id, item]) => {
          if (isFakeNote(id, item)) {
            remove(ref(db, `portfolio/notes/${id}`)).catch(() => {});
            return;
          }
          if (item && typeof item === "object") {
            liveIds.add(id);
            activeNotes.set(id, item);
            updateCachedNote(id, item);
            renderNote(id, item);
          }
        });
      }

      // Reconcile deleted notes
      stickyNotesLayer.querySelectorAll(".sn-card").forEach((c) => {
        const id = c.getAttribute("data-note-id");
        if (id && !liveIds.has(id)) {
          c.remove();
          activeNotes.delete(id);
          updateCachedNote(id, null);
        }
      });
      updateNotesBoxUI();
    },
    (err) => {
      console.warn("Firebase notes listener notice:", err.message || err);
    }
  );

  // Resize listener to re-clamp note boundaries
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const currentDocWidth = document.documentElement.clientWidth;
      stickyNotesLayer.querySelectorAll(".sn-card").forEach((card) => {
        if (card.classList.contains("is-dragging") || card.classList.contains("is-gathered")) return;
        const origLeft = parseFloat(card.style.left) || 0;
        const cWidth = card.offsetWidth || 230;
        const clamped = Math.max(10, Math.min(currentDocWidth - cWidth - 10, origLeft));
        card.style.left = `${clamped}px`;
      });
    }, 100);
  });
};
