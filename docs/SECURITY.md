# État de sécurité initial

Vérifié localement le 16 novembre 2026 : la lecture et la recherche publiques n'utilisent aucun secret, la recherche limite la longueur de requête à 160 caractères, les QR codes refusent les références inconnues, et les pages personnelles ne sont pas encore exposées. Le schéma Supabase active RLS sur chaque table créée, réserve les données personnelles à leur propriétaire et conditionne leur accès à un droit Plus vérifié dans la base. Le statut des abonnements n'est pas modifiable par les clients.

Non vérifié : la migration n'a pas été appliquée à un projet Supabase ; les politiques RLS n'ont donc pas encore été testées contre deux comptes réels. Aucun test de charge, audit de dépendances approfondi, politique CSP, limitation de débit distribuée ou revue juridique RGPD n'a été réalisé. Ne pas lancer de fonction de compte ni de paiement avant ces vérifications.
