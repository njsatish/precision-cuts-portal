(() => {
  "use strict";

  const BOOKSY_WIDGET_URL = "https://booksy.com/widget/index.html?id=97909&country=us&lang=en&mode=dialog&theme=default";
  let lastTrigger = null;

  const getBookingArea = () => {
    const heading = [...document.querySelectorAll("main h1, main h2, main h3, main h4")]
      .find(node => /live availability/i.test(node.textContent));
    return heading?.closest("section, article, [class*='availability'], [class*='booking']") || heading?.parentElement || document.querySelector("main");
  };

  const ensureButton = () => {
    let button = [...document.querySelectorAll("a, button")]
      .find(node => /book with keith/i.test(node.textContent.trim()));

    if (!button) {
      const area = getBookingArea();
      if (!area) return null;
      button = document.createElement("button");
      button.type = "button";
      button.textContent = "Book with Keith";
      area.appendChild(button);
    }

    if (button.tagName === "A") button.removeAttribute("href");
    button.classList.add("pc-book-with-keith-v4");
    button.dataset.keithSamePageBooksy = "v4";
    button.removeAttribute("target");
    return button;
  };

  const ensureModal = () => {
    let modal = document.getElementById("pc-keith-booksy-modal-v4");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "pc-keith-booksy-modal-v4";
    modal.className = "pc-keith-booksy-modal-v4";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "pc-keith-booksy-title-v4");
    modal.innerHTML = `
      <div class="pc-keith-booksy-dialog-v4">
        <header class="pc-keith-booksy-head-v4">
          <div>
            <p>Book with Keith</p>
            <h2 id="pc-keith-booksy-title-v4">Choose Your Appointment</h2>
          </div>
          <button class="pc-keith-booksy-close-v4" type="button" aria-label="Close booking">Close</button>
        </header>
        <div class="pc-keith-booksy-frame-wrap-v4">
          <div class="pc-keith-booksy-loading-v4">Loading Keith's live Booksy schedule...</div>
          <iframe
            class="pc-keith-booksy-frame-v4"
            title="Book an appointment with Keith Lemon"
            loading="eager"
            allow="payment; clipboard-write"
            referrerpolicy="strict-origin-when-cross-origin"
          ></iframe>
        </div>
      </div>`;

    document.body.appendChild(modal);

    const frame = modal.querySelector("iframe");
    frame.addEventListener("load", () => {
      modal.querySelector(".pc-keith-booksy-loading-v4")?.classList.add("is-hidden");
      frame.classList.add("is-loaded");
    });

    const close = () => {
      modal.classList.remove("is-open");
      document.body.classList.remove("pc-keith-booksy-modal-open-v4");
      lastTrigger?.focus();
    };

    modal.querySelector(".pc-keith-booksy-close-v4").addEventListener("click", close);
    modal.addEventListener("click", event => {
      if (event.target === modal) close();
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && modal.classList.contains("is-open")) close();
    });
    return modal;
  };

  const openModal = event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    lastTrigger = event.currentTarget;

    const modal = ensureModal();
    const frame = modal.querySelector("iframe");
    if (!frame.getAttribute("src")) frame.setAttribute("src", BOOKSY_WIDGET_URL);
    modal.classList.add("is-open");
    document.body.classList.add("pc-keith-booksy-modal-open-v4");
    modal.querySelector(".pc-keith-booksy-close-v4").focus();
  };

  const bind = () => {
    const button = ensureButton();
    if (!button) return false;
    if (button.dataset.keithSamePageBound !== "v4") {
      button.dataset.keithSamePageBound = "v4";
      button.addEventListener("click", openModal, true);
    }
    return true;
  };

  if (!bind()) {
    const observer = new MutationObserver(() => {
      if (bind()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 15000);
  }
})();
