(() => {
  "use strict";

  const slides = [
    {src:"/assets/images/barbers/keith-lemon/transitions/precision_cuts_transition_01.jpg",href:"#booking-workspace",title:"Book at Precision Cuts",caption:"View live services, barbers, dates, and times"},
    {src:"/assets/images/barbers/keith-lemon/transitions/precision_cuts_transition_02.jpg",href:"/barbers/keith-lemon.html",title:"Meet the Founder",caption:"Explore the founder profile"},
    {src:"/assets/images/barbers/keith-lemon/transitions/precision_cuts_transition_03.jpg",href:"/gallery.html",title:"View the Gallery",caption:"Explore more Precision Cuts work"},
    {src:"/assets/images/barbers/keith-lemon/transitions/precision_cuts_transition_04.jpg",href:"/services.html",title:"Browse Services",caption:"Review the Precision Cuts service catalog"},
    {src:"/assets/images/barbers/keith-lemon/transitions/precision_cuts_transition_05.jpg",href:"/contact.html",title:"Visit Precision Cuts",caption:"View location, hours, and contact details"}
  ];

  let slideIndex = 0;
  let timer = null;
  let scheduled = false;

  const normalize = value => String(value || "").replace(/\s+/g, " ").trim().toLowerCase();

  function heroMarkup() {
    const section = document.createElement("section");
    section.id = "pc-home-transition-v2";
    section.className = "pc-home-transition-v2";
    section.setAttribute("aria-label", "Precision Cuts homepage introduction");
    section.innerHTML = `
      <div class="pchv2-copy">
        <p class="pchv2-eyebrow">Roanoke, VA</p>
        <h1>Precision<br>in every <span>cut.</span></h1>
        <p>Professional barbering, clear service options, and convenient online booking.</p>
        <div class="pchv2-actions">
          <a href="#booking-workspace">Book Now</a>
          <a href="/about.html">About Precision Cuts</a>
        </div>
      </div>
      <div class="pchv2-carousel" id="pch-transition" aria-roledescription="carousel" aria-label="Precision Cuts photo gallery">
        <a id="pchv2-link" class="pchv2-link" href="#booking-workspace">
          <img id="pchv2-image" alt="Precision Cuts gallery photo" decoding="async">
          <span class="pchv2-overlay"><strong id="pchv2-title"></strong><small id="pchv2-caption"></small></span>
        </a>
        <button type="button" class="pchv2-arrow pchv2-prev" data-pchv2="previous" aria-label="Previous photo">‹</button>
        <button type="button" class="pchv2-arrow pchv2-next" data-pchv2="next" aria-label="Next photo">›</button>
        <div id="pch-transition-dots" class="pchv2-dots" aria-label="Choose photo"></div>
      </div>`;
    return section;
  }

  function ensureHero() {
    const main = document.querySelector("main");
    if (!main) return null;

    let hero = document.querySelector("#pc-home-transition-v2");
    if (!hero) {
      const oldTransition = document.querySelector("#pch-transition");
      const oldSection = oldTransition?.closest("section");
      if (oldSection && !oldSection.querySelector(".pc-home-barber-card") && !normalize(oldSection.textContent).includes("choose your barber")) {
        hero = oldSection;
        hero.id = "pc-home-transition-v2";
        hero.classList.add("pc-home-transition-v2");
      } else {
        hero = heroMarkup();
      }
    }

    if (main.firstElementChild !== hero) main.prepend(hero);
    return hero;
  }

  function removePortfolio() {
    const sections = [...document.querySelectorAll("main section")];
    const matches = sections.filter(section => {
      const text = normalize(section.textContent);
      return text.includes("portfolio") &&
        text.includes("detail you can see") &&
        section.querySelectorAll("img").length === 3 &&
        !section.querySelector("#pch-transition") &&
        !section.querySelector(".pc-home-barber-card,[data-barber-id]") &&
        !section.querySelector("#booking-workspace,[data-booking-workspace]");
    });
    matches.forEach(section => section.remove());
    if (matches.length) document.documentElement.dataset.pcPortfolioRemoved = "true";
  }

  function fixBarberHeading() {
    const heading = [...document.querySelectorAll("main h1,main h2,main h3")]
      .find(node => normalize(node.textContent).includes("choose your barber"));
    if (heading) heading.classList.add("pchv2-barber-heading");
  }

  function show(index, immediate = false) {
    const image = document.querySelector("#pchv2-image");
    const link = document.querySelector("#pchv2-link");
    const dots = document.querySelector("#pch-transition-dots");
    if (!image || !link || !dots) return;
    slideIndex = (index + slides.length) % slides.length;
    const slide = slides[slideIndex];
    const apply = () => {
      image.src = slide.src;
      image.alt = `Precision Cuts gallery photo ${slideIndex + 1} of ${slides.length}`;
      link.href = slide.href;
      document.querySelector("#pchv2-title").textContent = slide.title;
      document.querySelector("#pchv2-caption").textContent = slide.caption;
      [...dots.children].forEach((dot, i) => dot.setAttribute("aria-current", i === slideIndex ? "true" : "false"));
      image.classList.remove("is-changing");
    };
    if (immediate) apply();
    else {
      image.classList.add("is-changing");
      setTimeout(apply, 140);
    }
  }

  function initializeCarousel() {
    const dots = document.querySelector("#pch-transition-dots");
    const image = document.querySelector("#pchv2-image");
    if (!dots || !image) return;
    if (!dots.children.length) {
      dots.innerHTML = slides.map((_, i) => `<button type="button" data-pchv2-slide="${i}" aria-label="Show photo ${i + 1}" aria-current="${i === 0}"></button>`).join("");
    }
    if (!image.getAttribute("src")) show(0, true);
    if (!timer && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      timer = setInterval(() => show(slideIndex + 1), 5000);
    }
  }

  function apply() {
    ensureHero();
    removePortfolio();
    fixBarberHeading();
    initializeCarousel();
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; apply(); });
  }

  document.addEventListener("click", event => {
    const arrow = event.target.closest("[data-pchv2]");
    if (arrow) {
      event.preventDefault();
      show(slideIndex + (arrow.dataset.pchv2 === "next" ? 1 : -1));
      return;
    }
    const dot = event.target.closest("[data-pchv2-slide]");
    if (dot) {
      event.preventDefault();
      show(Number(dot.dataset.pchv2Slide));
    }
  });

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", apply, { once: true })
    : apply();
  window.addEventListener("load", apply, { once: true });

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 15000);
})();
