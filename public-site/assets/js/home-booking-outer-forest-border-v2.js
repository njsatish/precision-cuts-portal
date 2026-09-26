(() => {
  "use strict";

  const borderClass = "pc-home-booking-outer-frame-v2";
  const normalized = element =>
    (element?.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();

  const findStepHeading = label =>
    [...document.querySelectorAll("main h2, main h3, main h4, main header, main [class*='title']")]
      .find(element => normalized(element).includes(label));

  const findStepCard = heading => {
    if (!heading) return null;
    return heading.closest(
      "[data-booking-step], .booking-step, .booking-column, .booking-panel, .step-card, .pp-booking-step, section, article"
    ) || heading.parentElement;
  };

  const lowestCommonAncestor = elements => {
    if (!elements.length || elements.some(element => !element)) return null;
    let candidate = elements[0];
    while (candidate && !elements.every(element => candidate.contains(element))) {
      candidate = candidate.parentElement;
    }
    return candidate;
  };

  const locateThreeColumnGrid = () => {
    const services = findStepCard(findStepHeading("1. services"));
    const barbers = findStepCard(findStepHeading("2. barbers"));
    const dates = findStepCard(findStepHeading("3. available dates"));
    const common = lowestCommonAncestor([services, barbers, dates]);
    if (!common) return null;

    /* The workflow heading must not be inside the bordered element. */
    const headingText = "live booksy availability";
    if (!normalized(common).includes(headingText)) return common;

    /* Prefer a descendant that still contains all three step cards but not the heading. */
    const descendants = [...common.querySelectorAll("div, section, form")]
      .filter(element =>
        element.contains(services) &&
        element.contains(barbers) &&
        element.contains(dates) &&
        !normalized(element).startsWith(headingText)
      )
      .sort((a, b) => a.querySelectorAll("*").length - b.querySelectorAll("*").length);

    return descendants[0] || common;
  };

  const applyBorder = () => {
    const grid = locateThreeColumnGrid();
    if (!grid) return false;

    document.querySelectorAll(`.${borderClass}`).forEach(element => {
      if (element !== grid) {
        element.classList.remove(borderClass);
        delete element.dataset.homeBookingOuterBorder;
      }
    });

    grid.classList.add(borderClass);
    grid.dataset.homeBookingOuterBorder = "forest-v4";
    return true;
  };

  if (!applyBorder()) {
    const observer = new MutationObserver(() => {
      if (applyBorder()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 15000);
  }
})();
