(() => {
  "use strict";
  const LOGO="/assets/images/precision-cuts-logo-approved.png?v=wide-v3-1";

  function apply(){
    const header=document.querySelector("header");
    if(!header) return;

    const brand=header.querySelector(
      "a[href='/'],a[href='/index.html'],a[href='index.html'],[class*='brand']"
    ) || header;

    const image=brand.querySelector("img") || header.querySelector("img");
    if(!image) return;

    image.src=LOGO;
    image.alt="Precision Cuts";
    image.removeAttribute("srcset");
    image.removeAttribute("width");
    image.removeAttribute("height");
    image.classList.add("pc-wide-logo-header-v3");

    [...brand.querySelectorAll("span,strong,p")]
      .filter(node=>/precision cuts/i.test(node.textContent))
      .forEach(node=>node.hidden=true);
  }

  document.readyState==="loading"
    ? document.addEventListener("DOMContentLoaded",apply,{once:true})
    : apply();

  window.addEventListener("load",apply,{once:true});
  setTimeout(apply,300);
  setTimeout(apply,1000);
})();
