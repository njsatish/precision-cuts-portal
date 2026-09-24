(() => {
  "use strict";

  const normalize = value => String(value || "").replace(/\s+/g, " ").trim().toLowerCase();

  function findApprovedLogo() {
    return [...document.querySelectorAll("header img, nav img")].find(image => {
      const text = normalize(`${image.alt} ${image.title} ${image.src}`);
      return text.includes("precision") && text.includes("cut");
    }) || [...document.querySelectorAll("header img, nav img")]
      .find(image => image.naturalWidth > image.naturalHeight * 2.5) || null;
  }

  function findLink(root, tests) {
    return [...root.querySelectorAll("a[href]")].find(link => {
      const value = normalize(`${link.textContent} ${link.href}`);
      return tests.some(test => value.includes(test));
    }) || [...document.querySelectorAll("a[href]")].find(link => {
      const value = normalize(`${link.textContent} ${link.href}`);
      return tests.some(test => value.includes(test));
    }) || null;
  }

  function safeLink(source, label, fallback) {
    const link = document.createElement("a");
    link.textContent = label;
    link.href = source?.getAttribute("href") || fallback;
    if (source?.target) link.target = source.target;
    if (source?.rel) link.rel = source.rel;
    return link;
  }

  function apply() {
    const footer = document.querySelector("footer");
    const logo = findApprovedLogo();
    if (!footer || !logo) return false;
    if (footer.dataset.pcSimpleFooter === "true") return true;

    const phoneSource = findLink(footer, ["tel:", "540-", "(540)"]);
    const facebookSource = findLink(footer, ["facebook"]);
    const servicesSource = findLink(document, ["services.html", "/services", "services"]);
    const bookingSource = findLink(document, ["book.html", "/book", "booking", "book now"]);

    const shell = document.createElement("div");
    shell.className = "pc-simple-footer-shell";

    const main = document.createElement("div");
    main.className = "pc-simple-footer-main";

    const logoLink = document.createElement("a");
    logoLink.href = "/index.html";
    logoLink.setAttribute("aria-label", "Precision Cuts home");
    const footerLogo = document.createElement("img");
    footerLogo.className = "pc-simple-footer-logo";
    footerLogo.src = logo.currentSrc || logo.src;
    footerLogo.srcset = logo.srcset || "";
    footerLogo.alt = "Precision Cuts";
    logoLink.appendChild(footerLogo);

    const links = document.createElement("nav");
    links.className = "pc-simple-footer-links";
    links.setAttribute("aria-label", "Footer navigation");
    links.append(
      safeLink(phoneSource, phoneSource?.textContent.trim() || "(540) 556-2871", "tel:+15405562871"),
      safeLink(facebookSource, "Facebook", "#"),
      safeLink(servicesSource, "Services", "/services.html"),
      safeLink(bookingSource, "Booking", "/book.html")
    );

    main.append(logoLink, links);

    const bottom = document.createElement("div");
    bottom.className = "pc-simple-footer-bottom";
    const copyright = document.createElement("p");
    copyright.textContent = `© ${new Date().getFullYear()} Precision Cuts`;
    const location = document.createElement("p");
    location.textContent = "6423 Williamson Rd, Roanoke, VA 24019";
    bottom.append(copyright, location);

    shell.append(main, bottom);
    footer.replaceChildren(shell);
    footer.dataset.pcSimpleFooter = "true";
    document.documentElement.dataset.pcSimpleFooterApplied = "true";
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
  [50, 200, 500, 1200, 2500].forEach(delay => setTimeout(schedule, delay));
})();
