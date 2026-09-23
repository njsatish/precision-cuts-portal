(() => {
  "use strict";
  const TARGET = "choose a service, barber, and time.";
  const normalize = value => String(value || "").replace(/\s+/g, " ").trim().toLowerCase();

  function apply(root = document) {
    const headings = root.querySelectorAll?.("h1,h2,h3,h4,[role='heading']") || [];
    let matches = 0;
    for (const heading of headings) {
      if (normalize(heading.textContent) !== TARGET) continue;
      heading.classList.add("pc-booking-intro-one-line");
      heading.dataset.pcBookingIntroOneLine = "true";
      matches += 1;
    }
    document.documentElement.dataset.pcBookingIntroHeadingMatches = String(matches);
    return matches;
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule, { once: true });
  } else {
    schedule();
  }
  window.addEventListener("load", schedule, { once: true });
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 15000);
})();
