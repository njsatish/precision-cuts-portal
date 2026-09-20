(() => {
  "use strict";

  const ID = "pc-approved-logo-v5";
  const SRC = "/assets/images/precision-cuts-logo.png?v=5";
  let applying = false;

  function getHeader() {
    return document.querySelector("body > header, header.site-header, header, .site-header, .navbar, .topbar");
  }

  function getNav(root) {
    return root?.querySelector("nav, .main-nav, .nav, .navbar-nav") || null;
  }

  function createApprovedLogo() {
    const link = document.createElement("a");
    link.id = ID;
    link.className = "pc-approved-logo-v5-link";
    link.href = "/index.html";
    link.setAttribute("aria-label", "Precision Cuts home");
    link.innerHTML = `<img class="pc-approved-logo-v5-image" src="${SRC}" alt="Precision Cuts logo" decoding="async">`;
    return link;
  }

  function isLegacyBrand(node, root, nav) {
    if (!(node instanceof Element)) return false;
    if (node.id === ID || node.closest(`#${ID}`)) return false;
    if (nav && nav.contains(node) && !node.matches(".brand,.site-brand,.navbar-brand,[class*='logo'],[class*='brand']")) return false;

    const value = [
      node.className || "",
      node.id || "",
      node.getAttribute("aria-label") || "",
      node.getAttribute("title") || "",
      node.textContent || ""
    ].join(" ").toLowerCase();

    const hasGraphic = Boolean(node.querySelector("img,svg,picture") || node.matches("img,svg,picture"));
    const namedBrand = /brand|logo|mark|emblem/.test(value);
    const scissors = /scissor|precision cuts|home/.test(value);
    const nearStart = [...root.children].indexOf(node) <= 1;
    return hasGraphic && (namedBrand || scissors || nearStart);
  }

  function apply() {
    if (applying) return;
    applying = true;
    try {
      const root = getHeader();
      if (!root) return;
      const nav = getNav(root);

      let approved = document.getElementById(ID);
      if (!approved) approved = createApprovedLogo();

      // Remove the entire legacy brand wrapper, not merely its image. This
      // prevents old circular dimensions, overflow clipping, SVGs, and pseudo
      // elements from surviving around the approved rectangular logo.
      const candidates = [...root.querySelectorAll("a,div,span,figure")]
        .filter(node => isLegacyBrand(node, root, nav));
      candidates.forEach(node => {
        if (node.contains(approved)) return;
        node.remove();
      });

      if (!approved.isConnected) {
        if (nav && nav.parentElement === root) root.insertBefore(approved, nav);
        else if (nav) nav.insertBefore(approved, nav.firstChild);
        else root.prepend(approved);
      }

      const image = approved.querySelector("img");
      image.src = SRC;
      image.alt = "Precision Cuts logo";
      approved.hidden = false;
      approved.removeAttribute("aria-hidden");
      root.classList.add("pc-approved-logo-v5-header");

      // Explicitly suppress known legacy circular brand containers that may be
      // reinserted later by page-specific header scripts.
      [...root.querySelectorAll(".brand,.site-brand,.navbar-brand,[class*='logo'],[class*='brand']")]
        .filter(node => node.id !== ID && !node.closest(`#${ID}`) && node.querySelector("img,svg,picture"))
        .forEach(node => {
          node.dataset.pcLegacyBrandHidden = "true";
          node.hidden = true;
          node.setAttribute("aria-hidden", "true");
        });
    } finally {
      applying = false;
    }
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", apply, { once: true })
    : apply();
  window.addEventListener("load", apply, { once: true });
  window.addEventListener("pageshow", apply);

  const observer = new MutationObserver(() => queueMicrotask(apply));
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
