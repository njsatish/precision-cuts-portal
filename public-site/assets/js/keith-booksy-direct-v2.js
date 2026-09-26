(() => {
  "use strict";

  const WIDGET_SRC = "https://booksy.com/widget/code.js?id=97909&country=us&lang=en";
  const BOOKSY_PAGE = "https://booksy.com/en-us/97909_precision-cuts_barber-shop_134579_roanoke";
  let generatedLauncher = null;
  let widgetRequested = false;

  const labelOf = element =>
    (element?.textContent || element?.value || "").replace(/\s+/g, " ").trim();

  const isKeithButton = element =>
    /book with keith/i.test(labelOf(element)) ||
    element?.dataset?.keithDirectBooksy === "v3";

  const findLiveAvailabilityArea = () => {
    const heading = [...document.querySelectorAll("main h1, main h2, main h3, main h4")]
      .find(node => /live availability/i.test(node.textContent));
    return heading?.closest("section, article, [class*='availability'], [class*='booking']") || heading?.parentElement || document.querySelector("main");
  };

  const ensureKeithButton = () => {
    let button = [...document.querySelectorAll("a, button")].find(isKeithButton);
    if (!button) {
      const area = findLiveAvailabilityArea();
      if (!area) return null;
      button = document.createElement("button");
      button.type = "button";
      button.textContent = "Book with Keith";
      button.className = "pc-book-with-keith-v3";
      area.appendChild(button);
    }

    button.style.removeProperty("display");
    button.style.removeProperty("visibility");
    button.style.removeProperty("position");
    button.style.removeProperty("left");
    button.style.removeProperty("width");
    button.style.removeProperty("height");
    button.removeAttribute("aria-hidden");
    button.dataset.keithDirectBooksy = "v3";
    button.classList.add("pc-book-with-keith-v3");
    return button;
  };

  const findGeneratedLauncher = () => {
    const candidates = [...document.querySelectorAll("a, button, input[type='button'], input[type='submit']")];
    return candidates.find(element => {
      if (isKeithButton(element)) return false;
      const label = labelOf(element);
      const href = element.getAttribute("href") || "";
      return /^book now$/i.test(label) || /booksy\.com/i.test(href);
    }) || null;
  };

  const concealOnlyGeneratedLauncher = element => {
    if (!element || isKeithButton(element)) return;
    generatedLauncher = element;
    element.style.position = "fixed";
    element.style.left = "-10000px";
    element.style.top = "0";
    element.style.width = "1px";
    element.style.height = "1px";
    element.style.overflow = "hidden";
    element.style.opacity = "0";
    element.style.pointerEvents = "none";
    element.setAttribute("aria-hidden", "true");
  };

  const watchForGeneratedLauncher = () => {
    const existing = findGeneratedLauncher();
    if (existing) concealOnlyGeneratedLauncher(existing);

    const observer = new MutationObserver(() => {
      const found = findGeneratedLauncher();
      if (found) {
        concealOnlyGeneratedLauncher(found);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 15000);
  };

  const preloadWidget = () => {
    if (widgetRequested) return;
    widgetRequested = true;
    watchForGeneratedLauncher();

    const host = document.createElement("div");
    host.id = "pc-keith-booksy-preload-v3";
    host.hidden = true;
    document.body.appendChild(host);

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = WIDGET_SRC;
    script.async = true;
    script.dataset.keithBooksyDirect = "v3";
    host.appendChild(script);
  };

  const openBooksy = event => {
    event.preventDefault();
    event.stopImmediatePropagation();

    generatedLauncher = generatedLauncher && document.contains(generatedLauncher)
      ? generatedLauncher
      : findGeneratedLauncher();

    if (generatedLauncher) {
      generatedLauncher.style.pointerEvents = "auto";
      generatedLauncher.click();
      generatedLauncher.style.pointerEvents = "none";
      return;
    }

    window.location.assign(BOOKSY_PAGE);
  };

  const bind = () => {
    const button = ensureKeithButton();
    if (!button) return false;
    if (button.dataset.keithDirectBound !== "v3") {
      button.dataset.keithDirectBound = "v3";
      button.addEventListener("click", openBooksy, true);
    }
    preloadWidget();
    return true;
  };

  if (!bind()) {
    const observer = new MutationObserver(() => {
      if (bind()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 15000);
  }
})();
