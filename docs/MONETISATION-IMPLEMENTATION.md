# Monétisation Allégresse — état au 16 novembre 2026

## Disponible dans le code et la base Supabase

- Compte gratuit et profil avec pseudo.
- Lecture publique, recherche publique et compte personnel gratuit.
- Notes, favoris et surlignages privés par verset, avec une interface dans « Ma Bible ».
- Chapitres terminés, XP à attribution unique et niveaux dans « Mon Chemin ».
- Points de Lumière séparés de l’argent, objets virtuels et jardin 2D simple. Les débits sont atomiques et refusés si le solde est insuffisant.
- Catalogue de produits, droits d’achat permanents et page « Mes modules ».
- Abonnement Plus, Checkout, portail Stripe, webhooks signés, enregistrement idempotent et réconciliation quotidienne préparés.
- Soutien ponctuel sans compte préparé.
- Publicité contextuelle de sponsoring direct préparée, sans script tiers. Le drapeau publicitaire et tous les emplacements sont désactivés.

Les migrations de ces fonctions ont été appliquées au projet Supabase `isblenmezjebeqojhuum`. La migration initiale historique existe dans le dépôt mais n’apparaît pas dans l’historique de migrations du projet : avant tout `supabase db push`, rapprocher explicitement cette ligne de base de l’historique distant. Les migrations suivantes portent les numéros effectivement enregistrés à distance.

## Stripe et ouverture commerciale

Un produit **Allégresse Plus à 4,99 €/mois** a été créé en mode test Stripe, avec le prix `price_1UcRdCBkub52hHKj5wnMMirH`. Aucun produit, abonnement ou soutien réel n’a été encaissé.

Les valeurs serveur suivantes sont désormais configurées en production et contrôlent les parcours de paiement :

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PLUS_MONTHLY_PRICE_ID`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET` pour la réconciliation planifiée

Après les tests de paiement et les vérifications commerciales, ouvrir séparément les drapeaux Supabase `subscriptions`, `store` et `donations`. Ils restent désactivés aujourd’hui. La publicité possède son propre drapeau `advertising`, également désactivé.

Le webhook public à enregistrer auprès de Stripe est `/api/billing/webhook`. Les événements attendus sont `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed` et `charge.refunded`. Le secret associé doit être configuré sur le serveur. Le prix est vérifié côté serveur avant Checkout.

Le projet Vercel existant `mx3-progs-projects/allegresse` a été relié au dossier. La version courante est déployée sur `https://allegresse.vercel.app` avec les huit variables nécessaires enregistrées comme secrets de production. Le webhook Stripe est créé en mode test. La réconciliation planifiée est décrite dans `vercel.json` et son endpoint protégé a répondu correctement à un appel autorisé.

Une première publication directe avait inclus `.env` dans son archive source. Le fichier `.vercelignore` exclut désormais les environnements locaux ; une nouvelle publication a été vérifiée sans aucun `.env`. L’ancien déploiement concerné a été supprimé avec l’autorisation explicite de l’utilisateur et renvoie 404. En cas de doute sur un accès à cette archive avant suppression, renouveler les clés Supabase et Stripe concernées.

## Non achevé

- Le webhook de production a accepté un événement de test signé. Un abonnement créé avec la carte Stripe de test a été activé puis résilié par les webhooks réels ; le compte et le client de test ont été supprimés. Le parcours complet depuis le bouton Checkout reste à vérifier.
- Offre de parrainage, commissions et versements.
- Modules avancés : compagnon IA, bibliothèque audio, études, parcours premium, thèmes et jardin complet.
- Administration commerciale, consentement publicitaire pour régies tierces, rapports financiers, analyses économiques et tests E2E authentifiés.
- Conditions commerciales, licences des contenus et validation juridique avant vente.

Les anciens schémas `user_notes`, `user_highlights`, `user_favorites` et `reading_progress` sont vides dans le projet Supabase lors de l’implémentation. L’interface actuelle utilise `personal_verses` et `user_chapter_progress`, liés aux références du corpus statique. Vérifier et migrer ces anciennes tables si des données y sont ajoutées dans un autre environnement.

## Vérifications effectuées

- TypeScript, tests Vitest et build Next.js réussis.
- Pages publiques vérifiées localement.
- Contrôle d’origine des écritures vérifié ; accès anonyme refusé.
- Droits SQL vérifiés : les rôles navigateur ne peuvent pas exécuter les opérations de facturation ; seuls les comptes authentifiés peuvent échanger des Points de Lumière.
- Supabase confirme que publicité, produits publiés et comptes payants sont actuellement à zéro.
