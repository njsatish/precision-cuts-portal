(() => {
  "use strict";

  function start() {
    const cfg = window.HEADLINES_BOOKING;
    if (!cfg) {
      console.error("Headlines booking configuration is missing.");
      return;
    }

    const serviceSelect = document.querySelector("[data-booking-service]");
    const dateSelect = document.querySelector("[data-booking-date]");
    const refreshButton = document.querySelector("[data-booking-refresh], [data-refresh-availability]");
    const serviceName = document.querySelector("[data-service-name]");
    let serviceMeta = document.querySelector("[data-service-meta], .pp-service-meta");
    const servicePrice = document.querySelector("[data-service-price]");
    let status = document.querySelector("[data-booking-status]");
    let slotsRoot = document.querySelector("[data-booking-slots], [data-availability-slots]");
    const continueLink = document.querySelector("[data-booking-continue], [data-booksy-link]");

    if (!serviceSelect || !dateSelect) {
      console.error("Headlines booking controls were not found.");
      return;
    }

    const summaryRoot = document.querySelector(".pp-booking-card, .pp-booking-shell, main") || document.body;
    if (!serviceMeta) {
      serviceMeta = document.createElement("p");
      serviceMeta.className = "pp-service-meta";
      serviceMeta.setAttribute("data-service-meta", "");
      const nameNode = document.querySelector("[data-service-name]");
      if (nameNode && nameNode.parentElement) nameNode.insertAdjacentElement("afterend", serviceMeta);
      else summaryRoot.appendChild(serviceMeta);
    }
    if (!status || !slotsRoot) {
      const results = document.createElement("section");
      results.className = "pp-booking-results";
      results.setAttribute("aria-live", "polite");
      if (!status) {
        status = document.createElement("p");
        status.className = "pp-booking-status";
        status.setAttribute("data-booking-status", "");
        results.appendChild(status);
      }
      if (!slotsRoot) {
        slotsRoot = document.createElement("div");
        slotsRoot.className = "pp-booking-time-list";
        slotsRoot.setAttribute("data-booking-slots", "");
        results.appendChild(slotsRoot);
      }
      const priceNode = document.querySelector("[data-service-price]");
      if (priceNode) priceNode.insertAdjacentElement("beforebegin", results);
      else summaryRoot.appendChild(results);
    }


    if (!document.getElementById("headlines-booking-time-styles")) {
      const style = document.createElement("style");
      style.id = "headlines-booking-time-styles";
      style.textContent = `
        .pp-booking-results { padding: 24px 0; border-top: 1px solid #3b424b; }
        .pp-booking-status { margin: 0 0 18px; color: #c8d0da; font-weight: 700; }
        .pp-booking-time-list { display: flex; flex-wrap: wrap; gap: 12px; }
        .pp-booking-time-list .pp-button { min-width: 110px; text-align: center; }
      `;
      document.head.appendChild(style);
    }

    const services = cfg.SERVICES;
    const validSlugs = Object.keys(services);
    const params = new URLSearchParams(window.location.search);
    let selectedSlug = params.get("service") || serviceSelect.value || "haircut";
    if (!services[selectedSlug]) selectedSlug = "haircut";
    let availableSlots = [];

    function formatDate(value) {
      return new Intl.DateTimeFormat("en-US", {
        weekday: "short", month: "short", day: "numeric"
      }).format(new Date(`${value}T12:00:00`));
    }

    function formatTime(value) {
      const [hour, minute] = value.split(":").map(Number);
      return new Intl.DateTimeFormat("en-US", {
        hour: "numeric", minute: "2-digit"
      }).format(new Date(2000, 0, 1, hour, minute));
    }


    /* HEADLINES-BOOKSY-INSTANT-URL-V1-START */
    function buildBooksyInstantUrl(service, slot) {
      if (!service || !service.variantId || !slot?.date || !slot?.time) {
        return cfg.BOOKSY_URL;
      }

      const parameters = new URLSearchParams({
        variantId: String(service.variantId),
        date: `${slot.date}T${slot.time}`
      });

      return `https://booksy.com/en-us/instant-experiences/widget/94095?${parameters.toString()}`;
    }
    /* HEADLINES-BOOKSY-INSTANT-URL-V1-END */

    function setStatus(message) {
      if (status) status.textContent = message;
    }

    function updateSummary(slug) {
      const service = services[slug];
      if (serviceName) serviceName.textContent = service.name;
      if (serviceMeta) serviceMeta.textContent = `${service.duration} min · Live Booksy availability`;
      if (servicePrice) servicePrice.textContent = `$${service.price}`;
      serviceSelect.value = slug;
      const url = new URL(window.location.href);
      url.searchParams.set("service", slug);
      history.replaceState({}, "", url);
    }

    function renderTimes(date) {
      const matching = availableSlots.filter(slot => slot.date === date);
      if (slotsRoot) {
        slotsRoot.innerHTML = "";
        matching.forEach(slot => {
          const link = document.createElement("a");
          link.className = "pp-button pp-button-secondary";
          link.href = buildBooksyInstantUrl(services[selectedSlug], slot);
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = formatTime(slot.time);
          link.setAttribute("aria-label", `Continue to Booksy for ${services[selectedSlug].name} on ${formatDate(slot.date)} at ${formatTime(slot.time)}`);
          slotsRoot.appendChild(link);
        });
      }
      if (matching.length) {
        setStatus(`${matching.length} appointment time${matching.length === 1 ? "" : "s"} available on ${formatDate(date)}.`);
      } else {
        setStatus("No appointment times are shown for this date.");
      }
    }

    function populateDates(slots) {
      const dates = [...new Set(slots.map(slot => slot.date))];
      dateSelect.innerHTML = "";
      if (!dates.length) {
        const option = new Option("No dates currently available", "");
        option.disabled = true;
        option.selected = true;
        dateSelect.add(option);
        if (slotsRoot) slotsRoot.innerHTML = "";
        return;
      }
      dates.forEach(date => dateSelect.add(new Option(formatDate(date), date)));
      dateSelect.value = dates[0];
      renderTimes(dates[0]);
    }

    async function loadAvailability() {
      selectedSlug = serviceSelect.value;
      if (!services[selectedSlug]) selectedSlug = "haircut";
      updateSummary(selectedSlug);
      dateSelect.disabled = true;
      dateSelect.innerHTML = "";
      dateSelect.add(new Option("Loading dates...", ""));
      if (refreshButton) refreshButton.disabled = true;
      if (slotsRoot) slotsRoot.innerHTML = "";
      setStatus("Checking live Booksy availability...");

      try {
        const response = await fetch(`${cfg.API_BASE}/availability/${encodeURIComponent(selectedSlug)}`, {
          method: "GET",
          mode: "cors",
          cache: "no-store",
          headers: { Accept: "application/json" }
        });
        if (!response.ok) throw new Error(`Availability request returned HTTP ${response.status}`);
        const data = await response.json();
        if (data.success !== true || !Array.isArray(data.slots)) {
          throw new Error("Availability response was invalid.");
        }
        availableSlots = data.slots;
        populateDates(availableSlots);
        if (data.nextAvailable) {
          setStatus(`Next available: ${formatDate(data.nextAvailable.date)} at ${formatTime(data.nextAvailable.time)}.`);
        }
      } catch (error) {
        console.error("Headlines availability error:", error);
        availableSlots = [];
        dateSelect.innerHTML = "";
        dateSelect.add(new Option("Availability unavailable", ""));
        setStatus("Live availability could not be loaded. Use Booksy to view current openings.");
        if (slotsRoot) {
          slotsRoot.innerHTML = `<a class="pp-button pp-button-primary" href="${cfg.BOOKSY_URL}" target="_blank" rel="noopener noreferrer">View availability on Booksy</a>`;
        }
      } finally {
        dateSelect.disabled = false;
        if (refreshButton) refreshButton.disabled = false;
      }
    }

    serviceSelect.innerHTML = "";
    validSlugs.forEach(slug => {
      const service = services[slug];
      serviceSelect.add(new Option(service.name, slug));
    });
    serviceSelect.value = selectedSlug;

    serviceSelect.addEventListener("change", loadAvailability);
    dateSelect.addEventListener("change", () => renderTimes(dateSelect.value));
    if (refreshButton) refreshButton.addEventListener("click", loadAvailability);
    if (continueLink) {
      continueLink.href = cfg.BOOKSY_URL;
      continueLink.target = "_blank";
      continueLink.rel = "noopener noreferrer";
      continueLink.setAttribute("aria-label", "Open Headlines on Booksy");
    }

    loadAvailability();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();

/* HEADLINES-BOOKING-DATE-WATCHDOG-V1-START */
(() => {
  "use strict";
  function recover() {
    const selectors = [
      "#available-date",
      "#availableDate",
      "select[name='date']",
      "[data-available-date]"
    ];
    const select = selectors.map(selector => document.querySelector(selector)).find(Boolean);
    if (!select) return;
    const visibleText = `${select.value || ""} ${select.textContent || ""}`;
    if (!/loading dates/i.test(visibleText)) return;
    select.innerHTML = '<option value="">Unable to load dates. Try Refresh Availability.</option>';
    select.disabled = false;
  }
  document.addEventListener("DOMContentLoaded", () => setTimeout(recover, 15000), { once: true });
  document.addEventListener("change", event => {
    if (event.target?.matches("select[name='service'], #service, [data-service-select]")) {
      setTimeout(recover, 15000);
    }
  });
})();
/* HEADLINES-BOOKING-DATE-WATCHDOG-V1-END */
