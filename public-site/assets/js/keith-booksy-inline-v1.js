(() => {
  "use strict";

  const WIDGET_SRC = "https://booksy.com/widget/code.js?id=97909&country=us&lang=en";
  let widgetLoaded = false;

  const createPanel = () => {
    if (document.getElementById("keith-booksy-inline")) {
      return document.getElementById("keith-booksy-inline");
    }

    const section = document.createElement("section");
    section.id = "keith-booksy-inline";
    section.className = "pc-keith-booksy-inline";
    section.setAttribute("aria-labelledby", "keith-booksy-inline-title");
    section.innerHTML = `
      <div class="pc-keith-booksy-inline-head">
        <div>
          <p>Book with Keith</p>
          <h2 id="keith-booksy-inline-title">Choose Your Appointment</h2>
          <span>Use the Booksy booking widget below without leaving Keith's profile page.</span>
        </div>
        <button type="button" class="pc-keith-booksy-close" aria-label="Close Booksy booking panel">Close</button>
      </div>
      <div class="pc-keith-booksy-widget" id="keith-booksy-widget-host">
        <div class="pc-keith-booksy-loading">Loading Keith's Booksy booking options...</div>
      </div>`;

    const footer = document.querySelector("#shared-footer, footer");
    if (footer?.parentNode) footer.parentNode.insertBefore(section, footer);
    else document.querySelector("main")?.appendChild(section);

    section.querySelector(".pc-keith-booksy-close").addEventListener("click", () => {
      section.classList.remove("is-open");
    });
    return section;
  };

  const loadWidget = panel => {
    if (widgetLoaded) return;
    widgetLoaded = true;
    const host = panel.querySelector("#keith-booksy-widget-host");
    host.querySelector(".pc-keith-booksy-loading")?.remove();

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = WIDGET_SRC;
    script.async = true;
    script.dataset.keithBooksyWidget = "true";
    script.onerror = () => {
      widgetLoaded = false;
      host.innerHTML = `<p class="pc-keith-booksy-error">Booksy could not load. Please try again or use the Booksy booking link.</p>`;
    };
    host.appendChild(script);
  };

  const openPanel = event => {
    event?.preventDefault();
    const panel = createPanel();
    panel.classList.add("is-open");
    loadWidget(panel);
    window.setTimeout(() => panel.scrollIntoView({ behavior: "smooth", block: "start" }), 20);
  };

  const bind = () => {
    const candidates = [...document.querySelectorAll("a, button")].filter(element =>
      /book with keith/i.test(element.textContent.trim())
    );
    if (!candidates.length) return false;
    candidates.forEach(element => {
      if (element.dataset.keithInlineBooksyBound === "true") return;
      element.dataset.keithInlineBooksyBound = "true";
      element.addEventListener("click", openPanel);
    });
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
