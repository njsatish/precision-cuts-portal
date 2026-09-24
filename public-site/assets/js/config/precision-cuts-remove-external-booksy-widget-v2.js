(() => {
  "use strict";

  const isBooksyFrame = node => {
    if (!(node instanceof HTMLIFrameElement)) return false;
    return `${node.src} ${node.title} ${node.name} ${node.id} ${node.className}`
      .toLowerCase().includes("booksy");
  };

  function removeWidget() {
    let removed = 0;

    for (const frame of [...document.querySelectorAll("iframe")].filter(isBooksyFrame)) {
      if (frame.closest("#pc-home-booking-modal,main,footer")) continue;
      let root = frame;
      let current = frame.parentElement;
      while (current && current !== document.body) {
        const rect = current.getBoundingClientRect();
        if (rect.height <= 240 && rect.width <= 620) root = current;
        current = current.parentElement;
      }
      root.remove();
      removed += 1;
    }

    for (const node of document.querySelectorAll(
      "body > [class*='booksy'],body > [id*='booksy'],body > [data-booksy]"
    )) {
      if (node.matches("script") || node.closest("main,footer,#pc-home-booking-modal")) continue;
      node.remove();
      removed += 1;
    }

    if (removed) document.documentElement.dataset.pcExternalBooksyWidgetRemoved = String(removed);
  }

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; removeWidget(); });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule, {once:true});
  else schedule();
  window.addEventListener("load", schedule, {once:true});
  [0,50,150,350,700,1200,2500,5000,10000].forEach(delay => setTimeout(schedule,delay));
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(() => observer.disconnect(),30000);
})();
