(() => {
  "use strict";
  let scheduled = false;

  const visible = node => {
    if (!node) return false;
    const style = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" && rect.width > 300 && rect.height > 300;
  };

  function findLightbox() {
    return [...document.querySelectorAll("dialog,.pp-headlines-lightbox,.pc-gallery-lightbox,[class*='lightbox'],[role='dialog']")]
      .filter(visible)
      .sort((a,b) => b.getBoundingClientRect().width*b.getBoundingClientRect().height - a.getBoundingClientRect().width*a.getBoundingClientRect().height)[0] || null;
  }

  function findMainImage(lightbox) {
    return [...lightbox.querySelectorAll("img:not(.pcglb-backdrop)")]
      .filter(image => image.naturalWidth > 0 || image.getBoundingClientRect().width > 80)
      .sort((a,b) => b.getBoundingClientRect().width*b.getBoundingClientRect().height - a.getBoundingClientRect().width*a.getBoundingClientRect().height)[0] || null;
  }

  function enforceImage(image) {
    image.classList.add("pcglb-image");
    image.style.setProperty("width", "auto", "important");
    image.style.setProperty("height", "auto", "important");
    image.style.setProperty("max-width", "70%", "important");
    image.style.setProperty("max-height", "82%", "important");
    image.style.setProperty("object-fit", "contain", "important");
    image.style.setProperty("object-position", "center center", "important");
    image.style.setProperty("aspect-ratio", "auto", "important");
    image.style.setProperty("transform", "none", "important");
  }

  function apply() {
    const lightbox = findLightbox();
    if (!lightbox) return false;
    const image = findMainImage(lightbox);
    if (!image) return false;

    lightbox.classList.add("pcglb-lightbox");
    enforceImage(image);

    const portrait = (image.naturalHeight || image.height) > (image.naturalWidth || image.width);
    lightbox.classList.toggle("pcglb-landscape", !portrait);
    if (!portrait) image.style.setProperty("max-width", "88%", "important");

    let stage = lightbox.querySelector(":scope > .pcglb-stage");
    if (!stage) {
      stage = document.createElement("div");
      stage.className = "pcglb-stage";
      lightbox.prepend(stage);
    }

    let backdrop = stage.querySelector(".pcglb-backdrop");
    if (!backdrop) {
      backdrop = document.createElement("img");
      backdrop.className = "pcglb-backdrop";
      backdrop.alt = "";
      backdrop.setAttribute("aria-hidden", "true");
      stage.appendChild(backdrop);
    }
    backdrop.src = image.currentSrc || image.src;

    // Stage is a decorative sibling. Keep the real gallery image in its
    // original DOM location so the existing lightbox navigation still works.
    const caption = lightbox.querySelector("figcaption,[class*='caption'],p:last-child");
    if (caption && !caption.contains(image)) caption.classList.add("pcglb-caption");

    document.documentElement.dataset.pcGalleryBalanced = "true";
    return true;
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; apply(); });
  }

  document.addEventListener("click", schedule, true);
  document.addEventListener("keydown", schedule, true);
  window.addEventListener("load", apply, {once:true});
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, {childList:true,subtree:true,attributes:true,attributeFilter:["src","open","hidden","class","style"]});
})();
