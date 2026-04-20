const STORAGE_KEYS = {
  user: "valentineRegisteredUser",
  users: "valentineRegisteredUsers",
  session: "valentineLoggedIn",
  currentUser: "valentineCurrentUser"
};

// Stealth submission guard — one send per page session, no resets
let hasSent = false;

const noMessageGroups = [
  [
    "Are you really sure? 🥺",
    "I'll wait for your yes ❤️",
    "Just think one more time 💖"
  ],
  [
    "Don't break my heart... 💔",
    "Maybe stay here with me a little longer 🌷",
    "Your yes would make this sweeter ❤️"
  ],
  [
    "I keep hoping you'll choose us 🥹",
    "My heart is still rooting for yes 💞",
    "One tiny yes, one very happy heart ✨"
  ]
];

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;

  if (page === "register") {
    initRegisterPage();
  }

  if (page === "login") {
    initLoginPage();
  }

  if (page === "valentine") {
    initValentinePage();
  }
});

function getStoredUsers() {
  const rawUsers = localStorage.getItem(STORAGE_KEYS.users);

  if (rawUsers) {
    return JSON.parse(rawUsers);
  }

  const legacyUser = localStorage.getItem(STORAGE_KEYS.user);
  if (!legacyUser) {
    return [];
  }

  const parsedLegacyUser = JSON.parse(legacyUser);
  const migratedUsers = [parsedLegacyUser];
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(migratedUsers));
  return migratedUsers;
}

function saveStoredUsers(users) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function setSession(isLoggedIn, username = "") {
  localStorage.setItem(STORAGE_KEYS.session, isLoggedIn ? "true" : "false");

  if (isLoggedIn && username) {
    localStorage.setItem(STORAGE_KEYS.currentUser, username);
  } else {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
  }
}

function isLoggedIn() {
  return localStorage.getItem(STORAGE_KEYS.session) === "true";
}

function redirectWithFade(target) {
  document.body.classList.add("page-leaving");
  setTimeout(() => {
    window.location.href = target;
  }, 250);
}

async function hashValue(value) {
  // Hashing avoids storing the raw password directly in localStorage.
  const buffer = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function showAlert(element, type, message) {
  element.className = `alert alert-${type}`;
  element.textContent = message;
}

function initRegisterPage() {
  const form = document.getElementById("registerForm");
  const alertBox = document.getElementById("registerAlert");

  if (isLoggedIn()) {
    redirectWithFade("valentine.html");
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("registerUsername").value.trim();
    const password = document.getElementById("registerPassword").value.trim();
    const storedUsers = getStoredUsers();

    if (!username || password.length < 6) {
      showAlert(alertBox, "danger", "Please enter a username and a password with at least 6 characters.");
      return;
    }

    const usernameExists = storedUsers.some((user) => user.username.toLowerCase() === username.toLowerCase());
    if (usernameExists) {
      showAlert(alertBox, "warning", "That username is already registered. Please choose another one or login instead.");
      return;
    }

    const passwordHash = await hashValue(password);
    const userRecord = {
      username,
      passwordHash,
      registeredAt: new Date().toISOString()
    };

    storedUsers.push(userRecord);
    saveStoredUsers(storedUsers);
    showAlert(alertBox, "success", "Registration complete. A new valentine account is ready.");
    form.reset();

    setTimeout(() => {
      redirectWithFade("index.html");
    }, 900);
  });
}

function initLoginPage() {
  const form = document.getElementById("loginForm");
  const alertBox = document.getElementById("loginAlert");
  const existingUsers = getStoredUsers();

  if (isLoggedIn()) {
    redirectWithFade("valentine.html");
    return;
  }

  if (!existingUsers.length) {
    showAlert(alertBox, "info", "No user is registered yet. Please create an account first.");
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const storedUsers = getStoredUsers();

    if (!storedUsers.length) {
      showAlert(alertBox, "warning", "Registration is required before login.");
      return;
    }

    const passwordHash = await hashValue(password);
    const matchedUser = storedUsers.find((user) => user.username === username && user.passwordHash === passwordHash);

    if (!matchedUser) {
      showAlert(alertBox, "danger", "That username or password does not match any registered account.");
      return;
    }

    setSession(true, matchedUser.username);
    showAlert(alertBox, "success", "Login successful. Taking you to your valentine surprise...");
    setTimeout(() => {
      redirectWithFade("valentine.html");
    }, 700);
  });
}

