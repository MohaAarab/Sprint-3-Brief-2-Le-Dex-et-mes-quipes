// App state, startup and event listeners.
import { request, getCreature, createCreature } from "./services/api.js";
import {
  getSavedCreatures,
  saveCreature,
  getLastSearch,
  saveLastSearch,
  clearLastSearch,
  getFavorites,
  saveFavorites,
  saveLastType,
  getLastType,
  saveFormDraft,
  getFormDraft,
  clearFormDraft,
} from "./storage.js";
import {
  affich,
  detail,
  hideDetail,
  showStatus,
  clearGrid,
  setLoadMoreVisible,
  teamCreation,
  error,
  errorRemovale,
  showRetry,
  hideRetry,
} from "./ui.js";
import { validateCreature } from "./rules.js";

// validation test
// console.log(validateCreature({
//   name: "",
//   type: "",
//   stats: {
//     attack: 300,
//     defense: 0
//   }
// }));

let creatures = [];
let team = [];
const max = 6;
const knownCreatures = new Map();
const grid = document.querySelector("#grid");
const rech = document.querySelector("#search");
const tpSelect = document.querySelector("#typeFilter");
const load_more = document.querySelector("#load-more");
const detailPanel = document.querySelector("#detail");
const teamSlots = document.querySelector("#team-slots");
const teamMsg = document.querySelector("#team-msg");
const retry_btn = document.querySelector("#retry-btn");
const sortSelect = document.querySelector("#sortFilter");
let retryAction = init;
function rememberCards(cards) {
  cards.forEach((card) => knownCreatures.set(String(card.id), card));
}

function findCreature(id) {
  return knownCreatures.get(String(id)) ?? null;
}

function renderCurrent() {
  rememberCards(creatures);
  const favs = getFavorites();

  affich(creatures, creatures.length, team.length, favs);
}

// loading the initial cards
async function loadInitialCards() {
  creatures = await request("GET", "/creatures");
  renderCurrent();
  setLoadMoreVisible(false);
  hideDetail();
}

async function init() {
  hideRetry();
  showStatus("Chargement des cartes...");
  try {
    tpSelect.value = getLastType();
    await handleSearch();
  } catch (error) {
    console.error(error);
    clearGrid();
    showStatus("Erreur de chargement des cartes");
    retryAction = init;
    showRetry();
  }
}

async function loadMore() {
  hideRetry();
  load_more.disabled = true;
  try {
    const more = await getCreatures();
    creatures.push(...more);
    renderCurrent();
    showStatus("");
  } catch (error) {
    console.error(error);
    clearGrid();
    showStatus("Erreur de chargement des cartes");
    retryAction = loadMore;
    showRetry();
  } finally {
    load_more.disabled = false;
  }
}

async function handleSearch() {
  hideRetry();
  const value = rech.value.trim();
  const [sortBy, order] = sortSelect.value.split("-");
  rech.disabled = true;
  showStatus(value ? "Recherche en cours..." : "Chargement des cartes...");

  try {
    let route = "/creatures";

    if (!value && tpSelect.value !== "Tous")
      route += `?type=${encodeURIComponent(tpSelect.value)}`;
    else if (value && tpSelect.value !== "Tous")
      route += `?type=${encodeURIComponent(tpSelect.value)}&q=${encodeURIComponent(value)}`;
    else if (value) route += `?q=${encodeURIComponent(value)}`;

    const separ = route.includes("?") ? "&" : "?";
    route += `${separ}_sort=${sortBy}&_order=${order}`;

    creatures = await request("GET", `${route}`);
    renderCurrent();
    showStatus(creatures.length === 0 ? "Aucune créature trouvée" : "");
  } catch (error) {
    console.error(error);
    clearGrid();
    showStatus("Erreur lors de la recherche");
    retryAction = handleSearch;
    showRetry();
  } finally {
    rech.disabled = false;
  }
}

async function searchFilter() {
  saveLastType(tpSelect.value);
  await handleSearch();
}

