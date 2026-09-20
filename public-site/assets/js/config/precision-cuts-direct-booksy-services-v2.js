(() => {
  "use strict";

  const directIds = new Set(["levar-neal", "lamar-the-barber"]);
  const normalize = value => String(value || "").replace(/\s+/g, " ").trim();
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, character => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  })[character]);

  function registry() {
    const config = window.BOOKSY_PORTAL_CONFIG;
    return new Map((config?.barbers || []).map(barber => [barber.id, barber]));
  }

  function findPanel(title) {
    const marker = [...document.querySelectorAll("h1,h2,h3,h4,h5,strong")]
      .find(node => normalize(node.textContent).toUpperCase().includes(title));
    return marker?.closest("section,article") || marker?.closest("div") || null;
  }

  function selectedServicesHost() {
    const panel = findPanel("1. SERVICES");
    if (!panel) return null;
    let host = panel.querySelector("[data-pc-selected-direct-services]");
    if (!host) {
      host = document.createElement("section");
      host.className = "pc-selected-direct-services";
      host.setAttribute("data-pc-selected-direct-services", "");

      const header = [...panel.children].find(child => normalize(child.textContent).toUpperCase().includes("1. SERVICES"));
      if (header?.nextSibling) panel.insertBefore(host, header.nextSibling);
      else panel.prepend(host);
    }
    return host;
  }

  function resultHost() {
    const panel = findPanel("3. AVAILABLE DATES");
    if (!panel) return null;
    let host = panel.querySelector("[data-pc-direct-booksy-result]");
    if (!host) {
      host = document.createElement("div");
      host.setAttribute("data-pc-direct-booksy-result", "");
      panel.appendChild(host);
    }
    return host;
  }

  function formatPrice(value) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? `$${numeric.toFixed(0)}` : "";
  }

  function renderResult(barber, service) {
    const host = resultHost();
    if (!host) return;
    const name = barber.displayName || barber.name;
    host.innerHTML = `
      <div class="pc-v2-booksy-result">
        <p>VERIFIED BOOKSY PROFILE</p>
        <h3>${escapeHtml(name)}</h3>
        ${service ? `<div class="pc-v2-result-service"><strong>${escapeHtml(service.name)}</strong><span>${escapeHtml(service.durationMinutes || service.duration)} min · ${formatPrice(service.price)}</span></div>` : `<div class="pc-v2-result-service"><strong>Select a service from the left column.</strong></div>`}
        <small>Booking continues on the verified Booksy profile while dedicated live availability is being connected.</small>
        <a href="${escapeHtml(barber.booksyUrl)}" target="_blank" rel="noopener noreferrer">Continue to Booksy</a>
      </div>`;
  }

  function renderServices(barber) {
    const host = selectedServicesHost();
    if (!host) return;
    const services = Array.isArray(barber.services) ? barber.services : [];
    const name = barber.displayName || barber.name;

    host.innerHTML = `
      <header class="pc-v2-services-header">
        <div>
          <p>SELECTED BARBER SERVICES</p>
          <h3>${escapeHtml(name)}</h3>
          <span>${services.length} verified services</span>
        </div>
        <button type="button" aria-label="Close selected barber services">×</button>
      </header>
      <div class="pc-v2-service-list">
        ${services.map((service, index) => `
          <button type="button" data-service-index="${index}">
            <span><strong>${escapeHtml(service.name)}</strong><small>${escapeHtml(service.durationMinutes || service.duration)} min · ${formatPrice(service.price)}</small></span>
            <em>SELECT</em>
          </button>`).join("")}
      </div>`;

    host.classList.add("is-visible");
    host.querySelector("header button").addEventListener("click", () => {
      host.classList.remove("is-visible");
      host.innerHTML = "";
    });

    host.querySelectorAll("[data-service-index]").forEach(button => {
      button.addEventListener("click", () => {
        host.querySelectorAll("[data-service-index].is-selected").forEach(item => item.classList.remove("is-selected"));
        button.classList.add("is-selected");
        const service = services[Number(button.dataset.serviceIndex)];
        renderResult(barber, service);
      });
    });

    host.scrollIntoView({behavior:"smooth", block:"start"});
    renderResult(barber, null);
  }

  function barberIdFromElement(element) {
    const card = element.closest("[data-barber-id]");
    if (card?.dataset.barberId) return card.dataset.barberId;

    const text = normalize(element.closest("article,button,div")?.textContent).toLowerCase();
    if (text.includes("var da barber") || text.includes("levar neal")) return "levar-neal";
    if (text.includes("lamar the barber")) return "lamar-the-barber";
    return null;
  }

  function handleClick(event) {
    const id = barberIdFromElement(event.target);
    if (!id || !directIds.has(id)) return;
    const barber = registry().get(id);
    if (!barber) return;

    // Allow the card’s existing selection styling and direct-Booksy panel to run,
    // then render the services independently at the top of the Services column.
    setTimeout(() => renderServices(barber), 0);
  }

  function removeOldCollapsedGroups() {
    document.querySelectorAll(".pc-direct-booksy-service-groups, [data-pc-direct-booksy-services]")
      .forEach(node => node.remove());
  }

  function initialize() {
    const barbers = registry();
    if (!barbers.has("levar-neal") || !barbers.has("lamar-the-barber")) return;
    removeOldCollapsedGroups();
    selectedServicesHost();
    if (!document.documentElement.dataset.pcDirectServicesV2) {
      document.documentElement.dataset.pcDirectServicesV2 = "true";
      document.addEventListener("click", handleClick, true);
    }
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", initialize, {once:true})
    : initialize();
  document.addEventListener("booksy-portal-config-ready", initialize);
  window.addEventListener("load", initialize, {once:true});

  let pending = false;
  const observer = new MutationObserver(() => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      removeOldCollapsedGroups();
      selectedServicesHost();
    });
  });
  observer.observe(document.documentElement, {childList:true, subtree:true});
  setTimeout(() => observer.disconnect(), 7000);
})();
