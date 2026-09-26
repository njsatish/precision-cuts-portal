(() => {
  "use strict";

  const fallback = "https://booksy.com/en-us/97909_precision-cuts_barber-shop_134579_roanoke";

  const textOf = element =>
    (element?.textContent || element?.value || "").replace(/\s+/g, " ").trim();

  const findBookingArea = () => {
    const heading = [...document.querySelectorAll("main h1, main h2, main h3, main h4")]
      .find(node => /live availability/i.test(node.textContent));
    return heading?.closest("section, article, [class*='availability'], [class*='booking']") || heading?.parentElement || document.querySelector("main");
  };

  const ensureVisibleTrigger = () => {
    let trigger = [...document.querySelectorAll("a, button")]
      .find(node => /book with keith/i.test(textOf(node)));

    if (!trigger) {
      const area = findBookingArea();
      if (!area) return null;
      trigger = document.createElement("a");
      trigger.textContent = "Book with Keith";
      area.appendChild(trigger);
    }

    if (trigger.tagName !== "A") {
      const anchor = document.createElement("a");
      anchor.className = trigger.className;
      anchor.textContent = "Book with Keith";
      trigger.replaceWith(anchor);
      trigger = anchor;
    }

    trigger.href = fallback;
    trigger.removeAttribute("target");
    trigger.removeAttribute("rel");
    trigger.dataset.booksyWidgetLaunchKeith = "true";
    trigger.classList.add("pc-book-with-keith-v6");
    return trigger;
  };

  const findOfficialBooksyControl = trigger => {
    const candidates = [
      document.querySelector("[data-booksy-widget-button]"),
      document.querySelector(".booksy-widget-button"),
      document.querySelector("[class*='booksy'][class*='button']")
    ].filter(Boolean).filter(candidate => candidate !== trigger);

    if (candidates.length) return candidates[0];

    return [...document.querySelectorAll("a, button, input[type='button'], input[type='submit']")]
      .find(candidate => {
        if (candidate === trigger) return false;
        const text = textOf(candidate);
        const href = candidate.getAttribute("href") || "";
        return /^book now$/i.test(text) || /booksy\.com/i.test(href);
      }) || null;
  };

  const markGeneratedControl = trigger => {
    const control = findOfficialBooksyControl(trigger);
    if (control) control.classList.add("pc-booksy-generated-control-v6");
    return control;
  };

  function launch(event) {
    const trigger = event.currentTarget;
    const control = markGeneratedControl(trigger);

    if (control) {
      event.preventDefault();
      control.click();
      return;
    }

    /* Match Headlines behavior: keep the profile fallback only when the
       official script has not exposed its widget control. */
    if (!trigger.href) trigger.href = fallback;
  }

  const bind = () => {
    const trigger = ensureVisibleTrigger();
    if (!trigger) return false;
    markGeneratedControl(trigger);

    if (trigger.dataset.booksyExactBound !== "v6") {
      trigger.dataset.booksyExactBound = "v6";
      trigger.addEventListener("click", launch);
    }
    return true;
  };

  const observer = new MutationObserver(() => {
    const trigger = ensureVisibleTrigger();
    if (trigger) markGeneratedControl(trigger);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.setTimeout(() => observer.disconnect(), 20000);

  if (!bind()) {
    const bindObserver = new MutationObserver(() => {
      if (bind()) bindObserver.disconnect();
    });
    bindObserver.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(() => bindObserver.disconnect(), 15000);
  }
})();
