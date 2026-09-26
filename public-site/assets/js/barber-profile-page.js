const PAGE_MAP={keith:'keith-lemon.html',christopher:'christopher-meadows.html',ron:'ron-the-barber.html',var:'var-da-barber.html',lamar:'lamar-the-barber.html'};
const IDS={keith:['keith-lemon'],christopher:['christopher-meadows'],ron:['ron-the-barber'],var:['levar-neal','var-da-barber'],lamar:['lamar-the-barber']};
const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const arr=v=>Array.isArray(v)?v:[];const pick=(o,keys,f='')=>{for(const k of keys)if(o&&o[k]!=null&&o[k]!=='')return o[k];return f};
function findBarber(data,key){return arr(data.barbers).find(b=>IDS[key].includes(String(b.id||b.slug||'').toLowerCase()))||arr(data.teamProfiles).find(b=>IDS[key].includes(String(b.id||'').toLowerCase()))||null}
function money(v){if(v===''||v==null)return'';if(typeof v==='string'&&v.includes('$'))return v;return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(v))}
// PRECISION-CUTS-SHARED-HOME-LAYOUT-V1-START
async function injectSharedLayout(){
  const response=await fetch('../index.html',{cache:'no-store'});
  if(!response.ok)throw Error(`Unable to load shared home layout: ${response.status}`);
  const html=await response.text();
  const doc=new DOMParser().parseFromString(html,'text/html');
  const sourceHeader=doc.querySelector('header.pp-site-header')||doc.querySelector('header');
  const sourceFooter=doc.querySelector('footer.pp-site-footer')||doc.querySelector('footer');
  const sourceMobileActions=doc.querySelector('.pp-mobile-actions');
  const headerTarget=document.querySelector('#shared-header');
  const footerTarget=document.querySelector('#shared-footer');

  if(!sourceHeader||!sourceFooter||!headerTarget||!footerTarget){
    throw Error('The home page header or footer could not be found.');
  }

  const header=sourceHeader.cloneNode(true);
  const footer=sourceFooter.cloneNode(true);
  header.querySelectorAll('script').forEach(node=>node.remove());
  footer.querySelectorAll('script').forEach(node=>node.remove());
  headerTarget.replaceChildren(header);
  footerTarget.replaceChildren(footer);

  document.querySelectorAll('#shared-header [href^="/"],#shared-footer [href^="/"],#shared-header [src^="/"],#shared-footer [src^="/"]').forEach(node=>{
    for(const attribute of ['href','src']){
      const value=node.getAttribute(attribute);
      if(value&&value.startsWith('/'))node.setAttribute(attribute,`..${value}`);
    }
  });

  document.querySelectorAll('#shared-header a').forEach(link=>{
    const href=link.getAttribute('href')||'';
    if(href.endsWith('/index.html')||href.endsWith('../index.html'))link.setAttribute('aria-current','page');
  });

  if(sourceMobileActions&&!document.querySelector('.pp-mobile-actions')){
    const mobileActions=sourceMobileActions.cloneNode(true);
    mobileActions.querySelectorAll('[href^="/"]').forEach(link=>link.setAttribute('href',`..${link.getAttribute('href')}`));
    document.body.appendChild(mobileActions);
  }

  const menuButton=document.querySelector('#shared-header [data-menu-toggle]');
  const nav=document.querySelector('#shared-header [data-site-nav]');
  if(menuButton&&nav){
    menuButton.addEventListener('click',()=>{
      const expanded=menuButton.getAttribute('aria-expanded')==='true';
      menuButton.setAttribute('aria-expanded',String(!expanded));
      nav.classList.toggle('is-open',!expanded);
    });
  }
}
// PRECISION-CUTS-SHARED-HOME-LAYOUT-V1-END
function galleryItems(data,b){const configured=arr(b.gallery).length?arr(b.gallery):arr(data.gallery);const titles=[['Fade & Styling','Mid Bald Fade & Textured Top'],['Beard Detail','Full Beard Sculpt & Razor Sharp Line'],['Precision Cut','Low Drop Fade With Curved Edge'],['Classic Barbering','Clean Taper Cut & Groomed Beard']];if(configured.length)return configured.slice(0,4).map((g,i)=>({src:pick(g,['src','url','image','img']),title:pick(g,['caption','title','name'],titles[i][1]),category:pick(g,['category','type'],titles[i][0]),ai:false}));return titles.map((t,i)=>({category:t[0],title:t[1],src:`../assets/images/ai-gallery/work-0${i+1}.png`,ai:true}))}
function reviewItems(data,b){return arr(b.reviews).length?arr(b.reviews).slice(0,3):arr(data.reviews).slice(0,3)}
function featuredVideoSection(b){
  const video=b.featuredVideo;
  if(!video)return "";
  const heading=esc(video.heading||"Barber in Action");
  const description=esc(video.description||"");
  const poster=esc(video.poster||imageUrl(b));
  if(video.type==="local-mp4"&&video.src){
    return `<section class="pc-video-section pc-video-section-local"><div class="pc-video-copy"><p class="pc-video-kicker">Featured video</p><h2>${heading}</h2><p>${description}</p><small>Use the player controls for sound, playback, and full screen.</small></div><div class="pc-local-video-wrap"><video class="pc-local-video" controls playsinline preload="metadata" poster="${poster}"><source src="${esc(video.src)}" type="video/mp4">Your browser does not support HTML5 video.</video></div></section>`;
  }
  if(video.url){
    return `<section class="pc-video-section"><div class="pc-video-copy"><p class="pc-video-kicker">Featured video</p><h2>${heading}</h2><p>${description}</p><a class="pc-button pc-button-primary pc-video-button" href="${esc(video.url)}" target="_blank" rel="noopener noreferrer">${esc(video.buttonLabel||"Watch Video")}</a></div><a class="pc-video-poster" href="${esc(video.url)}" target="_blank" rel="noopener noreferrer"><img src="${poster}" alt="Featured barber video preview" loading="lazy"><span class="pc-video-play" aria-hidden="true">▶</span></a></section>`;
  }
  return "";
}
function render(data,b,key){const name=pick(b,['displayName','professionalName','name'],key);const role=pick(b,['title','role'],'Precision Cuts barber');const bio=pick(b,['bio','overview','description'],'Professional barbering with clear pricing and convenient online booking.');const services=arr(b.services);const tags=arr(b.specialties);const gallery=galleryItems(data,b);const reviews=reviewItems(data,b);const url=pick(b,['profileUrl','booksyUrl'],pick(data.business||{},['booksyUrl'],'#'));
const serviceHtml=services.map(s=>`<article class="pc-service"><div class="pc-service-head"><span>${esc(pick(s,['displayName','name'],'Service'))}</span><span class="pc-service-meta">${esc(money(s.price))}${pick(s,['durationMinutes','duration'],'')?` · ${esc(pick(s,['durationMinutes','duration']))} min`:''}</span></div>${s.description?`<p class="pc-service-desc">${esc(s.description)}</p>`:''}</article>`).join('')||'<p class="pc-note">Services are available through the current booking configuration.</p>';
const links=Object.entries(PAGE_MAP).map(([k,f])=>`<a href="${f}" ${k===key?'aria-current="page"':''}>${esc(k==='var'?'Var':k[0].toUpperCase()+k.slice(1))}</a>`).join('');
const galleryHtml=gallery.map(g=>`<button class="pc-gallery-card" type="button" data-lightbox-src="${esc(g.src)}" aria-label="Enlarge ${esc(g.title)}"><img src="${esc(g.src)}" alt="${esc(g.title)}" loading="lazy"><span class="pc-gallery-overlay"></span>${g.ai?'<span class="pc-ai-label">AI placeholder</span>':''}<span class="pc-gallery-copy"><span class="pc-gallery-category">${esc(g.category)}</span><span class="pc-gallery-title">${esc(g.title)}</span></span></button>`).join('');
const reviewsHtml=reviews.length?reviews.map(r=>`<article class="pc-review-card"><div class="pc-review-top"><span class="pc-review-name">${esc(pick(r,['name','client','author'],'Client'))}</span><span class="pc-review-date">${esc(pick(r,['date','timeAgo'],''))}</span></div><div class="pc-review-stars" aria-label="${esc(pick(r,['rating'],5))} out of 5 stars">★★★★★</div><p class="pc-review-quote">“${esc(pick(r,['comment','text','review'],''))}”</p></article>`).join(''):`<article class="pc-review-card"><div class="pc-review-name">Reviews coming soon</div><div class="pc-review-stars" aria-hidden="true">★★★★★</div><p class="pc-review-quote">Client review excerpts will appear here after verified review text is added to the Precision Cuts configuration.</p></article>`;
const photo=pick(b,['photo','photoUrl','profilePhoto'],'../assets/images/precision-cuts-logo.png');document.querySelector('#barber-profile-root').innerHTML=`<div class="pc-profile"><section class="pc-hero"><img class="pc-photo" src="${esc(photo)}" alt="${esc(name)} profile"><div><div class="pc-kicker">Precision Cuts · Roanoke, Virginia</div><h1 class="pc-title">${esc(name)}</h1><div class="pc-role">${esc(role)}</div><p class="pc-bio">${esc(bio)}</p>${tags.length?`<div class="pc-tags">${tags.map(t=>`<span class="pc-tag">${esc(t)}</span>`).join('')}</div>`:''}<div class="pc-actions"><a class="pc-button pc-button-primary" href="${esc(url)}" target="_blank" rel="noopener">Book with ${esc(name.split(' ')[0])}</a><a class="pc-button pc-button-secondary" href="../index.html#barbers">Back to all barbers</a></div><nav class="pc-switcher" aria-label="Barber profiles">${links}</nav></div></section><div class="pc-grid"><section class="pc-panel"><h2>Services</h2><div class="pc-service-list">${serviceHtml}</div></section><section class="pc-panel"><h2>Availability and booking</h2><p class="pc-note">Choose a service and continue to the barber's current booking profile for available dates and times.</p><div class="pc-actions"><a class="pc-button pc-button-primary" href="${esc(url)}" target="_blank" rel="noopener">View live availability</a></div></section></div><section class="pc-gallery-section"><header class="pc-section-head"><h2>Featured Barbering Work</h2><p class="pc-section-subtitle">Explore fades, beard detailing, precision shaping, and finished styles. Select any photo to view it larger.</p></header><div class="pc-gallery">${galleryHtml}</div></section>${featuredVideoSection(b)}<section class="pc-reviews-section"><header class="pc-section-head"><h2>Sample Client Feedback</h2><p class="pc-section-subtitle">Preview feedback created to demonstrate the review layout. Names and comments are fictional placeholders.</p></header><div class="pc-reviews-grid">${reviewsHtml}</div></section></div><div class="pc-lightbox" id="pc-lightbox" role="dialog" aria-modal="true" aria-label="Gallery image preview">
  <button class="pc-lightbox-close" type="button" aria-label="Close image preview">×</button>
  <button class="pc-lightbox-nav pc-lightbox-prev" type="button" aria-label="Previous gallery photo">‹</button>
  <figure class="pc-lightbox-figure">
    <img alt="Expanded portfolio work">
    <figcaption class="pc-lightbox-caption">
      <span class="pc-lightbox-category"></span>
      <strong class="pc-lightbox-title"></strong>
      <small class="pc-lightbox-count"></small>
    </figcaption>
  </figure>
  <button class="pc-lightbox-nav pc-lightbox-next" type="button" aria-label="Next gallery photo">›</button>
</div>`;
const box=document.querySelector('#pc-lightbox');
const galleryButtons=[...document.querySelectorAll('[data-lightbox-src]')];
const full=box.querySelector('img');
const captionCategory=box.querySelector('.pc-lightbox-category');
const captionTitle=box.querySelector('.pc-lightbox-title');
const captionCount=box.querySelector('.pc-lightbox-count');
let activeGalleryIndex=0;

const showGalleryImage=index=>{
  if(!galleryButtons.length)return;
  activeGalleryIndex=(index+galleryButtons.length)%galleryButtons.length;
  const card=galleryButtons[activeGalleryIndex];
  const cardImage=card.querySelector('img');
  const category=card.querySelector('.pc-gallery-category');
  const title=card.querySelector('.pc-gallery-title');
  full.src=card.dataset.lightboxSrc;
  full.alt=cardImage?.alt||'Expanded portfolio work';
  captionCategory.textContent=category?.textContent||'';
  captionTitle.textContent=title?.textContent||full.alt;
  captionCount.textContent=`${activeGalleryIndex+1} of ${galleryButtons.length}`;
};

const openGallery=index=>{
  showGalleryImage(index);
  box.classList.add('is-open');
  document.body.classList.add('pc-lightbox-open');
  box.querySelector('.pc-lightbox-close').focus();
};

const closeGallery=()=>{
  box.classList.remove('is-open');
  document.body.classList.remove('pc-lightbox-open');
  galleryButtons[activeGalleryIndex]?.focus();
};

galleryButtons.forEach((card,index)=>card.addEventListener('click',()=>openGallery(index)));
box.querySelector('.pc-lightbox-prev').addEventListener('click',event=>{event.stopPropagation();showGalleryImage(activeGalleryIndex-1)});
box.querySelector('.pc-lightbox-next').addEventListener('click',event=>{event.stopPropagation();showGalleryImage(activeGalleryIndex+1)});
box.querySelector('.pc-lightbox-close').addEventListener('click',closeGallery);
box.querySelector('.pc-lightbox-figure').addEventListener('click',event=>event.stopPropagation());
box.addEventListener('click',event=>{if(event.target===box)closeGallery()});
document.addEventListener('keydown',event=>{
  if(!box.classList.contains('is-open'))return;
  if(event.key==='Escape')closeGallery();
  if(event.key==='ArrowLeft')showGalleryImage(activeGalleryIndex-1);
  if(event.key==='ArrowRight')showGalleryImage(activeGalleryIndex+1);
})}
// PRECISION-CUTS-SIMPLE-HOME-FOOTER-V2-START
function renderSharedHomeFooter(data){
  const target=document.querySelector('#shared-footer');
  if(!target)return;
  const business=data?.business||{};
  const brand=data?.brand||{};
  const address=Array.isArray(business.addressLines)?business.addressLines.join(', '):'6423 Williamson Rd, Roanoke, VA 24019';
  const logo=brand.logo||business.logo||'/assets/images/precision-cuts-logo-approved.png';
  const phoneDisplay=business.phoneDisplay||'(540) 556-2871';
  const phoneHref=business.phoneHref||'+15405562871';
  const facebook=business.facebookUrl||'#';
  const booking=business.booksyUrl||'../book.html';
  target.innerHTML=`
    <footer class="pc-home-footer" aria-label="Precision Cuts footer">
      <div class="pc-home-footer-inner">
        <div class="pc-home-footer-top">
          <a class="pc-home-footer-logo" href="../index.html" aria-label="Precision Cuts home">
            <img src="..${esc(logo)}" alt="Precision Cuts logo" loading="lazy" decoding="async">
          </a>
          <nav class="pc-home-footer-links" aria-label="Footer navigation">
            <a href="tel:${esc(phoneHref)}">${esc(phoneDisplay)}</a>
            <a href="${esc(facebook)}" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="../services.html">Services</a>
            <a href="${esc(booking)}" target="_blank" rel="noopener noreferrer">Booking</a>
          </nav>
        </div>
        <div class="pc-home-footer-bottom">
          <span>© 2026 Precision Cuts</span>
          <span>${esc(address)}</span>
        </div>
      </div>
    </footer>`;
}
// PRECISION-CUTS-SIMPLE-HOME-FOOTER-V2-END
async function init(){try{await injectSharedLayout();const data=await fetch('../assets/config/portal.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error(`portal.json ${r.status}`);return r.json()});renderSharedHomeFooter(data);const key=document.body.dataset.barberKey,b=findBarber(data,key);if(!b)throw Error(`No configured profile found for ${key}`);render(data,b,key)}catch(e){document.querySelector('#barber-profile-root').innerHTML=`<div class="pc-error"><h1>Profile unavailable</h1><p>${esc(e.message)}</p><a href="../index.html">Return to Precision Cuts</a></div>`;console.error(e)}}init();
