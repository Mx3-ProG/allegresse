# Audit de modularité — Allégresse

Date de l'audit : 16 novembre 2026  
Branche : `main`  
Périmètre : structure applicative, données, authentification, navigation, tests, base Supabase.

## 1. Résumé exécutif

L'application est aujourd'hui **fonctionnelle et compacte**, mais elle est organisée comme une application **monolithique par couches** : pages Next.js, composants et données sont directement branchés les uns aux autres. Il n'y a pas encore de frontière claire de "module" réutilisable.

Ce n'est pas un problème pour la Bible et la recherche, qui sont les deux seuls domaines réels. En revanche, si l'on ajoute maintenant des pseudos, un blog ou un espace de communication sans poser une frontière, le risque est de dupliquer l'authentification, les routes, la navigation, les politiques RLS et les tests.

Conclusion courte :

- **État actuel** : bon noyau Bible/recherche, authentification partielle, Supabase préparé mais non migré.
- **Point fort** : séparation déjà visible entre `features/bible` et `features/search`.
- **Point faible** : absence de contrat commun pour un module, de registre de navigation, de couche d'accès aux données et de tests d'intégration.
- **Recommandation** : poser une architecture "modules verticaux" avant d'ajouter les pseudos. Les pseudos doivent être le premier module complet, utilisé comme gabarit pour les suivants.

## 2. Inventaire réel de la structure

### 2.1 Fichiers et couches

- `src/app` : 26 fichiers de routes Next.js App Router.
- `src/features` : 2 fichiers seulement, `bible/data.ts` et `search/search.ts`.
- `src/components` : 5 composants partagés.
- `src/lib` : 3 helpers (`supabase/config`, `supabase/server`, `password-policy`).
- `src/proxy.ts` : middleware de rafraîchissement de session Supabase.
- `content/processed/gospels.json` : corpus statique des 4 Évangiles.
- `supabase/migrations` : 1 migration SQL complète.
- `tests` : 2 fichiers de tests, 8 tests au total.
- `docs` : architecture, statut, déploiement, sécurité.

Volume approximatif : environ 360 lignes de TypeScript/TSX pour 38 fichiers source. Le code est donc volontairement compact, souvent sur une seule ligne par composant.

### 2.2 Routes existantes

Routes publiques :

- `/` : accueil, recherche, suggestions, verset Jean 3:16.
- `/recherche` : recherche côté serveur dans le JSON.
- `/bible` : liste des 4 Évangiles.
- `/bible/[book]` : redirection vers chapitre 1.
- `/bible/ls1910/[book]/[chapter]` : lecteur de chapitre.
- `/versets/[reference]` : page d'un verset + partage + QR code.
- `/themes/[theme]` : thèmes éditoriaux statiques (`pardon`, `foi`, `amour`).
- `/tarifs` : offre et compte.

Routes compte :

- `/connexion`
- `/inscription`
- `/compte`
- `/auth/callback`

Routes légales :

- `/mentions-legales`
- `/confidentialite`
- `/conditions-utilisation`
- `/cookies`

API :

- `/api/auth/[action]` : inscription, connexion, déconnexion.
- `/api/search` : recherche JSON.
- `/api/qr/[reference]` : QR code SVG.

### 2.3 Données et dépendances

Dépendance centrale : `src/features/bible/data.ts`.

Il exporte :

- types `Verse`, `Chapter`, `Book`
- `books`
- `translation`
- fonctions `getBook`, `getChapter`, `getVerse`, `chapterUrl`, `verseUrl`

Cette dépendance est importée par 12 fichiers : pages, API, sitemap, not-found, recherche. Autrement dit, **le module Bible est aujourd'hui le cœur implicite de toute l'application**.

La recherche (`src/features/search/search.ts`) importe directement `books` et le type `Verse`. Elle n'est pas indépendante du module Bible.

### 2.4 Authentification et compte

