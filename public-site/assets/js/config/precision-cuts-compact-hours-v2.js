(() => {
  "use strict";
  const clean = value => String(value || "").replace(/\s+/g, " ").trim();
  const lower = value => clean(value).toLowerCase();
  const weekdays = ["tuesday", "wednesday", "thursday", "friday"];

  function directCells(row) {
    return [...row.children].filter(cell => /^(TH|TD)$/.test(cell.tagName));
  }

  function compactTable(table) {
    if (table.dataset.pcHoursCompacted === "true") return;
    const rows = [...table.querySelectorAll("tr")];
    const byDay = new Map();
    rows.forEach(row => {
      const cells = directCells(row);
      if (cells[0]) byDay.set(lower(cells[0].textContent), { row, cells });
    });
    const entries = weekdays.map(day => byDay.get(day));
    if (entries.some(entry => !entry || entry.cells.length < 2)) return;
    const times = entries.map(entry => clean(entry.cells[1].textContent));
    if (times.some(time => !time || /undefined|null/i.test(time))) return;
    if (!times.every(time => time === times[0])) return;
    entries[0].cells[0].textContent = "Tuesday-Friday";
    entries[0].cells[1].textContent = times[0];
    entries.slice(1).forEach(entry => entry.row.remove());
    table.dataset.pcHoursCompacted = "true";
  }

  function compactList(container) {
    if (container.dataset.pcHoursCompacted === "true") return;
    const entries = weekdays.map(day => [...container.children].find(item => lower(item.textContent).startsWith(day)));
    if (entries.some(item => !item)) return;
    const details = entries.map(item => {
      const children = [...item.children];
      const time = clean(children.at(-1)?.textContent || "");
      return { item, children, time };
    });
    if (details.some(entry => !entry.time || /undefined|null/i.test(entry.time))) return;
    if (!details.every(entry => entry.time === details[0].time)) return;
    const first = details[0];
    if (first.children.length >= 2) {
      first.children[0].textContent = "Tuesday-Friday";
      first.children.at(-1).textContent = first.time;
    } else {
      first.item.textContent = `Tuesday-Friday ${first.time}`;
    }
    details.slice(1).forEach(entry => entry.item.remove());
    container.dataset.pcHoursCompacted = "true";
  }

  function apply() {
    document.querySelectorAll("table").forEach(compactTable);
    const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,strong")]
      .filter(node => /business hours|hours of operation/i.test(node.textContent));
    headings.forEach(heading => {
      const section = heading.closest("section,article") || heading.parentElement;
      if (!section) return;
      const candidates = [...section.querySelectorAll("ul,ol,div")]
        .filter(node => weekdays.every(day => lower(node.textContent).includes(day)))
        .sort((a,b) => a.children.length - b.children.length);
      if (candidates[0]) compactList(candidates[0]);
    });
  }

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; apply(); });
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", apply, {once:true}) : apply();
  window.addEventListener("load", apply, {once:true});
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, {childList:true, subtree:true});
  setTimeout(() => observer.disconnect(), 5000);
})();