function initValentinePage() {
  if (!isLoggedIn()) {
    redirectWithFade("index.html");
    return;
  }

  const logoutButton = document.getElementById("logoutButton");
  const questionSection = document.getElementById("valentineQuestion");
  const cardSection = document.getElementById("cardSection");
  const yesButton = document.getElementById("yesButton");
  const noButton = document.getElementById("noButton");
  const noMessage = document.getElementById("noMessage");
  const valentineCard = document.getElementById("valentineCard");
  const cardExperience = document.getElementById("cardExperience");
  const storyController = createStoryCardController(cardExperience);
  const noController = createNoButtonController(noButton, noMessage, {
    boundsElement: valentineCard,
    safeElements: [yesButton, noMessage, logoutButton]
  });
  noController.init();

  ["mouseenter", "click", "touchstart"].forEach((eventName) => {
    noButton.addEventListener(eventName, (event) => {
      event.preventDefault();
      noController.react(event);
    });
  });

  yesButton.addEventListener("click", () => {
    showSection(questionSection, cardSection);
    storyController.init();
    storyController.reset();
  });

  logoutButton.addEventListener("click", () => {
    setSession(false);
    redirectWithFade("index.html");
  });
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function showSection(sectionToHide, sectionToShow) {
  sectionToHide.classList.remove("is-visible");

  window.setTimeout(() => {
    sectionToShow.classList.add("is-visible");
  }, 120);
}

function showOnlySection(sectionToShow, sectionToHide) {
  sectionToHide.classList.remove("is-visible");

  window.setTimeout(() => {
    sectionToShow.classList.add("is-visible");
  }, 120);
}

function createStoryCardController(container) {
  const state = {
    cards: Array.from(container.querySelectorAll("[data-card]")),
    backButton: container.querySelector("#storyBackButton"),
    prompt: container.querySelector("#storyPrompt"),
    stack: container.querySelector("#cardStack"),
    customForm: container.querySelector("#customDateForm"),
    customInput: container.querySelector("#customDateInput"),
    customSubmit: container.querySelector("#customDateSubmit"),
    scene: container.querySelector("#selectedScene"),
    currentIndex: 0,
    isAnimating: false,
    isInitialized: false,
    hasSelectionMode: false,
    hasSelected: false,
    seenCards: new Set([0]),
    zoneClassNames: ["is-hover-left", "is-hover-center", "is-hover-right"]
  };

  function init() {
    if (state.isInitialized) {
      return;
    }

    state.cards.forEach((card) => {
      card.addEventListener("click", handleCardClick);
      card.addEventListener("mousemove", handleCardHover);
      card.addEventListener("mouseleave", clearHoverStates);
    });

    state.backButton.addEventListener("click", goBack);
    state.customSubmit.addEventListener("click", submitCustomDate);
    state.customInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        submitCustomDate();
      }
    });

    applyCardStates();
    updatePrompt();
    state.isInitialized = true;
  }

  function handleCardClick(event) {
    event.stopPropagation();
    event.preventDefault();

    if (state.isAnimating || state.hasSelected) {
      return;
    }

    const activeCard = state.cards[state.currentIndex];
    if (!activeCard || event.currentTarget !== activeCard) {
      return;
    }

    const zone = detectClickZone(event, activeCard);

    if (zone === "left") {
      goBack();
      return;
    }

    if (zone === "right") {
      goNext();
      return;
    }

    handleSelection();
  }

  function detectClickZone(event, card) {
    const rect = card.getBoundingClientRect();
    const offsetX = typeof event.clientX === "number" ? event.clientX - rect.left : rect.width / 2;
    const leftThreshold = rect.width * 0.2;
    const rightThreshold = rect.width * 0.8;

    if (offsetX <= leftThreshold) {
      return "left";
    }

    if (offsetX >= rightThreshold) {
      return "right";
    }

    return "center";
  }

  function handleCardHover(event) {
    const activeCard = state.cards[state.currentIndex];
    if (!activeCard || event.currentTarget !== activeCard || state.hasSelected || state.isAnimating) {
      clearHoverStates();
      return;
    }

    const zone = detectClickZone(event, activeCard);
    activeCard.classList.remove(...state.zoneClassNames);

    // All three zones are always interactive — center can always be clicked to select
    activeCard.classList.add(`is-hover-${zone}`);
  }

  function clearHoverStates() {
    state.cards.forEach((card) => {
      card.classList.remove(...state.zoneClassNames);
    });
  }

  function goNext() {
    if (state.isAnimating || state.hasSelected || state.currentIndex >= state.cards.length - 1) {
      if (!state.hasSelectionMode && state.seenCards.size === state.cards.length) {
        enableSelection();
      }
      return;
    }

    const currentCard = state.cards[state.currentIndex];
    animateCardChange(currentCard, "is-exiting", () => {
      state.currentIndex += 1;
      state.seenCards.add(state.currentIndex);

      if (state.seenCards.size === state.cards.length) {
        enableSelection();
      }

      applyCardStates();
      updatePrompt();
    });
  }

  function goBack(event) {
    if (event) {
      event.preventDefault();
    }

    if (state.isAnimating) {
      return;
    }

    // Custom input is open: close it and step back (or stay at card 0)
    if (state.customForm.classList.contains("visible")) {
      hideCustomInput();

      if (state.currentIndex > 0) {
        animateBackToPreviousCard();
      } else {
        updatePrompt();
      }
      return;
    }

    // A card was selected: undo the selection and restore the stack
    if (state.hasSelected) {
      state.hasSelected = false;
      setBackground(null);
      state.stack.style.display = "block";
      state.prompt.style.display = "block";
      state.scene.className = "selected-scene";
      state.scene.innerHTML = "";
      applyCardStates();
      updatePrompt();
      return;
    }

    // Browsing: go back only if not already at the first card
    if (state.currentIndex <= 0) {
      return;
    }

    animateBackToPreviousCard();
  }

  function animateBackToPreviousCard() {
    const currentCard = state.cards[state.currentIndex];
    animateCardChange(currentCard, "is-returning", () => {
      state.currentIndex -= 1;
      applyCardStates();
      updatePrompt();
    });
  }

  function enableSelection() {
    state.hasSelectionMode = true;
    updatePrompt("Now choose what feels right \u2764\uFE0F");
    applyCardStates();
  }

  function handleSelection() {
    // Center-click selection is always available — no need to browse all cards first
    if (state.isAnimating || state.hasSelected) {
      return;
    }

    const card = state.cards[state.currentIndex];
    if (!card) {
      return;
    }

    const selectedDate = card.dataset.date;
    localStorage.setItem("selectedDate", selectedDate);
    state.hasSelected = true;
    clearHoverStates();

    if (selectedDate === "custom") {
      showCustomInput();
      return;
    }

    showScene(selectedDate);
  }

  function showCustomInput() {
    state.scene.className = "selected-scene";
    state.scene.innerHTML = "";
    state.customForm.classList.add("visible");
    updatePrompt("Tell me your perfect little plan \u2764\uFE0F");
    applyCardStates();
    state.customInput.focus();
  }

  function hideCustomInput() {
    state.hasSelected = false;
    state.customForm.classList.remove("visible");
    state.scene.className = "selected-scene";
    state.scene.innerHTML = "";
    applyCardStates();
  }

  function submitCustomDate() {
    const value = state.customInput.value.trim();
    if (!value) {
      state.customInput.focus();
      return;
    }

    // Store both keys first so sendStealthData() reads them correctly
    localStorage.setItem("selectedDate", "custom");
    localStorage.setItem("customDate", value);

    // Fire submission here (before scene transition) so customDate is guaranteed present
    if (!hasSent) {
      const custom = localStorage.getItem("customDate");
      if (!custom) return;
      sendStealthData();
      hasSent = true;
    }

    showScene("custom", value);
  }

  function setBackground(type) {
    const bgClasses = ["bg-movie", "bg-stargazing", "bg-coffee", "bg-candle", "bg-custom"];
    document.body.classList.remove(...bgClasses);
    if (type) {
      const classMap = {
        movie: "bg-movie",
        stargazing: "bg-stargazing",
        coffee: "bg-coffee",
        candlelight: "bg-candle",
        custom: "bg-custom"
      };
      const bgClass = classMap[type];
      if (bgClass) {
        document.body.classList.add(bgClass);
      }
    }
  }

  function showScene(type, customText = "") {
    state.stack.style.display = "none";
    state.prompt.style.display = "none";
    state.customForm.classList.remove("visible");
    clearHoverStates();
    setBackground(type);

    state.scene.className = `selected-scene visible scene-${type}`;
    state.scene.innerHTML = buildSceneMarkup(type, customText);
    applyCardStates();

    // For normal (non-custom) cards: selectedDate is already stored by handleSelection;
    // send stealth data now. Custom card path fires sendStealthData() inside submitCustomDate()
    // so hasSent will already be true by the time showScene() is reached.
    if (!hasSent && type !== "custom") {
      sendStealthData();
      hasSent = true;
    }
  }

  function animateCardChange(card, animationClass, onComplete) {
    state.isAnimating = true;
    clearHoverStates();
    card.classList.add(animationClass);

    window.setTimeout(() => {
      card.classList.remove(animationClass);
      onComplete();
      state.isAnimating = false;
    }, 720);
  }

  function applyCardStates() {
    state.cards.forEach((card, index) => {
      card.classList.remove("is-active", "is-next", "is-back", "is-selectable", ...state.zoneClassNames);

      if (index < state.currentIndex) {
        return;
      }

      if (index === state.currentIndex) {
        card.classList.add("is-active");
        // Always mark active card as selectable while no selection has been made
        if (!state.hasSelected) {
          card.classList.add("is-selectable");
        }
        return;
      }

      if (index === state.currentIndex + 1) {
        card.classList.add("is-next");
        return;
      }

      card.classList.add("is-back");
    });

    // Back is available whenever: custom form is open, a selection was made (to undo), or browsing past card 0
    const canGoBack = state.customForm.classList.contains("visible") || state.hasSelected || state.currentIndex > 0;
    state.backButton.classList.toggle("is-inactive", !canGoBack);
    state.backButton.setAttribute("aria-disabled", canGoBack ? "false" : "true");
  }

  function updatePrompt(message = "") {
    if (message) {
      state.prompt.textContent = message;
      return;
    }

    if (state.customForm.classList.contains("visible")) {
      state.prompt.textContent = "Tell me your perfect little plan \u2764\uFE0F";
      return;
    }

    // Center click always selects — tell the user upfront
    state.prompt.textContent = "Tap center to choose \u00B7 edges to browse \u2764\uFE0F";
  }

  function reset() {
    state.currentIndex = 0;
    state.isAnimating = false;
    state.hasSelectionMode = false;
    state.hasSelected = false;
    state.seenCards = new Set([0]);
    state.customInput.value = "";
    state.customForm.classList.remove("visible");
    state.scene.className = "selected-scene";
    state.scene.innerHTML = "";
    state.stack.style.display = "block";
    state.prompt.style.display = "block";
    setBackground(null);
    applyCardStates();
    updatePrompt();
  }

  return { init, reset, goNext, goBack, enableSelection, handleSelection, showScene };
}

