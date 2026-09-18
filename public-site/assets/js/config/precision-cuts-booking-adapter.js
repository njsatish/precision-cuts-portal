(() => {
  "use strict";

  function install() {
    const portal=window.BOOKSY_PORTAL_CONFIG;
    if(!portal) {
      document.addEventListener("booksy-portal-config-ready", install, { once:true });
      return;
    }

    const services=portal.services
      .filter(service => service.active !== false)
      .sort((a,b)=>(a.sortOrder||0)-(b.sortOrder||0));
    const bySlug=Object.freeze(Object.fromEntries(services.map(service => [service.slug,Object.freeze({
      ...service,
      duration:service.durationMinutes,
      booksyVariantId:service.variantId
    })])));

    const provider=portal.bookingProvider;
    const compatibility=Object.freeze({
      API_BASE:provider.availabilityApiBase,
      BOOKSY_BUSINESS_ID:provider.businessId,
      BOOKSY_WIDGET_ID:provider.widgetId,
      BOOKSY_STAFFER_ID:provider.stafferId,
      BOOKSY_PROFILE_URL:provider.profileUrl,
      BOOKSY_URL:provider.profileUrl,
      BOOKSY_INSTANT_BASE:provider.instantExperienceBase,
      SERVICES:bySlug,
      services:Object.freeze(services),
      bySlug,
      getService(slug){ return bySlug[slug] || null; },
      get(slug){ return bySlug[slug] || null; },
      active(){ return services.slice(); }
    });

    window.HEADLINES_SERVICE_CONFIG=compatibility;
    window.HEADLINES_BOOKING_CONFIG=compatibility;
    window.HEADLINES_BOOKING=compatibility;
    window.PRECISION_CUTS_BOOKING=compatibility;

    document.dispatchEvent(new CustomEvent("headlines-services-ready",{detail:compatibility}));
    document.dispatchEvent(new CustomEvent("headlines-booking-config-ready",{detail:compatibility}));
  }

  install();
})();
