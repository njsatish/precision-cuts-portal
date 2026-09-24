(() => {
  "use strict";

  const BARBER_ID = "christopher-meadows";
  const FULL_NAME = "Christopher Meadows";
  const SHORT_NAME = "Christopher";
  const BUTTON_LABEL = "Book with Christopher";

  const normalize = value => String(value || "")
    .replace(/\s+/g, " ")
    .trim();

  function findCard(control) {
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
    return candidates[0] || null;
  }

  function apply() {
    const control = document.querySelector(
      `[data-index-profile-booking="${BARBER_ID}"]:not(#pc-home-booking-modal *)`
    );
    if (!control) return false;

    const card = findCard(control);
    if (!card || card.closest("#pc-home-booking-modal")) return false;

    const heading = [...card.querySelectorAll("h1,h2,h3,h4,[role='heading']")]
      .find(node => normalize(node.textContent) === FULL_NAME || normalize(node.textContent) === SHORT_NAME);
    if (!heading) return false;

    if (normalize(heading.textContent) !== SHORT_NAME) heading.textContent = SHORT_NAME;
    if (normalize(control.textContent) !== BUTTON_LABEL) control.textContent = BUTTON_LABEL;

    heading.dataset.pcChristopherShortName = "true";
    control.dataset.pcChristopherShortButton = "true";
    document.documentElement.dataset.pcChristopherShortCardName = "true";
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
  [100, 350, 900, 1800, 3500].forEach(delay => setTimeout(schedule, delay));

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  setTimeout(() => observer.disconnect(), 20000);
})();
