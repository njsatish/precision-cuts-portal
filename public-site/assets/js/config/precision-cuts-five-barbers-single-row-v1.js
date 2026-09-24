(() => {
  "use strict";

  const BARBER_IDS = [
    "keith-lemon",
    "christopher-meadows",
    "ron-the-barber",
    "levar-neal",
    "lamar-the-barber"
  ];

  function findCard(control) {
    const candidates = [];
    let current = control;
    while (current && current !== document.body) {
      if (current.matches?.("article, li, [class*='card'], [class*='profile'], div")) {
        const buttons = current.querySelectorAll("[data-index-profile-booking]").length;
        const images = current.querySelectorAll("img").length;
        if (buttons === 1 && images >= 1) candidates.push(current);
      }
      current = current.parentElement;
    }
    candidates.sort((a, b) => a.querySelectorAll("*").length - b.querySelectorAll("*").length);
    return candidates[0] || control.closest("article, li, div");
  }

  function commonParent(cards) {
    if (!cards.length) return null;
    let current = cards[0].parentElement;
    while (current && current !== document.body) {
      if (cards.every(card => current.contains(card))) return current;
      current = current.parentElement;
    }
    return null;
  }

  function apply() {
    const controls = BARBER_IDS.map(id =>
      document.querySelector(`[data-index-profile-booking="${id}"]`)
    );
    if (controls.some(control => !control)) return false;

    const cards = controls.map(findCard);
    if (new Set(cards).size !== 5) return false;

    const grid = commonParent(cards);
    if (!grid) return false;

    grid.dataset.pcFiveBarberGrid = "true";
    cards.forEach((card, index) => {
      card.dataset.pcFiveBarberCard = "true";
      card.dataset.pcFiveBarberOrder = String(index + 1);
      card.style.setProperty("grid-column", "auto", "important");
      card.style.setProperty("grid-row", "auto", "important");
      card.style.setProperty("width", "100%", "important");
      card.style.setProperty("max-width", "none", "important");
      card.style.setProperty("margin", "0", "important");
    });

    document.documentElement.dataset.pcFiveBarbersSingleRow = "true";
    return true;
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      apply();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule, { once: true });
  } else {
    schedule();
  }
  window.addEventListener("load", schedule, { once: true });
  window.addEventListener("resize", schedule, { passive: true });
  [100, 350, 900, 1800, 3500].forEach(delay => setTimeout(schedule, delay));

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 20000);
})();
