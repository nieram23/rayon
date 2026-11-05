# Mettre Rayon en ligne (GitHub + Supabase + Vercel)

Trois services gratuits, environ 20 minutes la première fois.

| Service | Rôle |
|---|---|
| **GitHub** | garde le code du site |
| **Supabase** | base de données : comptes, mots de passe (chiffrés), progression des élèves |
| **Vercel** | publie le site à une adresse du type `rayon-mcv.vercel.app`, et fait tourner la petite partie serveur qui crée les comptes |

Aucun mot de passe n'est écrit dans le code. Le mot de passe administrateur et la clé secrète de la base se saisissent uniquement dans les réglages de Vercel.

---

## Étape 1 · Déposer le code sur GitHub

1. Sur github.com, clique sur **New repository**.
2. Nom : `rayon` (ou autre). Choisis **Private**. Ne coche rien d'autre. Clique sur **Create repository**.
3. Sur la page du dépôt vide, clique sur le lien **uploading an existing file**.
4. Décompresse `rayon-source.zip` sur ton ordinateur et ouvre le dossier `rayon`. GitHub accepte 100 fichiers par envoi et le projet en compte environ 103 : dépose-le en deux fois.
   - **Premier envoi** : sélectionne tout le contenu du dossier **sauf le dossier `src`**, glisse-le dans la page GitHub, puis clique sur **Commit changes**.
   - **Second envoi** : dans le dépôt, clique sur **Add file**, puis **Upload files**. Glisse le dossier `src` entier et clique sur **Commit changes**.
   Les fichiers cachés `.gitignore` et `.env.example` doivent faire partie du premier envoi. Sur Mac, Cmd + Maj + . les fait apparaître dans le Finder.
5. Vérifie que le dépôt contient bien `api`, `src`, `supabase`, `package.json` et `vercel.json`.

## Étape 2 · Publier avec Vercel, avec la base de données Supabase intégrée

1. Sur vercel.com, connecte-toi avec **Continue with GitHub**.
2. **Add New…**, puis **Project**, puis **Import** sur le dépôt `rayon`.
3. Dans « Optional Integrations », clique sur **Add** à côté de **Supabase** et choisis **Create New Supabase Account (Vercel Native)**.
   - Offre : **Free**.
   - Région : **Europe** (Frankfurt, Paris, London ou Ireland).
   Vercel crée la base et renseigne tout seul l'adresse et les clés (variables `SUPABASE_…`, `NEXT_PUBLIC_SUPABASE_…` et `POSTGRES_…`).
4. Ajoute 2 variables d'environnement :
   - `ADMIN_USERNAME` = `m.bournicon` ;
   - `ADMIN_PASSWORD` = ton mot de passe administrateur.
5. Clique sur **Deploy**.

## Étape 3 · Mise en service (une seule fois)

1. Ouvre `https://ton-adresse.vercel.app/#/installation`.
2. Clique sur **Créer le compte administrateur**. Le site installe lui-même les tables et les règles d'accès de la base, puis crée ton compte.
3. Connecte-toi avec `m.bournicon` et ton mot de passe.
4. Pour créer les comptes élèves, va dans **Espace enseignant**, puis **Comptes élèves**.

Une fois ton compte créé, tu peux supprimer la variable `ADMIN_PASSWORD` dans Vercel. La page d'installation ne fait plus rien dès qu'un administrateur existe.

Si tu préfères utiliser une base Supabase créée à la main, colle `supabase/schema.sql` dans son éditeur SQL. Renseigne ensuite `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY` dans Vercel.

---

## Utilisation au quotidien

- **Ajouter une classe** : dans Comptes élèves, ouvre l'onglet **Importer un fichier**. Dépose le fichier Excel, LibreOffice ou CSV de la classe, par exemple l'export de la vie scolaire.
  - Les colonnes Nom, Prénom et Classe sont repérées toutes seules, et tu peux les corriger.
  - Chaque élève reçoit l'identifiant `initiale.nom` (par exemple `l.martin`, puis `l.martin2` en cas de doublon) et un mot de passe de 6 caractères (par exemple `k7m4tp`). Les caractères faciles à confondre sont écartés : l, i, o, 0, 1.
  - Clique sur **Créer**, puis sur **Télécharger (Excel)** pour récupérer tous les identifiants. Tu peux aussi cliquer sur **Imprimer les fiches** pour avoir une fiche à découper par élève.
- **Version papier** : chaque dossier propose un bouton **Télécharger la version papier**, sur la fiche du dossier et dans chaque mission. Il produit un cahier PDF A4 qui contient :
  - une couverture ;
  - les documents et les annexes à compléter, avec des cases et des lignes pour répondre ;
  - des coups de pouce ;
  - la grille d'évaluation.
  Connecté en administrateur, tu as en plus le bouton **Corrigé professeur**.
- **Mot de passe oublié** : bouton **Mot de passe** sur la ligne de l'élève. Les mots de passe sont chiffrés : personne ne peut relire l'ancien, pas même toi. Il faut donc en donner un nouveau.
- **Sauvegarde** : chaque réponse est envoyée au serveur moins d'une seconde après la saisie. L'indicateur « Enregistré » s'affiche en haut de l'écran. Si internet coupe, les réponses restent sur le poste et repartent automatiquement.
- **Postes partagés** : à la déconnexion, le travail de l'élève est effacé de l'ordinateur. Il reste sur son compte. Demande aux élèves de se déconnecter à la fin de la séance.

## Mettre à jour le site

Modifie ou remplace les fichiers dans GitHub (bouton **Add file**, puis **Upload files**). Vercel republie automatiquement en une minute environ. Les comptes et la progression des élèves sont conservés.

## Limites de l'offre gratuite

- **Supabase** : 500 Mo de base de données, plus de 100 fois ce qu'il faut pour quelques classes. Un projet sans aucune activité pendant 7 jours est mis en pause, et il se réactive en un clic depuis supabase.com. Pendant les vacances, ouvre le site une fois par semaine ou réactive le projet à la rentrée.
- **Vercel** : largement suffisant pour un usage en classe.

## Données personnelles

Les élèves sont mineurs. Ne stocke que le prénom, le nom ou son initiale, et la classe. Aucun courriel, aucune date de naissance. Les données sont hébergées en Europe si tu as choisi cette région. Il est prudent d'en informer le chef d'établissement, et le délégué à la protection des données (DPO) de l'académie si ton lycée le demande.
