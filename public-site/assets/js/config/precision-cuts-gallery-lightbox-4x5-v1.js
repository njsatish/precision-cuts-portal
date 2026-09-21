(() => {
  "use strict";
  let scheduled = false;

  const visible = node => {
    if (!node) return false;
    const style = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" && rect.width > 300 && rect.height > 300;
  };

  function apply() {
    const dialogs = [...document.querySelectorAll("dialog,.pp-headlines-lightbox,.pc-gallery-lightbox,[class*='lightbox'],[role='dialog']")]
      .filter(visible)
      .sort((a,b) => b.getBoundingClientRect().width*b.getBoundingClientRect().height - a.getBoundingClientRect().width*a.getBoundingClientRect().height);
    const lightbox = dialogs[0];
    if (!lightbox) return false;

    const images = [...lightbox.querySelectorAll("img")]
      .filter(image => image.getBoundingClientRect().width > 80 && image.getBoundingClientRect().height > 80)
      .sort((a,b) => b.getBoundingClientRect().width*b.getBoundingClientRect().height - a.getBoundingClientRect().width*a.getBoundingClientRect().height);
    const image = images[0];
    if (!image) return false;

    lightbox.classList.add("pc45-lightbox");
    image.classList.add("pc45-image");

    image.style.setProperty("width", "auto", "important");
    image.style.setProperty("height", "min(82vh, 820px)", "important");
    image.style.setProperty("max-width", "min(72vw, 760px)", "important");
    image.style.setProperty("max-height", "calc(100dvh - 100px)", "important");
    image.style.setProperty("aspect-ratio", "4 / 5", "important");
    image.style.setProperty("object-fit", "contain", "important");
    image.style.setProperty("object-position", "center center", "important");
    image.style.setProperty("transform", "none", "important");

    const caption = lightbox.querySelector("figcaption,[class*='caption'],p:last-child");
    if (caption && !caption.contains(image)) caption.classList.add("pc45-caption");

    document.documentElement.dataset.pcGallery4x5 = "true";
    return true;
  }

  function schedule(){
    if(scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; apply(); });
  }

  document.addEventListener("click", schedule, true);
  document.addEventListener("keydown", schedule, true);
  window.addEventListener("load", apply, {once:true});
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, {childList:true,subtree:true,attributes:true,attributeFilter:["src","open","hidden","class","style"]});
})();
