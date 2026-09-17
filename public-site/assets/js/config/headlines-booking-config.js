(() => {
  "use strict";

  const registry = window.HEADLINES_SERVICE_CONFIG;
  if (!registry || !Array.isArray(registry.services)) {
    console.error("Headlines service configuration must load before booking configuration.");
    return;
  }

  const apiBase = "https://57z7wwag50.execute-api.us-east-1.amazonaws.com";
  const booksyUrl = registry.business?.booksyUrl
    || "https://booksy.com/en-us/94095_headlines_barber-shop_134579_roanoke";

  const services = Object.fromEntries(registry.services.map(service => {
    const availabilityPath = String(service.availabilityPath || `/availability/${service.slug}`);
    const availabilityUrl = `${apiBase}${availabilityPath}`;
    return [service.slug, Object.freeze({
      slug: service.slug,
      id: service.slug,
      name: service.shortName || service.name,
      shortName: service.shortName || service.name,
      fullName: service.name,
      description: service.description,
      serviceId: Number(service.serviceId),
      variantId: Number(service.variantId),
      duration: Number(service.durationMinutes),
      durationMinutes: Number(service.durationMinutes),
      price: Number(service.price),
      availabilityPath,
      endpoint: availabilityUrl,
      apiUrl: availabilityUrl,
      availabilityUrl
    })];
  }));

  const endpoints = Object.freeze(Object.fromEntries(
    Object.entries(services).map(([slug, service]) => [slug, service.availabilityUrl])
  ));

  const config = Object.freeze({
    apiBase,
    apiBaseUrl: apiBase,
    apiUrl: apiBase,
    availabilityApiBase: apiBase,
    availabilityBaseUrl: apiBase,
    endpoints,
    availabilityEndpoints: endpoints,
    booksyUrl,
    businessUrl: booksyUrl,
    businessId: Number(registry.business?.booksyBusinessId || 94095),
    booksyBusinessId: Number(registry.business?.booksyBusinessId || 94095),
    stafferId: 113042,
    services: Object.freeze(services),
    serviceList: Object.freeze(Object.values(services)),
    getService(slug) { return services[slug] || null; },
    getEndpoint(slug) { return endpoints[slug] || null; },
    getAvailabilityUrl(slug) { return endpoints[slug] || null; }
  });

  window.HEADLINES_BOOKING_CONFIG = config;

  /* HEADLINES-LEGACY-BOOKING-GLOBAL-V1-START */
  // booking.js reads this original uppercase configuration contract.
  window.HEADLINES_BOOKING = Object.freeze({
    API_BASE: config.apiBase,
    BOOKSY_URL: config.booksyUrl,
    BUSINESS_ID: config.booksyBusinessId,
    STAFFER_ID: config.stafferId,
    SERVICES: config.services
  });
  /* HEADLINES-LEGACY-BOOKING-GLOBAL-V1-END */

  window.HEADLINES_BOOKSY_CONFIG = config;
  window.HEADLINES_AVAILABILITY_ENDPOINTS = endpoints;

  document.dispatchEvent(new CustomEvent("headlines-booking-config-ready", { detail: config }));
})();
