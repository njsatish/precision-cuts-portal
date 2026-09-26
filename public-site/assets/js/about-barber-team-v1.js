(() => {
  "use strict";

  const BARBERS = [
    {
      key: "keith",
      ids: ["keith-lemon"],
      name: "Keith Lemon",
      role: "Master Barber & Founder",
      image: "/assets/images/barbers/keith-booksy-profile.jpg?v=1",
      profile: "/barbers/keith-lemon.html",
      specialties: "Adult Haircuts · Beard Sculpting · Youth Cuts"
    },
    {
      key: "christopher",
      ids: ["christopher-meadows"],
      name: "Christopher Meadows",
      role: "Haircut, Fade & Grooming Specialist",
      image: "/assets/images/barbers/christopher-meadows/transitions/christopher_meadows_02.jpg",
      profile: "/barbers/christopher-meadows.html",
      specialties: "Haircuts & Skin Fades · Haircut & Beard · Hot Towel & Razor Shaves"
    },
    {
      key: "ron",
      ids: ["ron-the-barber"],
      name: "Ron The Barber",
      role: "Haircut, Beard & Edge-Up Specialist",
      image: "/assets/images/barbers/ron-the-barber/transitions/ron_01.jpeg",
      profile: "/barbers/ron-the-barber.html",
      specialties: "Haircuts · Beard Services · Precision Edge-Ups"
    },
    {
      key: "var",
      ids: ["levar-neal", "var-da-barber"],
      name: "Levar Neal",
      role: "Var da Barber",
      image: "/assets/images/barbers/levar-neal/transitions/Levar_Neal_02.jpg",
      profile: "/barbers/var-da-barber.html",
      specialties: "Men’s Haircuts · Head Shaves · Beard Trims · Hot Towel Shaves"
    },
    {
      key: "lamar",
      ids: ["lamar-the-barber"],
      name: "Lamar the barber",
      role: "Haircut, Beard & Kids Cut Specialist",
      image: "/assets/images/barbers/lamar-the-barber/transitions/lamar-the-barber.jpg",
      profile: "/barbers/lamar-the-barber.html",
      specialties: "Haircuts · Beard Grooming · Kids Cuts"
    }
  ];

  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);

  const findInsertionPoint = () => {
    const main = document.querySelector("main");
    if (!main) return null;
    const footer = document.querySelector("#shared-footer, footer");
    return { main, footer };
  };

  const render = () => {
    if (document.querySelector("#pc-about-barber-team")) return true;
    const location = findInsertionPoint();
    if (!location) return false;

    const section = document.createElement("section");
    section.id = "pc-about-barber-team";
    section.className = "pc-about-team";
    section.setAttribute("aria-labelledby", "pc-about-team-title");
    section.innerHTML = `
      <header class="pc-about-team-heading">
        <p>Meet the Precision Cuts Team</p>
        <h2 id="pc-about-team-title">Five Barbers. One Standard of Precision.</h2>
        <div>Explore each barber’s specialties, work, services, and booking options.</div>
      </header>
      <div class="pc-about-team-grid">
        ${BARBERS.map((barber, index) => `
          <article class="pc-about-barber-card">
            <a class="pc-about-barber-photo" href="${escapeHtml(barber.profile)}" aria-label="View ${escapeHtml(barber.name)} profile">
              <img src="${escapeHtml(barber.image)}" alt="${escapeHtml(barber.name)} profile presentation" loading="${index < 2 ? "eager" : "lazy"}">
              <span class="pc-about-photo-overlay"></span>
              <span class="pc-about-photo-number">0${index + 1}</span>
            </a>
            <div class="pc-about-barber-copy">
              <p>${escapeHtml(barber.role)}</p>
              <h3>${escapeHtml(barber.name)}</h3>
              <div>${escapeHtml(barber.specialties)}</div>
              <a class="pc-about-profile-link" href="${escapeHtml(barber.profile)}">View ${escapeHtml(barber.name)}’s Profile</a>
            </div>
          </article>`).join("")}
      </div>`;

    location.main.appendChild(section);
    return true;
  };

  if (!render()) {
    const observer = new MutationObserver(() => {
      if (render()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 15000);
  }
})();
