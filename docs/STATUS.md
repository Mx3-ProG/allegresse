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
| Bibléva Plus, authentification, paiements | Bloqué par une intégration | Aucun compte, produit ou paiement configuré |
| Notes, favoris, reprise | Architecture préparée | Tables et politiques, pas encore d'interface |
| PWA et hors connexion | Non commencé | — |
| Recherche hybride, IA, graphe | Architecture préparée | Tables de relations et flags ; pas de fournisseur connecté |
| Gamification, parrainage, boutique, dons, publicité | Non commencé | Flags désactivés |
| Back-office, veille, analytics | Non commencé | — |
| Documents juridiques | Nécessite une validation juridique | — |

## Mise à jour du 16 novembre 2026 — compte et informations légales

- Footer non fixe avec crédit Studio ATS et liens vers conditions, mentions, confidentialité et cookies : implémenté, vérifié localement sur ordinateur et mobile.
- Bandeau d’information cookies : implémenté, choix mémorisé localement ; aucun traceur facultatif actif.
- Inscription, connexion, déconnexion et page de compte : code implémenté et compilation validée ; activation bloquée par la création et la configuration d’un projet Supabase distinct. Aucun compte réel n’a encore été créé.
- Pages légales : brouillons informatifs en ligne dans l’application ; identification de l’éditeur, contact, hébergeur et politique de conservation à valider avant une publication publique.
