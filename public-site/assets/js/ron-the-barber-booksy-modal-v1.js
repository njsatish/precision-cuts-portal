(() => {
  "use strict";

  const BARBER_NAME = "Ron The Barber";
  const BOOKSY_IFRAME_URL = "https://booksy.com/widget/index.html?id=1700058&country=us&lang=en";
  let lastTrigger = null;

  const normalizedText = element =>
    (element?.textContent || element?.value || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  const isRonBookingTrigger = element => {
    if (!element) return false;
    const text = normalizedText(element);
    const href = element.getAttribute?.("href") || "";
    return text.includes("book with ron") ||
      text.includes("book with chris") ||
      /^book now\b/.test(text) ||
      /^book appointment\b/.test(text) ||
      /booksy\.com/i.test(href);
  };

  const ensureModal = () => {
    let modal = document.getElementById("ron-booksy-modal-v1");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "ron-booksy-modal-v1";
    modal.className = "ron-booksy-modal-v1";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "ron-booksy-title-v1");
    modal.innerHTML = `
      <div class="ron-booksy-backdrop-v1" data-ron-booksy-close></div>
      <div class="ron-booksy-dialog-v1">
        <header>
          <div>
            <p>Book with ${BARBER_NAME}</p>
            <h2 id="ron-booksy-title-v1">Official Booksy Instant Schedule</h2>
          </div>
          <button type="button" data-ron-booksy-close aria-label="Close booking">Close</button>
        </header>
        <div class="ron-booksy-frame-wrap-v1">
          <div class="ron-booksy-loader-v1">Connecting to Booksy...</div>
          <iframe
            title="Booksy booking calendar for Ron The Barber"
            allow="geolocation; microphone; camera; payment"
            referrerpolicy="strict-origin-when-cross-origin"
          ></iframe>
        </div>
        <footer>Secure booking provided by <strong>Booksy</strong></footer>
      </div>`;

    document.body.appendChild(modal);
    const iframe = modal.querySelector("iframe");
    iframe.addEventListener("load", () => {
      modal.querySelector(".ron-booksy-loader-v1")?.classList.add("is-hidden");
      iframe.classList.add("is-loaded");
    });
    modal.querySelectorAll("[data-ron-booksy-close]").forEach(element => {
      element.addEventListener("click", closeModal);
    });
    return modal;
  };

  const openModal = event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    lastTrigger = event.target.closest("a, button, input");

    const modal = ensureModal();
    const iframe = modal.querySelector("iframe");
    if (!iframe.getAttribute("src")) iframe.setAttribute("src", BOOKSY_IFRAME_URL);
    modal.classList.add("is-open");
    document.body.classList.add("ron-booksy-open-v1");
    modal.querySelector("header button").focus();
  };

  function closeModal() {
    const modal = document.getElementById("ron-booksy-modal-v1");
    if (!modal) return;
    modal.classList.remove("is-open");
    document.body.classList.remove("ron-booksy-open-v1");
    lastTrigger?.focus();
  }

  // Capture-phase delegation matches Keith's working dynamically rendered profile setup.
  document.addEventListener("click", event => {
    const trigger = event.target.closest("a, button, input[type='button'], input[type='submit']");
    if (!isRonBookingTrigger(trigger)) return;
    openModal(event);
  }, true);

  const normalizeTriggers = () => {
    document.querySelectorAll("a, button, input[type='button'], input[type='submit']").forEach(trigger => {
      if (!isRonBookingTrigger(trigger)) return;
      trigger.removeAttribute("href");
      trigger.removeAttribute("target");
      trigger.removeAttribute("rel");
      trigger.classList.add("book-with-ron-v1");
    });
  };

  new MutationObserver(normalizeTriggers).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
  normalizeTriggers();
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeModal();
  });
})();
