(() => {
  "use strict";

  const BARBERS = [
    "keith-lemon",
    "christopher-meadows",
    "ron-the-barber",
    "levar-neal",
    "lamar-the-barber"
  ];

  const normalize = value => String(value || "").replace(/\s+/g, " ").trim().toLowerCase();

  function findCard(control) {
    const candidates = [];
    let current = control;
    while (current && current !== document.body) {
      if (current.matches?.("article, li, [class*='card'], [class*='profile'], div")) {
        if (
          current.querySelectorAll("[data-index-profile-booking]").length === 1 &&
          current.querySelectorAll("img").length >= 1
        ) candidates.push(current);
      }
      current = current.parentElement;
    }
    candidates.sort((a, b) => a.querySelectorAll("*").length - b.querySelectorAll("*").length);
    return candidates[0] || null;
  }

  function markTypography(card, control) {
    const heading = card.querySelector("h2,h3,h4");
    if (heading) heading.dataset.pcBarberName = "true";

    const textNodes = [...card.querySelectorAll("p,span,small")];
    const status = textNodes.find(node => normalize(node.textContent) === "live availability");
    if (status) status.dataset.pcLiveStatus = "true";

    const role = textNodes.find(node => {
      if (node === status || node.contains(control)) return false;
      const text = normalize(node.textContent);
      return text && text.length > 5 && text.length < 80 &&
        (text.includes("specialist") || text.includes("master barber") || text.includes("founder"));
    });
    if (role) role.dataset.pcBarberRole = "true";
  }

  function apply() {
    let count = 0;
    for (const id of BARBERS) {
      const control = document.querySelector(`[data-index-profile-booking="${id}"]`);
      if (!control) continue;
      const card = findCard(control);
      if (!card) continue;

      card.dataset.pcFiveBarberCard = "true";
      card.dataset.pcDarkBarberCard = "true";
      control.dataset.pcBookWithButton = "true";
      markTypography(card, control);
      count += 1;
    }
    document.documentElement.dataset.pcDarkBarberCardsApplied = String(count);
    return count === 5;
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
  [100, 350, 900, 1800, 3500].forEach(delay => setTimeout(schedule, delay));
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 20000);
})();
