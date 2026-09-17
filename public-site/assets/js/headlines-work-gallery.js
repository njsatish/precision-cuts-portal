(() => {
  "use strict";
  const images = Array.from({ length: 12 }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    return {
      src: `/assets/images/headlines-work/headlines_work_${number}.jpeg`,
      alt: `Headlines barber work example ${index + 1}`
    };
  });

  function start() {
    const grid = document.querySelector("[data-headlines-work-grid]");
    const dialog = document.querySelector(".pp-headlines-lightbox");
    if (!grid || !dialog) return console.error("Headlines gallery elements are missing.");

    grid.innerHTML = images.map((item, index) => `
      <button class="pp-headlines-work-card" type="button" data-gallery-image="${index}" aria-label="Open ${item.alt}">
        <img src="${item.src}" alt="${item.alt}" loading="${index < 4 ? "eager" : "lazy"}" decoding="async">
      </button>`).join("");

    const fullImage = dialog.querySelector("figure img");
    const counter = dialog.querySelector("[data-gallery-count]");
    const previous = dialog.querySelector(".pp-headlines-lightbox-prev");
    const next = dialog.querySelector(".pp-headlines-lightbox-next");
    const close = dialog.querySelector(".pp-headlines-lightbox-close");
    let current = 0;
    let touchStart = null;

    function show(index) {
      current = (index + images.length) % images.length;
      fullImage.src = images[current].src;
      fullImage.alt = images[current].alt;
      counter.textContent = `${current + 1} / ${images.length}`;
    }

    function open(index) {
      show(index);
      dialog.showModal();
      next.focus();
    }

    function shut() {
      if (dialog.open) dialog.close();
    }

    grid.querySelectorAll("[data-gallery-image]").forEach(button => {
      button.addEventListener("click", () => open(Number(button.dataset.galleryImage)));
    });
    previous.addEventListener("click", event => { event.stopPropagation(); show(current - 1); });
    next.addEventListener("click", event => { event.stopPropagation(); show(current + 1); });
    close.addEventListener("click", event => { event.stopPropagation(); shut(); });
    dialog.addEventListener("click", event => { if (event.target === dialog) shut(); });
    dialog.addEventListener("keydown", event => {
      if (event.key === "ArrowLeft") { event.preventDefault(); show(current - 1); }
      if (event.key === "ArrowRight") { event.preventDefault(); show(current + 1); }
      if (event.key === "Escape") { event.preventDefault(); shut(); }
    });
    dialog.addEventListener("touchstart", event => { touchStart = event.changedTouches[0].clientX; }, { passive: true });
    dialog.addEventListener("touchend", event => {
      if (touchStart === null) return;
      const distance = event.changedTouches[0].clientX - touchStart;
      if (Math.abs(distance) > 45) show(current + (distance < 0 ? 1 : -1));
      touchStart = null;
    }, { passive: true });
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", start, { once: true })
    : start();
})();
