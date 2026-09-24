(() => {
  "use strict";

  const TARGET = "choose a service, barber, and time.";
  const normalize = value => String(value || "").replace(/\s+/g, " ").trim().toLowerCase();

  function findPanel(heading) {
    let current = heading.parentElement;
    const candidates = [];
    while (current && current !== document.body) {
      const rect = current.getBoundingClientRect();
      const style = getComputedStyle(current);
      const text = normalize(current.textContent);
      const framed = parseFloat(style.borderTopWidth) > 0 || parseFloat(style.borderRadius) >= 10;
      if (framed && rect.height >= 100 && rect.height <= 420 && text.includes(TARGET) && text.length < 320) {
        candidates.push(current);
      }
      current = current.parentElement;
    }
    candidates.sort((a,b) => a.querySelectorAll("*").length - b.querySelectorAll("*").length);
    return candidates[0] || null;
  }

  function apply() {
    const heading = [...document.querySelectorAll("h1,h2,h3,h4,[role='heading']")]
      .find(node => normalize(node.textContent) === TARGET && !node.closest("#pc-home-booking-modal"));
    if (!heading) return false;
    const panel = findPanel(heading);
    if (!panel) return false;

    panel.dataset.pcBookingIntroFullWidth = "true";
    const wrapper = panel.parentElement;
    if (wrapper && wrapper !== document.body) wrapper.dataset.pcBookingIntroWrapperFullWidth = "true";
    document.documentElement.dataset.pcBookingIntroFullWidthApplied = "true";
    return true;
  }

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; apply(); });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule, {once:true});
  else schedule();
  window.addEventListener("load", schedule, {once:true});
  window.addEventListener("resize", schedule, {passive:true});
  [50,200,500,1000,2500].forEach(delay => setTimeout(schedule,delay));
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(() => observer.disconnect(),20000);
})();
