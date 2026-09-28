(() => {
  "use strict";

  const BARBER_NAME = "Christopher Meadows";
  const BOOKSY_IFRAME_URL = "https://booksy.com/widget/index.html?id=1648732&country=us&lang=en";
  let lastTrigger = null;

  const normalizedText = element =>
    (element?.textContent || element?.value || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  const isChristopherBookingTrigger = element => {
    if (!element) return false;
    const text = normalizedText(element);
    const href = element.getAttribute?.("href") || "";
    return text.includes("book with christopher") ||
      text.includes("book with chris") ||
      /^book now\b/.test(text) ||
      /^book appointment\b/.test(text) ||
      /booksy\.com/i.test(href);
  };

  const ensureModal = () => {
    let modal = document.getElementById("christopher-booksy-modal-v1");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "christopher-booksy-modal-v1";
    modal.className = "christopher-booksy-modal-v1";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "christopher-booksy-title-v1");
    modal.innerHTML = `
      <div class="christopher-booksy-backdrop-v1" data-christopher-booksy-close></div>
      <div class="christopher-booksy-dialog-v1">
        <header>
          <div>
            <p>Book with ${BARBER_NAME}</p>
            <h2 id="christopher-booksy-title-v1">Official Booksy Instant Schedule</h2>
          </div>
          <button type="button" data-christopher-booksy-close aria-label="Close booking">Close</button>
        </header>
        <div class="christopher-booksy-frame-wrap-v1">
          <div class="christopher-booksy-loader-v1">Connecting to Booksy...</div>
          <iframe
            title="Booksy booking calendar for Christopher Meadows"
            allow="geolocation; microphone; camera; payment"
            referrerpolicy="strict-origin-when-cross-origin"
          ></iframe>
        </div>
        <footer>Secure booking provided by <strong>Booksy</strong></footer>
      </div>`;

    document.body.appendChild(modal);
    const iframe = modal.querySelector("iframe");
    iframe.addEventListener("load", () => {
      modal.querySelector(".christopher-booksy-loader-v1")?.classList.add("is-hidden");
      iframe.classList.add("is-loaded");
    });
    modal.querySelectorAll("[data-christopher-booksy-close]").forEach(element => {
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
    document.body.classList.add("christopher-booksy-open-v1");
    modal.querySelector("header button").focus();
  };

  function closeModal() {
    const modal = document.getElementById("christopher-booksy-modal-v1");
    if (!modal) return;
    modal.classList.remove("is-open");
    document.body.classList.remove("christopher-booksy-open-v1");
    lastTrigger?.focus();
  }

  // Capture-phase delegation matches Keith's working dynamically rendered profile setup.
  document.addEventListener("click", event => {
    const trigger = event.target.closest("a, button, input[type='button'], input[type='submit']");
    if (!isChristopherBookingTrigger(trigger)) return;
    openModal(event);
  }, true);

  const normalizeTriggers = () => {
    document.querySelectorAll("a, button, input[type='button'], input[type='submit']").forEach(trigger => {
      if (!isChristopherBookingTrigger(trigger)) return;
      trigger.removeAttribute("href");
      trigger.removeAttribute("target");
      trigger.removeAttribute("rel");
      trigger.classList.add("book-with-christopher-v1");
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
