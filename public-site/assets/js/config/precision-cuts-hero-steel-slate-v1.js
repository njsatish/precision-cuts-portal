(() => {
  "use strict";

  const normalize = value => String(value || "").replace(/\s+/g, " ").trim().toLowerCase();

  function score(node) {
    if (!node || node.closest("#pc-home-booking-modal")) return -1;
    const text = normalize(node.textContent);
    const hasMedia = Boolean(node.querySelector("img,picture,video"));
    const hasHeading = Boolean(node.querySelector("h1,h2"));
    const hasAction = Boolean(node.querySelector("a,button"));
    const words = ["precision", "cut", "roanoke", "book"]
      .filter(word => text.includes(word)).length;
    return (hasMedia ? 4 : 0) + (hasHeading ? 3 : 0) + (hasAction ? 2 : 0) + words;
  }

  function findHero() {
    const rounded = document.querySelector('[data-pc-rounded-home-hero="true"]');
    if (rounded) return rounded;

    const explicit = document.querySelector(
      "main [data-hero], main .hero, main [class*='hero'], main > section:first-of-type"
    );
    if (explicit && score(explicit) >= 8) return explicit;

    return [...document.querySelectorAll("main > section,main > div,body > section")]
      .filter(node => score(node) >= 8)
      .sort((a,b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0] || null;
  }

  function apply() {
    const hero = findHero();
    if (!hero) return false;

    hero.dataset.pcSteelSlateHero = "true";
    hero.style.setProperty("background", "#354154", "important");
    hero.style.setProperty("background-color", "#354154", "important");
    hero.style.setProperty("background-image", "none", "important");

    for (const child of hero.children) {
      const style = getComputedStyle(child);
      const color = style.backgroundColor;
      const image = style.backgroundImage;
      const opaqueDark = /rgba?\((?:1?[0-9]|2[0-9]|3[0-9]),\s*(?:1?[0-9]|2[0-9]|3[0-9]),\s*(?:1?[0-9]|2[0-9]|3[0-9])/.test(color);
      if (opaqueDark && image === "none") child.dataset.pcSteelSlateLayer = "true";
    }

    document.documentElement.dataset.pcSteelSlateHeroApplied = "true";
    return true;
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; apply(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule, {once:true});
  else schedule();
  window.addEventListener("load", schedule, {once:true});
  [50,200,500,1000,2500].forEach(delay => setTimeout(schedule,delay));
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(() => observer.disconnect(),20000);
})();
