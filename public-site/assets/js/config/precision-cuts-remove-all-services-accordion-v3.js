(() => {
  "use strict";

  const headingText = "all precision cuts services";
  const categoryTexts = [
    "haircuts",
    "combos",
    "beard & shave",
    "finishing & care",
    "other services"
  ];

  const normalize = value => String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  function allElements(root = document) {
    const elements = [...root.querySelectorAll("*")];
    for (const element of [...elements]) {
      if (element.shadowRoot) elements.push(...allElements(element.shadowRoot));
    }
    return elements;
  }

  function exactElements(text) {
    return allElements().filter(element => {
      if (normalize(element.textContent) !== text) return false;
      return ![...element.children].some(child => normalize(child.textContent) === text);
    });
  }

  function ancestors(node) {
    const output = [];
    let current = node;
    while (current && current !== document.documentElement) {
      output.push(current);
      current = current.parentElement;
    }
    return output;
  }

  function containsExact(root, text) {
    return [root, ...root.querySelectorAll("*")]
      .some(element => normalize(element.textContent) === text);
  }

  function protectedNode(node) {
    return node.matches?.("html,body,main") || Boolean(node.querySelector?.(
      "#pc-home-booking-modal,#pc-barber-first-comparison,[data-book-barbers],[data-book-services],[data-book-slots]"
    ));
  }

  function hide(node, reason) {
    if (!node || protectedNode(node)) return false;
    node.hidden = true;
    node.setAttribute("aria-hidden", "true");
    node.dataset.pcRedundantServicesRemoved = reason;
    node.style.setProperty("display", "none", "important");
    node.style.setProperty("visibility", "hidden", "important");
    node.style.setProperty("height", "0", "important");
    node.style.setProperty("min-height", "0", "important");
    node.style.setProperty("margin", "0", "important");
    node.style.setProperty("padding", "0", "important");
    node.style.setProperty("overflow", "hidden", "important");
    return true;
  }

  function findRow(labelElement) {
    let current = labelElement;
    while (current && current !== document.body) {
      const text = normalize(current.textContent);
      const childCount = current.querySelectorAll?.("*").length || 0;
      const isCandidate = current.matches?.("button,details,summary,article,li,[role='button'],div");
      if (isCandidate && childCount < 40 && text.length < 180) return current;
      current = current.parentElement;
    }
    return labelElement;
  }

  function removeVisibleAccordion() {
    const headings = exactElements(headingText);
    const labels = categoryTexts.map(text => exactElements(text)[0]).filter(Boolean);

    // Preferred path: find the smallest shared container containing the
    // heading and all five exact category labels, regardless of tag names.
    if (headings.length && labels.length === categoryTexts.length) {
      const required = [headings[0], ...labels];
      const candidates = ancestors(headings[0]).filter(node =>
        node.matches?.("section,article,div") &&
        required.every(item => node.contains(item)) &&
        !protectedNode(node)
      );
      candidates.sort((a, b) => a.querySelectorAll("*").length - b.querySelectorAll("*").length);
      if (candidates[0] && hide(candidates[0], "shared-container")) {
        document.documentElement.dataset.pcAllServicesAccordionRemoved = "shared-container";
        return true;
      }
    }

    // Fallback: hide the heading and each individual category row. This also
    // handles renderers where the heading and rows are separate siblings.
    let changed = false;
    for (const heading of headings) {
      const wrapper = heading.closest("header") || heading;
      changed = hide(wrapper, "heading") || changed;
    }
    for (const text of categoryTexts) {
      for (const label of exactElements(text)) {
        changed = hide(findRow(label), `row-${text.replace(/[^a-z]+/g, "-")}`) || changed;
      }
    }

    if (changed) {
      document.documentElement.dataset.pcAllServicesAccordionRemoved = "individual-elements";
    }
    return changed;
  }

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      removeVisibleAccordion();
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule, { once: true });
  } else {
    schedule();
  }
  window.addEventListener("load", schedule, { once: true });
  document.addEventListener("click", schedule, true);

  // Keep observing because the service renderer may rebuild the accordion
  // after config or theme scripts finish loading.
  new MutationObserver(schedule).observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true
  });

  [100, 300, 700, 1500, 3000, 6000].forEach(delay => setTimeout(schedule, delay));
})();
