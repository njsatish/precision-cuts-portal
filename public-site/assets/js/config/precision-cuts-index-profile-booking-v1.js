(() => {
  "use strict";

  const BARBERS = [
    { id: "keith-lemon", patterns: ["keith lemon", "view keith", "book with keith"] },
    { id: "christopher-meadows", patterns: ["christopher meadows", "view christopher", "book with christopher"] },
    { id: "ron-the-barber", patterns: ["ron the barber", "view ron", "book with ron"] },
    { id: "levar-neal", patterns: ["var da barber", "view var", "book with var", "levar neal"] },
    { id: "lamar-the-barber", patterns: ["lamar the barber", "view lamar", "book with lamar"] }
  ];

  const normalize = value => String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  function barberIdFor(control) {
    const card = control.closest("article,li,section,div");
    const text = normalize(`${control.textContent} ${card?.textContent || ""}`);
    return BARBERS.find(barber => barber.patterns.some(pattern => text.includes(pattern)))?.id || "";
  }

  function markProfileButtons(root = document) {
    let count = 0;
    const controls = root.querySelectorAll("a,button,[role='button']");
    for (const control of controls) {
      const text = normalize(control.textContent);
      if (!(text.includes("availability") || text.startsWith("book with"))) continue;
      const barberId = barberIdFor(control);
      if (!barberId) continue;

      control.dataset.indexProfileBooking = barberId;
      control.dataset.pickBarber = barberId;
      control.setAttribute("aria-haspopup", "dialog");
      control.setAttribute("aria-controls", "pc-home-booking-modal");
      if (control.tagName === "A") control.setAttribute("href", "#book-your-chair");
      count += 1;
    }
    document.documentElement.dataset.pcIndexProfileBookingButtons = String(count);
    return count;
  }

  function openPopup(event) {
    const control = event.target.closest("[data-index-profile-booking]");
    if (!control) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const barberId = control.dataset.indexProfileBooking;
    if (typeof window.openPrecisionCutsHomeBooking !== "function") {
      console.error("Precision Cuts booking popup is not loaded.");
      return;
    }
    window.openPrecisionCutsHomeBooking(barberId);
  }

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      markProfileButtons(document);
    });
  };

  document.addEventListener("click", openPopup, true);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule, { once: true });
  } else {
    schedule();
  }
  window.addEventListener("load", schedule, { once: true });

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 20000);
})();
