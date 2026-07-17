# 🚀 ReclamTrack - GMAO Industrielle v3.0

> Application de gestion des réclamations transformée en système GMAO complet (Gestion de Maintenance Assistée par Ordinateur).

## 📦 Structure

```
reclamtrack/
├── frontend/           # Next.js 15 (App Router)
│   ├── /dashboard      # Tableau de bord
│   ├── /complaints     # Gestion des réclamations
│   ├── /roster         # Planning d'équipe
│   ├── /assets         # Registre GMAO (Industrial)
│   ├── /work-orders    # Suivi interventions (OT)
│   ├── /inventory/mro  # Magasins pièces détachées
│   ├── /maintenance    # Plans préventifs (PM)
│   ├── /technician     # Portail Mobile Tactile
│   └── /audit-logs     # Logs d'audit
├── backend/            # Express + MongoDB
│   ├── /routes         # API routes (Assets, Orders, Analytics...)
│   └── /models         # Mongoose models
└── docker-compose.yml  # Orchestration
```

## 🚀 Démarrage Rapide

### Installation

```bash
npm run install:all
```

### Développement

```bash
# Lancer Frontend + Backend
npm run dev
```

### URLs Clés

- **Tableau de Bord** : http://localhost:3000
- **Equipements (GMAO)** : http://localhost:3000/assets
- **Ordres de Travail** : http://localhost:3000/work-orders
- **Magasin MRO** : http://localhost:3000/inventory/mro
- **Rapports KPIs** : http://localhost:3000/reports/maintenance
- **Portail Technicien** : http://localhost:3000/technician

---

## 🏗️ Rappel des Phases de Transformation (v3.0)

1.  **Asset Management** : Hiérarchie complète des équipements.
2.  **Work Orders** : Gestion des interventions correctives et préventives.
3.  **Preventive Maintenance** : Calendriers Gantt et gammes opératoires.
4.  **Inventory MRO** : Gestion du stock de pièces critiques.
5.  **Industrial Analytics** : Dashboard OEE, MTBF et MTTR.
6.  **Tech Portal** : Interface mobile avec scan QR Code.
7.  **Smart Flow** : Conversion automatique Ticket -> Ordre de Travail.
8.  **Digital Twin** : Lien interactif entre schémas techniques et maintenance.

---

## 📚 Documentation

- [GMAO_DOCS.md](GMAO_DOCS.md) - Documentation Maintenance Industrielle exhaustive
- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture détaillée
- [INTEGRATION_COMPLETE.md](INTEGRATION_COMPLETE.md) - Guide d'intégration

## ⚙️ Configuration

### Backend (.env)

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/reclamtrack
JWT_SECRET=your_secret_key
```

---

## 🌍 Déploiement en Production (Docker & HTTPS)

L'application est prête à être déployée en production à l'aide de **Docker Compose**. La configuration inclut un reverse proxy **Nginx** et la génération automatique de certificats SSL/HTTPS via **Certbot (Let's Encrypt)**.

### 1. Préparation de l'environnement

Copiez le modèle de configuration pour la production et remplissez vos secrets :

```bash
cp .env.production .env
```

Éditez le fichier `nginx/default.conf` pour remplacer `localhost` par votre véritable nom de domaine (ex: `votre-domaine.com`).
Modifiez également `NEXT_PUBLIC_API_URL` dans le `docker-compose.yml` (service `frontend`) avec l'URL de votre API.

### 2. Démarrage initial (HTTP)

Lancez l'infrastructure en tâche de fond (cela va compiler le Frontend Next.js en mode _standalone_) :

```bash
docker-compose up -d --build
```

### 3. Génération du certificat SSL (Let's Encrypt)

Exécutez cette commande ponctuelle pour que Certbot valide votre domaine et génère le certificat :

```bash
docker-compose run --rm certbot certonly --webroot --webroot-path /var/www/certbot/ -d votre-domaine.com --email contact@votre-domaine.com --agree-tos --no-eff-email
```

### 4. Activation du HTTPS

Une fois le certificat généré, ouvrez `nginx/default.conf` :

1. Décommentez la ligne de redirection HTTP vers HTTPS (sous `# 2. Redirection HTTP -> HTTPS`).
2. Tout en bas du fichier, **décommentez entièrement le bloc de serveur HTTPS** (port 443).
3. Redémarrez Nginx pour appliquer :

```bash
docker-compose restart nginx
```

L'application est désormais sécurisée et Certbot renouvellera automatiquement le certificat SSL !

---

## 📝 Changelog

### v3.0.0 (GMAO Update) - 2026-04-14

- ✅ Intégration complète du module GMAO Industriel.
- ✅ Jumeau numérique interactif dans le Design Studio.
- ✅ Conversion automatique Flux Complaint -> OT.

### v1.0.0 - 2026-02-12

- ✅ Systèmes Roster et Audit Guards.
