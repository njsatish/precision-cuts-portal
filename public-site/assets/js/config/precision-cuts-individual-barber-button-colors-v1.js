(() => {
  "use strict";

  const PALETTE = {
    "keith-lemon": {
      accent: "#F2C23A",
      hover: "#FFD45C",
      text: "#17120A"
    },
    "christopher-meadows": {
      accent: "#16A9E0",
      hover: "#35BCEC",
      text: "#FFFFFF"
    },
    "ron-the-barber": {
      accent: "#FF6A12",
      hover: "#FF8439",
      text: "#FFFFFF"
    },
    "levar-neal": {
      accent: "#E9164B",
      hover: "#F23867",
      text: "#FFFFFF"
    },
    "lamar-the-barber": {
      accent: "#0AA06E",
      hover: "#16B982",
      text: "#FFFFFF"
    }
  };

  const normalize = value => String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  function findCard(control) {
    if (!control) return null;
    const candidates = [];
    let current = control;

    while (current && current !== document.body) {
      if (current.matches?.("article, li, [class*='card'], [class*='profile'], div")) {
        const bookingControls = current.querySelectorAll("[data-index-profile-booking]").length;
        const images = current.querySelectorAll("img").length;
        if (bookingControls === 1 && images >= 1) candidates.push(current);
      }
      current = current.parentElement;
    }

    candidates.sort((a, b) => a.querySelectorAll("*").length - b.querySelectorAll("*").length);
    return candidates[0] || control.closest("article, li, div");
  }

  function findRole(card, control) {
    return [...card.querySelectorAll("p,span,small")].find(node => {
      if (node.contains(control)) return false;
      const text = normalize(node.textContent);
      return text && text.length > 5 && text.length < 100 &&
        (text.includes("specialist") || text.includes("master barber") || text.includes("founder"));
    }) || null;
  }

  function findStatus(card) {
    return [...card.querySelectorAll("p,span,small,div")].find(node =>
      normalize(node.textContent) === "live availability"
    ) || null;
  }

  function apply() {
    let applied = 0;

    for (const [barberId, colors] of Object.entries(PALETTE)) {
      const control = document.querySelector(`[data-index-profile-booking="${barberId}"]`);
      if (!control) continue;

      const card = findCard(control);
      if (!card) continue;

      card.dataset.pcColorBarberCard = "true";
      card.style.setProperty("--pc-barber-accent", colors.accent);
      card.style.setProperty("--pc-barber-hover", colors.hover);
      card.style.setProperty("--pc-barber-button-text", colors.text);

      control.dataset.pcColorBookButton = "true";
      control.removeAttribute("hidden");
      control.setAttribute("aria-hidden", "false");

      const image = card.querySelector("img");
      if (image) image.dataset.pcColorPhoto = "true";

      const role = findRole(card, control);
      if (role) role.dataset.pcColorRole = "true";

      const status = findStatus(card);
      if (status) status.dataset.pcColorStatus = "true";

      applied += 1;
    }

    document.documentElement.dataset.pcIndividualBarberColors = String(applied);
    return applied === 5;
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
