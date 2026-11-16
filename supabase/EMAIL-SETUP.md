# Emails Allégresse

Projet Supabase : `isblenmezjebeqojhuum` · site : `https://allegresse.vercel.app`.

## Configuration prévue

- Utiliser l’envoi intégré de Supabase Auth, sans SMTP personnalisé. Il n’y a pas de boîte de réception ni de réponses possibles avec ce service.
- Dans **Authentication → URL Configuration**, définir `https://allegresse.vercel.app` comme URL du site et autoriser `https://allegresse.vercel.app/auth/callback` ainsi que `https://allegresse.vercel.app/auth/callback?next=/nouveau-mot-de-passe`.
- Dans **Authentication → Email Templates**, copier le contenu HTML des fichiers `supabase/templates/` et leurs sujets depuis `supabase/config.toml`. Les notifications de sécurité doivent aussi être activées individuellement si disponibles.
- Tester l’inscription, la confirmation et la récupération avec une adresse membre de l’équipe Supabase.

`supabase/config.toml` configure la version locale ; il ne publie pas ces réglages sur le projet hébergé.

Selon la [documentation Supabase sur l’envoi intégré](https://supabase.com/docs/guides/auth/auth-smtp), ce service n’envoie qu’aux adresses membres de l’équipe du projet, avec des limites de débit. Une inscription publique par email demandera ultérieurement un fournisseur SMTP. Le domaine `allegresse.vercel.app` sert pour les liens de retour, pas comme adresse d’envoi ou boîte de réception.
