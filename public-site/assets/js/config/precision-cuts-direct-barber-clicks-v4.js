(() => {
  "use strict";

  const directIds = new Set(["levar-neal", "lamar-the-barber"]);
  const labels = {
    "levar-neal": "Var da Barber",
    "lamar-the-barber": "Lamar the barber"
  };
  const normalize = value => String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, character => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  })[character]);

  function configRegistry() {
    const config = window.BOOKSY_PORTAL_CONFIG;
    return new Map((config?.barbers || []).map(barber => [barber.id, barber]));
  }

  function findHeading(text) {
    return [...document.querySelectorAll("h1,h2,h3,h4,h5,strong")]
      .find(node => normalize(node.textContent).includes(text));
  }

  function panel(text) {
    const heading = findHeading(text);
    return heading?.closest("section,article") || heading?.closest("div") || null;
  }

  function cardId(target) {
    const explicit = target.closest("[data-pc-v3-barber], [data-barber-id]");
    const explicitId = explicit?.dataset.pcV3Barber || explicit?.dataset.barberId;
    if (directIds.has(explicitId)) return explicitId;

    const candidate = target.closest("button,article,a,div");
    const text = normalize(candidate?.textContent);
    if (text.includes("var da barber") || text.includes("levar neal")) return "levar-neal";
    if (text.includes("lamar the barber")) return "lamar-the-barber";
    return null;
  }

  function formatPrice(value) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? `$${numeric.toFixed(0)}` : "";
  }

  function servicesHost() {
    const servicesPanel = panel("1. services");
    if (!servicesPanel) return null;

    let host = servicesPanel.querySelector("[data-pc-v4-direct-services]");
    if (!host) {
      host = document.createElement("section");
      host.className = "pc-v4-direct-services";
      host.setAttribute("data-pc-v4-direct-services", "");

      const heading = findHeading("1. services");
      const headerBlock = heading?.closest("header") || heading?.parentElement;
      if (headerBlock && headerBlock.parentElement === servicesPanel) {
        headerBlock.insertAdjacentElement("afterend", host);
      } else {
        servicesPanel.prepend(host);
      }
    }
    return host;
  }

  function resultHost() {
    const datesPanel = panel("3. available dates");
    if (!datesPanel) return null;
    let host = datesPanel.querySelector("[data-pc-v4-direct-result]");
    if (!host) {
      host = document.createElement("div");
      host.setAttribute("data-pc-v4-direct-result", "");
      datesPanel.appendChild(host);
    }
    return host;
  }

  function clearNativeSelection() {
    const barbersPanel = panel("2. barbers");
    if (!barbersPanel) return;
    barbersPanel.querySelectorAll(".is-selected,[aria-pressed='true']").forEach(node => {
      node.classList.remove("is-selected");
      if (node.hasAttribute("aria-pressed")) node.setAttribute("aria-pressed", "false");
    });
  }

  function markSelected(id) {
    clearNativeSelection();
    const selectors = [
      `[data-pc-v3-barber="${id}"]`,
      `[data-barber-id="${id}"]`
    ];
    let card = document.querySelector(selectors.join(","));
    if (!card) {
      const expected = normalize(labels[id]);
      card = [...(panel("2. barbers")?.querySelectorAll("button,article") || [])]
        .find(node => normalize(node.textContent).includes(expected));
    }
    card?.classList.add("is-selected");
    card?.setAttribute("aria-pressed", "true");
  }

  function renderResult(barber, service) {
    const host = resultHost();
    if (!host) return;
    host.innerHTML = `
      <div class="pc-v4-result-card">
        <p>VERIFIED BOOKSY PROFILE</p>
        <h3>${escapeHtml(labels[barber.id] || barber.displayName || barber.name)}</h3>
        ${service ? `
          <section>
            <strong>${escapeHtml(service.name)}</strong>
            <span>${escapeHtml(service.durationMinutes || service.duration)} min · ${formatPrice(service.price)}</span>
          </section>` : `
          <section>
            <strong>Select one of the services shown in the Services column.</strong>
          </section>`}
        <small>Available dates and times are completed on the verified Booksy profile.</small>
        <a href="${escapeHtml(barber.booksyUrl)}" target="_blank" rel="noopener noreferrer">Continue to Booksy</a>
      </div>`;
  }

  function renderServices(barber) {
    const host = servicesHost();
    if (!host) return false;
    const services = Array.isArray(barber.services) ? barber.services : [];
    const display = labels[barber.id] || barber.displayName || barber.name;

    host.innerHTML = `
      <header>
        <p>SELECTED BARBER SERVICES</p>
        <h3>${escapeHtml(display)}</h3>
        <span>${services.length} verified services</span>
      </header>
      <div class="pc-v4-service-list">
        ${services.map((service, index) => `
          <button type="button" data-service-index="${index}">
            <span>
              <strong>${escapeHtml(service.name)}</strong>
              <small>${escapeHtml(service.durationMinutes || service.duration)} min · ${formatPrice(service.price)}</small>
            </span>
            <em>Select</em>
          </button>`).join("")}
      </div>`;
    host.classList.add("is-visible");

    host.querySelectorAll("[data-service-index]").forEach(button => {
      button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        host.querySelectorAll("button.is-selected").forEach(item => item.classList.remove("is-selected"));
        button.classList.add("is-selected");
        renderResult(barber, services[Number(button.dataset.serviceIndex)]);
      });
    });

    renderResult(barber, null);
    return true;
  }

  function selectDirect(id, attempt = 0) {
    const barber = configRegistry().get(id);
    const host = servicesHost();
    if (!barber || !host) {
      if (attempt < 30) setTimeout(() => selectDirect(id, attempt + 1), 100);
      return;
    }
    markSelected(id);
    renderServices(barber);
    history.replaceState(null, "", `#booking-workspace?barber=${encodeURIComponent(id)}`);
    const workspace = panel("1. services")?.parentElement || panel("1. services");
    setTimeout(() => workspace?.scrollIntoView({behavior:"smooth", block:"start"}), 60);
  }

  function captureDirectClick(event) {
    const barbersPanel = panel("2. barbers");
    if (!barbersPanel || !barbersPanel.contains(event.target)) return;
    const id = cardId(event.target);
    if (!id) return;

    // Capture phase prevents the legacy live-booking controller from treating
    // these direct Booksy profiles as unsupported live-availability records.
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    selectDirect(id);
  }

  function initialize() {
    servicesHost();
    if (document.documentElement.dataset.pcV4DirectClicks !== "true") {
      document.documentElement.dataset.pcV4DirectClicks = "true";
      document.addEventListener("click", captureDirectClick, true);
    }
    const hash = location.hash.replace(/^#/, "");
    if (hash.startsWith("booking-workspace")) {
      const id = new URLSearchParams(hash.split("?", 2)[1] || "").get("barber");
      if (directIds.has(id)) selectDirect(id);
    }
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", initialize, {once:true})
    : initialize();
  document.addEventListener("booksy-portal-config-ready", initialize);
  window.addEventListener("load", initialize, {once:true});
  window.addEventListener("hashchange", initialize);
})();
