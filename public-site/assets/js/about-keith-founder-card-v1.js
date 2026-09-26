(() => {
  "use strict";

  const PROFILE = "/keith-lemon.html";
  const PHOTO = "/assets/images/barbers/keith-booksy-profile.jpg?v=1";

  const locateBarberSection = () => {
    const heading = [...document.querySelectorAll("main h1, main h2, main h3")]
      .find(node => /about our barbers|my current barbers|meet.*barbers/i.test(node.textContent.trim()));
    return heading?.closest("section") || heading?.parentElement || null;
  };

  const render = () => {
    if (document.querySelector("#pc-about-founder-card")) return true;
    const barberSection = locateBarberSection();
    const main = document.querySelector("main");
    if (!main) return false;

    const founder = document.createElement("section");
    founder.id = "pc-about-founder-card";
    founder.className = "pc-about-founder-card";
    founder.setAttribute("aria-labelledby", "pc-about-founder-name");
    founder.innerHTML = `
      <a class="pc-about-founder-photo" href="${PROFILE}" aria-label="View Keith Lemon's profile">
        <img src="${PHOTO}" alt="Keith Lemon profile presentation">
        <span>Founder &amp; Master Barber</span>
      </a>
      <div class="pc-about-founder-copy">
        <p class="pc-about-founder-kicker">Founder Spotlight</p>
        <h2 id="pc-about-founder-name">Keith Lemon</h2>
        <p class="pc-about-founder-role">Founder, Master Barber &amp; Precision Cuts Leader</p>
        <p class="pc-about-founder-description">
          Keith Lemon leads Precision Cuts with a focus on precision haircuts, detailed beard shaping,
          sharp line-ups, and dependable service for adults and kids. Keith's hands-on leadership and
          commitment to consistent craftsmanship set the standard for every client experience.
        </p>
        <p class="pc-about-founder-address">6423 Williamson Rd, Roanoke, VA 24019</p>
        <div class="pc-about-founder-actions">
          <a class="pc-about-founder-primary" href="${PROFILE}">View Keith Lemon’s profile</a>
          <a class="pc-about-founder-secondary" href="${PROFILE}#services">View services and availability</a>
        </div>
      </div>`;

    if (barberSection && barberSection.parentNode) {
      barberSection.parentNode.insertBefore(founder, barberSection);
    } else {
      main.appendChild(founder);
    }
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
