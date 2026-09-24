(() => {
  "use strict";

  const TARGET_HEADING = "all precision cuts services";
  const normalize = value => String(value || "").replace(/\s+/g, " ").trim().toLowerCase();

  function findSection(heading) {
    const allowed = "section,article,[class*='section'],[class*='catalog'],[class*='services'],div";
    let current = heading;
    const candidates = [];

    while (current && current !== document.body && current.matches?.(allowed)) {
      const text = normalize(current.textContent);
      const categoryCount = ["haircuts", "combos", "beard & shave", "additional services"]
        .filter(label => text.includes(label)).length;
      if (text.includes(TARGET_HEADING) && categoryCount === 4) candidates.push(current);
      current = current.parentElement;
    }

    candidates.sort((a, b) => a.querySelectorAll("*").length - b.querySelectorAll("*").length);
    return candidates[0] || null;
  }

  function removeRedundantSection() {
    const heading = [...document.querySelectorAll("h1,h2,h3,h4,[role='heading']")]
      .find(node => normalize(node.textContent) === TARGET_HEADING);
    if (!heading || heading.closest("#pc-home-booking-modal")) return false;

    const section = findSection(heading);
    if (!section) return false;

    section.dataset.pcRedundantAllServices = "true";
    section.setAttribute("aria-hidden", "true");
    section.remove();
    document.documentElement.dataset.pcRedundantServicesRemoved = "true";
    return true;
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      removeRedundantSection();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule, { once: true });
  } else {
    schedule();
  }
  window.addEventListener("load", schedule, { once: true });
  [50, 150, 350, 700, 1200, 2500, 5000].forEach(delay => setTimeout(schedule, delay));

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 30000);
})();