- Configuration : `authConfigured()` vérifie uniquement la présence des variables Supabase.
- Client serveur : `createClient()` retourne `null` si non configuré.
- Proxy : rafraîchit la session sur `/compte/:path*`, `/connexion`, `/inscription`.
- API auth : validation Zod, politique de mot de passe, contrôle Pwned Passwords, signUp/signIn/signOut.
- Compte : affiche l'utilisateur connecté et une liste statique de fonctionnalités "à venir".

Il n'y a pas de profil utilisateur applicatif : seul `user.email` est affiché. Aucun pseudo, nom d'affichage, avatar, bio ou préférences.

### 2.5 Supabase / base de données

La migration crée déjà une architecture riche :

- catalogue Bible : traductions, versions, livres, chapitres, versets, passages, thèmes, entités, relations.
- données personnelles : notes, surlignages, favoris, progression de lecture.
- abonnement : `private.subscriptions`, fonction `private.has_plus()`.
- feature flags : 15 flags, tous désactivés par défaut.
- RLS : chaque table personnelle est réservée à son propriétaire et vérifie `private.has_plus()`.

Ce qui manque côté application :

- aucune table `public.user_profiles` ou équivalent pour les pseudos ;
- aucune table blog, commentaire, message ou notification ;
- aucune lecture réelle des feature flags ;
- aucun repository TypeScript pour parler à Supabase ;
- migration non appliquée à un projet distant selon la documentation.

## 3. Ce qui est bien fait

1. **Séparation Bible / recherche** : le corpus est isolé dans `features/bible`, la recherche dans `features/search`.
2. **App Router Next.js** : bon choix pour des pages serveur et du SEO.
3. **Contenu statique sans dépendance externe** : lecture et recherche fonctionnent sans compte ni API payante.
4. **Sécurité pensée côté base** : RLS et fonction `has_plus()` sont bien conçus.
5. **Validation du mot de passe** : politique claire, testée, avec contrôle externe.
6. **Tests existants** : corpus, recherche, mot de passe.
7. **Accessibilité partielle** : labels, navigation, focus visible.
8. **Design responsive** : CSS mobile et desktop.

## 4. Problèmes et risques pour la modularité

### 4.1 Couplage fort au module Bible

`features/bible/data.ts` est importé partout. Si un autre module a besoin d'un verset, il importe directement le JSON. Il n'y a pas de façade "contenu biblique" ni de repository.

Conséquence : ajouter un module "blog" qui cite des versets forcera à réimporter le même fichier et à dupliquer la logique d'URL.

### 4.2 Pas de contrat de module

Aujourd'hui, un "module" est juste un dossier. Il n'y a pas de définition commune pour :

- nom et slug du module ;
- routes exposées ;
- navigation (liens header/mobile/footer) ;
- permissions (public, connecté, Plus) ;
- dépendances ;
- feature flag associé ;
- migration SQL ;
- tests attendus.

Sans contrat, chaque nouveau module sera branché à la main dans `layout.tsx`, `sitemap.ts`, `AccountForm`, etc.

### 4.3 Navigation hardcodée

Dans `src/app/layout.tsx`, les liens sont écrits en dur :

- `/recherche`
- `/bible`
- `/themes/pardon`
- `/connexion`

Le footer et la navigation mobile sont aussi écrits en dur. Ajouter un module "pseudos" ou "blog" obligera à modifier plusieurs endroits.

### 4.4 Tableau de bord hardcodé

`src/app/compte/page.tsx` contient une liste statique `features`. Les modules ne peuvent pas s'enregistrer eux-mêmes dans le compte.

### 4.5 Authentification sans couche service

La logique d'authentification est dans la route API et dans le composant client. Il n'y a pas de service `authService`, de repository `profiles`, ni de validation centralisée. Pour les pseudos, il faudra ajouter des actions profil et éviter de recopier la gestion des cookies Supabase.

### 4.6 Recherche couplée au corpus

`search.ts` lit directement `books`. Si demain on veut rechercher dans les blogs ou les pseudos, il faudra soit dupliquer, soit refactorer. Il manque une abstraction "search provider" ou "index".

