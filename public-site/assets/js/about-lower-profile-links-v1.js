(() => {
  "use strict";

  const profiles = [
    {
      names: ["levar neal", "var da barber"],
      href: "/var-da-barber.html",
      label: "View Levar Neal’s profile",
      key: "levar"
    },
    {
      names: ["lamar the barber"],
      href: "/lamar-the-barber.html",
      label: "View Lamar the barber’s profile",
      key: "lamar"
    }
  ];

  const findHeading = names =>
    [...document.querySelectorAll("main h1, main h2, main h3, main h4")]
      .find(node => names.includes(node.textContent.trim().toLowerCase()));

  const findCard = heading =>
    heading?.closest("article, li, .barber-card, .team-card, .profile-card, [class*='barber-card'], [class*='team-card']") || null;

  const findCopyColumn = (card, heading) => {
    let node = heading.parentElement;
    while (node && node !== card) {
      if (!node.querySelector("img") && node.textContent.includes(heading.textContent)) return node;
      node = node.parentElement;
    }
    return [...card.children].find(child => !child.querySelector("img") && child.textContent.trim()) || card;
  };

  const removeOldActions = (card, href) => {
    [...card.querySelectorAll("a, button")].forEach(node => {
      const text = node.textContent.trim().toLowerCase();
      const isProfileAction =
        /view .*profile|view services and availability|profile preview/.test(text) ||
        node.getAttribute("href") === href;
      if (isProfileAction && !node.querySelector("img")) node.remove();
    });
  };

  const removePlaceholderText = card => {
    [...card.querySelectorAll("*")].forEach(node => {
      if (node.children.length) return;
      const text = node.textContent.trim().toLowerCase();
      if (
        text === "ai placeholder" ||
        text.includes("temporary ai-generated") ||
        text.includes("profile preview. live booking will be enabled")
      ) node.remove();
    });
  };

  const updateCard = profile => {
    const heading = findHeading(profile.names);
    const card = findCard(heading);
    if (!heading || !card) return false;

    card.classList.add("pc-about-lower-card-v1", `pc-about-${profile.key}-card-v1`);
    const copy = findCopyColumn(card, heading);
    copy.classList.add("pc-about-lower-copy-v1");

    const image = card.querySelector("img");
    if (image) {
      const existingLink = image.closest("a");
      if (existingLink) existingLink.href = profile.href;
      else {
        const imageLink = document.createElement("a");
        imageLink.href = profile.href;
        imageLink.className = "pc-about-lower-photo-link-v1";
        image.parentNode.insertBefore(imageLink, image);
        imageLink.appendChild(image);
      }
    }

    removeOldActions(card, profile.href);
    removePlaceholderText(card);

    const action = document.createElement("a");
    action.href = profile.href;
    action.className = "pc-about-lower-profile-link-v1";
    action.textContent = profile.label;
    copy.appendChild(action);
    return true;
  };

  const apply = () => profiles.every(updateCard);

  if (!apply()) {
    const observer = new MutationObserver(() => {
      if (apply()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 15000);
  }
})();
