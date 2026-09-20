(() => {
  "use strict";

  const normalize = value => String(value || "").replace(/\s+/g, " ").trim();

  const targets = [
    {
      heading: "Clear service. Careful detail.",
      supporting: [
        "Professional service without unnecessary steps.",
        "Clear choices",
        "Live availability",
        "Secure confirmation"
      ]
    },
    {
      heading: "From service choice to confirmation.",
      supporting: [
        "Choose a service",
        "Select a date and time",
        "Confirm through Booksy",
        "Ready to choose an appointment?"
      ]
    }
  ];

  function textOf(node) {
    return normalize(node?.textContent);
  }

  function findHeading(text) {
    return [...document.querySelectorAll("h1,h2,h3,h4,h5,h6,p,strong")]
      .find(node => textOf(node) === text || textOf(node).includes(text));
  }

  function candidateContainers(marker) {
    const containers = [];
    let node = marker;
    while (node && node !== document.body) {
      if (node.matches?.("section, article, main > div, .section, [class*='section']")) {
        containers.push(node);
      }
      node = node.parentElement;
    }
    return containers;
  }

  function chooseCompleteContainer(marker, target) {
    const required = [target.heading, ...target.supporting];
    const matches = candidateContainers(marker)
      .filter(node => required.every(text => textOf(node).includes(text)))
      .sort((a, b) => textOf(a).length - textOf(b).length);
    return matches[0] || marker.closest("section,article");
  }

  function removeTargets() {
    let removed = 0;
    for (const target of targets) {
      const marker = findHeading(target.heading);
      if (!marker) continue;
      const container = chooseCompleteContainer(marker, target);
      if (!container) continue;
      container.remove();
      removed += 1;
    }
    return removed;
  }

  function apply() {
    removeTargets();
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", apply, { once: true })
    : apply();

  window.addEventListener("load", apply, { once: true });

  // About content is partly assembled by other scripts. Observe briefly so
  // these two obsolete blocks are removed even if they render after DOM ready.
  const observer = new MutationObserver(() => apply());
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => {
    apply();
    observer.disconnect();
  }, 5000);
})();
