(() => {
  "use strict";

  let items = [];
  let activeIndex = 0;
  let activeTrigger = null;

  const createModal = () => {
    const modal = document.createElement("div");
    modal.className = "pc-family-modal";
    modal.id = "pc-family-modal-v3";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Keith and wife photo preview");
    modal.innerHTML = `
      <button class="pc-family-modal-close" type="button" aria-label="Close photo preview">×</button>
      <button class="pc-family-modal-nav pc-family-modal-prev" type="button" aria-label="Previous photo">‹</button>
      <figure class="pc-family-modal-figure">
        <img alt="Expanded personal photo">
        <figcaption>
          <span class="pc-family-modal-category">Keith &amp; His Wife</span>
          <strong class="pc-family-modal-title"></strong>
          <small class="pc-family-modal-count"></small>
        </figcaption>
      </figure>
      <button class="pc-family-modal-nav pc-family-modal-next" type="button" aria-label="Next photo">›</button>`;
    document.body.appendChild(modal);
    return modal;
  };

  const init = () => {
    const cards = [...document.querySelectorAll("[data-family-src]")];
    if (cards.length !== 3) return false;
    if (document.getElementById("pc-family-modal-v3")) return true;

    items = cards.map(card => ({
      source: card.dataset.familySrc,
      alt: card.querySelector("img")?.alt || "Expanded personal photo",
      title: card.querySelector(".pc-family-copy strong")?.textContent || "Personal Photo",
      trigger: card
    }));

    const modal = createModal();
    const image = modal.querySelector("img");
    const title = modal.querySelector(".pc-family-modal-title");
    const count = modal.querySelector(".pc-family-modal-count");
    const closeButton = modal.querySelector(".pc-family-modal-close");

    const show = index => {
      activeIndex = (index + items.length) % items.length;
      const item = items[activeIndex];
      image.src = item.source;
      image.alt = item.alt;
      title.textContent = item.title;
      count.textContent = `${activeIndex + 1} of ${items.length}`;
    };

    const open = (index, trigger) => {
      activeTrigger = trigger;
      show(index);
      modal.classList.add("is-open");
      document.body.classList.add("pc-family-modal-open");
      closeButton.focus();
    };

    const close = () => {
      modal.classList.remove("is-open");
      document.body.classList.remove("pc-family-modal-open");
      activeTrigger?.focus();
    };

    cards.forEach((card, index) => {
      card.addEventListener("click", event => {
        event.preventDefault();
        event.stopImmediatePropagation();
        open(index, card);
      }, true);
    });

    modal.querySelector(".pc-family-modal-prev").addEventListener("click", event => {
      event.stopPropagation();
      show(activeIndex - 1);
    });
    modal.querySelector(".pc-family-modal-next").addEventListener("click", event => {
      event.stopPropagation();
      show(activeIndex + 1);
    });
    closeButton.addEventListener("click", close);
    modal.querySelector(".pc-family-modal-figure").addEventListener("click", event => event.stopPropagation());
    modal.addEventListener("click", event => {
      if (event.target === modal) close();
    });
    document.addEventListener("keydown", event => {
      if (!modal.classList.contains("is-open")) return;
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") show(activeIndex - 1);
      if (event.key === "ArrowRight") show(activeIndex + 1);
    });

    return true;
  };

  if (!init()) {
    const observer = new MutationObserver(() => {
      if (init()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 15000);
  }
})();
