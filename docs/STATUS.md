# Couverture des fonctionnalités — 16 novembre 2026

| Module | État | Preuve ou limite |
| --- | --- | --- |
| Corpus des quatre Évangiles | Implémenté et testé localement | 89 chapitres, 3 781 versets, validation de numérotation, empreintes |
| Lecteur public | Implémenté et testé localement | Pages chapitre et verset, navigation, accès sans compte |
| Recherche classique | Implémenté et testé localement | Références et mots ; recherche côté serveur dans le JSON, sans correction de fautes |
| Partage | Partiellement implémenté | Liens permanents et QR code SVG testés localement ; partage navigateur à tester sur appareil |
| SEO technique | Partiellement implémenté | Métadonnées, sitemap, robots ; performance terrain non mesurée |
| Design responsive | Implémenté mais non testé en navigateur | CSS mobile et ordinateur |
| Supabase et RLS | Architecture préparée | Migration non appliquée à un projet distant |
| Bibléva Plus et paiements | Bloqué par une intégration | Aucun produit ou paiement configuré |
| Authentification | Partiellement implémentée | Projet Supabase relié localement ; parcours e-mail non vérifié de bout en bout |
| Notes, favoris, reprise | Architecture préparée | Tables et politiques, pas encore d'interface |
| PWA et hors connexion | Non commencé | — |
| Recherche hybride, IA, graphe | Architecture préparée | Tables de relations et flags ; pas de fournisseur connecté |
| Gamification, parrainage, boutique, dons, publicité | Non commencé | Flags désactivés |
| Back-office, veille, analytics | Non commencé | — |
| Documents juridiques | Nécessite une validation juridique | — |

## Mise à jour du 16 novembre 2026 — compte et informations légales

- Footer non fixe avec crédit Studio ATS et liens vers conditions, mentions, confidentialité et cookies : implémenté, vérifié localement sur ordinateur et mobile.
- Bandeau d’information cookies : implémenté, choix mémorisé localement ; aucun traceur facultatif actif.
- Inscription, connexion, déconnexion et page de compte : code implémenté et compilation validée ; relié au projet Supabase existant `bibleva_webapp` en local ; service Auth vérifié, inscription réelle et confirmation e-mail non testées. Aucun compte de test créé.
- Pages légales : brouillons informatifs en ligne dans l’application ; identification de l’éditeur, contact, hébergeur et politique de conservation à valider avant une publication publique.

## Mise à jour — accès payant et tableau de bord

- Offre affichée : lecture publique gratuite ; compte à créer avant un abonnement prévu à 4,99 € par mois et par utilisateur. Aucun paiement ou droit d’accès n’est activé.
- Inscription : 12 caractères minimum avec lettre, chiffre et caractère spécial, confirmation et contrôle serveur des mots de passe compromis via Pwned Passwords. Si le contrôle est indisponible, l’inscription est refusée temporairement.
- Tableau de bord authentifié : présentation des modules lecture, relecture, notes, favoris, surlignage, annotations signées, hooks, rappels, points, niveaux et défis. Les modules restent désactivés tant que l’abonnement, les données et les règles de progression ne sont pas implémentés.
