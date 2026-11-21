function createEl(tag, className = "", text = "") {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}


const loading = document.querySelector("#loading");

export function showStatus(message) {
  loading.textContent = message;
}

export function clearGrid() {
  document.querySelector("#grid").innerHTML = "";
  document.querySelector("#creature-count").textContent = "0";
}

export function hideDetail() {
  document.querySelector("#detail").classList.add("hidden");
}

export function affich(list, total, teamCount) {
  const container = document.querySelector("#grid");
  container.replaceChildren();

  list.forEach((creature) => {
    const card = createEl(
      "article",
      "cursor-pointer flex flex-col gap-3 rounded-card bg-ground border-4 border-brand-light p-3 pb-4 transition duration-300 hover:-translate-y-2 shadow-[0_0_30px_rgba(250,204,21,0.6)] hover:shadow-[0_0_45px_rgba(250,204,21,0.9)]"
    );

    card.dataset.id = creature.id;

    const imgContainer = createEl(
      "div",
      "card-img relative flex items-center justify-center rounded-xl"
    );

    const img = createEl(
      "img",
      "w-full rounded-xl object-contain aspect-[59/86]"
    );
    img.src = creature.image;
    img.alt = creature.name;
    img.loading = "lazy";

    const id = createEl(
      "span",
      "absolute left-3 top-2 font-mono font-bold text-sm text-white",
      String(creature.id)
    );

    imgContainer.append(img, id);

    const name = createEl(
      "h3",
      "cre-name font-display text-sm font-bold text-brand",
      creature.name
    );

    const type = createEl(
      "span",
      "cre-type rounded-full bg-brand-light px-2 py-2 text-sm font-bold text-ink text-center",
      creature.type
    );

    const level = createEl(
      "p",
      "text-sm text-muted",
      `Niveau ${creature.level ?? "—"}`
    );

    const favoriteBtn = createEl(
      "button",
      "btn-favorite btn-outline bg-brand text-line border-solid border-brand-light mt-auto shadow-[0_0_25px_rgba(250,204,21,0.6)] text-sm",
      "Favoris"
    );
    favoriteBtn.type = "button";
    favoriteBtn.dataset.id = creature.id;

    const addBtn = createEl(
      "button",
      "btn-add btn-primary btn-outline bg-brand text-line border-solid border-brand-light mt-auto shadow-[0_0_25px_rgba(250,204,21,0.6)] text-sm",
      "Ajouter à l'équipe"
    );
    addBtn.type = "button";
    addBtn.dataset.id = creature.id;

    card.append(imgContainer, name, type, level, favoriteBtn, addBtn);
    container.appendChild(card);
  });

  document.querySelector("#creature-count").textContent = total;
  updateButtons(teamCount);
}

