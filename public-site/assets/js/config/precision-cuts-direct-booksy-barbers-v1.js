(() => {
  "use strict";

  const directIds = ["levar-neal", "lamar-the-barber"];
  const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  })[char]);
  const norm = value => String(value || "").replace(/\s+/g, " ").trim();

  function configBarbers() {
    const config = window.BOOKSY_PORTAL_CONFIG;
    if (!config) return [];
    const registry = new Map((config.barbers || []).map(item => [item.id, item]));
    return directIds.map(id => registry.get(id)).filter(Boolean);
  }

  function heading(text) {
    return [...document.querySelectorAll("h1,h2,h3,h4,h5,strong")]
      .find(node => norm(node.textContent).toUpperCase().includes(text));
  }

  function panelFor(title) {
    const marker = heading(title);
    if (!marker) return null;
    return marker.closest("section,article") || marker.closest("div");
  }

  function bodyFor(panel, title) {
    if (!panel) return null;
    const directChildren = [...panel.children];
    const titleChild = directChildren.find(child => norm(child.textContent).toUpperCase().includes(title));
    const siblings = titleChild ? directChildren.slice(directChildren.indexOf(titleChild) + 1) : directChildren;
    return siblings.find(child => child.matches("div,ul,ol")) || panel;
  }

  function photo(barber) {
    return barber.photoUrl || barber.photo || barber.profilePhoto || "";
  }

  function showDirectBooking(barber, service) {
    const datePanel = panelFor("3. AVAILABLE DATES");
    if (!datePanel) return;
    let host = datePanel.querySelector("[data-pc-direct-booksy-result]");
    if (!host) {
      host = document.createElement("div");
      host.setAttribute("data-pc-direct-booksy-result", "");
      datePanel.appendChild(host);
    }
    datePanel.classList.add("pc-direct-booksy-active");
    host.innerHTML = `
      <div class="pc-direct-booksy-result-card">
        <p class="pc-direct-booksy-kicker">VERIFIED BOOKSY PROFILE</p>
        <h3>${esc(barber.displayName || barber.name)}</h3>
        <p>${service ? `<strong>${esc(service.name)}</strong><br>${esc(service.durationMinutes || service.duration)} min · $${Number(service.price).toFixed(0)}` : "Choose any available service and time on Booksy."}</p>
        <p class="pc-direct-booksy-note">This profile uses direct Booksy booking while dedicated live availability is being connected.</p>
        <a href="${esc(barber.booksyUrl)}" target="_blank" rel="noopener noreferrer">Continue to Booksy</a>
      </div>`;
    host.scrollIntoView({behavior:"smooth",block:"nearest"});
  }

  function barberCard(barber) {
    const article = document.createElement("article");
    article.className = "pc-direct-booksy-barber";
    article.dataset.barberId = barber.id;
    const src = photo(barber);
    article.innerHTML = `
      <button type="button" aria-label="Select ${esc(barber.displayName || barber.name)}">
        <span class="pc-direct-booksy-avatar">${src ? `<img src="${esc(src)}" alt="" loading="lazy">` : esc((barber.name || "B").slice(0,1))}</span>
        <span class="pc-direct-booksy-barber-copy">
          <strong>${esc(barber.displayName || barber.name)}</strong>
          <small>${esc(barber.title || "Precision Cuts Barber")}</small>
          <em>Direct verified Booksy booking</em>
        </span>
      </button>`;
    article.querySelector("button").addEventListener("click", () => {
      document.querySelectorAll(".pc-direct-booksy-barber.is-selected").forEach(node => node.classList.remove("is-selected"));
      article.classList.add("is-selected");
      showDirectBooking(barber, null);
    });
    return article;
  }

  function serviceGroup(barber) {
    const details = document.createElement("details");
    details.className = "pc-direct-booksy-services";
    details.dataset.barberId = barber.id;
    details.innerHTML = `
      <summary>
        <span><strong>${esc(barber.displayName || barber.name)}</strong><small>Verified direct Booksy services</small></span>
        <b>${(barber.services || []).length}</b>
      </summary>
      <div class="pc-direct-service-list"></div>`;
    const list = details.querySelector(".pc-direct-service-list");
    (barber.services || []).forEach(service => {
      const button = document.createElement("button");
      button.type = "button";
      button.innerHTML = `<span><strong>${esc(service.name)}</strong><small>${esc(service.durationMinutes || service.duration)} min · $${Number(service.price).toFixed(0)}</small></span><em>Booksy</em>`;
      button.addEventListener("click", () => {
        document.querySelectorAll(".pc-direct-service-list button.is-selected").forEach(node => node.classList.remove("is-selected"));
        button.classList.add("is-selected");
        const card = document.querySelector(`.pc-direct-booksy-barber[data-barber-id="${barber.id}"]`);
        document.querySelectorAll(".pc-direct-booksy-barber.is-selected").forEach(node => node.classList.remove("is-selected"));
        card?.classList.add("is-selected");
        showDirectBooking(barber, service);
      });
      list.appendChild(button);
    });
    return details;
  }

  function apply() {
    const barbers = configBarbers();
    if (barbers.length !== 2) return;
    const servicesPanel = panelFor("1. SERVICES");
    const barbersPanel = panelFor("2. BARBERS");
    if (!servicesPanel || !barbersPanel) return;

    const servicesBody = bodyFor(servicesPanel, "1. SERVICES");
    const barbersBody = bodyFor(barbersPanel, "2. BARBERS");
    if (!servicesBody || !barbersBody) return;

    let barberHost = barbersBody.querySelector("[data-pc-direct-booksy-barbers]");
    if (!barberHost) {
      barberHost = document.createElement("div");
      barberHost.className = "pc-direct-booksy-barbers";
      barberHost.setAttribute("data-pc-direct-booksy-barbers", "");
      barbersBody.appendChild(barberHost);
    }

    let serviceHost = servicesBody.querySelector("[data-pc-direct-booksy-services]");
    if (!serviceHost) {
      serviceHost = document.createElement("div");
      serviceHost.className = "pc-direct-booksy-service-groups";
      serviceHost.setAttribute("data-pc-direct-booksy-services", "");
      servicesBody.appendChild(serviceHost);
    }

    if (!barberHost.children.length) barbers.forEach(barber => barberHost.appendChild(barberCard(barber)));
    if (!serviceHost.children.length) barbers.forEach(barber => serviceHost.appendChild(serviceGroup(barber)));
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", apply, {once:true})
    : apply();
  document.addEventListener("booksy-portal-config-ready", apply);
  window.addEventListener("load", apply, {once:true});

  let queued=false;
  const observer=new MutationObserver(() => {
    if (queued) return;
    queued=true;
    requestAnimationFrame(() => { queued=false; apply(); });
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(() => observer.disconnect(),6000);
})();
