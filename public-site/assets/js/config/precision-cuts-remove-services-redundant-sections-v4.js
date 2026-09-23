(() => {
  "use strict";

  const normalize = value => String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  const visibleElements = root => [...root.querySelectorAll("h1,h2,h3,h4,p,span,strong,small")];

  function smallestContainer(node, validator) {
    const candidates = [];
    let current = node;
    while (current && current !== document.documentElement) {
      if (current.matches?.("section,article,div") && validator(current)) candidates.push(current);
      if (current.matches?.("main")) break;
      current = current.parentElement;
    }
    candidates.sort((a,b) => a.querySelectorAll("*").length - b.querySelectorAll("*").length);
    return candidates[0] || null;
  }

  function protect(node) {
    return Boolean(node?.matches?.("main,body,html") || node?.querySelector?.("#pc-home-booking-modal,[data-book-barbers]"));
  }

  function removeAllServices(root=document) {
    const heading = visibleElements(root).find(node => normalize(node.textContent) === "all precision cuts services");
    if (!heading) return false;
    const categories = ["haircuts","combos","beard & shave","finishing & care","other services"];
    const container = smallestContainer(heading, node => {
      const text = normalize(node.textContent);
      return categories.every(label => text.includes(label));
    });
    if (!container || protect(container)) return false;
    container.remove();
    document.documentElement.dataset.pcAllServicesRemoved = "true";
    return true;
  }

  function removeBarberFirst(root=document) {
    const heading = visibleElements(root).find(node => normalize(node.textContent) === "book by barber");
    if (!heading) return false;
    const container = smallestContainer(heading, node => {
      const text = normalize(node.textContent);
      return text.includes("option 2") &&
        text.includes("start with a barber") &&
        text.includes("available dates") &&
        text.includes("services");
    });
    if (!container || protect(container)) return false;
    container.remove();
    document.documentElement.dataset.pcBarberFirstRemoved = "true";
    return true;
  }

  function scanRoot(root=document) {
    let changed = false;
    changed = removeAllServices(root) || changed;
    changed = removeBarberFirst(root) || changed;
    for (const element of root.querySelectorAll?.("*") || []) {
      if (element.shadowRoot) changed = scanRoot(element.shadowRoot) || changed;
    }
    return changed;
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      scanRoot(document);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule, {once:true});
  } else {
    schedule();
  }
  window.addEventListener("load", schedule, {once:true});
  [100,300,700,1500,3000,6000,10000].forEach(delay => setTimeout(schedule, delay));

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, {childList:true,subtree:true});
  setTimeout(() => observer.disconnect(), 20000);
})();
