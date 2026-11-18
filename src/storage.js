export function getSavedCreatures() {
  return JSON.parse(localStorage.getItem("creature")) || [];
}

export function saveCreature(creature) {
  const saved = getSavedCreatures();
  saved.push(creature);
  localStorage.setItem("creature", JSON.stringify(saved));
}

export function getLastSearch() {
  return sessionStorage.getItem("lastSearch");
}

export function saveLastSearch(value) {
  sessionStorage.setItem("lastSearch", value);
}

export function clearLastSearch() {
  sessionStorage.removeItem("lastSearch");
}

export function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

export function saveFavorites(favorites) {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

export function saveLastType(type){
  localStorage.setItem("lastType",type)
}

export function getLastType(){
  return localStorage.getItem("lastType") || "Tous"
}