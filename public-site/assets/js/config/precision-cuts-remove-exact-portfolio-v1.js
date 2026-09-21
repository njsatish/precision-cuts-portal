(() => {
  "use strict";
  let scheduled = false;
  let removed = false;

  const normalize = value => String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  function protectedSection(section) {
    return Boolean(
      section.querySelector("#pch-transition") ||
      section.querySelector("[data-barber-id], .pc-home-barber-card") ||
      section.querySelector("#booking-workspace, [data-booking-workspace]") ||
      normalize(section.textContent).includes("choose your barber")
    );
  }

  function removeExactPortfolio() {
    if (removed) return true;

    const matches = [...document.querySelectorAll("main section")].filter(section => {
      const text = normalize(section.textContent);
      const images = section.querySelectorAll("img").length;
      return text.includes("portfolio") &&
        text.includes("detail you can see") &&
        images === 3 &&
        !protectedSection(section);
    });

    if (matches.length !== 1) return false;

    matches[0].remove();
    removed = true;
    document.documentElement.dataset.pcPortfolioRemoved = "true";
    return true;
  }

  function fixBarberHeading() {
    const heading = [...document.querySelectorAll("main h1, main h2, main h3")]
      .find(node => normalize(node.textContent).includes("choose your barber"));
    if (heading) heading.classList.add("pch-barber-title-v3");
  }

  function apply() {
    removeExactPortfolio();
    fixBarberHeading();
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

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 15000);
})();
