(() => {
  "use strict";
  const LOGO="/assets/images/precision-cuts-logo-approved.png";

  function replaceVisibleLogo(){
    if(!/(?:^|\/)index\.html$|\/$/.test(location.pathname)) return;

    const header=document.querySelector("header");
    if(header){
      const brandLink=header.querySelector("a[href='/'], a[href='/index.html'], a[href='index.html'], [class*='brand']");
      const oldHeaderImage=brandLink?.querySelector("img") || header.querySelector("img");
      if(oldHeaderImage){
        oldHeaderImage.src=LOGO;
        oldHeaderImage.alt="Precision Cuts";
        oldHeaderImage.removeAttribute("width");
        oldHeaderImage.removeAttribute("height");
        oldHeaderImage.classList.add("pc-approved-header-logo-v2");
      }
      const adjacentName=oldHeaderImage?.parentElement?.querySelector("span, strong, p");
      if(adjacentName && /precision cuts/i.test(adjacentName.textContent)){
        adjacentName.classList.add("pc-hide-redundant-brand-name-v2");
      }
    }

    const main=document.querySelector("main");
    if(main){
      const hero=main.querySelector("section") || main;
      const images=[...hero.querySelectorAll("img")];
      const heroImage=images.find(img=>
        /hero|logo|scissor|precision/i.test(`${img.src} ${img.alt} ${img.className}`)
      ) || images[0];
      if(heroImage){
        heroImage.src=LOGO;
        heroImage.alt="Precision Cuts logo";
        heroImage.removeAttribute("width");
        heroImage.removeAttribute("height");
        heroImage.classList.add("pc-approved-hero-logo-v2");
        const picture=heroImage.closest("picture");
        picture?.querySelectorAll("source").forEach(source=>source.remove());
      }
    }

    document.documentElement.setAttribute("data-pc-approved-logo-visible","true");
  }

  document.readyState==="loading"
    ? document.addEventListener("DOMContentLoaded",replaceVisibleLogo,{once:true})
    : replaceVisibleLogo();

  // Existing site runtimes may replace images after DOMContentLoaded.
  window.addEventListener("load",replaceVisibleLogo,{once:true});
  setTimeout(replaceVisibleLogo,250);
  setTimeout(replaceVisibleLogo,1000);
})();
