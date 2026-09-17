(() => {
  "use strict";

  const money = value => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(Number(value || 0));

  function start() {
    const config = window.BOOKSY_PORTAL_CONFIG;
    if (!config) {
      document.addEventListener("booksy-portal-config-ready", start, { once: true });
      return;
    }
    if (!/services\.html$/i.test(location.pathname)) return;

    const services = [...config.services]
      .filter(service => service.active !== false)
      .sort((left, right) => (left.sortOrder || 0) - (right.sortOrder || 0));

    const main = document.querySelector("main");
    if (!main || services.length === 0) return;

    // Find the original legacy explorer or an earlier generated explorer.
    const generated = main.querySelector(".pc-services-explorer-v2");
    const legacyHeading = [...main.querySelectorAll("h1,h2,h3")]
      .find(element => /what would you like to book/i.test(element.textContent));
    const legacy = legacyHeading?.closest("section") || legacyHeading?.parentElement?.parentElement;
    const anchor = generated || legacy;

    const explorer = document.createElement("section");
    explorer.className = "pc-services-explorer-v3";
    explorer.setAttribute("aria-label", "Precision Cuts service selector");
    explorer.innerHTML = `
      <div class="pp-container pc-services-shell-v3">
        <div class="pc-services-layout-v3">
          <aside class="pc-services-picker-v3">
            <p class="pp-kicker">Choose a service</p>
            <h2>What would you like to book?</h2>
            <nav class="pc-services-list-v3" aria-label="Precision Cuts services"></nav>
          </aside>
          <article class="pc-service-detail-v3" aria-live="polite"></article>
        </div>
      </div>`;

    if (anchor) anchor.replaceWith(explorer);
    else {
      const firstSection = main.querySelector("section");
      firstSection?.insertAdjacentElement("afterend", explorer) || main.appendChild(explorer);
    }

    // Remove any duplicate generated explorers left by earlier runtimes.
    main.querySelectorAll(".pc-services-explorer-v2, .pc-services-explorer-v3").forEach((section, index, all) => {
      if (section !== explorer) section.remove();
    });

    const list = explorer.querySelector(".pc-services-list-v3");
    const detail = explorer.querySelector(".pc-service-detail-v3");

    function renderDetail(service) {
      detail.innerHTML = `
        <div class="pc-detail-head-v3">
          <div>
            <p class="pp-kicker">Selected service</p>
            <h2>${service.displayName}</h2>
          </div>
          <strong class="pc-detail-price-v3">${money(service.price)}</strong>
        </div>
        <p class="pc-detail-description-v3">${service.description}</p>
        <div class="pc-detail-facts-v3">
          <div><strong>${service.durationMinutes} minutes</strong><span>Appointment length</span></div>
          <div><strong>Booksy confirmation</strong><span>Secure final booking</span></div>
          <div><strong>Professional finish</strong><span>Precision Cuts service</span></div>
        </div>
        <div class="pc-detail-actions-v3">
          <a class="pp-button pp-button-primary" href="/book.html?service=${encodeURIComponent(service.slug)}">View ${service.displayName} Times</a>
          <a class="pp-button pp-button-secondary" href="${config.bookingProvider.profileUrl}">Book on Booksy</a>
        </div>`;

      list.querySelectorAll("button").forEach(button => {
        const selected = button.dataset.serviceSlug === service.slug;
        button.classList.toggle("is-selected", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
    }

    list.innerHTML = services.map((service, index) => `
      <button type="button" class="pc-service-choice-v3${index === 0 ? " is-selected" : ""}" data-service-slug="${service.slug}" aria-pressed="${index === 0 ? "true" : "false"}">
        <strong>${service.displayName}</strong>
        <span>${money(service.price)} · ${service.durationMinutes} minutes</span>
      </button>`).join("");

    list.addEventListener("click", event => {
      const button = event.target.closest("button[data-service-slug]");
      if (!button) return;
      const service = services.find(item => item.slug === button.dataset.serviceSlug);
      if (service) renderDetail(service);
    });

    const requested = new URLSearchParams(location.search).get("service");
    renderDetail(services.find(service => service.slug === requested) || services[0]);

    main.querySelectorAll("a").forEach(link => {
      if (/view all availability/i.test(link.textContent)) {
        link.href = `/book.html?service=${encodeURIComponent(services[0].slug)}`;
      }
    });
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", start, { once: true })
    : start();
})();
