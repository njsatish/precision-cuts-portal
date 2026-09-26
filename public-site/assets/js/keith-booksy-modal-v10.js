(() => {
  "use strict";

  // This is an HTML widget endpoint. code.js is JavaScript and must not be used as an iframe src.
  const BOOKSY_IFRAME_URL = "https://booksy.com/widget/index.html?id=97909&country=us&lang=en";
  let lastTrigger = null;

  const normalizedText = element =>
    (element?.textContent || element?.value || "").replace(/\s+/g, " ").trim().toLowerCase();

  const isKeithBookingTrigger = element => {
    if (!element) return false;
    return /book with keith/.test(normalizedText(element));
  };

  const ensureModal = () => {
    let modal = document.getElementById("keith-booksy-modal-v10");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "keith-booksy-modal-v10";
    modal.className = "keith-booksy-modal-v10";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "keith-booksy-modal-title-v10");
    modal.innerHTML = `
      <div class="keith-booksy-backdrop-v10" data-keith-booksy-close></div>
      <div class="keith-booksy-dialog-v10">
        <header>
          <div>
            <p>Book with Keith</p>
            <h2 id="keith-booksy-modal-title-v10">Official Booksy Instant Schedule</h2>
          </div>
          <button type="button" data-keith-booksy-close aria-label="Close booking">Close</button>
        </header>
        <div class="keith-booksy-frame-wrap-v10">
          <div class="keith-booksy-loader-v10">Connecting to Booksy...</div>
          <iframe
            title="Booksy booking calendar for Keith Lemon"
            allow="geolocation; microphone; camera; payment"
            referrerpolicy="strict-origin-when-cross-origin"
          ></iframe>
        </div>
        <footer>Secure booking provided by <strong>Booksy</strong></footer>
      </div>`;

    document.body.appendChild(modal);
    const iframe = modal.querySelector("iframe");
    iframe.addEventListener("load", () => {
      modal.querySelector(".keith-booksy-loader-v10")?.classList.add("is-hidden");
      iframe.classList.add("is-loaded");
    });
    modal.querySelectorAll("[data-keith-booksy-close]").forEach(element => {
      element.addEventListener("click", closeModal);
    });
    return modal;
  };

  const openModal = event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    lastTrigger = event.target.closest("a, button");

    const modal = ensureModal();
    const iframe = modal.querySelector("iframe");
    if (!iframe.getAttribute("src")) iframe.setAttribute("src", BOOKSY_IFRAME_URL);
    modal.classList.add("is-open");
    document.body.classList.add("keith-booksy-open-v10");
    modal.querySelector("header button").focus();
  };

  function closeModal() {
    const modal = document.getElementById("keith-booksy-modal-v10");
    if (!modal) return;
    modal.classList.remove("is-open");
    document.body.classList.remove("keith-booksy-open-v10");
    lastTrigger?.focus();
  }

  // Capture-phase delegation handles buttons rendered later by barber-profile-page.js.
  document.addEventListener("click", event => {
    const trigger = event.target.closest("a, button");
    if (!isKeithBookingTrigger(trigger)) return;
    openModal(event);
  }, true);

  // Remove navigation attributes from dynamically rendered Keith booking controls.
  const normalizeTriggers = () => {
    document.querySelectorAll("a, button").forEach(trigger => {
      if (!isKeithBookingTrigger(trigger)) return;
      trigger.removeAttribute("href");
      trigger.removeAttribute("target");
      trigger.removeAttribute("rel");
      trigger.classList.add("book-with-keith-v10");
    });
  };

  const observer = new MutationObserver(normalizeTriggers);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  normalizeTriggers();
  window.setTimeout(() => observer.disconnect(), 30000);
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeModal();
  });
})();
