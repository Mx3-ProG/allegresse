# Préparation des environnements

1. Installer les dépendances avec `npm ci`, exécuter `npm run lint`, `npm test` et `npm run build`.
2. Créer des projets distincts Supabase pour développement, préproduction et production, après accord. Appliquer la migration dans chaque environnement après revue SQL et sauvegarde.
3. Générer et valider un import de base idempotent depuis le corpus JSON avant de déplacer la lecture vers PostgreSQL. Le corpus intégré reste la source actuelle du site.
4. Définir `NEXT_PUBLIC_SITE_URL` pour produire des URL canoniques et un sitemap corrects.
5. Configurer Stripe, e-mail et fournisseur IA seulement lorsque leurs modules auront été implémentés et testés. Les variables disponibles sont listées dans `.env.example`.
6. Configurer les sauvegardes, alertes et procédure de restauration avant la mise en production. Aucun déploiement n'a été effectué.

Le parcours de compte utilise `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Configurer dans Supabase l’URL du site et l’URL de redirection `/auth/callback` avant d’essayer l’inscription. Le projet Supabase existant `bibleva_webapp` a été relié dans `.env.local` pour le développement. La configuration de redirection des e-mails doit encore être vérifiée dans le tableau de bord Supabase. Aucune variable de production n’a été configurée.
