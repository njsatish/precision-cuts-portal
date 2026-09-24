(() => {
  "use strict";

  const BARBERS = [
    ["keith-lemon", "Keith"],
    ["christopher-meadows", "Christopher"],
    ["ron-the-barber", "Ron"],
    ["levar-neal", "Var"],
    ["lamar-the-barber", "Lamar"]
  ];

  const normalize = value => String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  function findCard(control) {
    const candidates = [];
    let current = control;
    while (current && current !== document.body) {
      if (current.matches?.("article, li, [class*='card'], [class*='profile'], div")) {
        if (
          current.querySelectorAll("[data-index-profile-booking]").length === 1 &&
          current.querySelectorAll("img").length >= 1
        ) candidates.push(current);
      }
      current = current.parentElement;
    }
    candidates.sort((a, b) => a.querySelectorAll("*").length - b.querySelectorAll("*").length);
    return candidates[0] || null;
  }

  function findContent(card, control) {
    let current = control.parentElement;
    while (current && current !== card) {
      if (current.querySelector("h2,h3,h4") && current.contains(control)) return current;
      current = current.parentElement;
    }
    return control.parentElement;
  }

  function hideServiceTags(content, control) {
    const candidates = [...content.querySelectorAll("div,ul,ol,p")];
    for (const node of candidates) {
      if (node.contains(control) || node.querySelector("h2,h3,h4")) continue;
      const chips = [...node.querySelectorAll("span,li")].filter(item => {
        const text = normalize(item.textContent);
        return text && text.length < 45;
      });
      if (chips.length >= 2 && node.getBoundingClientRect().height < 150) {
        node.dataset.pcBarberServiceTags = "hidden";
      }
    }
  }

  function apply() {
    let success = 0;
    for (const [id, shortName] of BARBERS) {
      const control = document.querySelector(`[data-index-profile-booking="${id}"]`);
      if (!control) continue;
      const card = findCard(control);
      if (!card) continue;

      const content = findContent(card, control);
      if (content) {
        content.dataset.pcFiveBarberContent = "true";
        hideServiceTags(content, control);
      }

      control.dataset.pcBookWithButton = "true";
      control.removeAttribute("hidden");
      control.setAttribute("aria-hidden", "false");
      control.style.setProperty("display", "flex", "important");
      control.style.setProperty("visibility", "visible", "important");
      control.style.setProperty("opacity", "1", "important");
      control.style.setProperty("pointer-events", "auto", "important");
      control.textContent = `Book with ${shortName}`;
      success += 1;
    }

    document.documentElement.dataset.pcSimpleBarberCards = String(success);
    return success === 5;
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      apply();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule, { once: true });
  } else {
    schedule();
  }
  window.addEventListener("load", schedule, { once: true });
  window.addEventListener("resize", schedule, { passive: true });
  [100, 350, 900, 1800, 3500].forEach(delay => setTimeout(schedule, delay));

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 20000);
})();
