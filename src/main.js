// App state, startup and event listeners.
import {
  request,
  getCreature,
  createCreature,
  updateCreature,
  deleteCreature,
} from "./services/api.js";
import {
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
  teamCreation,
  showRetry,
  hideRetry,
} from "./ui.js";
import { validateCreature } from "./rules.js";



let creatures = [];
let team = [];
const max = 6;
const knownCreatures = new Map();
const grid = document.querySelector("#grid");
const rech = document.querySelector("#search");
const tpSelect = document.querySelector("#typeFilter");
const detailPanel = document.querySelector("#detail");
const teamSlots = document.querySelector("#team-slots");
const teamMsg = document.querySelector("#team-msg");
const retry_btn = document.querySelector("#retry-btn");
const sortSelect = document.querySelector("#sortFilter");
let retryAction = init;
let editingId = null;

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
  const draft = getFormDraft();

  if (draft) {
    Object.entries(draft).forEach(([name, value]) => {
      const field = form.elements.namedItem(name);

      if (field && "value" in field) {
        field.value = value;
      }
    });
  }

  // for form draft to sessionStorage
  form.addEventListener("input", () => {
    if (editingId !== null) return;

    const data = Object.fromEntries(new FormData(form));
    saveFormDraft(data);
  });

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
      const isEditing = editingId !== null;

      if (isEditing) {
        // PUT: Update existing creature
        await updateCreature(editingId, newCreature);
      } else {
        // POST: Create new creature
        await createCreature(newCreature);
      }

      // Reload creatures from the API
      await handleSearch();

      // Reset form state
      editingId = null;
      form.reset();
      document.querySelector("#create h2").textContent = "Nouvelle créature";
      submitBtn.textContent = "Ajouter la créature";

      showStatus(
        isEditing
          ? "Créature modifiée avec succès"
          : "Créature ajoutée avec succès",
      );
    } catch (error) {
      console.error(error);
      showStatus("Erreur lors de l'enregistrement");
    } finally {
      submitBtn.disabled = false;
    }
  });

  form.addEventListener("reset", () => {
    clearFormDraft();
    resetEditMode();
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

function fillEditForm(creature) {
  editingId = creature.id;

  const form = document.querySelector("#creature-form");

  form.querySelector("#name").value = creature.name;
  form.querySelector("#type").value = creature.type;
  form.querySelector("#img").value = creature.image;
  form.querySelector("#description").value = creature.description;
  form.querySelector("#attack").value = creature.stats.attack;
  form.querySelector("#defence").value = creature.stats.defense;

  // Update the form title
  document.querySelector("#create h2").textContent = "Modifier la créature";

  // Update the submit button
  form.querySelector('button[type="submit"]').textContent =
    "Enregistrer les modifications";

  // Scroll to form
  document.querySelector("#create").scrollIntoView({
    behavior: "smooth",
  });
}

function resetEditMode() {
  editingId = null;
  document.querySelector("#create h2").textContent = "nouvelle creature";
  document.querySelector("#add_creature").textContent = "ajouter la creature";
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

detailPanel.addEventListener("click", async (event) => {
  const target = event.target;
  if (target.classList.contains("btn-add")) addToTeam(target.dataset.id);
  if (target.classList.contains("btn-close")) hideDetail();
  if (target.classList.contains("btn-edit")) {
    try {
      const creature = await getCreature(target.dataset.id);
      fillEditForm(creature);
    } catch (error) {
      console.error(error);
      showStatus("Erreur lors du chargement de la créature");
    }
  }
  if (target.classList.contains("btn-delete")) {
    const id = target.dataset.id;

    const confirmed = confirm(
      "vouler-vous vraiment supprimer cette creature ?",
    );

    if (!confirmed) return;
    target.disabled = true;
    try {
      await deleteCreature(id);
      hideDetail();
      await handleSearch();
      showStatus("creature supprimee avec succes");
    } catch (error) {
      console.error(error);
      showStatus("erreur lors de suppression");
    } finally {
      target.disabled = false;
    }
  }
});

rech.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleSearch();
  }
});

tpSelect.addEventListener("change", searchFilter);

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
