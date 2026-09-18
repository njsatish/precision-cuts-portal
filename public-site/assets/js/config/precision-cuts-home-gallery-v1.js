(() => {
  "use strict";

  function start() {
    const config=window.BOOKSY_PORTAL_CONFIG;
    if(!config) {
      document.addEventListener("booksy-portal-config-ready",start,{once:true});
      return;
    }
    if(!/(?:^|\/)index\.html$|\/$/.test(location.pathname)) return;

    const images=(config.gallery || []).slice(0,3);
    if(images.length !== 3) {
      console.error(`Expected 3 homepage gallery images, received ${images.length}.`);
      return;
    }

    const main=document.querySelector("main");
    if(!main) return;

    const heading=[...main.querySelectorAll("h1,h2,h3")]
      .find(element=>/detail you can see/i.test(element.textContent));
    const existingSection=heading?.closest("section");

    const section=document.createElement("section");
    section.className="pc-home-gallery-v1";
    section.setAttribute("aria-labelledby","pc-home-gallery-title-v1");
    section.innerHTML=`
      <div class="pp-container pc-home-gallery-shell-v1">
        <header class="pc-home-gallery-heading-v1">
          <div>
            <p class="pp-kicker">Precision Cuts Portfolio</p>
            <h2 id="pc-home-gallery-title-v1">Detail you can see.</h2>
          </div>
          <a class="pp-button pp-button-secondary" href="/gallery.html">View Full Gallery</a>
        </header>
        <div class="pc-home-gallery-grid-v1">
          ${images.map(image=>`
            <a class="pc-home-gallery-item-v1" href="/gallery.html" aria-label="View ${image.caption} in the Precision Cuts gallery">
              <img src="${image.src}" alt="${image.alt}" loading="lazy" decoding="async">
              <span>${image.caption}</span>
            </a>`).join("")}
        </div>
      </div>`;

    if(existingSection) existingSection.replaceWith(section);
    else {
      const footer=document.querySelector("footer");
      footer?.insertAdjacentElement("beforebegin",section) || main.appendChild(section);
    }

    // Remove any duplicate homepage gallery section created by prior scripts.
    main.querySelectorAll(".pc-home-gallery-v1").forEach(item=>{
      if(item !== section) item.remove();
    });
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded",start,{once:true})
    : start();
})();