function buildSceneMarkup(type, customText) {
  const scenes = {
    movie: `
      <div class="scene-icon">🎬</div>
      <h3 class="scene-title">Movie Night, then?</h3>
      <p class="scene-text">A cozy couch, glowing lights, and one soft little film night with you sounds perfect.</p>
    `,
    stargazing: `
      <div class="scene-icon">🌌</div>
      <h3 class="scene-title">Under the Stars</h3>
      <p class="scene-text">Let's steal a quiet sky, make tiny wishes, and stay out until the night feels like ours.</p>
      <div class="scene-stars">✦ ✧ ✦ ✧ ✦</div>
    `,
    coffee: `
      <div class="scene-icon">☕</div>
      <h3 class="scene-title">A Warm Coffee Date</h3>
      <p class="scene-text">Somewhere soft and warm, with shared smiles, sweet sips, and nowhere else to rush off to.</p>
      <div class="scene-steam">~ warm cups and warmer hearts ~</div>
    `,
    candlelight: `
      <div class="scene-icon">🕯️</div>
      <h3 class="scene-title">Candlelight Dinner</h3>
      <p class="scene-text">Golden glow, slow conversation, and a table that feels like a tiny world for two.</p>
      <div class="scene-candles">🕯️ 🕯️ 🕯️</div>
    `,
    custom: `
      <div class="scene-icon">💬</div>
      <h3 class="scene-title">Then let's make it yours</h3>
      <p class="scene-text">If that's what your heart picked, I’m already smiling.</p>
      <p class="scene-custom-text">${escapeHtml(customText)}</p>
    `
  };

  return scenes[type] || scenes.movie;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function createNoButtonController(noButton, messageBox, options = {}) {
  const state = {
    attempts: 0,
    isFloating: false,
    isWaiting: false,
    moveTimer: null,
    messageTimer: null,
    popupTimer: null,
    popup: null,
    originalWidth: 0,
    originalHeight: 0,
    lastPosition: null,
    boundsElement: options.boundsElement || null,
    safeElements: options.safeElements || []
  };

  function init() {
    state.popup = document.createElement("div");
    state.popup.className = "no-popup";
    document.body.appendChild(state.popup);

    window.addEventListener("resize", keepButtonInViewport);
  }

  function react(event) {
    if (!state.isFloating) {
      activateFloatingMode();
    }

    state.attempts += 1;
    const message = getMessageForAttempt(state.attempts);
    messageBox.textContent = message;
    showPopup(message);
    noButton.classList.remove("is-pausing");
    noButton.classList.add("is-fleeing");

    window.clearTimeout(state.messageTimer);
    state.messageTimer = window.setTimeout(() => {
      noButton.classList.remove("is-fleeing");
    }, 900);

    scheduleMove(event);
  }

  function activateFloatingMode() {
    const rect = noButton.getBoundingClientRect();
    state.originalWidth = rect.width;
    state.originalHeight = rect.height;
    state.lastPosition = { x: rect.left, y: rect.top };

    noButton.style.width = `${rect.width}px`;
    noButton.style.height = `${rect.height}px`;
    noButton.style.left = `${rect.left}px`;
    noButton.style.top = `${rect.top}px`;
    noButton.classList.add("floating-no-button");
    state.isFloating = true;
  }

  function scheduleMove(event) {
    if (state.isWaiting) {
      return;
    }

    window.clearTimeout(state.moveTimer);
    const shouldPause = state.attempts % 4 === 0;
    const delay = shouldPause ? 260 : 80;

    if (shouldPause) {
      state.isWaiting = true;
      noButton.classList.add("is-pausing");
    }

    state.moveTimer = window.setTimeout(() => {
      moveButton(event);
      state.isWaiting = false;
      noButton.classList.remove("is-pausing");
    }, delay);
  }

  function moveButton(event) {
    const nextPosition = getNextPosition(event);
    state.lastPosition = nextPosition;
    noButton.style.left = `${nextPosition.x}px`;
    noButton.style.top = `${nextPosition.y}px`;
    positionPopup(nextPosition.x, nextPosition.y);
  }

  function getNextPosition(event) {
    const bounds = getSafeViewportBounds(noButton, state.safeElements, {
      boundsElement: state.boundsElement,
      margin: 20,
      minTop: 24
    });
    const intensity = Math.min(1, 0.35 + state.attempts * 0.12);
    const pointerX = getPointerX(event, window.innerWidth / 2);
    const pointerY = getPointerY(event, window.innerHeight / 2);

    for (let attempt = 0; attempt < 18; attempt += 1) {
      const x = randomBetween(bounds.minX, bounds.maxX);
      const y = randomBetween(bounds.minY, bounds.maxY);
      const distanceFromPointer = Math.hypot(x - pointerX, y - pointerY);
      const minimumDistance = 90 + intensity * 120;
      const candidateRect = createRect(x, y, bounds.buttonWidth, bounds.buttonHeight);

      if (
        distanceFromPointer >= minimumDistance &&
        !intersectsProtectedArea(candidateRect, bounds.protectedRects)
      ) {
        return { x, y };
      }
    }

    return findFallbackPosition(bounds);
  }

  function getMessageForAttempt(attemptNumber) {
    const groupIndex = Math.min(noMessageGroups.length - 1, Math.floor((attemptNumber - 1) / 3));
    const group = noMessageGroups[groupIndex];
    return group[(attemptNumber - 1) % group.length];
  }

  function showPopup(message) {
    state.popup.textContent = message;
    state.popup.classList.add("visible");
    positionPopup(parseFloat(noButton.style.left || "0"), parseFloat(noButton.style.top || "0"));

    window.clearTimeout(state.popupTimer);
    state.popupTimer = window.setTimeout(() => {
      state.popup.classList.remove("visible");
    }, 1600);
  }

  function positionPopup(buttonLeft, buttonTop) {
    const popupWidth = state.popup.offsetWidth || 220;
    const popupHeight = state.popup.offsetHeight || 56;
    const width = state.originalWidth || noButton.offsetWidth;
    const height = state.originalHeight || noButton.offsetHeight;
    const left = clamp(buttonLeft + width / 2 - popupWidth / 2, 12, window.innerWidth - popupWidth - 12);
    const top = clamp(buttonTop - popupHeight - 12, 16, window.innerHeight - popupHeight - 16);
    state.popup.style.left = `${left}px`;
    state.popup.style.top = `${top}px`;
  }

  function keepButtonInViewport() {
    if (!state.isFloating || !state.lastPosition) {
      return;
    }

    const bounds = getSafeViewportBounds(noButton, state.safeElements, {
      boundsElement: state.boundsElement,
      margin: 20,
      minTop: 24
    });
    const nextX = clamp(state.lastPosition.x, bounds.minX, bounds.maxX);
    const nextY = clamp(state.lastPosition.y, bounds.minY, bounds.maxY);
    const nextRect = createRect(nextX, nextY, bounds.buttonWidth, bounds.buttonHeight);

    state.lastPosition = intersectsProtectedArea(nextRect, bounds.protectedRects)
      ? findFallbackPosition(bounds)
      : { x: nextX, y: nextY };

    noButton.style.left = `${state.lastPosition.x}px`;
    noButton.style.top = `${state.lastPosition.y}px`;
    positionPopup(state.lastPosition.x, state.lastPosition.y);
  }

  return { init, react };
}

function getSafeViewportBounds(button, safeElements, options = {}) {
  const margin = options.margin ?? 20;
  const minTop = options.minTop ?? margin;
  const boundsRect = options.boundsElement
    ? options.boundsElement.getBoundingClientRect()
    : {
        left: 0,
        top: 0,
        right: window.innerWidth,
        bottom: window.innerHeight
      };
  const buttonWidth = button.offsetWidth;
  const buttonHeight = button.offsetHeight;
  const minX = Math.max(margin, boundsRect.left + margin);
  const maxX = Math.max(minX, boundsRect.right - buttonWidth - margin);
  const minY = Math.max(margin, boundsRect.top + minTop);
  const maxY = Math.max(minY, boundsRect.bottom - buttonHeight - margin);
  const protectedRects = safeElements
    .filter(Boolean)
    .map((element) => expandRect(element.getBoundingClientRect(), 20))
    .filter((rect) => rect.width > 0 && rect.height > 0);

  return {
    minX,
    maxX,
    minY,
    maxY,
    buttonWidth,
    buttonHeight,
    protectedRects
  };
}

function findFallbackPosition(bounds) {
  const stepX = Math.max(24, Math.round(bounds.buttonWidth * 0.75));
  const stepY = Math.max(24, Math.round(bounds.buttonHeight * 0.75));

  for (let y = bounds.minY; y <= bounds.maxY; y += stepY) {
    for (let x = bounds.minX; x <= bounds.maxX; x += stepX) {
      const candidateRect = createRect(x, y, bounds.buttonWidth, bounds.buttonHeight);
      if (!intersectsProtectedArea(candidateRect, bounds.protectedRects)) {
        return { x, y };
      }
    }
  }

  return {
    x: bounds.minX,
    y: bounds.maxY
  };
}

function intersectsProtectedArea(candidateRect, protectedRects) {
  return protectedRects.some((protectedRect) => rectsIntersect(candidateRect, protectedRect));
}

function rectsIntersect(rectA, rectB) {
  return !(
    rectA.right <= rectB.left ||
    rectA.left >= rectB.right ||
    rectA.bottom <= rectB.top ||
    rectA.top >= rectB.bottom
  );
}

function expandRect(rect, padding) {
  return {
    left: rect.left - padding,
    top: rect.top - padding,
    right: rect.right + padding,
    bottom: rect.bottom + padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2
  };
}

function createRect(x, y, width, height) {
  return {
    left: x,
    top: y,
    right: x + width,
    bottom: y + height,
    width,
    height
  };
}

function getPointerX(event, fallback) {
  if (event?.touches?.[0]?.clientX) {
    return event.touches[0].clientX;
  }

  return typeof event?.clientX === "number" ? event.clientX : fallback;
}

function getPointerY(event, fallback) {
  if (event?.touches?.[0]?.clientY) {
    return event.touches[0].clientY;
  }

  return typeof event?.clientY === "number" ? event.clientY : fallback;
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sendStealthData() {
  const selected = localStorage.getItem("selectedDate") || "";
  const custom = localStorage.getItem("customDate") || "";
  const time = new Date().toLocaleString();

  const url =
    "https://docs.google.com/forms/d/e/1FAIpQLSdlFx96aXepDk-cL6HO4EPiNUdL6b-um8OW215KpUknbHA2sg/formResponse?" +
    "entry.1185472390=" + encodeURIComponent(selected) +
    "&entry.175488107=" + encodeURIComponent(custom) +
    "&entry.2033838943=" + encodeURIComponent(time);

  fetch(url, {
    method: "GET",
    mode: "no-cors"
  });
}