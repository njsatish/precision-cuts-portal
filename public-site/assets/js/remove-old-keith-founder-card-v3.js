(() => {
  "use strict";

  const clean = value => String(value || "").replace(/\s+/g, " ").trim().toLowerCase();

  const isLegacyText = text =>
    text.includes("480+") &&
    text.includes("client reviews") &&
    text.includes("5.0") &&
    text.includes("booksy rating") &&
    text.includes("verified services") &&
    text.includes("adults + kids");

  const findLegacyRoot = () => {
    const elements = [...document.querySelectorAll("main section, main article, main > div, main [class*='founder'], main [class*='spotlight']")];
    const candidates = elements.filter(element => {
      if (element.id === "pc-about-founder-card" || element.closest("#pc-about-founder-card")) return false;
      const text = clean(element.textContent);
      return text.includes("keith lemon") && isLegacyText(text);
    });

    // The correct legacy root is the smallest complete container with all legacy statistics.
    return candidates.sort((a, b) => a.querySelectorAll("*").length - b.querySelectorAll("*").length)[0] || null;
  };

  const removeLegacy = () => {
    const newCard = document.querySelector("#pc-about-founder-card");
    if (!newCard) return false;

    let removed = false;
    let legacy = findLegacyRoot();
    while (legacy) {
      legacy.remove();
      removed = true;
      legacy = findLegacyRoot();
    }

    document.documentElement.classList.add("pc-new-founder-ready-v3");
    if (removed) document.documentElement.dataset.legacyKeithFounderRemoved = "v3";
    return true;
  };

  const observer = new MutationObserver(removeLegacy);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  removeLegacy();
  window.setTimeout(() => observer.disconnect(), 30000);
})();
