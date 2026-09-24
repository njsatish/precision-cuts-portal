(() => {
  "use strict";

  const normalize = value => String(value || "").replace(/\s+/g, " ").trim().toLowerCase();

  function score(node) {
    if (!node || node.closest("#pc-home-booking-modal")) return -1;
    const text = normalize(node.textContent);
    const hasImage = Boolean(node.querySelector("img,picture,video"));
    const hasAction = Boolean(node.querySelector("a,button"));
    const hasHeadline = Boolean(node.querySelector("h1,h2"));
    const heroWords = ["book", "precision", "cuts", "barber", "look sharp"]
      .filter(word => text.includes(word)).length;
    return (hasImage ? 4 : 0) + (hasAction ? 3 : 0) + (hasHeadline ? 3 : 0) + heroWords;
  }

  function findHero() {
    const explicit = document.querySelector(
      "main [data-hero], main .hero, main [class*='hero'], main > section:first-of-type"
    );
    if (explicit && score(explicit) >= 9) return explicit;

    const candidates = [...document.querySelectorAll("main > section, main > div, body > section")]
      .filter(node => score(node) >= 9)
      .sort((a, b) => {
        const topDifference = a.getBoundingClientRect().top - b.getBoundingClientRect().top;
        if (Math.abs(topDifference) > 4) return topDifference;
        return a.querySelectorAll("*").length - b.querySelectorAll("*").length;
      });
    return candidates[0] || null;
  }

  function apply() {
    const hero = findHero();
    if (!hero) return false;
    hero.dataset.pcRoundedHomeHero = "true";
    document.documentElement.dataset.pcRoundedHomeHeroApplied = "true";
    return true;
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; apply(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule, { once: true });
  else schedule();
  window.addEventListener("load", schedule, { once: true });
  [50, 200, 500, 1000, 2500].forEach(delay => setTimeout(schedule, delay));
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 20000);
})();
