# Mon Dex — Yu-Gi-Oh! | Sprint 3 — Brief 2

Application web de gestion de cartes **Yu-Gi-Oh!**, développée dans le cadre de la formation **Développeur Web et Web Mobile à YouCode Safi**.

Cette version fait évoluer le précédent Mon Dex : les créatures sont désormais lues, créées, modifiées et supprimées via une **API REST locale avec json-server**, au lieu d'être stockées dans `data.js` ou dans le LocalStorage.

**Dépôt GitHub :** https://github.com/MohaAarab/Sprint-3-Brief-2-Le-Dex-et-mes-quipes.git  
**Tableau de planification Trello :** https://trello.com/invite/b/6afb0e1e813b73b368bfbd4b/ATTIa92d9b506619b7cd3e98d4a6048ccae01FEB7E71/sprint-3-brief-2-le-dex-et-mes-equipes

> **Démonstration en local :** l'API fonctionne sur `http://localhost:3000`. Le projet n'est pas prévu pour GitHub Pages sans hébergement séparé de l'API.

## Fonctionnalités

- Affichage des cartes depuis `GET /creatures`, avec image, identifiant, nom et type.
- Recherche côté serveur (`q`), filtre par type (`type`) et tri (`_sort`, `_order`) combinables.
- Consultation d'une fiche détaillée via `GET /creatures/:id`, avec statistiques et description.
- Ajout de créatures via `POST /creatures` et validation du formulaire.
- Modification de créatures via `PUT /creatures/:id`, avec formulaire prérempli.
- Suppression via `DELETE /creatures/:id`, après confirmation.
- Messages de chargement, de résultat vide, de succès et d'erreur ; gestion des erreurs HTTP et réseau.
- Sauvegarde du dernier filtre de type avec **LocalStorage** et du brouillon d'ajout avec **SessionStorage**.
- Affichage avec `createElement()`, `textContent` et les méthodes du DOM, sans injection de données API via `innerHTML`.
- Fonctions complémentaires héritées de Mon Dex : favoris et équipe locale (fonctionnalités distinctes du bonus de persistance des équipes via l'API).

## Technologies

- HTML5, Tailwind CSS 3, JavaScript (modules ES)
- Fetch API, `async` / `await`
- json-server **0.17.4** pour l'API REST locale
- Git / GitHub pour le versionnement et les Pull Requests

## Installation et lancement

Prérequis : **Node.js et npm**.

```bash
git clone https://github.com/MohaAarab/Sprint-3-Brief-1-Mon-Dex-connect-.git
cd Sprint-3-Brief-1-Mon-Dex-connect-
npm install
```

Si `json-server` n'est pas encore enregistré dans les dépendances de développement du dépôt, l'installer **une seule fois** puis committer `package.json` et `package-lock.json` :

```bash
npm install --save-dev json-server@0.17.4
```

Générer le CSS Tailwind (nécessaire si `dist/output.css` est ignoré par Git) :

```bash
npm run build
```

Dans un premier terminal, démarrer l'API :

```bash
npx json-server --watch db.json --port 3000
```

Dans un second terminal, servir `index.html` avec un serveur local (par exemple l'extension **Live Server** de l'éditeur). Ouvrir l'adresse locale fournie par ce serveur. Ne pas ouvrir la page directement via `file://`.

Pour reconstruire automatiquement le CSS pendant le développement :

```bash
npm run dev
```

L'API est accessible à l'adresse **http://localhost:3000/creatures**. Le terminal json-server doit rester ouvert pour utiliser l'application.

> Si Live Server actualise la page après chaque POST, PUT ou DELETE, configurer Live Server pour ignorer les modifications de `db.json`.

## Routes principales de l'API

| Méthode | Route | Utilisation |
|---|---|---|
| GET | `/creatures` | Toutes les créatures |
| GET | `/creatures?type=Normal%20Monster` | Filtrer par type |
| GET | `/creatures?q=dragon` | Rechercher |
| GET | `/creatures?_sort=name&_order=asc` | Trier par nom |
| GET | `/creatures?type=Normal%20Monster&q=dragon&_sort=name&_order=desc` | Combiner les paramètres |
| GET | `/creatures/:id` | Consulter une créature |
| POST | `/creatures` | Ajouter une créature |
| PUT | `/creatures/:id` | Modifier une créature |
| DELETE | `/creatures/:id` | Supprimer une créature |

Les créatures sont stockées dans **`db.json`**. Le tableau `teams` est prévu pour l'extension bonus ; les fonctionnalités d'équipe affichées dans l'interface ne constituent pas nécessairement une implémentation complète des routes `/teams`.

## Organisation du code

```text
.
├── db.json                 # Base de données locale json-server
├── index.html              # Interface de l'application
├── package.json            # Dépendances et commandes npm
├── tailwind.config.js      # Configuration Tailwind
├── src/
│   ├── main.js             # Démarrage, événements et coordination
│   ├── ui.js               # Affichage et éléments DOM
│   ├── rules.js            # Validation sans accès au DOM
│   ├── storage.js          # LocalStorage et SessionStorage
│   ├── services/
│   │   └── api.js          # Requêtes HTTP centralisées
│   └── input.css           # Styles source Tailwind
└── dist/
    └── output.css         # CSS généré (recréé par npm run build)
```

## Gestion des données et des erreurs

Toutes les requêtes HTTP passent par `src/services/api.js`. La fonction `request(method, route, body)` centralise `fetch()`, le contrôle de `response.ok`, la sérialisation des corps JSON et les erreurs.

Le fichier `src/rules.js` contient `validateCreature(data)` ; les messages de validation s'affichent sous les champs du formulaire. Les valeurs d'attaque et de défense suivent une plage adaptée aux cartes Yu-Gi-Oh! (**1 à 5000**) dans cette implémentation ; le brief indique **1 à 255**.

Le **LocalStorage** conserve le dernier type choisi (et les favoris). Le **SessionStorage** conserve le brouillon de création. **Aucune créature n'est enregistrée dans le LocalStorage : `db.json` est la source de vérité.**

## Vérification manuelle

1. Lancer json-server et ouvrir l'application.
2. Vérifier le chargement des cartes, puis combiner recherche, type et tri.
3. Ouvrir une fiche et vérifier `GET /creatures/:id` dans l'onglet Réseau.
4. Ajouter une carte valide et vérifier le POST et son enregistrement dans `db.json`.
5. Modifier cette carte via PUT et la supprimer via DELETE après confirmation.
6. Rafraîchir après avoir sélectionné un type : le filtre doit être conservé.
7. Saisir un brouillon dans le formulaire, rafraîchir et vérifier sa restauration.
8. Arrêter json-server et vérifier qu'un message d'erreur apparaît sans bloquer l'interface.

## Travail et suivi

- Travail individuel réalisé à **YouCode Safi**.
- Branches de fonctionnalités, Pull Requests et relectures selon les consignes du brief.
- **Planification :** [Tableau Trello — Sprint 3 Brief 2](https://trello.com/invite/b/6afb0e1e813b73b368bfbd4b/ATTIa92d9b506619b7cd3e98d4a6048ccae01FEB7E71/sprint-3-brief-2-le-dex-et-mes-equipes).

## Auteur

**Mohamed Aarab** — [GitHub](https://github.com/MohaAarab)
