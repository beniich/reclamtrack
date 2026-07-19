# Rapport d'Audit de Sécurité — Conformité SOC 2 & ISO 27001
**Projet** : ReclamTrack
**Date** : 20 Juillet 2026
**Portée** : Sécurité Applicative, Sécurité Réseau, et Gestion des Vulnérabilités

## Résumé Exécutif

Cet audit a été réalisé pour évaluer l'état de conformité de l'application par rapport aux standards **SOC 2 (Trust Services Criteria - Security & Confidentiality)** et **ISO 27001 (Annexe A.9 Contrôle d'accès, A.12 Sécurité des opérations, A.13 Sécurité des communications)**.

Le système présente une base robuste avec des contrôles de sécurité adéquats intégrés dans l'architecture backend, notamment grâce à des middlewares d'authentification stricts et un mécanisme centralisé de journalisation des événements de sécurité. 

Cependant, des vulnérabilités au niveau des dépendances tierces nécessitent une attention à court et moyen terme.

---

## 1. Contrôles d'Accès et d'Authentification (ISO 27001 A.9 / SOC 2 CC6)

### 1.1 Authentification par JWT
- **État : Conforme.**
- **Détails :** Le système utilise des jetons JWT avec rotation de `refreshToken` (`backend/src/middleware/security.ts`). Les durées d'expiration sont correctement configurées pour minimiser la fenêtre d'opportunité en cas de vol de jeton. 
- **Observations :** La gestion des tokens expirés (TokenExpiredAppError) et invalides (TokenInvalidAppError) empêche la fuite d'informations via les requêtes non autorisées.

### 1.2 Contrôle d'Accès Basé sur les Rôles (RBAC) & Multitenancy
- **État : Conforme.**
- **Détails :** Le middleware `requireOrganization` s'assure qu'un utilisateur appartient bien à une organisation de manière `ACTIVE` avant d'accéder aux données associées. Les droits sont rigoureusement validés via le schéma de rôles (`Membership`, `User`).

### 1.3 Protection contre les attaques de force brute
- **État : Conforme.**
- **Détails :** Le middleware implémente un verrouillage des comptes (lockout) après 5 tentatives échouées, en bloquant l'accès pendant 30 minutes, en plus de l'analyse comportementale via `securityDetectionService.detectBruteForce`.

---

## 2. Sécurité des Systèmes et des Réseaux (ISO 27001 A.13 / SOC 2 CC6.6)

### 2.1 En-têtes de Sécurité & Protection CORS
- **État : Conforme.**
- **Détails :** Utilisation de `helmet` pour renforcer les en-têtes HTTP (Content Security Policy, Cross-Origin-Resource-Policy). 
- **CORS :** La politique CORS est stricte et validée dynamiquement (absence de `*` pour les requêtes authentifiées, ce qui limite les attaques CSRF).

### 2.2 Flux réseau
- **État : Conforme.**
- L'architecture Cloudflare + Nginx protège efficacement les API contre les attaques DDoS et le sniffing réseau en forçant les communications en TLS 1.2/1.3.

---

## 3. Gestion des Vulnérabilités (ISO 27001 A.12 / SOC 2 CC7)

Un audit des dépendances NPM a mis en lumière certaines failles liées à l'écosystème Node.js.

- **Niveau de risque global :** 🔴 Élevé (pour certains environnements de développement)
- **Métriques des vulnérabilités :**
  - Faibles : 3
  - Modérées : 19
  - Hautes : 17
  - Critiques : 3 (principalement dans les packages de dev comme `vitest` ou outils frontend comme `vite`)

### Recommandations Immédiates
- **Mise à jour des outils de build :** Les packages `vite` (vulnérabilités de path traversal) et `vitest` doivent être mis à jour, bien qu'ils ne soient pas exposés en production.
- **Packages exposés :** Les failles dans `ws` (déni de service) et `xlsx` (Prototype Pollution) sont à adresser si ces bibliothèques traitent des inputs utilisateurs directs.
- **Action requise :** Lancer `npm audit fix` pour les dépendances non-critiques de production et planifier une mise à niveau pour le package `xlsx`.

---

## 4. Audit Trail & Monitoring (SOC 2 CC7.2 / ISO 27001 A.12.4)

### 4.1 Journalisation des Événements
- **État : Hautement Conforme.**
- **Détails :** Le système de logs `AuditLog` centralise toutes les tentatives de connexions (succès/échecs) et inclut les métadonnées (Adresse IP, identifiants des cibles, sévérité). 
- Le middleware `auditTrail('DATA_ACCESS')` assure que toutes les transactions sont enregistrées et non modifiables. L'architecture d'événements (`eventBus`) alerte en cas d'actions suspectes.

---

## Conclusion

L'application **ReclamTrack** satisfait à la grande majorité des exigences techniques inhérentes à **SOC 2** et **ISO 27001**. L'architecture orientée "Secure by Design" (séparation des tenants, logs robustes, gestion des tentatives de connexion) est opérationnelle.

La principale étape d'amélioration réside dans le patch des bibliothèques open-source et l'activation continue du monitoring des vulnérabilités (ex: Snyk, Dependabot).
