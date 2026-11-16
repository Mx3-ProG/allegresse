# Architecture initiale de Allégresse

## État du dépôt

Le dépôt était vide le 16 novembre 2026. Cette première livraison crée une application Next.js 16, un corpus local des quatre Évangiles et un schéma Supabase versionné. Aucune ressource Supabase, Stripe, Vercel ou IA n'a été créée ou reliée.

## Chemin de lecture actuel

Les pages publiques utilisent le corpus JSON généré depuis les quatre fichiers USFM d'eBible.org. Ce choix rend la lecture et la recherche disponibles sans compte, base distante ou API payante. Le code sépare le corpus (`features/bible`) de la recherche (`features/search`) et de l'interface (`app`, `components`). Le schéma SQL prépare la migration vers PostgreSQL pour la recherche plein texte et les données personnelles.

## Provenance et intégrité

Source : https://ebible.org/details.php?id=fraLSG ; déclaration de domaine public : https://ebible.org/fraLSG/copyright.htm. Fichiers sources USFM datés du 30 octobre 2026. Le pipeline enlève les notes, les références croisées et les balises Strong de cette édition, puis conserve le texte des versets et calcule son SHA-256. Il exige la numérotation continue des 89 chapitres. Le rapport d'import est dans `content/processed/import-report.json`. Une revue éditoriale de l'édition et de la ponctuation reste nécessaire avant une publication commerciale.

## Schéma et sécurité

La migration crée les tables des traductions, versions, livres, chapitres, versets, passages, thèmes, entités et relations. Les tables personnelles couvrent notes, surlignages, favoris et reprise de lecture. Les politiques RLS réservent les données à leur propriétaire et vérifient côté base un abonnement actif. Le statut de souscription est dans un schéma privé ; seul un processus serveur de paiement signé devra le modifier. Les fonctionnalités non reliées sont éteintes dans `feature_flags`.

## Étapes suivantes

1. Relire et valider le corpus importé et sa provenance juridique.
2. Configurer un projet Supabase de développement, appliquer la migration et importer le corpus en base avec un outil idempotent.
3. Brancher Supabase Auth et les opérations personnelles avec tests d'isolation entre utilisateurs.
4. Créer les produits Stripe après validation commerciale, puis webhooks signés et tests de bout en bout des droits Plus.
5. Ajouter recherche PostgreSQL, thèmes éditoriaux vérifiés, références croisées et QR codes.
6. Ajouter PWA, consultation hors connexion et synchronisation avec résolution de conflits.
7. Ajouter compagnon IA sourcé, gamification, parrainage et veille documentaire après validation séparée des contenus, coûts et règles juridiques.

## Décisions à valider

- Édition de référence exacte et éventuelles obligations d'attribution supplémentaires avant publication.
- Prix annuel, conditions Plus, consentement des données sensibles, textes juridiques et politique de conservation.
- Comptes Supabase, Stripe, Vercel, domaine, fournisseur d'e-mail et budgets IA.
- Publication et dépenses : aucune effectuée.
