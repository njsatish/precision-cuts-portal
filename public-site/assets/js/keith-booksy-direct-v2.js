(() => {
  "use strict";

  const WIDGET_SRC = "https://booksy.com/widget/code.js?id=97909&country=us&lang=en";
  let launcher = null;
  let loadStarted = false;

  const isVisible = element => {
    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden";
  };

  const findBooksyLauncher = () => {
    const candidates = [...document.querySelectorAll("a, button, input[type='button'], input[type='submit']")]
      .filter(element => !element.matches("[data-keith-direct-booksy]"));

    return candidates.find(element => {
      const text = (element.textContent || element.value || "").replace(/\s+/g, " ").trim();
      const href = element.getAttribute("href") || "";
      return /book now/i.test(text) || /booksy\.com/i.test(href);
    }) || null;
  };

  const hideGeneratedLauncher = element => {
    if (!element) return;
    launcher = element;
    const wrapper = element.closest("div, span") || element;
    wrapper.style.position = "fixed";
    wrapper.style.left = "-10000px";
    wrapper.style.top = "0";
    wrapper.style.width = "1px";
    wrapper.style.height = "1px";
    wrapper.style.overflow = "hidden";
    wrapper.setAttribute("aria-hidden", "true");
  };

  const observeLauncher = () => {
    const existing = findBooksyLauncher();
    if (existing) {
      hideGeneratedLauncher(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const generated = findBooksyLauncher();
      if (generated) {
        hideGeneratedLauncher(generated);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 15000);
  };

  const preloadBooksy = () => {
    if (loadStarted) return;
    loadStarted = true;
    observeLauncher();

    const host = document.createElement("div");
    host.id = "pc-keith-booksy-preload-v2";
    host.style.position = "fixed";
    host.style.left = "-10000px";
    host.style.top = "0";
    host.style.width = "1px";
    host.style.height = "1px";
    host.style.overflow = "hidden";
    host.setAttribute("aria-hidden", "true");
    document.body.appendChild(host);

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = WIDGET_SRC;
    script.async = true;
    script.dataset.keithBooksyDirect = "v2";
    host.appendChild(script);
  };

  const openBooksy = event => {
    event.preventDefault();
    event.stopImmediatePropagation();

    launcher = launcher && document.contains(launcher) ? launcher : findBooksyLauncher();
    if (launcher) {
      launcher.click();
      return;
    }

    /* Booksy has not finished loading. Keep this fallback on the same tab. */
    window.location.href = "https://booksy.com/en-us/97909_precision-cuts_barber-shop_134579_roanoke";
  };

  const bindKeithButtons = () => {
    const buttons = [...document.querySelectorAll("a, button")]
      .filter(element => /book with keith/i.test(element.textContent.trim()));
    if (!buttons.length) return false;

    buttons.forEach(button => {
      if (button.dataset.keithDirectBooksy === "v2") return;
      button.dataset.keithDirectBooksy = "v2";
      button.addEventListener("click", openBooksy, true);
    });
    return true;
  };

  const initialize = () => {
    preloadBooksy();
    if (bindKeithButtons()) return true;
    return false;
  };

  if (!initialize()) {
    const observer = new MutationObserver(() => {
      if (bindKeithButtons()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 15000);
  }
})();
