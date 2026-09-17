(() => {
  "use strict";

  function start() {
    const config=window.BOOKSY_PORTAL_CONFIG;
    if(!config) {
      document.addEventListener("booksy-portal-config-ready",start,{once:true});
      return;
    }

    const provider=config.bookingProvider || {};
    const widgetId=String(provider.widgetId || "");
    if(widgetId !== "97909") {
      console.error("Precision Cuts widget ID must be 97909.");
      return;
    }

    const widgetParams=new URLSearchParams({
      id:widgetId,
      businessId:"",
      appointmentId:"",
      lang:provider.language || "en",
      country:provider.country || "us",
      mode:"dialog",
      theme:"default",
      uniqueId:"precision-cuts-home"
    });
    const widgetUrl=`https://booksy.com/widget-2021/index.html?${widgetParams}`;

    function markButton(element) {
      if(!(element instanceof HTMLAnchorElement)) return;

      // Booksy's launcher can intercept this same-page link. If interception is
      // unavailable, the browser follows the URL in the current tab.
      element.href=widgetUrl;
      element.removeAttribute("target");
      element.removeAttribute("rel");
      element.setAttribute("data-booksy-widget-button","");
      element.setAttribute("data-booksy-business-id",widgetId);
      element.setAttribute("data-booksy-mode","dialog");
      element.setAttribute("aria-label","Book Precision Cuts on Booksy");

      element.addEventListener("click",event=>{
        // Give the official Booksy script first opportunity to handle the click.
        // Keep the interaction in the current page and avoid forced new tabs.
        if(element.target === "_blank") element.removeAttribute("target");
      });
    }

    [...document.querySelectorAll("a")]
      .filter(element=>{
        const value=String(element.textContent || "").replace(/\s+/g," ").trim().toLowerCase();
        const href=element.getAttribute("href") || "";
        return value === "book on booksy"
          || value === "book now"
          || /widget-2021|booksy\.com\/widget/.test(href)
          || element.hasAttribute("data-booksy-widget-button");
      })
      .forEach(markButton);

    document.documentElement.setAttribute("data-precision-booksy-widget",widgetId);
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded",start,{once:true})
    : start();
})();
