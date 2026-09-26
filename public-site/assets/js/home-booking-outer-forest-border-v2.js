(() => {
  "use strict";

  const textOf = element =>
    (element?.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();

  const includesAny = (element, values) => {
    const text = textOf(element);
    return values.some(value => text.includes(value));
  };

  const locateHomeBookingWorkflow = () => {
    const explicit = document.querySelector(
      "[data-booking-workflow], #booking-workflow, .booking-workflow, .booking-grid, .booking-steps, .pp-booking-grid, .pc-booking-grid"
    );
    if (explicit) return explicit;

    const candidates = [...document.querySelectorAll("main section, main form, main > div")]
      .filter(element => {
        const services = includesAny(element, ["1. services", "services"]);
        const barbers = includesAny(element, ["2. barbers", "barbers"]);
        const dates = includesAny(element, ["3. available dates", "available dates"]);
        return services && barbers && dates;
      })
      .sort((a, b) => a.querySelectorAll("*").length - b.querySelectorAll("*").length);

    return candidates[0] || null;
  };

  const applyBorder = () => {
    if (document.querySelector(".pc-home-booking-outer-frame-v2")) return true;
    const workflow = locateHomeBookingWorkflow();
    if (!workflow) return false;
    workflow.classList.add("pc-home-booking-outer-frame-v2");
    workflow.dataset.homeBookingOuterBorder = "forest-v2";
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