### 4.7 Pas de gestion de modules côté base

Le schéma a des feature flags, mais l'application ne les lit pas. Il n'y a pas de table `modules`, de manifeste ou de configuration centralisée. Les modules "désactivés" sont seulement documentés dans `docs/STATUS.md`.

### 4.8 Tests insuffisants pour une croissance modulaire

Seuls 8 tests couvrent le corpus, la recherche et le mot de passe. Aucun test pour :

- routes ;
- composants ;
- authentification ;
- RLS ;
- migrations ;
- modules futurs.

Un ajout de pseudos sans tests d'isolation risque des régressions silencieuses.

### 4.9 Travail en cours non commité

Le dépôt contient des modifications non commitées :

- `src/app/globals.css`
- `src/app/not-found.tsx`
- nouveau `src/app/loading.tsx`

Ces changements doivent être stabilisés avant une refactorisation importante, sinon ils risquent d'être perdus ou de créer des conflits.

## 5. Architecture cible recommandée

### 5.1 Principe

Passer d'une architecture "par couches" à une architecture "par modules verticaux". Chaque module possède ses données, sa logique, son UI et ses routes. Le noyau commun fournit les services transverses.

### 5.2 Arborescence proposée

```text
src/
  app/                         # routes Next.js, minces, délèguent aux modules
  core/                        # services transverses
    auth/                      # session, guards, policies
    db/                        # clients Supabase, repositories génériques
    config/                    # variables d'environnement, feature flags
    navigation/                # registre de navigation
    ui/                        # primitives partagées
  modules/
    bible/
      data/                    # corpus, types, repositories
      search/                  # recherche biblique
      components/
      routes/                  # helpers d'URL et metadata
      index.ts                 # manifeste du module
    account/
      profile/                 # pseudos, avatar, préférences
      billing/                 # Plus, abonnement
      components/
      index.ts
    blog/                      # futur
    messaging/                 # futur
  shared/                      # types et utilitaires vraiment génériques
```

### 5.3 Contrat de module

Chaque module devrait exposer un objet simple, par exemple :

```ts
export const bibleModule = {
  id: 'bible',
  name: 'Bible',
  featureFlag: null, // toujours actif
  access: 'public',
  navigation: [
    { label: 'La Bible', href: '/bible', placement: 'header' },
  ],
  accountCards: [],
  routes: ['/bible', '/bible/[book]', '/bible/ls1910/[book]/[chapter]', '/versets/[reference]'],
} as const;
```

Le noyau pourra alors construire la navigation et le tableau de bord à partir des modules actifs, au lieu de les coder en dur.

### 5.4 Couche d'accès aux données

Introduire des repositories :

- `BibleRepository` : lit le JSON aujourd'hui, pourra lire Supabase demain.
- `ProfileRepository` : lit/écrit les pseudos.
- `SearchRepository` : recherche dans un ou plusieurs modules.

Les pages et API ne doivent pas importer directement `gospels.json` ni le client Supabase.

### 5.5 Feature flags pilotés par la base

Au démarrage ou dans le middleware, lire `public.feature_flags`. Un module désactivé ne doit pas afficher ses routes ni ses liens. Pour le développement local, prévoir un fallback statique.

### 5.6 Navigation pilotée par les modules

`layout.tsx` doit consommer un registre :

```ts
const navigation = getNavigation({ authenticated, plus });
```

Cela évite de toucher au layout à chaque ajout de module.

## 6. Plan pour ajouter les pseudos

Les pseudos sont le bon premier module complet. Ils touchent l'auth, la base, l'UI et les tests, donc ils valideront l'architecture.

### 6.1 Base de données

Ajouter une migration :

```sql
create table public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,24}$'),
  display_name text,
  bio text check (length(bio) <= 280),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

create policy profiles_owner on public.user_profiles
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy profiles_public_read on public.user_profiles
  for select to anon, authenticated
  using (true);
```

