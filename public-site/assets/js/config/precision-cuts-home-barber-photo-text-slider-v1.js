(() => {
  "use strict";

  const slides = [
    {
      name: "Keith Lemon",
      description: "Founder & Master Barber · Adult Haircuts · Beard Sculpting · Youth Cuts",
      href: "/barbers/keith-lemon.html",
      imageNumber: "01"
    },
    {
      name: "Christopher Meadows",
      description: "Haircuts & Skin Fades · Haircut & Beard · Hot Towel & Razor Shaves",
      href: "/barbers/christopher-meadows.html",
      imageNumber: "02"
    },
    {
      name: "Ron The Barber",
      description: "Haircuts · Haircut & Beard · Edge-Ups & Beard Services",
      href: "/barbers/ron-the-barber.html",
      imageNumber: "03"
    },
    {
      name: "Var da Barber",
      description: "Men's Haircuts · Head Shaves · Beard Trims · Hot Towel Shaves",
      href: "/barbers/var-da-barber.html",
      imageNumber: "04"
    },
    {
      name: "Lamar the barber",
      description: "Male Haircuts · Beard Shaping · Kids Cuts",
      href: "/barbers/lamar-the-barber.html",
      imageNumber: "05"
    }
  ];

  const carousel = document.getElementById("pch-transition");
  const link = document.getElementById("pch-transition-link");
  const image = document.getElementById("pch-transition-image");
  const title = document.getElementById("pch-transition-title");
  const caption = document.getElementById("pch-transition-caption");
  const dots = [...document.querySelectorAll("[data-home-slide]")];

  if (!carousel || !link || !image || !title || !caption || dots.length < slides.length) {
    console.warn("Precision Cuts barber photo text slider was not initialized.");
    return;
  }

  let lastAppliedIndex = -1;
  let applying = false;

  const currentIndex = () => {
    const activeDot = dots.find(dot => dot.getAttribute("aria-current") === "true");
    const dotIndex = activeDot ? Number(activeDot.dataset.homeSlide) : NaN;
    if (Number.isInteger(dotIndex) && slides[dotIndex]) return dotIndex;

    const source = image.currentSrc || image.getAttribute("src") || image.src || "";
    const imageIndex = slides.findIndex(slide => source.includes(`_${slide.imageNumber}.`));
    return imageIndex >= 0 ? imageIndex : 0;
  };

  const applySlideContent = (force = false) => {
    if (applying) return;
    const index = currentIndex();
    if (!force && index === lastAppliedIndex && title.textContent === slides[index].name) return;

    applying = true;
    const slide = slides[index];
    link.href = slide.href;
    link.dataset.barberProfile = slide.name;
    link.setAttribute("aria-label", `View ${slide.name} profile`);
    title.textContent = slide.name;
    caption.textContent = slide.description;
    image.alt = `${slide.name} at Precision Cuts, photo ${index + 1} of ${slides.length}`;

    dots.forEach((dot, dotIndex) => {
      const mapped = slides[dotIndex];
      if (mapped) dot.setAttribute("aria-label", `Show ${mapped.name}`);
    });

    lastAppliedIndex = index;
    applying = false;
  };

  applySlideContent(true);

  const observer = new MutationObserver(() => requestAnimationFrame(() => applySlideContent()));
  observer.observe(carousel, {
    attributes: true,
    childList: true,
    subtree: true,
    attributeFilter: ["aria-current", "src"]
  });

  carousel.addEventListener("transitionend", () => applySlideContent(true));
  carousel.addEventListener("click", event => {
    if (event.target.closest("[data-home-transition], [data-home-slide]")) {
      requestAnimationFrame(() => requestAnimationFrame(() => applySlideContent(true)));
    }
  });

  window.addEventListener("load", () => applySlideContent(true), { once: true });
})();
