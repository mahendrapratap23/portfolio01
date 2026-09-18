import { db, ref, onValue, runTransaction } from "./firebase-config.js";

/**
 * Authentic Portfolio View Counter
 * Reads real-time visitor counts from Firebase RTDB with session deduplication.
 */
export const initViewsCounter = () => {
  const viewCountEl = document.getElementById("viewCount");
  if (!viewCountEl || !db) return;

  const totalViewsRef = ref(db, "portfolio/views/total");

  // Restore cached count immediately to prevent layout shift
  const cachedTotal = localStorage.getItem("portfolio_views_total");
  if (cachedTotal && Number(cachedTotal) > 0) {
    viewCountEl.textContent = Number(cachedTotal).toLocaleString();
  }

  // Real-time synchronization listener
  onValue(
    totalViewsRef,
    (snapshot) => {
      const val = snapshot.val();
      const count = typeof val === "number" ? val : Number(val) || 0;
      if (count > 0) {
        viewCountEl.textContent = count.toLocaleString();
        localStorage.setItem("portfolio_views_total", String(count));
      }
    },
    (err) => {
      console.warn("Firebase RTDB views listener notice:", err.message || err);
    }
  );

  // Single increment per browser session
  const hasViewed = sessionStorage.getItem("has_viewed_portfolio");
  if (!hasViewed) {
    sessionStorage.setItem("has_viewed_portfolio", "true");

    runTransaction(totalViewsRef, (current) => {
      return (current || 0) + 1;
    }).catch((err) => {
      console.warn("Firebase views transaction notice:", err.message || err);
    });

    // Track referrer metadata (e.g. LinkedIn)
    const referrer = (document.referrer || "").toLowerCase();
    const urlParams = new URLSearchParams(window.location.search);
    const isLinkedIn =
      referrer.includes("linkedin.com") ||
      referrer.includes("lnkd.in") ||
      urlParams.get("ref") === "linkedin";

    if (isLinkedIn) {
      const linkedinViewsRef = ref(db, "portfolio/views/linkedin");
      runTransaction(linkedinViewsRef, (current) => (current || 0) + 1).catch(() => {});
    }
  }
};
