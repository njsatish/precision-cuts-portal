(() => {
  "use strict";

  const normalize = value => String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  function generalWorkspace() {
    const heading = [...document.querySelectorAll("h1,h2,h3,h4,[role='heading']")]
      .find(node => normalize(node.textContent) === "1. services");
    if (!heading || heading.closest("#pc-home-booking-modal")) return null;

    let current = heading.parentElement;
    while (current && current !== document.body) {
      const text = normalize(current.textContent);
      if (
        current.matches?.("section,main,article,div") &&
        text.includes("1. services") &&
        text.includes("2. barbers") &&
        text.includes("3. available dates")
      ) return current;
      current = current.parentElement;
    }
    return heading.parentElement;
  }

  function servicesColumn(workspace) {
    const heading = [...workspace.querySelectorAll("h1,h2,h3,h4,[role='heading']")]
      .find(node => normalize(node.textContent) === "1. services");
    if (!heading) return null;

    let current = heading.parentElement;
    while (current && current !== workspace) {
      const text = normalize(current.textContent);
      if (text.includes("1. services") && !text.includes("2. barbers")) return current;
      current = current.parentElement;
    }
    return heading.parentElement;
  }

  function exactTextNode(root, text) {
    return [...root.querySelectorAll("h1,h2,h3,h4,h5,strong,b,p,span,div")]
      .find(node => normalize(node.textContent) === text &&
        ![...node.children].some(child => normalize(child.textContent) === text));
  }

  function categoryCard(titleNode, column) {
    let current = titleNode;
    while (current && current !== column) {
      const text = normalize(current.textContent);
      const hasButton = Boolean(current.querySelector("button,[role='button']"));
      if (hasButton && text.length < 220) return current;
      current = current.parentElement;
    }
    return titleNode.parentElement;
  }

  function countNode(card, expected) {
    return [...card.querySelectorAll("span,div,strong,b")]
      .find(node => normalize(node.textContent) === String(expected) && node.children.length === 0);
  }

  function descriptionNode(card, expected) {
    return [...card.querySelectorAll("p,span,div")]
      .find(node => normalize(node.textContent) === expected && node.children.length === 0);
  }

  function serviceRows(card) {
    const selectors = [
      "[data-service-slug]", "[data-service]", "[data-slug]",
      "[data-variant-id]", "[data-service-id]", "li", "article"
    ].join(",");
    const rows = [...card.querySelectorAll(selectors)].filter(node => {
      if (node === card) return false;
      if (node.querySelector("h1,h2,h3,h4") && normalize(node.textContent).includes("other services")) return false;
      const text = normalize(node.textContent);
      return text.length > 2 && text.length < 300;
    });
    return rows.filter(node => !rows.some(other => other !== node && other.contains(node)));
  }

  function contentHost(card, rows) {
    if (rows.length) {
      const parent = rows[0].parentElement;
      if (rows.every(row => row.parentElement === parent)) return parent;
    }
    const candidates = [...card.children].filter(child =>
      !normalize(child.textContent).startsWith("finishing & care") &&
      !normalize(child.textContent).startsWith("other services")
    );
    return candidates[candidates.length - 1] || card;
  }

  function moveOtherRows(finishingCard, otherCard) {
    const otherRows = serviceRows(otherCard);
    if (!otherRows.length) return 0;

    const finishingRows = serviceRows(finishingCard);
    const host = contentHost(finishingCard, finishingRows);
    let moved = 0;
    for (const row of otherRows) {
      if (row.closest("[data-pc-merged-finishing-card='true']")) continue;
      row.dataset.pcMovedOtherService = "true";
      host.appendChild(row);
      moved += 1;
    }
    return moved;
  }

  function apply() {
    const workspace = generalWorkspace();
    if (!workspace) return false;
    const column = servicesColumn(workspace);
    if (!column) return false;

    const finishingTitle = exactTextNode(column, "finishing & care");
    const otherTitle = exactTextNode(column, "other services");
    if (!finishingTitle || !otherTitle) return false;

    const finishingCard = categoryCard(finishingTitle, column);
    const otherCard = categoryCard(otherTitle, column);
    if (!finishingCard || !otherCard || finishingCard === otherCard) return false;

    finishingCard.dataset.pcMergedFinishingCard = "true";

    const description = descriptionNode(finishingCard, "detailing and finishing services");
    if (description) description.textContent = "Detailing, finishing, and additional services";

    const count = countNode(finishingCard, 3);
    if (count) {
      count.textContent = "5";
      count.dataset.pcMergedCount = "true";
    }

    let moved = moveOtherRows(finishingCard, otherCard);

    // If the accordion content is lazy-rendered, open the hidden source temporarily,
    // transfer the two service rows, and then close/remove the source category.
    if (moved === 0 && otherCard.dataset.pcMergeAttempted !== "true") {
      otherCard.dataset.pcMergeAttempted = "true";
      const toggle = otherCard.querySelector("button,[role='button']");
      if (toggle) {
        toggle.click();
        setTimeout(() => {
          const transferred = moveOtherRows(finishingCard, otherCard);
          if (transferred > 0) otherCard.dataset.pcOtherServicesCard = "merged";
        }, 80);
      }
    }

    const finishingRows = serviceRows(finishingCard);
    if (moved >= 2 || finishingRows.length >= 5) {
      otherCard.dataset.pcOtherServicesCard = "merged";
    }

    // Safe visual fallback for category systems whose details render in a shared panel.
    // The category is hidden only after its count and label are represented by the merged card.
    if (!otherCard.querySelector("[data-service-slug],[data-service],[data-variant-id],li,article")) {
      otherCard.dataset.pcOtherServicesCard = "merged";
    }

    document.documentElement.dataset.pcFinishingOtherMerged = "true";
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

  document.addEventListener("click", schedule, true);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule, { once: true });
  } else {
    schedule();
  }
  window.addEventListener("load", schedule, { once: true });
  [100,350,900,1800,3500].forEach(delay => setTimeout(schedule, delay));
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList:true, subtree:true });
  setTimeout(() => observer.disconnect(), 25000);
})();
