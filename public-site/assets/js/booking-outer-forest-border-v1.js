(() => {
  "use strict";

  const normalizedText = element =>
    (element?.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();

  const containsStep = (element, patterns) => {
    const text = normalizedText(element);
    return patterns.some(pattern => text.includes(pattern));
  };

  const locateBookingFrame = () => {
    const preferred = document.querySelector(
      "[data-booking-workflow], .booking-workflow, .booking-grid, .booking-steps, .pp-booking-grid, .pc-booking-grid"
    );
    if (preferred) return preferred;

    const candidates = [...document.querySelectorAll("main section, main > div, main form, main")]
      .filter(element => {
        const hasServices = containsStep(element, ["1. services", "services"]);
        const hasBarbers = containsStep(element, ["2. barbers", "barbers"]);
        const hasDates = containsStep(element, ["3. available dates", "available dates"]);
        return hasServices && hasBarbers && hasDates;
      })
      .sort((a, b) => a.querySelectorAll("*").length - b.querySelectorAll("*").length);

    return candidates[0] || null;
  };

  const applyOuterBorder = () => {
    if (document.querySelector(".pc-booking-outer-frame-v1")) return true;
    const frame = locateBookingFrame();
    if (!frame) return false;
    frame.classList.add("pc-booking-outer-frame-v1");
    frame.dataset.bookingOuterBorder = "forest-v1";
    return true;
  };

  if (!applyOuterBorder()) {
    const observer = new MutationObserver(() => {
      if (applyOuterBorder()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 15000);
  }
})();
