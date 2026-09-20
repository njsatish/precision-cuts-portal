(() => {
  "use strict";

  const profiles = [
    {
      id: "keith-lemon",
      name: "Keith Lemon",
      role: "Master Barber & Founder",
      location: "6423 Williamson Rd, Roanoke, VA 24019",
      rating: "5.0",
      reviews: "240+ reviews",
      featured: "Adult Precision Cut, age 19 and up · $40",
      overview: "As the founder of Precision Cuts, Keith sets the benchmark for classic barbering craft and precision finishes in Roanoke. Keith specializes in tailored haircuts, beard detailing, youth cuts, and clean finishing work.",
      handle: "precision-cuts-keith-lemon",
      verifiedBooking: true
    },
    {
      id: "christopher-meadows",
      name: "Christopher Meadows",
      role: "Haircut, Fade & Grooming Specialist",
      location: "6423 Williamson Rd, Roanoke, VA 24019",
      rating: "5.0",
      reviews: "23 Booksy reviews",
      featured: "Skin Fade · $35 · 30 min",
      overview: "Christopher specializes in seamless skin fades, detailed beard work, line-ups, hot towel services, and straight-razor grooming. Christopher's verified Booksy catalog includes haircut, shave, facial, and full-service options.",
      handle: "2windabarber",
      verifiedBooking: true
    },
    {
      id: "ron-the-barber",
      name: "Ron The Barber",
      role: "Haircut, Beard & Edge-Up Specialist",
      location: "6423 Williamson Rd, Roanoke, VA 24019",
      rating: "5.0",
      reviews: "11 Booksy reviews",
      featured: "Haircut & Beard · $45 · 45 min",
      overview: "Ron is known for clean haircuts, detailed beard work, edge-ups, and head-shave services. Ron's verified Booksy catalog also includes kid's haircuts for clients age seven and older.",
      handle: "precisioncutz23",
      verifiedBooking: true
    },
    {
      id: "marcus-vance",
      name: "Marcus “VIP” Vance",
      role: "Hot Towel & Razor Sculptor",
      location: "6423 Williamson Rd, Roanoke, VA 24019",
      rating: null,
      reviews: null,
      featured: "Executive grooming, hot towel treatments, and razor sculpting",
      overview: "Marcus delivers a premium grooming profile focused on hot towel treatments, detailed razor sculpting, and executive-style finishing services.",
      handle: "marcus-vip-precisioncuts",
      verifiedBooking: false
    },
    {
      id: "jaylen-brooks",
      name: "Jaylen “Fresh Fades” Brooks",
      role: "Athletic Cuts & Hair Art",
      location: "6423 Williamson Rd, Roanoke, VA 24019",
      rating: null,
      reviews: null,
      featured: "Athletic cuts, current styles, and custom hair art",
      overview: "Jaylen's profile focuses on modern athletic cuts, current styling, and custom hair-design work for clients seeking a more creative finish.",
      handle: "jaylen-fresh-fades",
      verifiedBooking: false
    }
  ];

  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);

  function start() {
    if (!/about\.html$/i.test(location.pathname)) return;
    const main = document.querySelector("main");
    if (!main || main.querySelector("[data-pc-about-barbers]")) return;

    const section = document.createElement("section");
    section.className = "pc-about-barbers-v1";
    section.setAttribute("data-pc-about-barbers", "");
    section.setAttribute("aria-labelledby", "pc-about-barbers-title");
    section.innerHTML = `
      <div class="pc-about-barbers-shell">
        <header>
          <p>Meet the team</p>
          <h2 id="pc-about-barbers-title">About Our Barbers</h2>
          <span>Explore each specialist's focus, location, and booking status.</span>
        </header>
        <div class="pc-about-barbers-grid">
          ${profiles.map((profile, index) => `
            <article class="pc-about-barber-card ${profile.verifiedBooking ? "is-bookable" : "is-preview"}">
              <div class="pc-about-barber-number">${String(index + 1).padStart(2, "0")}</div>
              <div class="pc-about-barber-content">
                <div class="pc-about-barber-heading">
                  <div>
                    <h3>${escapeHtml(profile.name)}</h3>
                    <p>${escapeHtml(profile.role)}</p>
                  </div>
                  <span class="pc-about-barber-status">${profile.verifiedBooking ? "Verified live booking" : "Profile preview"}</span>
                </div>
                <dl>
                  <div><dt>Location</dt><dd>${escapeHtml(profile.location)}</dd></div>
                  ${profile.rating ? `<div><dt>Booksy rating</dt><dd>★ ${escapeHtml(profile.rating)} · ${escapeHtml(profile.reviews)}</dd></div>` : ""}
                  <div><dt>Featured</dt><dd>${escapeHtml(profile.featured)}</dd></div>
                  <div><dt>Booksy handle</dt><dd>${escapeHtml(profile.handle)}</dd></div>
                </dl>
                <p class="pc-about-barber-overview">${escapeHtml(profile.overview)}</p>
                ${profile.verifiedBooking
                  ? `<a href="/index.html?barber=${encodeURIComponent(profile.id)}#pc-barbers-title">View services and availability</a>`
                  : `<p class="pc-about-barber-notice">Live services and availability will be added after the Booksy business, staffer, and service-variant records are verified.</p>`}
              </div>
            </article>
          `).join("")}
        </div>
      </div>`;

    const footer = main.querySelector("footer");
    if (footer) footer.insertAdjacentElement("beforebegin", section);
    else main.appendChild(section);
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", start, { once: true })
    : start();
})();
