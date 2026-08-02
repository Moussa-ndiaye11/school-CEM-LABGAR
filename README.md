# Ecole SaaS — Gestion d'ecole primaire multi-etablissements

Application complete (frontend + backend) pour gerer une ou plusieurs ecoles primaires :
inscriptions, classes, enseignants, notes, presences, facturation, et espace parents —
avec une architecture **multi-tenant** (plusieurs ecoles sur la meme plateforme, donnees
completement isolees entre elles).

## Architecture

```
school-saas/
├── backend/     Node.js + Express + Prisma + PostgreSQL (API REST, JWT)
├── frontend/    React + Vite + Tailwind CSS
└── docker-compose.yml   PostgreSQL local pour le developpement
```

## Roles geres

| Role | Acces |
|---|---|
| **SUPER_ADMIN** | Gere toutes les ecoles inscrites (plans, activation/suspension), vue globale de la plateforme |
| **ADMIN** (directeur/directrice) | Gere son ecole : eleves, classes, enseignants, matieres, presences, notes, facturation |
| **TEACHER** (enseignant) | Fait l'appel et saisit les notes pour ses classes |
| **PARENT** | Consulte les notes, presences et factures de ses enfants |

## Demarrage rapide

### 1. Base de donnees

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env      # ajustez JWT_SECRET si besoin
npm install
npx prisma migrate dev --name init
npm run seed               # cree une ecole de demonstration avec tous les roles
npm run dev                 # API sur http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                 # App sur http://localhost:5173
```

## Comptes de demonstration (apres `npm run seed`)

| Role | Email | Mot de passe |
|---|---|---|
| Super admin | superadmin@ecole-saas.com | password123 |
| Admin ecole | admin@petitsgenies.com | password123 |
| Enseignant | teacher@petitsgenies.com | password123 |
| Parent | parent@petitsgenies.com | password123 |

Une nouvelle ecole peut aussi s'inscrire elle-meme via la page **"Creer une ecole"**
(`/register-school`) : cela cree automatiquement le tenant et le compte administrateur.

## Fonctionnalites incluses

- Authentification JWT, inscription d'ecole en self-service
- Isolation multi-tenant stricte (chaque ecole ne voit que ses propres donnees)
- Gestion des eleves (fiche complete : classe, notes, presences, factures, parents rattaches)
- Gestion des classes, matieres, enseignants
- Appel quotidien (present / absent / retard / excuse) avec historique
- Saisie des notes par classe/matiere/periode + calcul de moyenne (bulletin)
- Facturation : creation de factures, enregistrement de paiements (mobile money, especes, virement, carte), suivi des impayes
- Espace parent en lecture seule pour chaque enfant
- Tableau de bord Super Admin : nombre d'ecoles, plans d'abonnement, activation/suspension d'ecoles
- Tableau de bord Admin : statistiques du jour (presences, factures en attente/retard)

## Pistes d'evolution

- Paiement en ligne (Stripe / mobile money API) au lieu de la saisie manuelle des paiements
- Notifications par email/SMS (absences, factures echues)
- Emploi du temps et cahier de textes
- Export PDF des bulletins et recus de paiement
- Gestion documentaire (certificats, dossiers d'inscription)
- Tests automatises (unitaires + end-to-end)

## Stack technique

- **Backend** : Node.js, Express, Prisma ORM, PostgreSQL, JWT, bcrypt
- **Frontend** : React 18, Vite, React Router, Tailwind CSS, Axios
