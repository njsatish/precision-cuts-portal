(() => {
  "use strict";
  const config = {
  "business": {
    "booksyUrl": "https://booksy.com/en-us/94095_headlines_barber-shop_134579_roanoke",
    "booksyBusinessId": 94095
  },
  "services": [
    {
      "slug": "haircut",
      "name": "Haircut",
      "shortName": "Haircut",
      "description": "Haircut with edge up.",
      "serviceId": 634731,
      "variantId": 9396822,
      "durationMinutes": 45,
      "price": 50,
      "availabilityPath": "/availability/haircut"
    },
    {
      "slug": "haircut-and-beard",
      "name": "Haircut & Beard",
      "shortName": "Haircut & Beard",
      "description": "Haircut with beard shaping, edging, and line work.",
      "serviceId": 574263,
      "variantId": 9396820,
      "durationMinutes": 45,
      "price": 60,
      "availabilityPath": "/availability/haircut-and-beard"
    },
    {
      "slug": "kids-cut",
      "name": "Kid's cut, 16 and under",
      "shortName": "Kid's Cut",
      "description": "Detailed haircut for clients age 16 and under.",
      "serviceId": 3602928,
      "variantId": 9396824,
      "durationMinutes": 35,
      "price": 35,
      "availabilityPath": "/availability/kids-cut"
    },
    {
      "slug": "black-mask",
      "name": "Black mask with charcoal and eucalyptus oil",
      "shortName": "Black Mask",
      "description": "Charcoal and eucalyptus treatment that exfoliates the skin.",
      "serviceId": 623287,
      "variantId": 9396821,
      "durationMinutes": 20,
      "price": 25,
      "availabilityPath": "/availability/black-mask"
    }
  ]
};
  const bySlug = Object.fromEntries(config.services.map(service => [service.slug, Object.freeze(service)]));
  window.HEADLINES_SERVICE_CONFIG = Object.freeze({
    ...config,
    services: Object.freeze(config.services.map(Object.freeze)),
    bySlug: Object.freeze(bySlug),
    get(slug) { return bySlug[slug] || null; }
  });
  document.dispatchEvent(new CustomEvent("headlines-services-ready", { detail: window.HEADLINES_SERVICE_CONFIG }));
})();
