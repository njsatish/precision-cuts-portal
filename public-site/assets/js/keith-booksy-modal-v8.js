(() => {
  "use strict";

  const BOOKSY_IFRAME = "https://booksy.com/widget/index.html?id=97909&lang=en&country=us";
  let lastTrigger = null;
  let safetyTimer = null;

  const textOf = node =>
    (node?.textContent || node?.value || "").replace(/\s+/g, " ").trim();

  const findBookingArea = () => {
    const heading = [...document.querySelectorAll("main h1, main h2, main h3, main h4")]
      .find(node => /live availability/i.test(node.textContent));
    return heading?.closest("section, article, [class*='availability'], [class*='booking']") || heading?.parentElement || document.querySelector("main");
  };

  const ensureTrigger = () => {
    let trigger = [...document.querySelectorAll("a, button")]
      .find(node => /book with keith/i.test(textOf(node)));

    if (!trigger) {
      const area = findBookingArea();
      if (!area) return null;
      trigger = document.createElement("button");
      trigger.type = "button";
      trigger.textContent = "Book with Keith";
      area.appendChild(trigger);
    }

    if (trigger.tagName === "A") {
      trigger.removeAttribute("href");
      trigger.removeAttribute("target");
      trigger.removeAttribute("rel");
      trigger.setAttribute("role", "button");
    }
    trigger.classList.add("pc-book-with-keith-v8");
    trigger.dataset.keithModalTrigger = "v8";
    return trigger;
  };

  const ensureModal = () => {
    let modal = document.getElementById("pc-keith-booksy-modal-v8");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "pc-keith-booksy-modal-v8";
    modal.className = "pc-keith-booksy-modal-v8";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "pc-keith-booksy-title-v8");
    modal.innerHTML = `
      <div class="pc-keith-booksy-backdrop-v8" data-booksy-close-v8></div>
      <div class="pc-keith-booksy-dialog-v8">
        <header class="pc-keith-booksy-header-v8">
          <div>
            <p>Book with Keith</p>
            <h2 id="pc-keith-booksy-title-v8">Official Booksy Instant Schedule</h2>
          </div>
          <div class="pc-keith-booksy-controls-v8">
            <button type="button" class="pc-keith-booksy-fullscreen-v8" aria-label="Toggle fullscreen">Full screen</button>
            <button type="button" class="pc-keith-booksy-close-v8" data-booksy-close-v8 aria-label="Close booking">Close</button>
          </div>
        </header>
        <div class="pc-keith-booksy-body-v8">
          <div class="pc-keith-booksy-loader-v8">
            <span></span>
            <strong>Connecting to Booksy...</strong>
          </div>
          <iframe
            class="pc-keith-booksy-iframe-v8"
            title="Booksy booking calendar for Keith Lemon"
            allow="geolocation; microphone; camera; payment"
            referrerpolicy="strict-origin-when-cross-origin"
          ></iframe>
        </div>
        <footer class="pc-keith-booksy-footer-v8">Secure booking provided by <strong>Booksy</strong></footer>
      </div>`;

    document.body.appendChild(modal);

    const frame = modal.querySelector("iframe");
    const hideLoader = () => {
      modal.querySelector(".pc-keith-booksy-loader-v8")?.classList.add("is-hidden");
      frame.classList.add("is-loaded");
      window.clearTimeout(safetyTimer);
    };
    frame.addEventListener("load", hideLoader);

    modal.querySelectorAll("[data-booksy-close-v8]").forEach(node =>
      node.addEventListener("click", closeModal)
    );
    modal.querySelector(".pc-keith-booksy-fullscreen-v8").addEventListener("click", () => {
      modal.querySelector(".pc-keith-booksy-dialog-v8").classList.toggle("is-fullscreen");
    });
    return modal;
  };

  const openModal = event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    lastTrigger = event.currentTarget;

    const modal = ensureModal();
    const frame = modal.querySelector("iframe");
    const loader = modal.querySelector(".pc-keith-booksy-loader-v8");
    loader.classList.remove("is-hidden");
    frame.classList.remove("is-loaded");
    if (!frame.src) frame.src = BOOKSY_IFRAME;

    modal.classList.add("is-open");
    document.body.classList.add("pc-booksy-open-v8");
    modal.querySelector(".pc-keith-booksy-close-v8").focus();

    safetyTimer = window.setTimeout(() => {
      loader.classList.add("is-hidden");
      frame.classList.add("is-loaded");
    }, 5000);
  };

  function closeModal() {
    const modal = document.getElementById("pc-keith-booksy-modal-v8");
    if (!modal) return;
    modal.classList.remove("is-open");
    document.body.classList.remove("pc-booksy-open-v8");
    lastTrigger?.focus();
  }

  const bind = () => {
    const trigger = ensureTrigger();
    if (!trigger) return false;
    if (trigger.dataset.keithModalBound !== "v8") {
      trigger.dataset.keithModalBound = "v8";
      trigger.addEventListener("click", openModal, true);
    }
    return true;
  };

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeModal();
  });

  if (!bind()) {
    const observer = new MutationObserver(() => {
      if (bind()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 15000);
  }
})();
