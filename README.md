# Allégresse

Application publique pour lire et rechercher les quatre Évangiles. Fondations d'un produit plus vaste décrites dans [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) et état réel dans [docs/STATUS.md](docs/STATUS.md).

## Démarrer

```sh
npm ci
npm run dev
```

Ouvrir http://localhost:3000. La lecture et la recherche n'exigent aucun compte ni variable d'environnement. Pour vérifier le corpus : `npm run import:bible`. Pour vérifier le code : `npm run lint`, `npm test`, `npm run build`.

Texte : Louis Segond 1910, fichiers USFM eBible.org, déclaration de domaine public sur https://ebible.org/fraLSG/copyright.htm. Les fichiers sources sont dans `content/source` ; le corpus généré est dans `content/processed`.

La migration Supabase est préparée, mais non appliquée. Aucune intégration externe ni publication n'est active.
