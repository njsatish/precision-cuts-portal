(() => {
  "use strict";

  const LOGO_SRC = "/assets/images/precision-cuts-logo.png?v=4";
  const LOGO_ALT = "Precision Cuts logo";
  let scheduled = false;

  function header() {
    return document.querySelector("body > header, header, .site-header, .navbar, .topbar");
  }

  function logoCandidate(root) {
    if (!root) return null;
    const images = [...root.querySelectorAll("img")];
    return images.find(image => {
      const value = `${image.getAttribute("src") || ""} ${image.alt || ""} ${image.className || ""}`.toLowerCase();
      return value.includes("precision") || value.includes("logo") || value.includes("brand");
    }) || null;
  }

  function oldIconCandidate(root) {
    if (!root) return null;
    return [...root.querySelectorAll("a,div")].find(node => {
      const value = `${node.className || ""} ${node.getAttribute?.("aria-label") || ""}`.toLowerCase();
      const hasSmallImage = node.querySelector?.("img,svg") !== null;
      return hasSmallImage && (value.includes("brand") || value.includes("logo"));
    }) || null;
  }

  function makeLogoLink() {
    const link = document.createElement("a");
    link.href = "/index.html";
    link.className = "pc-approved-logo-v4-link";
    link.setAttribute("aria-label", "Precision Cuts home");

    const image = document.createElement("img");
    image.src = LOGO_SRC;
    image.alt = LOGO_ALT;
    image.className = "pc-approved-logo-v4-image";
    image.decoding = "async";
    link.appendChild(image);
    return link;
  }

  function apply() {
    const root = header();
    if (!root) return;

    let image = logoCandidate(root);
    let link = image?.closest("a") || null;

    if (image) {
      image.src = LOGO_SRC;
      image.alt = LOGO_ALT;
      image.classList.add("pc-approved-logo-v4-image");
      image.removeAttribute("srcset");
      image.removeAttribute("sizes");
      if (!link) {
        link = document.createElement("a");
        image.replaceWith(link);
        link.appendChild(image);
      }
      link.href = "/index.html";
      link.classList.add("pc-approved-logo-v4-link");
      link.setAttribute("aria-label", "Precision Cuts home");
    } else {
      const replacement = makeLogoLink();
      const oldIcon = oldIconCandidate(root);
      if (oldIcon) {
        oldIcon.replaceWith(replacement);
      } else {
        const nav = root.querySelector("nav, .nav, .navbar-nav");
        if (nav?.parentElement === root) root.insertBefore(replacement, nav);
        else root.prepend(replacement);
      }
    }

    root.classList.add("pc-approved-logo-v4-header");

    // Remove duplicate old brand icons after the approved image is present.
    [...root.querySelectorAll("a,div")].forEach(node => {
      if (node.classList?.contains("pc-approved-logo-v4-link")) return;
      const value = `${node.className || ""} ${node.getAttribute?.("aria-label") || ""}`.toLowerCase();
      if ((value.includes("brand") || value.includes("logo")) && node.querySelector?.("svg")) {
        node.hidden = true;
        node.setAttribute("aria-hidden", "true");
      }
    });
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
  window.addEventListener("pageshow", apply);

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 12000);
})();
