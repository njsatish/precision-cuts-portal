(() => {
  "use strict";

  const TARGET = "choose a service, barber, and time.";
  const normalize = value => String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  function smallestIntroContainer(heading) {
    const candidates = [];
    let current = heading.parentElement;

    while (current && current !== document.body) {
      if (current.matches("header, section, article, div")) {
        const text = normalize(current.textContent);
        const elements = current.querySelectorAll("*").length;
        if (
          text.includes("live booksy availability") &&
          text.includes(TARGET) &&
          elements < 40
        ) {
          candidates.push(current);
        }
      }
      if (current.matches("main")) break;
      current = current.parentElement;
    }

    candidates.sort((a, b) =>
      a.querySelectorAll("*").length - b.querySelectorAll("*").length
    );
    return candidates[0] || heading.parentElement;
  }

  function apply() {
    const heading = [...document.querySelectorAll("h1,h2,h3,h4,[role='heading']")]
      .find(node => normalize(node.textContent) === TARGET);
    if (!heading) return false;

    heading.classList.add("pc-booking-intro-title-v2");
    const container = smallestIntroContainer(heading);
    if (container) container.classList.add("pc-booking-intro-card-v2");

    const kicker = [...container.querySelectorAll("p,span,small")]
      .find(node => normalize(node.textContent) === "live booksy availability");
    if (kicker) kicker.classList.add("pc-booking-intro-kicker-v2");

    document.documentElement.dataset.pcBookingIntroCompact = "true";
    return true;
  }

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      apply();
    });
  };

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
