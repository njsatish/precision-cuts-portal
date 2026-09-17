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

    const params=new URLSearchParams({
      id:widgetId,
      businessId:"",
      appointmentId:"",
      lang:provider.language || "en",
      country:provider.country || "us",
      mode:"dialog",
      theme:"default",
      uniqueId:`precision-cuts-${Date.now()}`
    });
    const widgetUrl=`https://booksy.com/widget-2021/index.html?${params}`;

    const candidates=[...document.querySelectorAll("a,button")].filter(element => {
      const value=String(element.textContent || "").replace(/\s+/g," ").trim().toLowerCase();
      const href=element.getAttribute?.("href") || "";
      return value === "book on booksy"
        || value === "book now"
        || /widget-2021|booksy\.com\/widget/.test(href)
        || element.hasAttribute?.("data-booksy-widget-button");
    });

    candidates.forEach(element => {
      if(!(element instanceof HTMLAnchorElement)) return;
      element.href=widgetUrl;
      element.target="_blank";
      element.rel="noopener noreferrer";
      element.setAttribute("data-booksy-widget-button","");
      element.setAttribute("data-booksy-business-id",widgetId);
      element.setAttribute("data-booksy-profile-url",provider.profileUrl);
      element.setAttribute("aria-label","Book Precision Cuts on Booksy");
    });

    // If the official Booksy launcher script is available, it may intercept
    // the marked link and open a dialog. The href remains a functional secure
    // fallback if dialog interception is unavailable.
    document.documentElement.setAttribute("data-precision-booksy-widget",widgetId);
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded",start,{once:true})
    : start();
})();
