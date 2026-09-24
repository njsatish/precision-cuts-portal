(() => {
  "use strict";

  const normalize = value => String(value || "").replace(/\s+/g, " ").trim().toLowerCase();

  function heading(text) {
    return [...document.querySelectorAll("h1,h2,h3,h4,[role='heading']")]
      .find(node => normalize(node.textContent) === text);
  }

  function panelFor(node) {
    if (!node) return null;
    let current = node.parentElement;
    const candidates = [];
    while (current && current !== document.body) {
      const rect = current.getBoundingClientRect();
      const style = getComputedStyle(current);
      const text = normalize(current.textContent);
      const framed = parseFloat(style.borderTopWidth) > 0 || parseFloat(style.borderRadius) >= 10;
      if (framed && rect.width >= 500 && rect.height >= 100 && rect.height <= 420 && text.length < 320) {
        candidates.push(current);
      }
      current = current.parentElement;
    }
    candidates.sort((a,b) => a.querySelectorAll("*").length - b.querySelectorAll("*").length);
    return candidates[0] || null;
  }

  function apply() {
    const teamHeading = heading("choose your barber.");
    const bookingHeading = heading("choose a service, barber, and time.");
    const teamPanel = panelFor(teamHeading);
    const bookingPanel = panelFor(bookingHeading);
    if (!teamPanel || !bookingPanel || teamPanel === bookingPanel) return false;

    const teamRect = teamPanel.getBoundingClientRect();
    if (teamRect.width < 500) return false;

    const rootRect = document.documentElement.getBoundingClientRect();
    document.documentElement.style.setProperty("--pc-team-intro-width", `${teamRect.width}px`);
    document.documentElement.style.setProperty("--pc-team-intro-left", `${teamRect.left - rootRect.left}px`);
    teamPanel.dataset.pcTeamIntroWidthSource = "true";
    bookingPanel.dataset.pcBookingIntroWidthMatch = "true";
    document.documentElement.dataset.pcBookingIntroWidthMatched = "true";
    return true;
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; apply(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule, {once:true});
  else schedule();
  window.addEventListener("load", schedule, {once:true});
  window.addEventListener("resize", schedule, {passive:true});
  [50,200,500,1000,2500].forEach(delay => setTimeout(schedule,delay));
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(() => observer.disconnect(),20000);
})();
