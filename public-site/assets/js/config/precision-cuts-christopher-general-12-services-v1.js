(() => {
  "use strict";

  const CHRISTOPHER = "christopher-meadows";
  const HIDDEN = new Set([
    "christopher-mens-haircut",
    "christopher-buzz-cut",
    "christopher-beard-trim",
    "christopher-edge-up",
    "christopher-hair-wash",
    "christopher-facial"
  ]);
  const LABELS = new Map([
    ["christopher-beard-shaping", "Beard Trim / Beard Shaping"],
    ["christopher-line-up", "Line Up / Edge Up"],
    ["christopher-eyebrow-shaping", "Eyebrow Shaping / Hair Wash"]
  ]);
  const NAME_TO_SLUG = new Map([
    ["haircut", "christopher-haircut"],
    ["men's haircut", "christopher-mens-haircut"],
    ["mens haircut", "christopher-mens-haircut"],
    ["haircut & beard", "christopher-haircut-beard"],
    ["haircut and beard", "christopher-haircut-beard"],
    ["kid's haircut", "christopher-kids-haircut"],
    ["kids haircut", "christopher-kids-haircut"],
    ["skin fade", "christopher-skin-fade"],
    ["buzz cut", "christopher-buzz-cut"],
    ["beard trim", "christopher-beard-trim"],
    ["beard shaping", "christopher-beard-shaping"],
    ["line up", "christopher-line-up"],
    ["edge up", "christopher-edge-up"],
    ["head shave", "christopher-head-shave"],
    ["head shave & beard trim", "christopher-head-shave-beard-trim"],
    ["head shave and beard trim", "christopher-head-shave-beard-trim"],
    ["hot towel shave", "christopher-hot-towel-shave"],
    ["straight razor shave", "christopher-straight-razor-shave"],
    ["eyebrow shaping", "christopher-eyebrow-shaping"],
    ["hair wash", "christopher-hair-wash"],
    ["facial", "christopher-facial"],
    ["full service", "christopher-full-service"]
  ]);

  const normalize = value => String(value || "")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  function bookingWorkspace() {
    const headings = [...document.querySelectorAll("h1,h2,h3,h4,[role='heading']")];
    const intro = headings.find(node => normalize(node.textContent) === "choose a service, barber, and time.");
    if (intro) {
      let current = intro;
      while (current && current !== document.body) {
        const text = normalize(current.textContent);
        if (
          current.matches?.("section,main,article,div") &&
          text.includes("1. services") && text.includes("2. barbers") && text.includes("3. available dates")
        ) return current;
        current = current.parentElement;
      }
    }
    const servicesHeading = headings.find(node => /^1\.\s*services$/.test(normalize(node.textContent)));
    return servicesHeading?.closest("section,article,main,div")?.parentElement || null;
  }

  function servicesColumn(workspace) {
    const heading = [...workspace.querySelectorAll("h1,h2,h3,h4,[role='heading']")]
      .find(node => /^1\.\s*services$/.test(normalize(node.textContent)));
    if (!heading) return null;
    let current = heading.parentElement;
    while (current && current !== workspace) {
      const text = normalize(current.textContent);
      if (text.includes("1. services") && !text.includes("2. barbers")) return current;
      current = current.parentElement;
    }
    return heading.parentElement;
  }

  function christopherSelected(workspace) {
    const select = [...workspace.querySelectorAll("select")].find(node =>
      [...node.options].some(option => normalize(option.textContent).includes("christopher meadows"))
    );
    if (select) {
      const chosen = normalize(select.selectedOptions?.[0]?.textContent || select.value);
      if (chosen.includes("christopher meadows") || select.value === CHRISTOPHER) return true;
    }

    const candidates = workspace.querySelectorAll(
      `[data-barber-id="${CHRISTOPHER}"],`+
      `[data-value="${CHRISTOPHER}"],`+
      `[value="${CHRISTOPHER}"],`+
      `[data-id="${CHRISTOPHER}"],`+
      `[data-slug="${CHRISTOPHER}"]`
    );
    return [...candidates].some(node => {
      const aria = node.getAttribute("aria-selected") === "true" || node.getAttribute("aria-pressed") === "true";
      const data = node.dataset.selected === "true" || node.dataset.active === "true";
      const klass = /(^|\s)(selected|is-selected|active|is-active)(\s|$)/i.test(node.className || "");
      return aria || data || klass;
    });
  }

  function slugFromElement(element) {
    const nodes = [element, ...element.querySelectorAll("[data-slug],[data-service],[data-service-slug],[value]")];
    for (const node of nodes) {
      const values = [node.dataset?.slug, node.dataset?.service, node.dataset?.serviceSlug, node.getAttribute?.("value")];
      for (const value of values) {
        if (value && /^christopher-/.test(value)) return value;
      }
    }
    const text = normalize(element.textContent)
      .replace(/\$\d+(?:\.\d{2})?/g, "")
      .replace(/\b\d+\s*min(?:utes?)?\b/g, "")
      .replace(/\s+/g, " ")
      .trim();
    for (const [name, slug] of NAME_TO_SLUG) {
      if (text === name || text.startsWith(name + " ")) return slug;
    }
    return "";
  }

  function serviceControls(column) {
    const candidates = [...column.querySelectorAll("button,[role='button'],label,option,a")];
    return candidates.filter(node => {
      if (node.closest("#pc-home-booking-modal")) return false;
      const slug = slugFromElement(node);
      if (!slug) return false;
      return !candidates.some(other => other !== node && node.contains(other) && slugFromElement(other) === slug);
    });
  }

  function replaceVisibleName(control, oldSlug, newLabel) {
    if (!control.dataset.pcOriginalHtml) control.dataset.pcOriginalHtml = control.innerHTML;
    const oldNames = [...NAME_TO_SLUG].filter(([,slug]) => slug === oldSlug).map(([name]) => name);
    const walker = document.createTreeWalker(control, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const normalized = normalize(node.nodeValue);
      const match = oldNames.find(name => normalized === name || normalized.startsWith(name + " "));
      if (!match) continue;
      const raw = node.nodeValue;
      const index = raw.toLowerCase().indexOf(match);
      node.nodeValue = index >= 0 ? raw.slice(0,index) + newLabel + raw.slice(index + match.length) : newLabel;
      return;
    }
    control.setAttribute("aria-label", newLabel);
  }

  function restore(column) {
    column.querySelectorAll("[data-pc-christopher-general-hidden='true']").forEach(node => {
      node.style.removeProperty("display");
      node.hidden = false;
      delete node.dataset.pcChristopherGeneralHidden;
    });
    column.querySelectorAll("[data-pc-original-html]").forEach(node => {
      node.innerHTML = node.dataset.pcOriginalHtml;
      delete node.dataset.pcOriginalHtml;
      delete node.dataset.pcChristopherGeneralLabel;
    });
    delete column.dataset.pcChristopherGeneral12;
  }

  function apply() {
    const workspace = bookingWorkspace();
    if (!workspace || workspace.closest("#pc-home-booking-modal")) return false;
    const column = servicesColumn(workspace);
    if (!column) return false;

    if (!christopherSelected(workspace)) {
      if (column.dataset.pcChristopherGeneral12 === "true") restore(column);
      return false;
    }

    const controls = serviceControls(column);
    for (const control of controls) {
      const slug = slugFromElement(control);
      if (HIDDEN.has(slug)) {
        control.dataset.pcChristopherGeneralHidden = "true";
        control.hidden = true;
        control.style.setProperty("display", "none", "important");
        continue;
      }
      const label = LABELS.get(slug);
      if (label) {
        control.dataset.pcChristopherGeneralLabel = label;
        replaceVisibleName(control, slug, label);
      }
    }

    column.dataset.pcChristopherGeneral12 = "true";
    workspace.dataset.pcChristopherGeneralCount = "12";
    document.documentElement.dataset.pcChristopherGeneral12 = "true";
    return true;
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; apply(); });
  }

  document.addEventListener("click", schedule, true);
  document.addEventListener("change", schedule, true);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule, { once: true });
  else schedule();
  window.addEventListener("load", schedule, { once: true });
  [100,350,900,1800,3500].forEach(delay => setTimeout(schedule, delay));
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList:true, subtree:true, attributes:true, attributeFilter:["class","aria-selected","aria-pressed","data-selected","data-active"] });
  setTimeout(() => observer.disconnect(), 30000);
})();
