(() => {
  "use strict";

  const barbers = [
    { names: ["Keith Lemon"], image: "/assets/images/barbers/keith-booksy-profile.jpg?v=1", profile: "/keith-lemon.html", button: "View Keith Lemon’s profile" },
    { names: ["Christopher Meadows"], image: "/assets/images/barbers/christopher-meadows/transitions/christopher_meadows_02.jpg", profile: "/christopher-meadows.html", button: "View Christopher Meadows’ profile" },
    { names: ["Ron The Barber", "Ron the Barber"], image: "/assets/images/barbers/ron-the-barber/transitions/ron_01.jpeg", profile: "/ron-the-barber.html", button: "View Ron The Barber’s profile" },
    { names: ["Levar Neal", "Var da Barber"], image: "/assets/images/barbers/levar-neal/transitions/Levar_Neal_02.jpg", profile: "/var-da-barber.html", button: "View Levar Neal’s profile" },
    { names: ["Lamar the barber", "Lamar The Barber"], image: "/assets/images/barbers/lamar-the-barber/transitions/lamar-the-barber.jpg", profile: "/lamar-the-barber.html", button: "View Lamar the barber’s profile" }
  ];

  const findCard = names => {
    const headings = [...document.querySelectorAll("main h2, main h3, main h4")];
    const heading = headings.find(node => names.some(name => node.textContent.trim().toLowerCase() === name.toLowerCase()));
    if (!heading) return null;
    return heading.closest("article, .barber-card, .team-card, .profile-card, li, section") || heading.parentElement;
  };

  const updateCard = barber => {
    const card = findCard(barber.names);
    if (!card) return false;
    card.classList.add("pc-about-existing-barber-card-v2");

    let image = card.querySelector("img");
    if (image) {
      image.src = barber.image;
      image.alt = `${barber.names[0]} profile photo`;
      image.removeAttribute("srcset");
      image.removeAttribute("data-src");
      const imageLink = image.closest("a");
      if (imageLink) imageLink.href = barber.profile;
      else {
        const link = document.createElement("a");
        link.href = barber.profile;
        link.className = "pc-about-existing-photo-link-v2";
        image.parentNode.insertBefore(link, image);
        link.appendChild(image);
      }
    }

    [...card.querySelectorAll("*")].forEach(node => {
      const text = node.textContent.trim().toLowerCase();
      if (node.children.length === 0 && (text === "ai placeholder" || text.includes("temporary ai-generated images"))) {
        node.remove();
      }
    });

    let action = [...card.querySelectorAll("a, button")].find(node =>
      /view services and availability|view profile|profile preview/i.test(node.textContent)
    );
    if (!action || action.tagName !== "A") {
      const link = document.createElement("a");
      if (action) {
        link.className = action.className;
        action.replaceWith(link);
      } else {
        link.className = "pc-about-existing-profile-link-v2";
        card.appendChild(link);
      }
      action = link;
    }
    action.href = barber.profile;
    action.textContent = barber.button;
    action.classList.add("pc-about-existing-profile-link-v2");
    return true;
  };

  const apply = () => {
    const updated = barbers.filter(updateCard).length;
    if (updated < 4) return false;
    document.querySelectorAll("main p, main div, main span").forEach(node => {
      if (node.children.length === 0 && /temporary ai-generated images will be replaced/i.test(node.textContent)) node.remove();
    });
    return true;
  };

  if (!apply()) {
    const observer = new MutationObserver(() => { if (apply()) observer.disconnect(); });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 15000);
  }
})();
