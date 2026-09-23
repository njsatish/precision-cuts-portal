(() => {
  "use strict";
  const TARGET = "choose your barber.";
  const normalize = value => String(value || "").replace(/\s+/g, " ").trim().toLowerCase();

  function fit(heading) {
    heading.classList.add("pc-choose-barber-heading-compact");
    heading.dataset.pcChooseBarberCompact = "true";
    heading.style.removeProperty("font-size");
    if (window.innerWidth <= 640) return;

    const computed = getComputedStyle(heading);
    const horizontalPadding = (parseFloat(computed.paddingLeft) || 0) + (parseFloat(computed.paddingRight) || 0);
    const available = Math.max(0, heading.clientWidth - horizontalPadding - 8);
    let size = parseFloat(computed.fontSize) || 52;
    const minimum = 28;
    heading.style.setProperty("font-size", `${size}px`, "important");

    while (heading.scrollWidth - horizontalPadding > available && size > minimum) {
      size -= 1;
      heading.style.setProperty("font-size", `${size}px`, "important");
    }
    heading.dataset.pcChooseBarberFittedSize = String(size);
  }

  function apply(root = document) {
    let count = 0;
    for (const heading of root.querySelectorAll?.("h1,h2,h3,h4,[role='heading']") || []) {
      if (normalize(heading.textContent) !== TARGET) continue;
      fit(heading);
      count += 1;
    }
    document.documentElement.dataset.pcChooseBarberHeadingMatches = String(count);
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      apply(document);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule, { once: true });
  else schedule();
  window.addEventListener("load", schedule, { once: true });
  window.addEventListener("resize", schedule, { passive: true });
  document.fonts?.ready?.then(schedule);
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 15000);
})();
