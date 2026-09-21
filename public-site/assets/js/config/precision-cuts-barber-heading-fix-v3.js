(() => {
  "use strict";
  let scheduled = false;

  function apply() {
    const heading = [...document.querySelectorAll("main h1, main h2, main h3")]
      .find(node => (node.textContent || "").replace(/\s+/g, " ").trim().toLowerCase().includes("choose your barber"));
    if (!heading) return false;
    heading.classList.add("pch-barber-title-v3");
    return true;
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      apply();
    });
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", apply, { once: true })
    : apply();
  window.addEventListener("load", apply, { once: true });

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 12000);
})();
