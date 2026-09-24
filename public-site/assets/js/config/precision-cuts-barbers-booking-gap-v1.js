(() => {
  "use strict";
  const norm = value => String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
  const important = (node, property, value) => node?.style?.setProperty(property, value, "important");

  function sectionAncestor(node) {
    let current = node;
    while (current && current !== document.body) {
      if (current.matches?.("section, main > div, main > article")) return current;
      current = current.parentElement;
    }
    return null;
  }

  function smallestIntro(title) {
    const candidates = [];
    let current = title;
    while (current && current !== document.body) {
      if (current.matches?.("header, section, article, div")) {
        const text = norm(current.textContent);
        if (text.includes("live booksy availability") && text.includes("choose a service, barber, and time.")) {
          candidates.push(current);
        }
      }
      current = current.parentElement;
    }
    candidates.sort((a, b) => a.querySelectorAll("*").length - b.querySelectorAll("*").length);
    return candidates[0] || title.parentElement;
  }

  function apply() {
    const grid = document.querySelector('[data-pc-five-barber-grid="true"]');
    const bookingTitle = [...document.querySelectorAll("h1,h2,h3,h4,[role='heading']")]
      .find(node => norm(node.textContent) === "choose a service, barber, and time.");
    if (!grid || !bookingTitle) return false;

    const teamSection = sectionAncestor(grid) || grid.parentElement;
    const bookingIntro = smallestIntro(bookingTitle);
    const bookingSection = sectionAncestor(bookingIntro) || bookingIntro.parentElement;
    if (!teamSection || !bookingSection || teamSection === bookingSection) return false;

    teamSection.dataset.pcTeamGap = "compact";
    bookingSection.dataset.pcBookingGap = "compact";
    bookingIntro.dataset.pcBookingIntroGap = "compact";

    important(teamSection, "min-height", "0");
    important(teamSection, "height", "auto");
    important(teamSection, "margin-bottom", "0");
    important(teamSection, "padding-bottom", window.innerWidth <= 640 ? "24px" : "32px");

    important(bookingSection, "min-height", "0");
    important(bookingSection, "height", "auto");
    important(bookingSection, "margin-top", "0");
    important(bookingSection, "padding-top", "0");
    important(bookingIntro, "margin-top", "0");

    document.documentElement.dataset.pcBarbersBookingGap = "compact";
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
  window.addEventListener("resize", schedule, { passive: true });
  [100, 350, 900, 1800, 3500].forEach(delay => setTimeout(schedule, delay));
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 20000);
})();
