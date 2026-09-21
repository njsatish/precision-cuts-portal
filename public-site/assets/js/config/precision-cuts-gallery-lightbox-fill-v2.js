(() => {
  "use strict";
  let scheduled = false;

  const isVisible = node => {
    if (!node) return false;
    const style = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" && rect.width > 300 && rect.height > 300;
  };

  function findLightbox() {
    const candidates = [...document.querySelectorAll(
      "dialog, .pp-headlines-lightbox, .pc-gallery-lightbox, [class*='lightbox'], [role='dialog']"
    )].filter(isVisible);
    candidates.sort((a, b) =>
      b.getBoundingClientRect().width * b.getBoundingClientRect().height -
      a.getBoundingClientRect().width * a.getBoundingClientRect().height
    );
    return candidates[0] || null;
  }

  function findImage(lightbox) {
    return [...lightbox.querySelectorAll("img")]
      .filter(image => {
        const rect = image.getBoundingClientRect();
        return rect.width > 100 && rect.height > 100;
      })
      .sort((a, b) =>
        b.getBoundingClientRect().width * b.getBoundingClientRect().height -
        a.getBoundingClientRect().width * a.getBoundingClientRect().height
      )[0] || lightbox.querySelector("img");
  }

  function apply() {
    const lightbox = findLightbox();
    if (!lightbox) return false;
    const image = findImage(lightbox);
    if (!image) return false;

    lightbox.classList.add("pcglf-lightbox");
    image.classList.add("pcglf-image");

    const source = image.currentSrc || image.src;
    if (source) lightbox.style.setProperty("--pcglf-image", `url("${source.replace(/"/g, "\\\"")}")`);

    const caption = lightbox.querySelector("figcaption, [class*='caption'], p:last-child");
    if (caption && caption !== image) caption.classList.add("pcglf-caption");

    document.documentElement.dataset.pcGalleryLightboxFill = "true";
    return true;
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; apply(); });
  }

  document.addEventListener("click", schedule, true);
  document.addEventListener("keydown", schedule, true);
  window.addEventListener("load", apply, { once: true });
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["src", "open", "hidden", "class", "style"]
  });
})();
