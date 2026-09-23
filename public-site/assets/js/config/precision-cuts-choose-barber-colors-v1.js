(() => {
  "use strict";
  const normalize = value => String(value || "").replace(/\s+/g, " ").trim().toLowerCase();

  function findCard(heading) {
    const candidates = [];
    let current = heading.parentElement;
    while (current && current !== document.body) {
      if (current.matches("header,section,article,div")) {
        const text = normalize(current.textContent);
        if (
          text.includes("meet the precision cuts team") &&
          text.includes("choose your barber.") &&
          text.includes("five verified professionals") &&
          current.querySelectorAll("*").length < 30
        ) candidates.push(current);
      }
      if (current.matches("main")) break;
      current = current.parentElement;
    }
    candidates.sort((a,b) => a.querySelectorAll("*").length - b.querySelectorAll("*").length);
    return candidates[0] || heading.parentElement;
  }

  function apply() {
    const heading = [...document.querySelectorAll("h1,h2,h3,h4,[role='heading']")]
      .find(node => normalize(node.textContent) === "choose your barber.");
    if (!heading) return false;

    const card = findCard(heading);
    card?.classList.add("pc-choose-barber-card-cream");
    heading.classList.add("pc-choose-barber-title-cream");

    const candidates = card ? [...card.querySelectorAll("p,span,small")] : [];
    const kicker = candidates.find(node => normalize(node.textContent) === "meet the precision cuts team");
    const description = candidates.find(node => normalize(node.textContent).includes("five verified professionals"));
    kicker?.classList.add("pc-choose-barber-kicker-cream");
    description?.classList.add("pc-choose-barber-description-cream");

    document.documentElement.dataset.pcChooseBarberCream = "true";
    return true;
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; apply(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule, {once:true});
  else schedule();
  window.addEventListener("load", schedule, {once:true});
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, {childList:true,subtree:true});
  setTimeout(() => observer.disconnect(), 15000);
})();
