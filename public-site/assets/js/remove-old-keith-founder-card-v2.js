(() => {
  "use strict";

  const normalized = element =>
    (element?.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();

  const findLegacyCard = () => {
    const newCard = document.querySelector("#pc-about-founder-card");
    const headings = [...document.querySelectorAll("main h1, main h2, main h3")]
      .filter(node => node.textContent.trim().toLowerCase() === "keith lemon");

    const candidates = headings
      .map(heading => heading.closest("section, article, [class*='founder'], [class*='spotlight']") || heading.parentElement)
      .filter(card => card && card !== newCard && !card.closest("#pc-about-founder-card"));

    return candidates.find(card => {
      const text = normalized(card);
      const hasLegacyStatistics =
        text.includes("480+") ||
        text.includes("client reviews") ||
        text.includes("verified services") ||
        text.includes("adults + kids");
      const hasLegacyAction =
        text.includes("view keith's availability") ||
        text.includes("explore services");
      return hasLegacyStatistics || hasLegacyAction;
    }) || null;
  };

  const removeLegacyCard = () => {
    const newCard = document.querySelector("#pc-about-founder-card");
    if (!newCard) return false;

    const legacy = findLegacyCard();
    if (!legacy) return true;

    legacy.remove();
    document.documentElement.dataset.oldKeithFounderCardRemoved = "true";
    return true;
  };

  if (!removeLegacyCard()) {
    const observer = new MutationObserver(() => {
      if (removeLegacyCard()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 15000);
  }
})();