function addToTeam(id) {
  if (team.includes(id)) {
    teamMsg.textContent = "this creature is already in the team";
    return;
  }
  if (team.length >= max) {
    teamMsg.textContent = "the team is already full";
    return;
  }
  team.push(id);
  teamCreation(team, findCreature);
}

function removeFromTeam(id) {
  team = team.filter((item) => item !== id);
  teamCreation(team, findCreature);
}

// form validation
function formValidation() {
  const form = document.querySelector("#creature-form");
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (submitBtn.disabled) return;

    // Get form data
    const newCreature = {
      name: document.querySelector("#name").value.trim(),
      type: document.querySelector("#type").value,
      image: document.querySelector("#img").value.trim(),
      description: document.querySelector("#description").value.trim(),
      stats: {
        attack: document.querySelector("#attack").value.trim(),
        defense: document.querySelector("#defence").value.trim(),
      },
    };

    // Validate before sending
    const errors = validateCreature(newCreature);

    // Display errors under each field
    const fields = {
      name: "nameError",
      type: "typeError",
      attack: "attackError",
      defense: "defenceError",
    };

    Object.entries(fields).forEach(([field, elementId]) => {
      document.getElementById(elementId).textContent = errors[field] || "";
    });

    // Stop submission if validation fails
    if (Object.keys(errors).length > 0) return;

    // Convert stats to numbers
    newCreature.stats.attack = Number(newCreature.stats.attack);
    newCreature.stats.defense = Number(newCreature.stats.defense);

    // POST request
    submitBtn.disabled = true;

    try {
      await createCreature(newCreature);
      await handleSearch();

      form.reset();
      showStatus("Créature ajoutée avec succès");
    } catch (error) {
      console.error(error);
      showStatus("Erreur lors de l'ajout");
    } finally {
      submitBtn.disabled = false;
    }
  });
}

function addFavorite(id) {
  const fav = getFavorites();
  id = String(id);

  if (!fav.includes(id)) {
    fav.push(id);
    saveFavorites(fav);
  }
}

function removeFavorite(id) {
  const favs = getFavorites();
  id = String(id);

  const newFavs = favs.filter((fav) => fav !== id);
  saveFavorites(newFavs);
}

function toggleFavorites(id) {
  const favs = getFavorites();
  id = String(id);
  if (favs.includes(id)) {
    removeFavorite(id);
  } else {
    addFavorite(id);
  }
}

// Event listeners
grid.addEventListener("click", async (event) => {
  const target = event.target;
  if (target.classList.contains("btn-favorite")) {
    toggleFavorites(target.dataset.id);
    renderCurrent();
    return;
  }
  if (target.classList.contains("btn-add")) {
    addToTeam(target.dataset.id);
    return;
  }
  const card = target.closest("article[data-id]");
  if (!card) return;

  try {
    showStatus("Chargement de la créature...");
    const creature = await getCreature(card.dataset.id);
    detail(creature, team.length);
    showStatus("");
  } catch (error) {
    clearGrid();
    error.message.includes("404")
      ? showStatus("Créature introuvable")
      : showStatus("Erreur lors du chargement de la créature");

    console.error(error);
  }
});

detailPanel.addEventListener("click", (event) => {
  const target = event.target;
  if (target.classList.contains("btn-add")) addToTeam(target.dataset.id);
  if (target.classList.contains("btn-close")) hideDetail();
});

rech.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleSearch();
  }
});

tpSelect.addEventListener("change", searchFilter);

load_more.addEventListener("click", loadMore);
teamSlots.addEventListener("click", (event) => {
  if (event.target.classList.contains("btn-remove")) {
    removeFromTeam(event.target.dataset.id);
  }
});

retry_btn.addEventListener("click", () => {
  hideRetry();
  retryAction();
});

sortSelect.addEventListener("change", () => {
  handleSearch();
});

formValidation();
teamCreation(team, findCreature);
init();
