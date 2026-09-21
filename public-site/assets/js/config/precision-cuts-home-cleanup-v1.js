(() => {
  "use strict";

  const normalize = value => String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  function smallestSection(node) {
    if (!node) return null;
    return node.closest("section, article") || node.parentElement;
  }

  function removeLegacyThreePhotoSection() {
    const headings = [...document.querySelectorAll("main h1, main h2, main h3, main p, main strong")];
    const marker = headings.find(node => {
      const text = normalize(node.textContent);
      return text.includes("precision cuts portfolio") ||
        text.includes("our work") ||
        text.includes("work photos");
    });
    if (!marker) return false;

    const section = smallestSection(marker);
    if (!section || section.id === "pch-transition") return false;
    if (section.querySelector("#pch-transition")) return false;
    if (section.querySelector("[data-barber-id], .pc-home-barber-card")) return false;

    const images = section.querySelectorAll("img");
    if (images.length < 3) return false;

    section.remove();
    return true;
  }

  function fixBarberHeading() {
    const heading = [...document.querySelectorAll("main h1, main h2, main h3")]
      .find(node => normalize(node.textContent).includes("choose your barber"));
    if (!heading) return false;

    heading.classList.add("pch-barber-heading-title");
    const intro = heading.closest("section")?.querySelector("p");
    const wrapper = heading.parentElement;
    if (wrapper) wrapper.classList.add("pch-barber-heading-panel");
    if (intro) intro.classList.add("pch-barber-heading-copy");
    return true;
  }

  function apply() {
    removeLegacyThreePhotoSection();
    fixBarberHeading();
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", apply, { once: true })
    : apply();
  window.addEventListener("load", apply, { once: true });

  const observer = new MutationObserver(apply);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 12000);
})();
