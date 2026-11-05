# Rayon — plateforme pédagogique Bac Pro MCV option A

13 dossiers et 2 scénarios interactifs, espace élève et espace enseignant.

**Mise en ligne avec comptes élèves : voir [DEPLOIEMENT.md](DEPLOIEMENT.md)** (GitHub + Supabase + Vercel).

## Deux façons de fonctionner

- **En ligne avec comptes** (variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` renseignées) :
  connexion obligatoire, comptes créés par l'administrateur, progression enregistrée sur le serveur
  et retrouvée sur n'importe quel ordinateur.
- **Sans serveur** (aucune variable) : comme avant, profil et progression dans le navigateur.
  Utile pour un aperçu ou une démonstration hors ligne.

## Lancer l'application sur un ordinateur

Prérequis : Node.js 18 ou plus récent.

```bash
npm install
npm run dev                      # sans serveur : http://localhost:5173
VITE_CLOUD=mock npm run dev      # avec un simulateur de serveur (admin : m.bournicon / test-admin, après #/installation)
npm test                         # tests (contenus, synchronisation, création de comptes)
npm run build                    # version de production dans dist/
```

## Comptes et sauvegarde

```
supabase/schema.sql           tables profiles et user_data, règles d'accès (chaque élève ne voit que ses données)
api/admin.ts                  fonction serveur Vercel : création du compte admin, des comptes élèves, mots de passe
src/services/cloud/           connexion à Supabase, simulateur, moteur de synchronisation
src/state/AuthContext.tsx     session, connexion, déconnexion
src/pages/auth/AuthGate.tsx   page de connexion et d'installation
src/pages/enseignant/TeacherAccounts.tsx   gestion des comptes élèves (import Excel/CSV, export des identifiants)
src/lib/roster.ts             lecture des listes d'élèves (xlsx, ods, csv) et export Excel
```

## Version papier (PDF)

```
src/pdf/ChapterPdf.tsx        mise en page du cahier (couverture, étapes, annexes, coups de pouce, grille)
src/pdf/assets.ts             pictogrammes et plans convertis en images pour le PDF
src/pdf/download.tsx          génération dans le navigateur (chargée au premier clic)
npm run test:pdf              génère les 28 cahiers (élève et corrigé) dans /tmp/pdf pour relecture
```

## Organisation du code

```
src/
  domain/        types.ts (modèle de données), progress.ts (calcul des 3 indicateurs)
  content/       contenus pédagogiques — SÉPARÉS des composants
    programme.ts parties, méta-compétences, niveaux de maîtrise
    units.ts     13 dossiers + 2 scénarios (intitulés, compétences, résultats attendus)
  services/      sources de données (interfaces remplaçables par une API)
    storage.ts       accès sécurisé au localStorage
    studentData.ts   LocalStudentData (réel, local) / DemoStudentData (simulé)
    teacherData.ts   DemoTeacherData (fictif, signalé « Démonstration »)
  state/         contexte global (profil, mode) et vues dérivées
  components/    design system (ui/), mise en page (layout/), illustrations SVG
  pages/eleve/   accueil, parcours, catalogue, fiche dossier, compétences, travaux, fiches, profil
  pages/enseignant/  tableau de bord, classes, élèves, fiche élève, progression, compétences, productions
```

## Ajouter un dossier (jalon 2)

1. Dans `src/content/units.ts`, passer `availability` de l'unité à `'disponible'`.
2. Renseigner `missions` (type `MissionDefinition` : documents, productions, aides 1-2-3, mode de vérification).
3. Créer les composants d'annexes interactives et la route de lecture du dossier.
Les identifiants existants (`d05`, `d05-r1`…) ne doivent jamais être renumérotés.

## Principes respectés

- Trois indicateurs distincts : progression (activités faites), réussite (qualité des réponses), maîtrise (niveau 1–4 validé par l'enseignant).
- « Non évalué » est distinct de « Non maîtrisé ». Un niveau indicatif n'est jamais présenté comme validé.
- Les données simulées sont toujours signalées à l'écran.
- Les critères ajoutés (dossier 5) sont marqués « ajout pédagogique » et distingués de la grille du manuel.
- L'organisation reprend un manuel et ne remplace pas le référentiel officiel du diplôme.
