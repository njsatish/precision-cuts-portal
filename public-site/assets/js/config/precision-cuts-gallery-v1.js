(() => {
  "use strict";

  function start() {
    const config=window.BOOKSY_PORTAL_CONFIG;
    if(!config) {
      document.addEventListener("booksy-portal-config-ready",start,{once:true});
      return;
    }
    if(!/gallery\.html$/i.test(location.pathname)) return;

    const images=config.gallery || [];
    if(images.length !== 12) {
      console.error(`Expected 12 Precision Cuts gallery images, received ${images.length}.`);
      return;
    }

    const main=document.querySelector("main");
    if(!main) return;

    const oldGrid=main.querySelector(
      ".pp-headlines-work-grid, .pp-work-grid, .pp-gallery-grid, [class*='gallery-grid'], [class*='work-grid']"
    );

    const section=document.createElement("section");
    section.className="pc-gallery-section-v1";
    section.setAttribute("aria-labelledby","pc-gallery-title-v1");
    section.innerHTML=`
      <div class="pp-container pc-gallery-shell-v1">
        <header class="pc-gallery-heading-v1">
          <p class="pp-kicker">${config.content?.gallery?.kicker || "Precision Cuts Portfolio"}</p>
          <h2 id="pc-gallery-title-v1">${config.content?.gallery?.headline || "Detail you can see."}</h2>
          <p>${config.content?.gallery?.description || "Selected Precision Cuts work."}</p>
        </header>
        <div class="pc-gallery-grid-v1">
          ${images.map((image,index)=>`
            <figure class="pc-gallery-item-v1">
              <button type="button" class="pc-gallery-open-v1" data-gallery-index="${index}" aria-label="Open ${image.caption}">
                <img src="${image.src}" alt="${image.alt}" loading="lazy" decoding="async">
              </button>
              <figcaption>${image.caption}</figcaption>
            </figure>`).join("")}
        </div>
      </div>`;

    const oldSection=oldGrid?.closest("section") || oldGrid?.parentElement;
    if(oldSection) oldSection.replaceWith(section);
    else main.appendChild(section);

    const dialog=document.createElement("dialog");
    dialog.className="pc-gallery-dialog-v1";
    dialog.innerHTML=`
      <button type="button" class="pc-gallery-close-v1" aria-label="Close gallery">×</button>
      <button type="button" class="pc-gallery-prev-v1" aria-label="Previous photo">‹</button>
      <figure><img alt=""><figcaption></figcaption></figure>
      <button type="button" class="pc-gallery-next-v1" aria-label="Next photo">›</button>`;
    document.body.appendChild(dialog);

    let current=0;
    const render=index=>{
      current=(index+images.length)%images.length;
      const image=images[current];
      dialog.querySelector("img").src=image.src;
      dialog.querySelector("img").alt=image.alt;
      dialog.querySelector("figcaption").textContent=image.caption;
    };

    section.addEventListener("click",event=>{
      const button=event.target.closest("[data-gallery-index]");
      if(!button) return;
      render(Number(button.dataset.galleryIndex));
      dialog.showModal();
    });
    dialog.querySelector(".pc-gallery-close-v1").addEventListener("click",()=>dialog.close());
    dialog.querySelector(".pc-gallery-prev-v1").addEventListener("click",()=>render(current-1));
    dialog.querySelector(".pc-gallery-next-v1").addEventListener("click",()=>render(current+1));
    dialog.addEventListener("click",event=>{ if(event.target===dialog) dialog.close(); });
    dialog.addEventListener("keydown",event=>{
      if(event.key==="ArrowLeft") render(current-1);
      if(event.key==="ArrowRight") render(current+1);
    });
  }

  document.readyState==="loading"
    ? document.addEventListener("DOMContentLoaded",start,{once:true})
    : start();
})();
