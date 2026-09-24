(() => {
  "use strict";

  const normalize = value => String(value || "").replace(/\s+/g, " ").trim().toLowerCase();

  function approvedHeaderLogo() {
    const images = [...document.querySelectorAll("header img, nav img, body > img")];
    return images.find(image => {
      const text = normalize(`${image.alt} ${image.title} ${image.src}`);
      return text.includes("precision") && text.includes("cut");
    }) || images.find(image => image.naturalWidth > image.naturalHeight * 2.5) || null;
  }

  function footerRoot() {
    return document.querySelector("footer") || [...document.querySelectorAll("section,div")]
      .find(node => {
        const text = normalize(node.textContent);
        return text.includes("business hours") && text.includes("visit precision cuts") && text.includes("get directions");
      }) || null;
  }

  function directSection(root, node) {
    let current = node;
    while (current && current.parentElement !== root) current = current.parentElement;
    return current || node;
  }

  function apply() {
    const footer = footerRoot();
    const sourceLogo = approvedHeaderLogo();
    if (!footer || !sourceLogo) return false;

    footer.dataset.pcMediumFooter = "true";
    const inner = footer.firstElementChild || footer;
    inner.dataset.pcFooterInner = "true";

    const footerImages = [...footer.querySelectorAll("img")];
    const footerLogo = footerImages.find(image => {
      const text = normalize(`${image.alt} ${image.title} ${image.src}`);
      return text.includes("precision") || text.includes("logo") || image.width <= 180;
    });

    if (footerLogo) {
      footerLogo.src = sourceLogo.currentSrc || sourceLogo.src;
      footerLogo.srcset = sourceLogo.srcset || "";
      footerLogo.alt = "Precision Cuts";
      footerLogo.dataset.pcApprovedFooterLogo = "true";
      const brandRow = footerLogo.closest("a,div,section") || footerLogo.parentElement;
      if (brandRow) brandRow.dataset.pcFooterBrandRow = "true";
    }

    const title = [...footer.querySelectorAll("h1,h2,h3,h4,strong,span")]
      .find(node => normalize(node.textContent) === "precision cuts");
    if (title) title.dataset.pcFooterBrandTitle = "hidden";

    const tagline = [...footer.querySelectorAll("p")]
      .find(node => normalize(node.textContent).includes("professional barbering with clear pricing"));
    if (tagline) tagline.dataset.pcFooterTagline = "true";

    const locationText = [...footer.querySelectorAll("a,p,div")]
      .find(node => normalize(node.textContent).includes("visit precision cuts") && normalize(node.textContent).includes("get directions"));
    if (locationText) directSection(inner, locationText).dataset.pcFooterLocation = "true";

    const hoursHeading = [...footer.querySelectorAll("h1,h2,h3,h4")]
      .find(node => normalize(node.textContent) === "business hours");
    if (hoursHeading) {
      const details = directSection(inner, hoursHeading);
      details.dataset.pcFooterDetails = "true";
      (hoursHeading.parentElement || details).dataset.pcFooterHours = "true";
    }

    const emailLinks = [...footer.querySelectorAll('a[href^="mailto:"],a')]
      .filter(node => node.matches('a[href^="mailto:"]') || /\S+@\S+\.\S+/.test(node.textContent));
    for (const email of emailLinks) {
      const row = email.closest("li,p") || email;
      row.dataset.pcFooterEmail = "hidden";
      row.setAttribute("aria-hidden", "true");
    }

    document.documentElement.dataset.pcMediumFooterApplied = "true";
    return true;
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; apply(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule, { once: true });
  else schedule();
  window.addEventListener("load", schedule, { once: true });
  [50, 200, 500, 1000, 2500].forEach(delay => setTimeout(schedule, delay));
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 20000);
})();
