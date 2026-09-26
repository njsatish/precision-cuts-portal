(() => {
  "use strict";

  const text = node => (node?.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
  const visible = node => !!(node && (node.offsetWidth || node.offsetHeight || node.getClientRects().length));

  const findHeading = () => [...document.querySelectorAll("h1,h2,h3,p,span")]
    .find(node => visible(node) && /live booksy availability|choose a service, barber, and time/.test(text(node)));

  const findShell = heading => {
    let node = heading;
    while (node && node !== document.body) {
      const content = text(node);
      if (
        content.includes("services") &&
        content.includes("barbers") &&
        (content.includes("available dates") || content.includes("availability"))
      ) return node;
      node = node.parentElement;
    }
    return null;
  };

  const decorate = () => {
    const headingText = findHeading();
    if (!headingText) return false;
    const shell = findShell(headingText);
    if (!shell) return false;

    shell.classList.add("pc-booking-dark-shell-v1");

    const heading = headingText.closest("section,header,div") || headingText.parentElement;
    heading?.classList.add("pc-booking-heading-v1");

    const titleNodes = [...shell.querySelectorAll("h1,h2,h3,h4")];
    const servicesTitle = titleNodes.find(node => /^1\.?\s*services$|^services$/.test(text(node)));
    const barbersTitle = titleNodes.find(node => /^2\.?\s*barbers$|^barbers$/.test(text(node)));
    const datesTitle = titleNodes.find(node => /^3\.?\s*available dates$|^available dates$/.test(text(node)));
    const titles = [servicesTitle, barbersTitle, datesTitle].filter(Boolean);

    const columns = titles.map(title => {
      title.classList.add("pc-column-title-v1");
      return title.closest("section,article,[class*='column'],[class*='panel'],[class*='step']") || title.parentElement;
    }).filter(Boolean);

    columns.forEach(column => column.classList.add("pc-booking-column-v1"));

    const grid = columns.length >= 2
      ? columns[0].parentElement
      : shell.querySelector("[class*='grid'],[class*='steps'],[class*='booking']");
    if (grid && grid !== shell) grid.classList.add("pc-booking-grid-v1");

    columns.forEach(column => {
      [...column.querySelectorAll("button,a,label,li,[role='button'],[class*='option'],[class*='service'],[class*='barber']")]
        .filter(node => node !== column && !node.classList.contains("pc-column-title-v1"))
        .forEach(node => node.classList.add("pc-booking-row-v1"));
    });

    shell.dataset.darkShellLightCardsApplied = "v1";
    return true;
  };

  if (!decorate()) {
    const observer = new MutationObserver(() => { if (decorate()) observer.disconnect(); });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 20000);
  }
})();
