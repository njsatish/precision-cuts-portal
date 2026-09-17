(() => {
  "use strict";
  window.HEADLINES_BOOKING = Object.freeze({
    API_BASE: "https://57z7wwag50.execute-api.us-east-1.amazonaws.com",
    BOOKSY_URL: "https://booksy.com/en-us/94095_headlines_barber-shop_134579_roanoke",
    SERVICES: {
      "haircut": { name: "Haircut", short: "Haircut", price: 50, duration: 45 },
      "haircut-and-beard": { name: "Haircut & Beard", short: "Haircut & Beard", price: 60, duration: 45 },
      "kids-cut": { name: "Kid's cut (16 and under)", short: "Kid's Cut", price: 35, duration: 35 },
      "black-mask": { name: "Black mask with charcoal and eucalyptus oil", short: "Black Mask", price: 25, duration: 20 }
    }
  });
})();
