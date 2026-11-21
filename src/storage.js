
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

export function saveFormDraft(data) {
  sessionStorage.setItem("creatureDraft", JSON.stringify(data));
}

export function getFormDraft() {
  const draft = sessionStorage.getItem("creatureDraft");
  return draft ? JSON.parse(draft) : null;
}

export function clearFormDraft() {
  sessionStorage.removeItem("creatureDraft");
}