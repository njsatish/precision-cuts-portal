(() => {
  "use strict";

  const approvedLogo = "/assets/images/precision-cuts-logo-approved.png";
  const isHome = location.pathname === "/" || location.pathname.endsWith("/index.html");

  const applyLogo = () => {
    if (isHome) return true;
    const header = document.querySelector("#shared-header header") || document.querySelector("header");
    if (!header) return false;

    const brand = header.querySelector(
      ".pp-brand, .pp-logo, .site-brand, .navbar-brand, .brand, a[href='/'], a[href='../index.html'], a[href='/index.html'], a[href='index.html']"
    );
    if (!brand) return false;

    let image = brand.querySelector("img");
    if (!image) {
      image = document.createElement("img");
      brand.prepend(image);
    }

    image.src = approvedLogo;
    image.alt = "Precision Cuts";
    image.classList.add("pc-approved-wide-logo");
    brand.classList.add("pc-approved-wide-brand");

    [...brand.children].forEach(child => {
      if (child !== image && !child.matches(".sr-only, .visually-hidden")) {
        child.classList.add("pc-hide-old-brand-content");
      }
    });
    return true;
  };

  if (!applyLogo()) {
    const observer = new MutationObserver(() => {
      if (applyLogo()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 15000);
  }
})();
