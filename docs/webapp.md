# WebApp de controle du Roomba

## But
Cette page documente l'utilisation de la webapp locale ajoutee au projet.

## Prerequis
- Node.js installé
- Dependances installées (`npm install`)
- Fichier [config/config.json](../config/config.json) renseigné si mode réel

## Commandes de lancement
Depuis la racine du projet:

```bash
npm run mock:web
```

- Lance le serveur en mode mock
- Langue par défaut: français
- Port par défaut: `3000`

```bash
npm run web
```

- Lance le serveur en mode réel (connexion au robot)
- Langue par défaut: français
- Port par défaut: `3000`

Options surchargeables:

```bash
npm run mock:web -- --lang=en --port=3210
npm run web -- --lang=fr --port=8080
```

Options disponibles:
- `--mode=mock|real`
- `--lang=fr|en`
- `--port=<entier positif>`

## Interface web
Ouvrir dans un navigateur:
- [http://localhost:3000](http://localhost:3000)

Pages disponibles:
- Home: état du robot (mission, batterie, bac), actions (clean/stop/dock), bouton refresh
- Planning: planning hebdomadaire, activation/désactivation par jour, modification d'heure, bouton confirmation si changement
- Détails: informations techniques (résultat de `robot.config()`)

Comportements:
- Si mission inactive: bouton clean visible
- Si mission active: boutons stop et dock visibles
- En cas d'échec API: bannière d'erreur en haut de la page
- Langue UI imposée par l'option serveur `--lang`

## API HTTP exposee
- `GET /api/status`
  - Retourne `config` et `status`
- `POST /api/actions/clean`
- `POST /api/actions/stop`
- `POST /api/actions/dock`
- `GET /api/planning`
- `PUT /api/planning`
  - Body JSON attendu:

```json
{
  "planning": [null, [7, 15], [7, 15], [7, 15], [7, 15], [7, 15], null]
}
```

- `GET /api/details`

## Verification rapide en mode mock
Lancer:

```bash
npm run mock:web -- --port=3210 --lang=en
```

Vérifier les endpoints:

```bash
curl -s http://localhost:3210/api/status
curl -s http://localhost:3210/api/planning
curl -s -X POST http://localhost:3210/api/actions/clean
```

## Limites actuelles
- Pas d'authentification utilisateur
- Pas de websocket (rafraichissement manuel)
- Gestion d'erreur simple via bannière

## CI Docker (GitHub Actions)
Le workflow [`.github/workflows/docker-image.yml`](../.github/workflows/docker-image.yml) construit l'image Docker sur:
- `push` sur `main`
- `push` de tags `v*`
- `pull_request` (build sans push)
- `workflow_dispatch`

Architectures cibles:
- `linux/amd64`
- `linux/arm/v7`

Publication:
- Registry: `ghcr.io`
- Image: `ghcr.io/<owner>/<repo>`
- Tags automatiques: `latest` (branche par défaut), nom de branche, tag git, SHA

Prerequis GitHub:
- Autoriser les GitHub Actions sur le dépôt
- Laisser le `GITHUB_TOKEN` avec permission `packages: write` (déjà demandé dans le workflow)
- Si l'image est privée, vérifier les permissions de lecture du package GHCR côté utilisateur/organisation
