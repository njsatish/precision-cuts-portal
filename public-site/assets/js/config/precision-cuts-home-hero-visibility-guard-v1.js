(() => {
  "use strict";
  let scheduled = false;

  function reveal() {
    const carousel = document.querySelector("#pch-transition");
    if (!carousel) return false;

    const section = carousel.closest("section") || carousel.parentElement;
    [section, carousel].filter(Boolean).forEach(node => {
      node.hidden = false;
      node.removeAttribute("aria-hidden");
      node.style.setProperty("display", node === carousel ? "block" : "", "important");
      node.style.setProperty("visibility", "visible", "important");
      node.style.setProperty("opacity", "1", "important");
    });

    const image = carousel.querySelector("#pch-transition-image");
    if (image) {
      image.hidden = false;
      image.style.setProperty("display", "block", "important");
      image.style.setProperty("visibility", "visible", "important");
      if (!image.getAttribute("src")) {
        image.src = "/assets/images/barbers/keith-lemon/transitions/precision_cuts_transition_01.jpg";
      }
    }

    document.documentElement.dataset.pcHeroVisible = "true";
    return true;
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      reveal();
    });
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", reveal, { once: true })
    : reveal();
  window.addEventListener("load", reveal, { once: true });

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["hidden", "style", "class", "aria-hidden"],
    childList: true,
    subtree: true
  });
  setTimeout(() => observer.disconnect(), 15000);
})();
