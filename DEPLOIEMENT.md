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

## Étape 2 · Créer la base Supabase

1. Sur supabase.com, crée un compte, puis **New project**.
   - Nom : `rayon`.
   - Mot de passe de la base : laisse Supabase en générer un. Il ne sert pas au site.
   - Région : **Europe (Paris)** ou une autre région d'Europe.
2. Attends la fin de la création, environ 2 minutes.
3. Menu de gauche **SQL Editor**, puis **New query**. Colle tout le contenu du fichier `supabase/schema.sql` et clique sur **Run**. Le message « Success » doit s'afficher.
4. Menu **Authentication**, puis **Sign In / Providers** (ou **Providers**), puis **Email** :
   - désactive **Allow new users to sign up**, pour que seuls les comptes que tu crées existent ;
   - désactive **Confirm email**, car aucun courriel n'est envoyé.
   Enregistre.
5. Menu **Project Settings**, puis **API** (ou **Data API** et **API Keys**). Note trois valeurs :
   - **Project URL**, de la forme `https://xxxx.supabase.co` ;
   - la clé **anon / public**, aussi appelée *publishable* ;
   - la clé **service_role**, aussi appelée *secret*. ⚠️ Elle ne doit jamais être partagée.

## Étape 3 · Publier avec Vercel

1. Sur vercel.com, crée un compte avec **Continue with GitHub**.
2. **Add New…**, puis **Project**, puis **Import** sur le dépôt `rayon`.
3. Avant de cliquer sur Deploy, ouvre **Environment Variables** et ajoute ces 5 variables :

| Nom | Valeur |
|---|---|
| `VITE_SUPABASE_URL` | la Project URL |
| `VITE_SUPABASE_ANON_KEY` | la clé anon / public |
| `SUPABASE_SERVICE_ROLE_KEY` | la clé service_role |
| `ADMIN_USERNAME` | `m.bournicon` |
| `ADMIN_PASSWORD` | ton mot de passe administrateur |

4. Clique sur **Deploy**. Au bout d'une minute environ, Vercel affiche l'adresse du site.

## Étape 4 · Créer le compte administrateur (une seule fois)

1. Ouvre `https://ton-adresse.vercel.app/#/installation`.
2. Clique sur **Créer le compte administrateur**.
3. Connecte-toi avec `m.bournicon` et ton mot de passe.
4. Pour créer les comptes élèves, va dans **Espace enseignant**, puis **Comptes élèves**.

Une fois le compte créé, tu peux supprimer la variable `ADMIN_PASSWORD` dans Vercel. Le compte reste valable. La page d'installation ne fait plus rien si un administrateur existe déjà.

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
