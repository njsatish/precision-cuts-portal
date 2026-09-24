(() => {
  "use strict";

  const normalize = value => String(value || "").replace(/\s+/g, " ").trim().toLowerCase();

  function isProtected(node) {
    return Boolean(node.closest(
      "footer,#pc-home-booking-modal,[data-index-profile-booking]," +
      "[data-pc-five-barber-grid='true'],[data-pc-booking-workspace],main"
    ));
  }

  function candidateRoot(node) {
    let current = node;
    let best = node;
    while (current && current !== document.body) {
      const text = normalize(current.textContent);
      const rect = current.getBoundingClientRect();
      const compact = rect.height > 0 && rect.height <= 180 && rect.width <= 500;
      const booksyOnly = text.includes("powered by") && text.includes("booksy") && text.length < 100;
      if (compact && booksyOnly && !isProtected(current)) best = current;
      current = current.parentElement;
    }
    return best;
  }

  function removeBadge() {
    const nodes = [...document.querySelectorAll("body *")].filter(node => {
      if (isProtected(node)) return false;
      const text = normalize(node.textContent);
      return text === "powered by booksy" ||
        (text.includes("book now") && text.includes("powered by") && text.includes("booksy") && text.length < 100);
    });

    let removed = 0;
    const roots = new Set(nodes.map(candidateRoot));
    for (const root of roots) {
      if (!root || !root.isConnected || isProtected(root)) continue;
      root.dataset.pcExternalBooksyBadge = "true";
      root.setAttribute("aria-hidden", "true");
      root.style.setProperty("display", "none", "important");
      requestAnimationFrame(() => {
        if (root.isConnected) root.remove();
      });
      removed += 1;
    }

    if (removed) document.documentElement.dataset.pcExternalBooksyBadgeRemoved = String(removed);
    return removed > 0;
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      removeBadge();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule, { once: true });
  else schedule();
  window.addEventListener("load", schedule, { once: true });
  [0, 50, 150, 350, 700, 1200, 2500, 5000].forEach(delay => setTimeout(schedule, delay));

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 30000);
})();
