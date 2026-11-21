export function validateCreature(data) {
  const errors = {};
  // name valdation
  if (data.name.trim() === "") {
    errors.name = "name is required";
  }

  // type validation
  if (data.type === "" || data.type === "Choisir un type") {
    errors.type = "Please select a valid type";
  }

  // atk validation
  const attack = data.stats?.attack;
  if (
    attack === "" ||
    attack === null ||
    attack === undefined ||
    !Number.isFinite(Number(attack)) ||
    Number(attack) < 1 ||
    Number(attack) > 5000
  ) {
    errors.attack = "attack must be between 1 and 5000";
  }

  //   def validation
  const defense = data.stats?.defense;

  if (
    defense === "" ||
    defense === null ||
    defense === undefined ||
    !Number.isFinite(Number(defense)) ||
    Number(defense) < 1 ||
    Number(defense) > 5000
  ) {
    errors.defense = "defense must be between 1 and 5000";
  }

  return errors;
}
