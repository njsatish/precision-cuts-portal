(() => {
  "use strict";

  const allowed = new Set([
    "keith-lemon",
    "christopher-meadows",
    "ron-the-barber",
    "levar-neal",
    "lamar-the-barber"
  ]);

  const labels = {
    "keith-lemon": ["keith lemon"],
    "christopher-meadows": ["christopher meadows"],
    "ron-the-barber": ["ron the barber"],
    "levar-neal": ["levar neal", "var da barber"],
    "lamar-the-barber": ["lamar the barber"]
  };

  const normalize = value => String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  function requestedBarber() {
    const hash = location.hash.replace(/^#/, "");
    if (!hash.startsWith("booking-workspace")) return null;
    const query = hash.includes("?") ? hash.split("?", 2)[1] : "";
    const id = new URLSearchParams(query).get("barber");
    return allowed.has(id) ? id : null;
  }

  function bookingWorkspace() {
    const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,strong")];
    const marker = headings.find(node =>
      /2\.\s*barbers/i.test(node.textContent || "")
    );
    if (!marker) return null;

    let current = marker;
    while (current && current !== document.body) {
      const text = normalize(current.textContent);
      if (
        text.includes("1. services") &&
        text.includes("2. barbers") &&
        text.includes("3. available dates")
      ) return current;
      current = current.parentElement;
    }
    return marker.closest("section")?.parentElement || marker.parentElement;
  }

  function barbersPanel() {
    const workspace = bookingWorkspace();
    if (!workspace) return null;
    const headings = [...workspace.querySelectorAll("h1,h2,h3,h4,h5,strong")];
    const marker = headings.find(node =>
      /2\.\s*barbers/i.test(node.textContent || "")
    );
    return marker?.closest("section,article") || marker?.closest("div") || null;
  }

  function barberCard(id) {
    const panel = barbersPanel();
    if (!panel) return null;

    const explicitSelectors = [
      `[data-barber-id="${CSS.escape(id)}"]`,
      `[data-provider-id="${CSS.escape(id)}"]`,
      `[data-booking-barber-id="${CSS.escape(id)}"]`,
      `[value="${CSS.escape(id)}"]`
    ];
    const explicit = panel.querySelector(explicitSelectors.join(","));
    if (explicit) return explicit.closest("button,a,article") || explicit;

    const expected = labels[id] || [];
    const candidates = [...panel.querySelectorAll("button,a,article,[role='button']")];
    return candidates.find(node => {
      const text = normalize(node.textContent);
      return expected.some(label => text.includes(label));
    }) || null;
  }

  function isSelected(card) {
    if (!card) return false;
    return card.classList.contains("is-selected") ||
      card.classList.contains("selected") ||
      card.getAttribute("aria-pressed") === "true" ||
      card.getAttribute("aria-selected") === "true" ||
      card.querySelector("[aria-pressed='true'],[aria-selected='true']") !== null;
  }

  function clickNativeCard(card) {
    const target = card.matches("button,a,[role='button']")
      ? card
      : card.querySelector("button,a,[role='button']") || card;
    target.dispatchEvent(new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window
    }));
  }

  function preselect(id, attempt = 0) {
    if (!allowed.has(id)) return;
    const workspace = bookingWorkspace();
    const card = barberCard(id);

    if (!workspace || !card) {
      if (attempt < 50) setTimeout(() => preselect(id, attempt + 1), 100);
      return;
    }

    workspace.id = "booking-workspace";
    if (!isSelected(card)) clickNativeCard(card);

    setTimeout(() => {
      workspace.scrollIntoView({ behavior: "smooth", block: "start" });
      card.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 80);
  }

  function handleHomepageAvailability(event) {
    const link = event.target.closest(
      '.pc-home-barber-action[href^="#booking-workspace"]'
    );
    if (!link) return;

    const href = link.getAttribute("href") || "";
    const query = href.includes("?") ? href.split("?", 2)[1] : "";
    const id = new URLSearchParams(query).get("barber");
    if (!allowed.has(id)) return;

    event.preventDefault();
    history.replaceState(null, "", href);
    preselect(id);
  }

  function initialize() {
    const id = requestedBarber();
    if (id) preselect(id);
  }

  document.addEventListener("click", handleHomepageAvailability, true);
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", initialize, { once: true })
    : initialize();
  document.addEventListener("booksy-portal-config-ready", initialize);
  window.addEventListener("load", initialize, { once: true });
  window.addEventListener("hashchange", initialize);
})();