export function detail(creature, teamCount) {
  const max = 5000;

  const attack = Number(creature.stats.attack);
  const defense = Number(creature.stats.defense ?? creature.stats.defence);

  const detailPanel = document.querySelector("#detail");
  detailPanel.classList.remove("hidden");
  detailPanel.replaceChildren();

  const section = createEl(
    "section",
    "flex flex-col gap-4 rounded-card border-4 border-brand-light bg-ground p-4 md:p-6"
  );
  section.setAttribute("aria-label", "Détail de la créature");
  section.style.boxShadow = "0 0 30px rgba(250,204,21,0.6)";

  // Header
  const header = createEl(
    "div",
    "flex items-center justify-between"
  );

  const id = createEl(
    "span",
    "font-mono text-sm text-muted",
    `${creature.id} · Détail`
  );

  const closeBtn = createEl(
    "button",
    "btn-close btn-outline w-11 px-0",
    "✕"
  );
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Fermer le détail");

  header.append(id, closeBtn);

  // Image
  const imgContainer = createEl(
    "div",
    "flex items-center justify-center rounded-2xl"
  );

  const img = createEl(
    "img",
    "w-full max-w-xs rounded-2xl object-contain aspect-[59/86]"
  );
  img.src = creature.image;
  img.alt = creature.name;

  imgContainer.appendChild(img);

  // Name and type
  const titleRow = createEl(
    "div",
    "flex flex-wrap justify-between"
  );

  const name = createEl(
    "h2",
    "font-display text-3xl font-extrabold text-brand",
    creature.name
  );

  const type = createEl(
    "span",
    "rounded-full bg-brand-light px-3 py-1 text-sm font-bold",
    creature.type
  );

  titleRow.append(name, type);

  const description = createEl(
    "p",
    "text-cream",
    creature.description
  );

  // Statistics
  const stats = createEl(
    "div",
    "flex flex-col gap-2 text-sm text-cream"
  );

  function createStat(label, value) {
    const row = createEl(
      "div",
      "grid grid-cols-[80px_1fr_40px] items-center gap-2"
    );

    const labelEl = createEl("span", "font-bold", label);
    const barBg = createEl("span", "h-3 rounded-full bg-ground");
    const barFill = createEl(
      "span",
      "block h-3 rounded-full bg-brand"
    );

    barFill.style.width = `${Math.min(100, Math.max(0, (value / max) * 100))}%`;

    barBg.appendChild(barFill);

    const number = createEl(
      "span",
      "text-right font-mono",
      String(value)
    );

    row.append(labelEl, barBg, number);
    return row;
  }

  stats.append(
    createStat("Attaque", attack),
    createStat("Défense", defense)
  );

  // Team button
  const addBtn = createEl(
    "button",
    "btn-add btn-primary text-line border-2 border-brand-light shadow-[0_0_25px_rgba(250,204,21,0.6)]",
    "Ajouter à l'équipe"
  );
  addBtn.type = "button";
  addBtn.dataset.id = creature.id;

  const editBtn = createEl(
    "button",
    "btn-edit btn-primary text-line border-2 border-brand-light",
    "Modifier"
  );
  
  editBtn.type = "button";
  editBtn.dataset.id = creature.id;

  const deleteBtn = createEl("button", "btn-delete bg-red-700 text-white border-2 border-red-500 rounded-lg p-3", "Supprimer")
  deleteBtn.type = "button";
  deleteBtn.dataset.id = creature.id;

  section.append(
    header,
    imgContainer,
    titleRow,
    description,
    stats,
    addBtn,
    editBtn,
    deleteBtn
  );

  detailPanel.appendChild(section);
  updateButtons(teamCount);
}

export function updateButtons(teamCount) {
  const buttons = document.querySelectorAll(".btn-add");

  for (let i = 0; i < buttons.length; i++) {
    if (teamCount >= 6) {
      buttons[i].disabled = true;
      buttons[i].classList.add("cursor-not-allowed");
      buttons[i].classList.add("text-gray-400" ,"border-gray-600","opacity-50");
      buttons[i].classList.remove("shadow-[0_0_25px_rgba(250,204,21,0.6)]","text-line","border-brand-light")
    } else {
      buttons[i].disabled = false;
      buttons[i].classList.remove("text-gray-400" ,"border-gray-600","opacity-50");
      buttons[i].classList.remove("cursor-not-allowed");
      buttons[i].classList.add("shadow-[0_0_25px_rgba(250,204,21,0.6)]","text-line","border-brand-light");

    }
  }
}

const max = 6;
const teamSlots = document.querySelector("#team-slots");
const teamMsg = document.querySelector("#team-msg");
const team_count = document.querySelector("#team-count");
const team_counter = document.querySelector("#team-counter");

export function teamCreation(team, findCreature) {
  teamSlots.replaceChildren();

  for (let i = 0; i < max; i++) {
    if (i < team.length) {
      const creature = findCreature(team[i]);
      if (!creature) continue;

      const slot = createEl(
        "div",
        "border-2 border-brand-light p-2 flex flex-col gap-2 items-center"
      );

      const img = createEl(
        "img",
        "w-full rounded-lg object-contain aspect-[59/86]"
      );
      img.src = creature.image;
      img.alt = creature.name;

      const name = createEl(
        "p",
        "text-sm font-bold",
        creature.name
      );

      const removeBtn = createEl(
        "button",
        "btn-remove text-xs underline text-line bg-brand border-2 border-brand-light rounded-full p-3 font-bold",
        "Retirer"
      );
      removeBtn.type = "button";
      removeBtn.dataset.id = creature.id;

      slot.append(img, name, removeBtn);
      teamSlots.appendChild(slot);

    } else {
      const emptySlot = createEl(
        "div",
        "border-dashed border-2 border-brand-light p-6 text-4xl text-brand",
        "+"
      );

      teamSlots.appendChild(emptySlot);
    }
  }

  team_count.textContent = team.length;
  team_counter.textContent = `${team.length}/${max}`;

  teamMsg.textContent =
    team.length === 0 ? "no creature on the team" : "";

  updateButtons(team.length);
}

const retry_btn = document.querySelector("#retry-btn");

export function showRetry(){
  retry_btn.classList.remove("hidden")
}
export function hideRetry(){
  retry_btn.classList.add("hidden")
}