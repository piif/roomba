Je commence par lire le prompt fonctionnel ciblé et les surfaces de code minimales qui porteront l’implémentation, pour formuler une approche concrète et la plus simple possible.

Read [](file:///home/pif/GitHub/piif/roomba/prompts/feature-webapp.md)

Read memory

Read [](file:///home/pif/GitHub/piif/roomba/package.json)

Read [](file:///home/pif/GitHub/piif/roomba/src/app/robotService.js)

J’ai le besoin fonctionnel et le point d’entrée existant. Je lis maintenant l’interface client et le CLI actuel pour proposer une architecture qui réutilise l’existant sans ajouter de couches inutiles.

Read [](file:///home/pif/GitHub/piif/roomba/src/clients/robotClient.js)

Read [](file:///home/pif/GitHub/piif/roomba/src/clients/mockClient.js)

Read [](file:///home/pif/GitHub/piif/roomba/src/clients/doritaClient.js)

Read [](file:///home/pif/GitHub/piif/roomba/src/cli/robot-cli.js)

Read memory [](file:///home/pif/.config/Code/User/workspaceStorage/7e6730929cc61a6c2792b8375cc17404/GitHub.copilot-chat/memory-tool/memories/repo/notes.md)

Le socle existant couvre déjà l’essentiel côté robot: création du client réel/mock, actions de base, statut, config et planning. Je synthétise maintenant une approche de mise en œuvre qui reste volontairement très plate: un petit serveur HTTP, quelques routes JSON, une UI statique sans framework front, et aucune persistance.

L’approche la plus simple est de faire une application web en deux couches seulement: un petit serveur Node avec rendu HTML très léger, et une interface front en JavaScript natif qui appelle quelques routes JSON. Je déconseille un framework front, une base de données, du temps réel, ou une API trop générique. Le besoin dans prompts/feature-webapp.md est modeste, et le socle robot existe déjà dans src/app/robotService.js, src/clients/robotClient.js, src/clients/mockClient.js et src/clients/doritaClient.js. Le projet n’a aujourd’hui qu’une dépendance métier dans package.json, donc rester sur une pile minimale est cohérent.

Concrètement, je partirais sur Express comme unique dépendance web additionnelle. C’est plus simple à lire et à maintenir que du Node HTTP brut, tout en restant très léger. Côté interface, une seule page HTML avec navigation interne suffit: onglets ou menu vers “Home”, “Planning” et “Details”, sans routeur front. Le serveur sert les assets statiques, expose quelques endpoints JSON, et injecte au chargement une petite config globale avec la langue choisie par CLI. Pour l’i18n, un simple objet `{ fr: {...}, en: {...} }` côté serveur suffit, sans bibliothèque dédiée. Pour le favicon et l’icône mobile, un SVG statique est le plus simple.

Le découpage que je recommande est le suivant:
- Un point d’entrée serveur distinct du CLI actuel, en réutilisant la fabrique de client de src/app/robotService.js.
- Des routes très ciblées:
  - `GET /` pour la page web
  - `GET /api/status` pour agréger `config()` et `status()`
  - `POST /api/actions/clean`
  - `POST /api/actions/stop`
  - `POST /api/actions/dock`
  - `GET /api/planning`
  - `PUT /api/planning`
  - `GET /api/details` pour `config()`
- Un front statique avec trois petits modules:
  - chargement/rafraîchissement du statut
  - édition locale du planning puis envoi via “Confirm”
  - affichage d’une bannière d’erreur commune à tous les `fetch`

Je garderais aussi une logique d’UI très directe:
- La page d’accueil charge les données au démarrage et sur clic “Refresh”.
- Les boutons visibles dépendent de `mission`:
  - mission inactive: bouton clean
  - mission active: boutons stop et dock
- La page planning maintient un état local en mémoire navigateur, compare avec la version chargée, et n’affiche “Confirm” que s’il y a un diff.
- La page détails affiche le JSON ou une version formatée simple de `config()`.
- En cas d’échec HTTP, le front affiche une bannière en haut, sans gestionnaire d’état complexe.

Quelques choix simplificateurs me semblent importants:
- Pas de WebSocket ni de polling automatique: le besoin mentionne un bouton de rafraîchissement, donc restons là-dessus.
- Pas de templating serveur sophistiqué: une page HTML statique + JS natif suffit.
- Pas de stockage côté serveur: le planning et le statut viennent toujours du robot ou du mock.
- Pas d’abstraction “repository/service/controller” inutile: un petit module de routes, un petit module de rendu, un petit module front.

Il y a aussi deux points techniques à anticiper:
- Le mode `mock` et `real` doit rester un simple argument de ligne de commande, exactement comme le CLI actuel dans src/cli/robot-cli.js.
- Le planning est déjà presque prêt côté client robot via `planning()` dans src/clients/robotClient.js, donc il faut surtout encapsuler ça proprement côté API web.

Si tu veux, l’étape suivante la plus rationnelle est:
1. créer le serveur web minimal avec les routes JSON et le lancement `mock`/`real`
2. brancher une page HTML unique avec le rafraîchissement du statut et les actions clean/stop/dock
3. ajouter ensuite la page planning, puis la page détails, puis l’i18n et le favicon

Cette séquence minimise le risque et donne très vite quelque chose de testable.