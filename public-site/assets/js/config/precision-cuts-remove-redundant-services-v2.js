(() => {
  "use strict";

  const normalize = value => String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
  const HEADING = "all precision cuts services";
  const CATEGORIES = ["haircuts", "combos", "beard & shave", "additional services"];

  function scoreContainer(node) {
    if (!node) return -1;
    const text = normalize(node.textContent);
    if (!text.includes(HEADING)) return -1;
    const categoryMatches = CATEGORIES.filter(label => text.includes(label)).length;
    if (categoryMatches !== 4) return -1;
    const controls = node.querySelectorAll("button,[role='button'],details,summary").length;
    return categoryMatches * 100 + controls;
  }

  function findCatalog(heading) {
    const candidates = [];
    let current = heading.parentElement;

    while (current && current !== document.body) {
      if (current.matches?.("section,article,div,main")) {
        const score = scoreContainer(current);
        if (score >= 400) candidates.push({ node: current, score, size: current.querySelectorAll("*").length });
      }
      current = current.parentElement;
    }

    candidates.sort((a, b) => a.size - b.size || b.score - a.score);
    return candidates[0]?.node || null;
  }

  function apply() {
    const heading = [...document.querySelectorAll("h1,h2,h3,h4,[role='heading']")]
      .find(node => normalize(node.textContent) === HEADING && !node.closest("#pc-home-booking-modal"));
    if (!heading) return false;

    const catalog = findCatalog(heading);
    if (!catalog) return false;

    catalog.dataset.pcRedundantServiceCatalog = "true";
    catalog.setAttribute("aria-hidden", "true");
    catalog.style.setProperty("display", "none", "important");

    requestAnimationFrame(() => {
      if (catalog.isConnected) catalog.remove();
    });

    document.documentElement.dataset.pcRedundantServiceCatalogRemoved = "true";
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

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule, { once: true });
  else schedule();
  window.addEventListener("load", schedule, { once: true });
  [0, 50, 150, 350, 700, 1200, 2500, 5000].forEach(delay => setTimeout(schedule, delay));

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 30000);
})();
