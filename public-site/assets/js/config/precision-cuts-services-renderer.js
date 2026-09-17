(() => {
  "use strict";

  function start() {
    const config = window.BOOKSY_PORTAL_CONFIG;
    if (!config) {
      document.addEventListener("booksy-portal-config-ready", start, { once: true });
      return;
    }

    const services = [...config.services]
      .filter(service => service.active !== false)
      .sort((left, right) => (left.sortOrder || 0) - (right.sortOrder || 0));

    const money = value => new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: config.business?.currency || "USD",
      maximumFractionDigits: 0
    }).format(Number(value || 0));

    const bookingHref = slug => `/book.html?service=${encodeURIComponent(slug)}`;

    const card = service => `
      <article class="pc-service-card" data-service-slug="${service.slug}">
        <div class="pc-service-copy">
          <h3>${service.displayName || service.name}</h3>
          <p>${service.description || "Professional Precision Cuts service."}</p>
        </div>
        <div class="pc-service-meta">
          <span>${service.durationMinutes} min</span>
          <strong>${money(service.price)}</strong>
        </div>
        <a class="pp-button pp-button-primary pc-service-action" href="${bookingHref(service.slug)}">View Times</a>
      </article>`;

    function replaceHomepageGrid() {
      const heading = [...document.querySelectorAll("h1,h2,h3")]
        .find(element => /five ways to get appointment-ready/i.test(element.textContent));
      if (!heading) return;

      const section = heading.closest("section") || heading.parentElement;
      const existingGrid = section?.querySelector(
        ".pp-home-services, .pp-service-grid, .pp-services-grid, [class*='service-grid'], [class*='services-grid']"
      );
      if (!section) return;

      const grid = document.createElement("div");
      grid.className = "pc-service-grid";
      grid.setAttribute("data-precision-services-grid", "home");
      grid.innerHTML = services.map(card).join("");

      if (existingGrid) {
        existingGrid.replaceWith(grid);
      } else {
        const firstCard = [...section.querySelectorAll("article, [class*='service-card']")]
          .find(element => /haircut|beard|kid|mask/i.test(element.textContent));
        const oldContainer = firstCard?.parentElement;
        if (oldContainer) oldContainer.replaceWith(grid);
        else section.appendChild(grid);
      }

      section.querySelectorAll("a[href*='widget-2021'], a[href*='94095']").forEach(link => {
        link.href = config.bookingProvider.profileUrl;
      });
    }

    function replaceServicesPage() {
      if (!/services\.html$/i.test(location.pathname)) return;
      const main = document.querySelector("main");
      if (!main) return;
      const candidate = main.querySelector(
        ".pp-service-grid, .pp-services-grid, [class*='service-grid'], [class*='services-grid']"
      );
      if (!candidate) return;
      candidate.className = "pc-service-grid pc-service-grid-detail";
      candidate.setAttribute("data-precision-services-grid", "details");
      candidate.innerHTML = services.map(card).join("");
    }

    function repairBooksyLinks() {
      document.querySelectorAll("a[href*='booksy.com']").forEach(link => {
        if (/widget-2021|\/94095(?:[?#]|$)/.test(link.href)) {
          link.href = config.bookingProvider.profileUrl;
        }
      });
    }

    replaceHomepageGrid();
    replaceServicesPage();
    repairBooksyLinks();
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", start, { once: true })
    : start();
})();
