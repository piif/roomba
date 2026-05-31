# Question

dans un projet nodejs, quelle est la bonne pratique pour le fichier package-lock.json ? faut-il le stocker dans git, ou laisser le build le recréer, notamment dans les github actions ?

# Réponse

Bonne pratique (Node.js + npm) : versionner package-lock.json dans Git.

Pourquoi :
- Reproductibilité : mêmes versions exactes en local, CI et prod.
- Sécurité : audit et mises à jour maîtrisées.
- Stabilité CI : moins de “ça marchait hier”.

Dans GitHub Actions, évite de “recréer” le lockfile à chaque build.
- Utilise npm ci (pas npm install) pour installer exactement ce qui est dans package-lock.json.
- npm ci échoue si package.json et package-lock.json ne sont pas synchronisés, ce qui est souhaitable.

Pattern recommandé en CI :
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 22
    cache: npm
- run: npm ci
- run: npm test
```

Quand régénérer package-lock.json :
- Seulement quand tu changes les dépendances (upgrade, add, remove), puis tu commits le diff du lockfile dans la PR.

Cas particulier :
- Même pour une librairie, le commit du lockfile reste généralement recommandé pour le dev/CI du repo (le lockfile npm n’est pas utilisé par les consommateurs du package publié).