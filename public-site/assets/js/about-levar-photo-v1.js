(() => {
  "use strict";
  const PHOTO = "/assets/images/barbers/levar-neal/Levar_Neal_01.jpg";
  const PROFILE = "/var-da-barber.html";

  const findCard = () => {
    const heading = [...document.querySelectorAll("main h1, main h2, main h3, main h4")]
      .find(node => ["levar neal", "var da barber"].includes(node.textContent.trim().toLowerCase()));
    if (!heading) return null;
    return heading.closest("article, li, .barber-card, .team-card, .profile-card, [class*='barber'], [class*='team']") || heading.parentElement;
  };

  const apply = () => {
    const card = findCard();
    if (!card) return false;
    card.classList.add("pc-about-levar-card-v1");

    const image = card.querySelector("img");
    if (!image) return false;
    image.src = PHOTO;
    image.alt = "Levar Neal profile photo";
    image.removeAttribute("srcset");
    image.removeAttribute("data-src");
    image.classList.add("pc-about-levar-photo-v1");

    const existingImageLink = image.closest("a");
    if (existingImageLink) existingImageLink.href = PROFILE;
    else {
      const link = document.createElement("a");
      link.href = PROFILE;
      link.className = "pc-about-levar-photo-link-v1";
      image.parentNode.insertBefore(link, image);
      link.appendChild(image);
    }

    [...card.querySelectorAll("*")].forEach(node => {
      if (node.children.length) return;
      const text = node.textContent.trim().toLowerCase();
      if (text === "ai placeholder" || text.includes("ai-generated")) node.remove();
    });

    let action = [...card.querySelectorAll("a, button")].find(node =>
      /view services and availability|view profile|profile preview/i.test(node.textContent)
    );
    if (!action || action.tagName !== "A") {
      const replacement = document.createElement("a");
      replacement.className = action?.className || "pc-about-levar-profile-v1";
      if (action) action.replaceWith(replacement);
      else card.appendChild(replacement);
      action = replacement;
    }
    action.href = PROFILE;
    action.textContent = "View Levar Neal’s profile";
    action.classList.add("pc-about-levar-profile-v1");
    return true;
  };

  if (!apply()) {
    const observer = new MutationObserver(() => { if (apply()) observer.disconnect(); });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 15000);
  }
})();
