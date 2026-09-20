(() => {
  "use strict";

  const order = [
    "keith-lemon",
    "christopher-meadows",
    "ron-the-barber",
    "levar-neal",
    "lamar-the-barber"
  ];

  const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  })[char]);

  const imageOf = barber => barber.photoUrl || barber.photo || barber.profilePhoto || "";
  const displayName = barber => barber.displayName || barber.name;
  const serviceTags = barber => {
    const specialties = Array.isArray(barber.specialties) ? barber.specialties : [];
    if (specialties.length) return specialties.slice(0, 3);
    return (barber.services || []).slice(0, 3).map(service => service.name);
  };
  function bookingLink(barber) {
    return `#booking-workspace?barber=${encodeURIComponent(barber.id)}`;
  }

  function card(barber, index) {
    const direct = !barber.liveAvailability;
    const target = "";
    const action = direct ? `View ${esc(displayName(barber))}'s services` : `View ${esc(displayName(barber))}'s availability`;
    const status = direct ? "VERIFIED BOOKSY PROFILE" : "LIVE AVAILABILITY";
    const image = imageOf(barber);
    const fallback = esc(displayName(barber).split(/\s+/).map(part => part[0]).join("").slice(0,2));
    return `
      <article class="pc-home-barber-card pc-home-barber-card-${index + 1}">
        <div class="pc-home-barber-photo">
          ${image ? `<img src="${esc(image)}" alt="${esc(displayName(barber))} profile" loading="lazy" decoding="async">` : `<span>${fallback}</span>`}
        </div>
        <div class="pc-home-barber-body">
          <p class="pc-home-barber-status">${status}</p>
          <h3>${esc(displayName(barber))}</h3>
          <p class="pc-home-barber-title">${esc(barber.title || "Precision Cuts Barber")}</p>
          <div class="pc-home-barber-tags">
            ${serviceTags(barber).map(tag => `<span>${esc(tag)}</span>`).join("")}
          </div>
          <a class="pc-home-barber-action" href="${esc(bookingLink(barber))}"${target}>${action}</a>
        </div>
      </article>`;
  }

  function removeLegacyRyan(main) {
    [...main.querySelectorAll("h1,h2,h3,h4,h5,p,strong")]
      .filter(node => /ryan\s+vandyke/i.test(node.textContent || ""))
      .forEach(node => {
        const section = node.closest("section,article") || node.closest("div");
        if (section) section.remove();
      });

    [...main.querySelectorAll("section,article")]
      .filter(section => /what clients say about precision cuts/i.test(section.textContent || "") && /ryan/i.test(section.textContent || ""))
      .forEach(section => section.remove());
  }

  function findAnchor(main) {
    const booking = main.querySelector("#pc-barbers-title, [data-pc-booking], .pc-booking-workspace");
    if (booking) return booking.closest("section") || booking;
    const headings = [...main.querySelectorAll("h1,h2,h3")];
    return headings.find(node => /choose a service, barber/i.test(node.textContent || ""))?.closest("section") || main.lastElementChild;
  }

  function render() {
    if (!/(^|\/)index\.html$|\/$/.test(location.pathname)) return;
    const config = window.BOOKSY_PORTAL_CONFIG;
    if (!config) {
      document.addEventListener("booksy-portal-config-ready", render, { once:true });
      return;
    }
    const main = document.querySelector("main");
    if (!main) return;
    const registry = new Map((config.barbers || []).map(barber => [barber.id, barber]));
    const barbers = order.map(id => registry.get(id)).filter(Boolean);
    if (barbers.length !== 5) {
      console.error(`Expected 5 verified barbers; found ${barbers.length}.`);
      return;
    }

    removeLegacyRyan(main);
    document.querySelector("[data-pc-home-five-barbers]")?.remove();

    const section = document.createElement("section");
    section.className = "pc-home-five-barbers";
    section.setAttribute("data-pc-home-five-barbers", "");
    section.innerHTML = `
      <div class="pc-home-five-barbers-inner">
        <header class="pc-home-five-barbers-head">
          <p>MEET THE PRECISION CUTS TEAM</p>
          <h2>Choose your barber.</h2>
          <span>Five verified professionals at 6423 Williamson Rd, Roanoke, VA 24019.</span>
        </header>
        <div class="pc-home-five-barbers-grid">
          ${barbers.map(card).join("")}
        </div>
      </div>`;

    const anchor = findAnchor(main);
    if (anchor && anchor !== main) main.insertBefore(section, anchor);
    else main.appendChild(section);
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", render, { once:true })
    : render();
  window.addEventListener("load", render, { once:true });
  setTimeout(render, 500);
})();