Décisions à valider :

- un pseudo doit-il être public ou masqué ?
- doit-on autoriser le changement de pseudo, et à quelle fréquence ?
- le pseudo doit-il être unique globalement ou par module ?

### 6.2 Domaine applicatif

Créer `src/modules/account/profile` :

- `types.ts` : `Profile`, `Username`.
- `validation.ts` : regex, longueur, mots réservés.
- `repository.ts` : `getProfile`, `createProfile`, `updateUsername`.
- `service.ts` : orchestration et erreurs métier.

### 6.3 API et UI

- Route `POST /api/profile` ou server action pour créer/mettre à jour le pseudo.
- Page `/compte/profil` ou section dans `/compte`.
- Affichage du pseudo dans le tableau de bord au lieu de l'e-mail seul.
- Page publique optionnelle `/utilisateurs/[username]`.

### 6.4 Tests

- validation du pseudo ;
- unicité ;
- RLS : un utilisateur ne peut pas modifier le pseudo d'un autre ;
- redirection si pseudo manquant.

## 7. Feuille de route recommandée

### Phase 0 — Stabilisation (avant tout refactor)

1. Committer ou ranger les modifications en cours (`globals.css`, `not-found.tsx`, `loading.tsx`).
2. Vérifier `npm run build`.
3. Appliquer la migration Supabase dans un projet de développement.
4. Ajouter un fichier `.env.local.example` aligné avec `.env.example`.

### Phase 1 — Noyau modulaire minimal

1. Créer `src/core` et `src/modules`.
2. Déplacer `features/bible` vers `modules/bible`.
3. Déplacer `features/search` vers `modules/bible/search` ou `modules/search`.
4. Créer un registre de modules.
5. Rendre la navigation générée par le registre.
6. Garder toutes les routes et tests verts.

### Phase 2 — Couche données et auth

1. Introduire les repositories.
2. Extraire la logique auth de la route API vers `core/auth`.
3. Ajouter la gestion centralisée des erreurs et des permissions.

### Phase 3 — Module pseudos

1. Ajouter la migration `user_profiles`.
2. Implémenter validation, repository, service, UI.
3. Ajouter les tests.
4. Mettre à jour le tableau de bord pour afficher le pseudo.

### Phase 4 — Modules suivants

1. Blog : articles, catégories, commentaires, modération.
2. Communication : messages, notifications, groupes.
3. Recherche transverse : index multi-modules.

## 8. Questions à trancher avant implémentation

1. Le pseudo doit-il être obligatoire à la création de compte ou optionnel ?
2. Le pseudo doit-il être public et servir d'URL (`/u/[username]`) ?
3. Faut-il garder la structure `src/features` actuelle ou migrer vers `src/modules` ?
4. Faut-il introduire un ORM/query builder ou rester sur le client Supabase direct ?
5. Les modules futurs (blog, messagerie) doivent-ils être activés par feature flags dès le départ ?
6. Souhaitez-vous que je réalise la Phase 0 et 1 maintenant, ou seulement la documentation ?

## 9. Réponse directe à la question posée

**Où en sommes-nous ?**  
L'application a un bon noyau Bible/recherche, une authentification partielle et une base Supabase bien pensée mais non branchée. Elle n'est pas encore modulaire : les modules sont implicites et la navigation est codée en dur.

**Peut-on ajouter plusieurs modules proprement ?**  
Oui, mais il faut d'abord poser un contrat de module, un registre de navigation et des repositories. Sans cela, chaque ajout augmentera le couplage au module Bible.

**Quel est le meilleur premier pas ?**  
Stabiliser le travail en cours, puis implémenter un noyau modulaire minimal et le module des pseudos comme gabarit. Les modules blog et communication viendront ensuite sans refonte majeure.

**Risque principal si on fonce maintenant**  
Duplication de la logique d'authentification, de navigation et de RLS, avec des tests insuffisants pour détecter les régressions.