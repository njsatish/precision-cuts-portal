(() => {
  "use strict";

  const BARBERS = [
    ["keith-lemon", "#d7ad24"],
    ["christopher-meadows", "#25a7d2"],
    ["ron-the-barber", "#ef6330"],
    ["levar-neal", "#d91334"],
    ["lamar-the-barber", "#4e8765"]
  ];

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

  function findPhotoFrame(image, card) {
    let current = image.parentElement;
    const candidates = [];
    while (current && current !== card) {
      if (current.matches?.("figure, picture, div, a")) {
        const imageCount = current.querySelectorAll("img").length;
        const buttonCount = current.querySelectorAll("[data-index-profile-booking]").length;
        if (imageCount === 1 && buttonCount === 0) candidates.push(current);
      }
      current = current.parentElement;
    }
    candidates.sort((a, b) => a.querySelectorAll("*").length - b.querySelectorAll("*").length);
    return candidates[0] || image.parentElement;
  }

  function findContent(card, frame, control) {
    const direct = [...card.children].find(child => child !== frame && child.contains(control));
    return direct || control.parentElement;
  }

  function commonParent(cards) {
    let current = cards[0]?.parentElement;
    while (current && current !== document.body) {
      if (cards.every(card => current.contains(card))) return current;
      current = current.parentElement;
    }
    return null;
  }

  function apply() {
    const records = BARBERS.map(([id, accent]) => {
      const control = document.querySelector(`[data-index-profile-booking="${id}"]`);
      if (!control) return null;
      const card = findCard(control);
      const image = card?.querySelector("img");
      if (!card || !image) return null;
      const frame = findPhotoFrame(image, card);
      const content = findContent(card, frame, control);
      return { id, accent, control, card, image, frame, content };
    });

    if (records.some(record => !record)) return false;
    const cards = records.map(record => record.card);
    if (new Set(cards).size !== 5) return false;
    const grid = commonParent(cards);
    if (!grid) return false;

    grid.dataset.pcFiveBarberGrid = "true";
    records.forEach(record => {
      record.card.dataset.pcFiveBarberCard = "true";
      record.card.style.setProperty("--pc-card-accent", record.accent);
      record.frame.dataset.pcFiveBarberPhotoFrame = "true";
      record.image.dataset.pcFiveBarberPhoto = "true";
      if (record.content) record.content.dataset.pcFiveBarberContent = "true";
    });

    document.documentElement.dataset.pcFiveBarberCompactCircles = "true";
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
