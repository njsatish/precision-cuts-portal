(() => {
  "use strict";

  const normalize = value => String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  function findSmallestIntro(title) {
    const candidates = [];
    let current = title;
    while (current && current !== document.body) {
      if (current.matches?.("header, section, article, div")) {
        const text = normalize(current.textContent);
        if (
          text.includes("meet the precision cuts team") &&
          text.includes("choose your barber.") &&
          text.includes("five verified professionals")
        ) candidates.push(current);
      }
      current = current.parentElement;
    }
    candidates.sort((a, b) => a.querySelectorAll("*").length - b.querySelectorAll("*").length);
    return candidates[0] || title.parentElement;
  }

  function findTeamSection(intro, grid) {
    let current = intro;
    while (current && current !== document.body) {
      if (current.matches?.("section, main > div, main > article") && current.contains(grid)) {
        return current;
      }
      current = current.parentElement;
    }
    return grid.parentElement;
  }

  function apply() {
    const title = [...document.querySelectorAll("h1,h2,h3,h4,[role='heading']")]
      .find(node => normalize(node.textContent) === "choose your barber.");
    const grid = document.querySelector('[data-pc-five-barber-grid="true"]');
    if (!title || !grid) return false;

    const intro = findSmallestIntro(title);
    const section = findTeamSection(intro, grid);
    if (!intro || !section) return false;

    section.dataset.pcTeamSection = "cream";
    intro.dataset.pcTeamIntro = "cream";

    const kicker = [...intro.querySelectorAll("p,span,small")]
      .find(node => normalize(node.textContent) === "meet the precision cuts team");
    if (kicker) kicker.dataset.pcTeamKicker = "true";

    section.style.setProperty("background", "#f4ede1", "important");
    section.style.setProperty("background-color", "#f4ede1", "important");
    section.style.setProperty("background-image", "none", "important");

    document.documentElement.dataset.pcTeamCreamApplied = "true";
    return true;
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
  [100, 350, 900, 1800, 3500].forEach(delay => setTimeout(schedule, delay));
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 20000);
})();
