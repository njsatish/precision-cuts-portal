(() => {
  "use strict";

  const allIds = new Set([
    "keith-lemon",
    "christopher-meadows",
    "ron-the-barber",
    "levar-neal",
    "lamar-the-barber"
  ]);
  const directIds = new Set(["levar-neal", "lamar-the-barber"]);
  const normalize = value => String(value || "").replace(/\s+/g, " ").trim().toLowerCase();

  function barberFromHash() {
    const hash = location.hash.replace(/^#/, "");
    if (!hash.startsWith("booking-workspace")) return null;
    const query = hash.includes("?") ? hash.split("?", 2)[1] : "";
    const id = new URLSearchParams(query).get("barber");
    return allIds.has(id) ? id : null;
  }

  function workspace() {
    const directCard = document.querySelector("[data-pc-direct-booksy-barbers]");
    if (directCard) return directCard.closest("section") || directCard.closest("main > div");
    const headings = [...document.querySelectorAll("h1,h2,h3,h4,strong")];
    const marker = headings.find(node => /2\.\s*barbers/i.test(node.textContent || ""));
    return marker?.closest("section")?.parentElement || marker?.closest("main > div") || marker?.parentElement || null;
  }

  function cardFor(id) {
    const explicit = document.querySelector(`[data-barber-id="${CSS.escape(id)}"]`);
    if (explicit) return explicit;
    const names = {
      "keith-lemon":"keith lemon",
      "christopher-meadows":"christopher meadows",
      "ron-the-barber":"ron the barber",
      "levar-neal":"var da barber",
      "lamar-the-barber":"lamar the barber"
    };
    return [...document.querySelectorAll("button,article")].find(node =>
      normalize(node.textContent).includes(names[id]) &&
      node.closest("main")
    ) || null;
  }

  function clickCard(id) {
    const card = cardFor(id);
    if (!card) return false;
    const clickable = card.matches("button,a") ? card : card.querySelector("button,a") || card;
    clickable.dispatchEvent(new MouseEvent("click", {bubbles:true, cancelable:true, view:window}));
    return true;
  }

  function selectLiveBarber(id) {
    const card = cardFor(id);
    if (!card) return false;
    const clickable = card.matches("button,a") ? card : card.querySelector("button,a") || card;

    // Existing live cards may be anchors to book.html. Prevent navigation and
    // invoke the workspace selection UI instead when possible.
    if (clickable.tagName === "A") {
      const buttonInCard = card.querySelector("button");
      if (buttonInCard) buttonInCard.click();
      else clickable.dispatchEvent(new MouseEvent("click", {bubbles:true,cancelable:true,view:window}));
    } else {
      clickable.click();
    }
    return true;
  }

  function applySelection(id, attempt = 0) {
    const target = workspace();
    const selected = directIds.has(id) ? clickCard(id) : selectLiveBarber(id);
    if (!target || !selected) {
      if (attempt < 20) setTimeout(() => applySelection(id, attempt + 1), 120);
      return;
    }
    target.id = "booking-workspace";
    setTimeout(() => target.scrollIntoView({behavior:"smooth", block:"start"}), 80);
  }

  function handleHomepageCard(event) {
    const link = event.target.closest('.pc-home-barber-action[href^="#booking-workspace"]');
    if (!link) return;
    event.preventDefault();
    const raw = link.getAttribute("href");
    history.replaceState(null, "", raw);
    const id = barberFromHash();
    if (id) applySelection(id);
  }

  document.addEventListener("click", handleHomepageCard, true);

  function initialize() {
    const id = barberFromHash();
    if (id) applySelection(id);
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", initialize, {once:true})
    : initialize();
  window.addEventListener("hashchange", initialize);
  window.addEventListener("load", initialize, {once:true});
})();
