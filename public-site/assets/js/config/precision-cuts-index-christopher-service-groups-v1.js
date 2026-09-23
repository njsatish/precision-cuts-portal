(() => {
  "use strict";

  const CHRISTOPHER = "christopher-meadows";
  const GROUP_LABEL = "Eyebrow Shaping / Hair Wash";
  const normalize = value => String(value || "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase();

  function isEyebrow(option) {
    const text = normalize(option.textContent);
    return text.includes("eyebrow") && text.includes("shaping");
  }

  function isHairWash(option) {
    const text = normalize(option.textContent);
    return text.includes("hair") && text.includes("wash");
  }

  function groupOptions() {
    const modal = document.querySelector("#pc-home-booking-modal");
    const barber = modal?.querySelector("#pchbm-barber");
    const service = modal?.querySelector("#pchbm-service");
    if (!modal || !barber || !service) return false;
    if (barber.value !== CHRISTOPHER) return false;

    const options = [...service.options];
    const eyebrow = options.find(isEyebrow);
    const hairWash = options.find(isHairWash);
    if (!eyebrow) return false;

    // Keep Eyebrow Shaping's original option value. The modal therefore uses
    // Eyebrow Shaping's existing mapping and Booksy variant ID for the group.
    eyebrow.textContent = GROUP_LABEL;
    eyebrow.dataset.pcCanonicalService = "eyebrow-shaping";
    eyebrow.dataset.pcGroupedServices = "eyebrow-shaping,hair-wash";
    eyebrow.title = "Books with the Eyebrow Shaping Booksy variant";

    if (hairWash && hairWash !== eyebrow) {
      const selectedHairWash = service.value === hairWash.value;
      hairWash.remove();
      if (selectedHairWash) {
        service.value = eyebrow.value;
        service.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }

    service.dataset.pcChristopherGrouped = "true";
    document.documentElement.dataset.pcChristopherServiceGroup = "eyebrow-shaping-hair-wash";
    return true;
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      groupOptions();
    });
  }

  document.addEventListener("change", event => {
    if (event.target?.matches?.("#pchbm-barber,#pchbm-service")) schedule();
  }, true);
  document.addEventListener("click", event => {
    if (event.target?.closest?.("[data-index-profile-booking='christopher-meadows']")) schedule();
  }, true);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule, { once: true });
  else schedule();
  window.addEventListener("load", schedule, { once: true });
  [100,300,700,1500,3000].forEach(delay => setTimeout(schedule, delay));
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 20000);
})();
