import type { Chapter, ChoiceOption, Field } from '../../domain/chapter';

const w = (id: string, label: string, model: string, criteria?: string[], lines = 3): Field => ({ id, label, kind: 'written', model, criteria, lines });

/**
 * DOSSIER 10 — Valoriser l'offre sur les sites marchands et les réseaux sociaux
 *
 * Progression calquée sur le manuel de référence (contexte, 5 missions, synthèse, 3 applications).
 * Enseignes, sites, marques, personnages et documents : ORIGINAUX et fictifs.
 */

const R1 = ['d10-r1']; // Information conforme, visible et attractive.
const R2 = ['d10-r2']; // Communication en adéquation avec l'offre et la clientèle.
const R12 = ['d10-r1', 'd10-r2'];
const OUI_NON: ChoiceOption[] = [
  { value: 'oui', label: 'Oui' },
  { value: 'non', label: 'Non' },
];

const ZONES_SITE: ChoiceOption[] = [
  { value: 'entete', label: 'En-tête de page' },
  { value: 'contenu', label: 'Espace dédié au contenu' },
  { value: 'pied', label: 'Pied de page' },
];
export const ELEMENTS_SITE = [
  { id: 'menu', label: 'Menu de navigation principal (onglets des univers)', zone: 'entete', role: 'structure' },
  { id: 'recherche', label: 'Moteur de recherche', zone: 'entete', role: 'trouver' },
  { id: 'compte', label: 'Espace personnel « Mon compte »', zone: 'entete', role: 'perso' },
  { id: 'panier', label: 'Panier', zone: 'entete', role: 'panier' },
  { id: 'focus', label: 'Grande image « Calendriers de l’Avent »', zone: 'contenu', role: 'focus' },
  { id: 'ariane', label: 'Accueil > Bien-être > Relaxation', zone: 'contenu', role: 'ariane' },
  { id: 'filtres', label: 'Filtres « Budget », « Marque », « Disponibilité »', zone: 'contenu', role: 'trouver' },
  { id: 'legales', label: 'Mentions légales, CGV, réseaux sociaux, contact', zone: 'pied', role: 'info' },
];
const ROLES: ChoiceOption[] = [
  { value: 'structure', label: 'Présenter la structure et l’étendue de l’offre' },
  { value: 'trouver', label: 'Trouver vite un produit' },
  { value: 'perso', label: 'Accéder à un contenu personnalisé' },
  { value: 'panier', label: 'Visualiser les produits sélectionnés et finaliser la commande' },
  { value: 'focus', label: 'Mettre en avant une sélection, une promotion, une nouveauté' },
  { value: 'ariane', label: 'Situer la page et revenir en arrière (fil d’Ariane)' },
  { value: 'info', label: 'Donner les informations complémentaires et obligatoires' },
];

export const D10: Chapter = {
  unitId: 'd10',
  mission:
    "Terre & Curieux veut aider les clients à trouver le bon article de jardinage sur téléphone comme sur ordinateur. Tu observes le premier écran, testes la navigation et la recherche, réécris une fiche et relies une publication sociale à une page utile.",
  fictionNotice: 'Terre & Curieux, les autres enseignes, les sites et les personnages de ce dossier sont imaginaires.',
  company: {
    name: 'Terre & Curieux',
    tagline: 'Nature, jeux éducatifs et bien-être — magasins et site marchand',
    facts: [
      ['Ton poste', 'Élève en PFMP, service e-commerce'],
      ['Ton tuteur', 'Mathis Garnier, directeur des ventes en ligne'],
      ['Clientèle', 'Familles engagées, sensibles au bien-être et au bio'],
    ],
  },
  steps: [
    {
      id: 'ouverture',
      kind: 'ouverture',
      title: "Réviser un site marchand du premier écran à la fiche produit",
      hero: { id: 'd10-hero', alt: 'Boutique chaleureuse avec hamacs colorés, jeux en bois et objets nature' },
      message: {
        from: 'Mathis Garnier',
        role: 'Directeur des ventes en ligne, Terre & Curieux',
        text: ['Notre enseigne indépendante compte 70 magasins en France et un site marchand. Je veux vérifier que notre site est cohérent avec l’image de nos magasins et qu’il valorise au mieux notre offre. Tu vas m’y aider.'],
      },
      documents: [
        {
          id: "d10-revision-reperes",
          number: 2,
          title: "Trois repères pour commencer",
          look: "memo",
          blocks: [
            {
              type: "list",
              items: [
                "Sur un site marchand, le menu, la recherche et les filtres sont trois chemins possibles pour retrouver le même produit.",
                "La fiche donne les éléments nécessaires pour choisir. Vérifie la présence du prix, du contenu, des conditions et de la disponibilité à partir du cas.",
                "Pour tester un parcours, pars du lien ou de l’accueil et vérifie l’écran suivant sur le support concerné."
              ]
            }
          ]
        },
        {
          id: 'd10-o-doc1',
          number: 1,
          title: 'L’enseigne Terre & Curieux',
          look: 'article',
          blocks: [
            { type: 'p', text: 'Terre & Curieux propose des produits authentiques et originaux autour de la nature, de l’éducation, de la santé et du bien-être : jeux en bois, jumelles, huiles essentielles, objets de décoration, livres. Ses valeurs : éthique, développement durable, respect de l’homme et de la nature.' },
            { type: 'facts', items: [['Société', 'Terre & Curieux SA'], ['Siège', 'Nantes'], ['Canaux', '70 magasins et un site marchand avec retrait en magasin'], ['Concurrents', 'Enseignes de loisirs créatifs, de sport, de décoration ; sites spécialisés']] },
          ],
        },
      ],
      activities: [
        {
          id: 'd10-o-a1',
          kind: 'fields',
          label: 'Annexe',
          title: 'Fiche d’identité et premières questions',
          instructions: 'Complète la fiche à l’aide du document 1, puis réponds.',
          helps: ['Les réponses sont dans le document 1.', 'Magasins + site en parallèle : on parle de « click and mortar ».', 'Sur un site, l’ambiance passe par les couleurs, les images, les polices, parfois le son.'],
          outcomeIds: R12,
          fields: [
            { id: 'raison', label: 'Raison sociale', kind: 'text', accept: ['Terre & Curieux SA', 'Terre et Curieux SA', 'Terre & Curieux', 'Terre et Curieux'], explain: 'Terre & Curieux SA.' },
            { id: 'activite', label: 'Activité', kind: 'choice', options: [{ value: 'nature', label: 'Vente de produits nature, jeux éducatifs et bien-être' }, { value: 'sport', label: 'Vente d’articles de sport' }], answer: 'nature', explain: 'Document 1.' },
            { id: 'statut', label: 'Statut juridique', kind: 'given', value: 'SA (société anonyme)' },
            { id: 'canal', label: '1. Une enseigne qui vend à la fois en magasin et sur un site est une enseigne…', kind: 'choice', options: [{ value: 'click', label: '« click and mortar » (cross-canal)' }, { value: 'pure', label: '« pure player »' }], answer: 'click', explain: 'Un pure player ne vend qu’en ligne.' },
            { id: 'atmo', label: '2. Comment créer une atmosphère sur un site ? (plusieurs réponses)', kind: 'multi', options: [{ value: 'couleurs', label: 'Par les couleurs et le logo' }, { value: 'images', label: 'Par les photos et les vidéos' }, { value: 'polices', label: 'Par les polices de caractères' }, { value: 'odeurs', label: 'Par les odeurs' }], answers: ['couleurs', 'images', 'polices'], explain: 'L’odorat ne passe pas par un écran.' },
          ],
        },
        {
          id: 'd10-o-a2',
          kind: 'fields',
          label: 'Questions',
          title: 'Identifier les valeurs de l’enseigne',
          instructions: 'Réponds par écrit à l’aide du document 1.',
          helps: ['Relis la phrase sur les valeurs.', 'Pense à ce que l’on ressent en magasin : nature, découverte, bien-être.', 'Le site doit transmettre la même image que les magasins.'],
          outcomeIds: R12,
          fields: [
            w('valeurs', '1. Quelles sont les valeurs de Terre & Curieux ?', 'Éthique, développement durable, respect de l’homme et de la nature, authenticité et originalité des produits.', ['Au moins trois valeurs.']),
            w('magasins', '2. Que doit ressentir un client dans un magasin de l’enseigne ?', 'Un lieu chaleureux qui éveille les sens et donne envie de découvrir : nature, jeu, bien-être.', ['Je parle des sens ou des émotions.']),
            w('enjeu', '3. Pourquoi le site doit-il être cohérent avec les magasins ?', 'Pour que le client retrouve la même image et les mêmes valeurs sur tous les canaux : cela renforce la confiance et la fidélité.', ['Je cite la confiance ou l’image.']),
          ],
        },
      ],
    },
    {
      id: 'mission-1',
      kind: 'mission',
      number: 1,
      title: 'Identifier les facteurs d’ambiance d’un site Internet',
      guidance: 'guidé',
      message: { from: 'Mathis Garnier', role: 'Directeur des ventes en ligne', text: ['Analyse les facteurs d’ambiance de notre page d’accueil, puis dis-moi si l’atmosphère est cohérente avec nos valeurs.'] },
      documents: [
        {
          id: 'd10-m1-doc1',
          number: 1,
          title: 'Page d’accueil du site, version de décembre',
          look: 'site',
          url: 'terreetcurieux.example',
          blocks: [
            { type: 'list', items: ['Logo vert feuille ; fond blanc ; titres en police manuscrite arrondie, textes en police simple et lisible.', 'Grande photo : coffrets de l’Avent posés sur une table en bois, avec du miel, des bougies et une tasse de thé fumante.', 'Bandeau « Idées cadeaux » sur fond orange.', 'Pas de musique ; une courte vidéo sans son montre l’atelier d’un fabricant de jouets en bois.'] },
          ],
        },
        {
          id: 'd10-m1-doc2',
          number: 2,
          title: 'Créer une atmosphère sur un site',
          look: 'texte',
          blocks: [
            { type: 'list', items: ['Reproduire l’identité graphique de l’enseigne (couleurs, logo).', 'Suggérer des univers ou des thèmes par des symboles (Noël : sapins, bougies, rouge et vert…).', 'Utiliser des nuances de couleur, des animations, des vidéos, des visuels qui valorisent les produits.', 'Refléter l’image, le positionnement et les valeurs de l’enseigne, pour créer des émotions.'] },
            { type: 'table', caption: 'Symbolique des couleurs', head: ['Couleur', 'Évoque'], rows: [['Blanc', 'Pureté, douceur, éclat'], ['Vert', 'Nature, plein air, écologie, équilibre'], ['Bleu', 'Confiance, calme, sérénité'], ['Noir', 'Élégance, haut de gamme'], ['Rouge', 'Énergie, dynamisme'], ['Orange et jaune', 'Chaleur, lumière, bois naturel']] },
          ],
        },
        {
          id: "d10-revision-1-doc",
          number: 3,
          title: "Revoir le premier écran sur téléphone",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Sur trois téléphones, la première vue affiche une photo sombre et un titre sur l’image. Sur deux appareils, le titre manque de contraste. Le bouton « Voir les kits » apparaît seulement après défilement. L’équipe dispose du visuel original et peut raccourcir l’accroche."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd10-m1-a1',
          kind: 'fields',
          label: 'Annexe',
          title: 'Analyser les facteurs d’ambiance du site',
          instructions: 'Pour chaque facteur, indique s’il est présent, puis analyse-le.',
          helps: ['Relis la description de la page.', 'Associe chaque couleur à sa symbolique.', 'Les visuels mettent en scène des produits naturels.'],
          outcomeIds: R1,
          fields: [
            { id: 'couleurs', label: 'Couleurs : présentes ?', kind: 'choice', options: OUI_NON, answer: 'oui', explain: 'Vert, blanc, orange.' },
            { id: 'couleursSens', label: 'Couleurs : ce qu’elles évoquent (plusieurs réponses)', kind: 'multi', options: [{ value: 'nature', label: 'La nature et l’écologie (vert)' }, { value: 'purete', label: 'La douceur (blanc)' }, { value: 'chaleur', label: 'La chaleur (orange)' }, { value: 'luxe', label: 'Le haut de gamme (noir)' }], answers: ['nature', 'purete', 'chaleur'], explain: 'Pas de noir sur la page.' },
            { id: 'musique', label: 'Musique : présente ?', kind: 'choice', options: OUI_NON, answer: 'non', explain: 'Vidéo sans son.' },
            { id: 'police', label: 'Police : effet recherché', kind: 'choice', options: [{ value: 'a', label: 'Manuscrite arrondie : naturelle et artisanale ; texte simple : lisible' }, { value: 'b', label: 'Police technique et froide' }], answer: 'a', explain: 'Cohérent avec l’univers artisanal.' },
            { id: 'images', label: 'Illustrations : message suggéré', kind: 'choice', options: [{ value: 'a', label: 'Douceur, fêtes de fin d’année, produits naturels' }, { value: 'b', label: 'Performance sportive' }], answer: 'a', explain: 'Bois, miel, bougies, thé.' },
            { id: 'coherent', label: 'L’atmosphère est-elle cohérente avec les valeurs de la marque ?', kind: 'choice', options: OUI_NON, answer: 'oui', explain: 'Nature, authenticité, bien-être.' },
          ],
        },
        {
          id: 'd10-m1-a2',
          kind: 'fields',
          label: 'Annexe (suite)',
          title: 'Rédiger l’analyse des facteurs d’ambiance',
          instructions: 'Rédige ton analyse pour chaque facteur, puis conclus.',
          helps: ['Utilise la symbolique des couleurs (document 2).', 'Pour les images : que voit-on, quel message ?', 'Conclus en reliant l’atmosphère aux valeurs.'],
          outcomeIds: R1,
          layout: 'columns',
          columns: ['Ton analyse'],
          fields: [
            w('couleurs.0', 'Couleurs', 'Le vert (nature, écologie), le blanc (douceur, pureté) et l’orange (chaleur) reprennent l’identité de l’enseigne ; l’ambiance est chaude et naturelle.', ['Je cite au moins deux couleurs et leur symbolique.'], 2),
            w('musique.0', 'Musique', 'Pas de musique : la vidéo est muette ; une ambiance sonore douce pourrait renforcer l’univers.', ['Je constate l’absence et je propose.'], 2),
            w('police.0', 'Police de caractères', 'Deux polices : une manuscrite arrondie pour les titres (artisanal, chaleureux), une simple pour les textes (lisible).', ['Je distingue titres et textes.'], 2),
            w('images.0', 'Illustrations et images', 'Coffrets de l’Avent sur du bois, miel, bougies, thé : douceur des fêtes et produits naturels ; vidéo d’un artisan : authenticité.', ['Je décris et j’interprète.'], 2),
            w('atmo.0', 'Atmosphère de la page', 'Chaleureuse, naturelle et festive, qui invite à la découverte.', ['Deux ou trois adjectifs.'], 2),
            w('coherence.0', 'Cohérence avec les valeurs', 'Oui : nature, artisanat et bien-être sont présents ; objectif atteint.', ['Je réponds et je justifie.'], 2),
          ],
        },
        {
          id: "d10-revision-1",
          label: "Annexe complémentaire",
          title: "Revoir le premier écran sur téléphone",
          instructions: "Lis le document 3. Rédige tes réponses en t’appuyant sur les faits du document. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Sépare le message, la lisibilité et l’accès à l’action.",
            "Relis le document 3 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "Utiliser le titre « Cultivez vos premières aromatiques », placé sur un fond uni lisible. Conserver une photo recadrée et montrer un bouton « Voir les kits aromatiques » près du titre."
          ],
          outcomeIds: [
            "d10-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Rédige la proposition de premier écran.",
              kind: "written",
              lines: 3,
              model: "Utiliser le titre « Cultivez vos premières aromatiques », placé sur un fond uni lisible. Conserver une photo recadrée et montrer un bouton « Voir les kits aromatiques » près du titre."
            },
            {
              id: "q2",
              label: "Propose un test avec trois personnes.",
              kind: "written",
              lines: 3,
              model: "Donner la consigne de trouver les kits sans expliquer où cliquer. Vérifier sur chaque téléphone que la personne lit le titre et atteint la catégorie. Relever les hésitations et erreurs."
            }
          ]
        },
      ],
    },
    {
      id: 'mission-2',
      kind: 'mission',
      number: 2,
      title: 'Optimiser la navigation sur le site Internet',
      guidance: 'accompagné',
      message: { from: 'Mathis Garnier', role: 'Directeur des ventes en ligne', text: ['Les facteurs d’ambiance sont cohérents. Évalue maintenant la navigation du site : repère ses éléments de construction et leur rôle, puis vérifie la navigabilité, la lisibilité et l’ergonomie.'] },
      documents: [
        {
          id: 'd10-m2-doc1',
          number: 1,
          title: 'La construction d’un site marchand',
          look: 'texte',
          blocks: [
            { type: 'table', head: ['Zone', 'Contenu'], rows: [['En-tête', 'Espace fixe, répété sur chaque page : logo, onglets de navigation, moteur de recherche, compte, panier.'], ['Espace de contenu', 'Il change selon la page : focus, catalogue, fil d’Ariane, filtres, parfois un menu secondaire à gauche.'], ['Pied de page', 'Liens complémentaires : contact, service après-vente, réseaux sociaux, mentions légales.']] },
            { type: 'p', text: 'La navigation correspond au chemin parcouru par l’internaute. Elle doit être fluide et intuitive. Navigabilité : atteindre facilement les pages ; lisibilité : comprendre la structure et trouver l’information ; ergonomie : un site confortable, sûr et efficace.' },
          ],
        },
        {
          id: "d10-revision-2-doc",
          number: 2,
          title: "Raccourcir une recherche fréquente",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Lors de huit tests, les clients cherchent des gants taille M. Six ouvrent « Jardin », puis « Entretien », puis « Accessoires ». Quatre reviennent à l’accueil avant de trouver les gants. Le menu peut accueillir « Gants et protection » sous « Jardin ». La recherche reconnaît « gants », mais pas « protection des mains »."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd10-m2-a1',
          kind: 'fields',
          label: 'Annexe 1',
          title: 'Repérer la structure du site',
          instructions: 'Pour chaque élément, indique sa zone et son rôle.',
          helps: ['Ce qui se répète en haut de chaque page est dans l’en-tête.', 'Le fil d’Ariane et les filtres sont au-dessus du catalogue.', 'Le pied de page regroupe les liens complémentaires.'],
          outcomeIds: R1,
          layout: 'columns',
          columns: ['Zone', 'Rôle'],
          fields: ELEMENTS_SITE.flatMap((e): Field[] => [
            { id: `${e.id}.0`, label: e.label, kind: 'choice', select: true, options: ZONES_SITE, answer: e.zone, explain: ZONES_SITE.find((z) => z.value === e.zone)!.label + '.' },
            { id: `${e.id}.1`, label: e.label, kind: 'choice', select: true, options: ROLES, answer: e.role, explain: ROLES.find((r) => r.value === e.role)!.label + '.' },
          ]),
        },
        {
          id: 'd10-m2-a2',
          kind: 'classify',
          label: 'Annexe 2',
          title: 'Évaluer les facteurs de stylique',
          instructions: 'Associe chaque constat au critère qu’il améliore.',
          helps: ['Navigabilité : aller d’une page à l’autre.', 'Lisibilité : comprendre et trouver.', 'Ergonomie : confort, sécurité, efficacité.'],
          outcomeIds: R1,
          categories: [
            { id: 'navigabilite', label: 'Navigabilité' },
            { id: 'lisibilite', label: 'Lisibilité' },
            { id: 'ergonomie', label: 'Ergonomie' },
          ],
          items: [
            { id: 'menu', text: 'Le menu principal est présent sur toutes les pages', answer: 'navigabilite', explain: 'On atteint toutes les pages.' },
            { id: 'ariane', text: 'Le fil d’Ariane permet de revenir en arrière', answer: 'navigabilite', explain: 'Navigation facilitée.' },
            { id: 'police', text: 'Les textes sont dans une police simple, de taille suffisante', answer: 'lisibilite', explain: 'Lecture facile.' },
            { id: 'rubriques', text: 'Les univers sont clairement nommés', answer: 'lisibilite', explain: 'Structure compréhensible.' },
            { id: 'paiement', text: 'Le paiement est sécurisé et le panier mémorisé', answer: 'ergonomie', explain: 'Confort et sécurité.' },
            { id: 'filtres', text: 'Les filtres réduisent en un clic la liste des produits', answer: 'ergonomie', explain: 'Efficacité.' },
          ],
        },
        {
          id: 'd10-m2-a3',
          kind: 'fields',
          label: 'Annexe 2 (suite)',
          title: 'Valider les critères de stylique',
          instructions: 'Pour chaque critère, indique s’il est validé sur le site et justifie.',
          helps: ['Appuie-toi sur les éléments repérés à l’annexe 1.', 'Navigabilité : menu, fil d’Ariane. Lisibilité : univers nommés, police. Ergonomie : filtres, panier, paiement.', 'Les trois critères sont validés.'],
          outcomeIds: R1,
          layout: 'columns',
          columns: ['Validé ?', 'Justification'],
          fields: [
            { id: 'nav.0', label: 'Navigabilité', kind: 'choice', options: OUI_NON, answer: 'oui', explain: 'Menu fixe et fil d’Ariane.' },
            w('nav.1', 'Navigabilité', 'Le menu principal est répété sur chaque page et le fil d’Ariane permet de revenir en arrière.', ['Je cite un élément du site.'], 2),
            { id: 'lis.0', label: 'Lisibilité', kind: 'choice', options: OUI_NON, answer: 'oui', explain: 'Univers clairs.' },
            w('lis.1', 'Lisibilité', 'Les univers sont clairement nommés, la police des textes est simple et lisible.', ['Je cite un élément du site.'], 2),
            { id: 'ergo.0', label: 'Ergonomie', kind: 'choice', options: OUI_NON, answer: 'oui', explain: 'Filtres et panier.' },
            w('ergo.1', 'Ergonomie', 'Filtres, moteur de recherche, panier mémorisé et paiement sécurisé rendent l’achat confortable.', ['Je cite un élément du site.'], 2),
          ],
        },
        {
          id: "d10-revision-2",
          label: "Annexe complémentaire",
          title: "Raccourcir une recherche fréquente",
          instructions: "Lis le document 2. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Traite le chemin par le menu et celui par la recherche.",
            "Relis le document 2 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "4 ÷ 8 × 100 = 50 %."
          ],
          outcomeIds: [
            "d10-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Quel pourcentage des testeurs revient à l’accueil ?",
              kind: "number",
              answer: 50,
              explain: "4 ÷ 8 × 100 = 50 %."
            },
            {
              id: "q2",
              label: "Rédige les changements à tester et la mesure.",
              kind: "written",
              lines: 3,
              model: "Ajouter « Gants et protection » sous « Jardin » et relier « protection des mains » aux résultats gants. Faire répéter la tâche sur mobile et relever le taux de réussite, les retours à l’accueil et le nombre d’étapes."
            }
          ]
        },
      ],
    },
    {
      id: 'mission-3',
      kind: 'mission',
      number: 3,
      title: 'Rendre l’offre produits accessible',
      guidance: 'accompagné',
      message: { from: 'Mathis Garnier', role: 'Directeur des ventes en ligne', text: ['Pour transformer un visiteur en acheteur, le catalogue doit être clair. Évalue l’organisation de notre catalogue en ligne.'] },
      documents: [
        {
          id: 'd10-m3-doc1',
          number: 1,
          title: 'Fiche conseil : le catalogue en ligne',
          look: 'texte',
          blocks: [
            { type: 'table', head: ['Organisation', 'Principe', 'Exemple'], rows: [['Critère technique : par famille', 'Produits semblables, de même nature', 'Thés verts, thés noirs'], ['Critère technique : par rayon', 'Produits de même catégorie', 'Boissons « détente »'], ['Critère technique : par univers', 'Produits complémentaires qui répondent à un même besoin', 'Bien-être'], ['Critère thématique', 'Lieu d’utilisation, profil client, occasion', 'Cuisine, débutant, idées cadeaux']] },
            { type: 'p', text: 'Les filtres (prix, taille, couleur, marque, disponibilité) aident le client à affiner sa recherche ; un comparateur est utile pour les produits techniques.' },
          ],
        },
        {
          id: 'd10-m3-doc2',
          number: 2,
          title: 'Menu du catalogue Terre & Curieux',
          look: 'site',
          url: 'terreetcurieux.example/catalogue',
          blocks: [
            { type: 'list', title: 'Menu', items: ['Meilleures ventes · Idées cadeaux · Nouveautés · Offres du moment', 'Tous nos produits : Jeux et jouets · Bien-être · Huiles essentielles · Jardin · Optique et astronomie · Thés et épicerie · Décoration · Livres · Bébé · Mode et bagagerie'] },
            { type: 'list', title: 'Page « Relaxation »', items: ['Filtres : catégorie, budget, disponibilité, marque ; tri par prix ou popularité.', 'Bouton « Charger plus » : « Vous avez vu 69 articles sur 646 ».', 'Bloc « Découvrez aussi » : coussins chauffants, plaids, bougies.'] },
          ],
        },
        {
          id: "d10-revision-3-doc",
          number: 3,
          title: "Vérifier les filtres et la disponibilité",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Article",
                "Usage",
                "Stock web"
              ],
              rows: [
                [
                  "GA12",
                  "Balcon",
                  "4"
                ],
                [
                  "GA18",
                  "Balcon",
                  "0"
                ],
                [
                  "GA25",
                  "Pleine terre",
                  "7"
                ]
              ]
            },
            {
              type: "p",
              text: "Avec « Balcon » et « En stock » sélectionnés, la page affiche GA12 et GA18. Les filtres sélectionnés ne sont rappelés nulle part sur la page."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd10-m3-a1',
          kind: 'fields',
          label: 'Annexe',
          title: 'Évaluer le catalogue',
          instructions: 'Réponds à l’aide des documents.',
          helps: ['« Bien-être », « Jardin » : univers. « Idées cadeaux » : thème.', 'Les filtres sont listés sur la page « Relaxation ».', '« Découvrez aussi » : suggestions d’achat complémentaires.'],
          outcomeIds: R1,
          fields: [
            { id: 'critere', label: '1. Le catalogue est classé selon…', kind: 'choice', options: [{ value: 'deux', label: 'Des critères techniques (univers) et thématiques (cadeaux, nouveautés)' }, { value: 'tech', label: 'Uniquement des critères techniques' }], answer: 'deux', explain: 'Les deux sont combinés.' },
            num('domaines', '2. Nombre d’univers dans « Tous nos produits »', 10, 'Dix univers.'),
            { id: 'clair', label: '3. Cette organisation est-elle claire ?', kind: 'choice', options: OUI_NON, answer: 'oui', explain: 'Univers nommés simplement.' },
            { id: 'filtres', label: '4. Filtres proposés (plusieurs réponses)', kind: 'multi', options: [{ value: 'categorie', label: 'Catégorie' }, { value: 'budget', label: 'Budget' }, { value: 'dispo', label: 'Disponibilité' }, { value: 'marque', label: 'Marque' }, { value: 'couleur', label: 'Couleur' }], answers: ['categorie', 'budget', 'dispo', 'marque'], explain: 'Pas de filtre couleur.' },
            { id: 'suggestion', label: '5. Objectif du bloc « Découvrez aussi »', kind: 'choice', options: [{ value: 'a', label: 'Suggérer des achats complémentaires et augmenter le panier moyen' }, { value: 'b', label: 'Afficher les mentions légales' }], answer: 'a', explain: 'Vente additionnelle.' },
          ],
        },
        {
          id: 'd10-m3-a2',
          kind: 'fields',
          label: 'Annexe (suite)',
          title: 'Compléter l’aide à l’évaluation du catalogue',
          instructions: 'Rédige les réponses aux questions de l’annexe.',
          helps: ['Relis le menu (document 2).', 'Le catalogue propose aussi des services et des ateliers.', 'Pense à un comparateur, à une recherche par âge, à des avis.'],
          outcomeIds: R1,
          fields: [
            w('liste', '1. Liste des domaines proposés', 'Jeux et jouets, bien-être, huiles essentielles, jardin, optique et astronomie, thés et épicerie, décoration, livres, bébé, mode et bagagerie.', ['Au moins six domaines.']),
            w('produits', '2. Le catalogue propose-t-il uniquement des produits ? Justifie.', 'Non : il propose aussi des services (cartes cadeaux, retrait en magasin) et des ateliers et sorties nature.', ['Je cite au moins un service.']),
            w('pertinence', '3. Les filtres sont-ils pertinents par rapport à l’offre et à la cible ?', 'Oui : le budget et la disponibilité correspondent aux familles qui cherchent un cadeau ; un filtre par âge serait utile pour les jeux.', ['Je juge et je propose un filtre.']),
            w('outils', '4. Autres outils de navigation', 'Bouton « Charger plus », tri par prix ou popularité, recherche par mots-clés.', ['Au moins deux outils.']),
            w('idees', '5. Avez-vous d’autres idées à proposer ?', 'Un filtre par âge, un comparateur pour l’optique, des sélections « idées cadeaux » par budget.', ['Au moins deux idées.']),
          ],
        },
        {
          id: "d10-revision-3",
          label: "Annexe complémentaire",
          title: "Vérifier les filtres et la disponibilité",
          instructions: "Lis le document 3. Rédige tes réponses en t’appuyant sur les faits du document. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Applique les deux conditions à chaque produit.",
            "Relis le document 3 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "GA12 uniquement. Il est prévu pour balcon et quatre unités sont en stock web. GA18 est indisponible et GA25 est réservé à un autre usage."
          ],
          outcomeIds: [
            "d10-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Quel résultat doit rester et pourquoi ?",
              kind: "written",
              lines: 3,
              model: "GA12 uniquement. Il est prévu pour balcon et quatre unités sont en stock web. GA18 est indisponible et GA25 est réservé à un autre usage."
            },
            {
              id: "q2",
              label: "Rédige une demande de correction et un test de retour à la liste.",
              kind: "written",
              lines: 3,
              model: "Combiner les deux filtres, afficher « Balcon » et « En stock » et permettre de retirer chacun. Après ouverture de GA12 et retour à la liste, vérifier que les filtres et le résultat sont conservés."
            }
          ]
        },
      ],
    },
    {
      id: 'mission-4',
      kind: 'mission',
      number: 4,
      title: 'Valoriser les produits en ligne',
      guidance: 'autonome',
      message: { from: 'Mathis Garnier', role: 'Directeur des ventes en ligne', text: ['Évalue nos fiches produits, puis conçois la fiche du nouveau surmatelas chauffant et massant. Envoie-la-moi par courriel.'] },
      documents: [
        {
          id: 'd10-m4-doc1',
          number: 1,
          title: 'Les conseils pour une fiche produit qui vend',
          look: 'procedure',
          blocks: [{ type: 'list', items: ['Un visuel principal zoomable, des vignettes sous plusieurs angles, une mise en situation, une vidéo.', 'Un intitulé exact et des caractéristiques hiérarchisées.', 'Le prix, la disponibilité, les options et les conditions de livraison.', 'Un bouton « Ajouter au panier » bien visible, de couleur contrastée.', 'Les avis clients et les boutons de partage sur les réseaux sociaux.', 'Des suggestions d’achat complémentaires (cross-selling).', 'Des mentions d’influence : stock limité, livraison le lendemain…'] }],
        },
        {
          id: 'd10-m4-doc2',
          number: 2,
          title: 'Le surmatelas chauffant et massant',
          look: 'fiche',
          blocks: [{ type: 'list', items: ['Se pose sur le matelas pour en améliorer le confort.', 'Matières naturelles : fibres de bambou, coton, laine et billes de bois ; mousse à mémoire de forme ergonomique, pour les personnes qui souffrent du dos.', 'Se branche sur secteur : effet chauffant ; fonction « massage » par billes de bois en mouvement (procédé breveté).', 'Deux tailles : 90 × 190 cm à 89 € ; 140 × 190 cm à 119,90 €.', 'Housses de protection beige ou gris clair vendues en complément.'] }],
        },
        {
          id: 'd10-m4-doc3',
          number: 3,
          title: 'Exemple d’une de nos fiches produits : plaid chauffant',
          look: 'site',
          url: 'terreetcurieux.example/plaid-chauffant',
          blocks: [
            { type: 'list', items: ['Repère 1 : « Plaid chauffant électrique » et 4 étoiles (52 avis).', 'Repère 2 : grande photo zoomable, quatre vignettes, une vidéo.', 'Repère 3 : 89,90 € ; « En stock, livré demain ».', 'Repère 4 : bouton orange « Ajouter au panier », bouton « Retirer en magasin ».', 'Repère 5 : pictogrammes « Livraison offerte », « Paiement sécurisé », « Retour gratuit ».', 'Repère 6 : onglets « Caractéristiques techniques » et « Ce qu’en pensent nos clients ».', 'Repère 7 : « Nos clients ont aussi aimé » : chaussons chauffants, couverture lestée.', 'Repère 8 : cœur pour ajouter aux favoris, icônes de partage.'] },
          ],
        },
        {
          id: "d10-revision-4-doc",
          number: 4,
          title: "Rédiger une fiche à partir des seules données disponibles",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Fiche fournisseur. Kit Balcon S, prix 24,90 € TTC. Contenu de trois pots de 12 cm, trois coupelles et un sachet de graines de basilic. Usage sur balcon abrité. Terreau vendu séparément. Photo disponible montrant les pots, les coupelles et le sachet."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd10-m4-a1',
          kind: 'fields',
          label: 'Annexe',
          title: 'Construire la fiche produit',
          instructions: 'Choisis les bons éléments pour chaque zone de la fiche.',
          helps: ['L’intitulé est précis : nom du produit et caractéristique principale.', 'Le bouton d’achat doit attirer l’œil.', 'Les housses sont un produit complémentaire.'],
          outcomeIds: R12,
          layout: 'extranet',
          windowTitle: 'Éditeur de fiche produit — Terre & Curieux',
          fields: [
            { id: 'titre', label: 'Intitulé', kind: 'choice', options: [{ value: 'a', label: 'Surmatelas chauffant et massant, fibres naturelles' }, { value: 'b', label: 'Produit n° 4521' }], answer: 'a', explain: 'Exact et descriptif.' },
            { id: 'visuels', label: 'Visuels', kind: 'multi', options: [{ value: 'zoom', label: 'Photo zoomable' }, { value: 'angles', label: 'Vignettes sous plusieurs angles' }, { value: 'situation', label: 'Mise en situation sur un lit' }, { value: 'video', label: 'Vidéo de la fonction massage' }], answers: ['zoom', 'angles', 'situation', 'video'], explain: 'Tous ces visuels sont recommandés.' },
            { id: 'prix', label: 'Prix et options', kind: 'choice', options: [{ value: 'a', label: 'Choix de la taille : 89 € (90 × 190) ou 119,90 € (140 × 190)' }, { value: 'b', label: 'Un seul prix pour les deux tailles' }], answer: 'a', explain: 'Options et prix associés.' },
            { id: 'bouton', label: 'Bouton d’achat', kind: 'choice', options: [{ value: 'a', label: '« Ajouter au panier », couleur contrastée, bien visible' }, { value: 'b', label: 'Lien gris en bas de page' }], answer: 'a', explain: 'Il doit attirer le clic.' },
            { id: 'cross', label: 'Suggestion complémentaire', kind: 'choice', options: [{ value: 'housses', label: 'Housses de protection beige ou gris clair' }, { value: 'jumelles', label: 'Jumelles d’observation' }], answer: 'housses', explain: 'Cross-selling cohérent.' },
            { id: 'avis', label: 'Réassurance', kind: 'choice', options: [{ value: 'a', label: 'Avis clients, livraison et retours, paiement sécurisé' }, { value: 'b', label: 'Aucune' }], answer: 'a', explain: 'Rassurer pour convertir.' },
          ],
        },
        {
          id: 'd10-m4-a2',
          kind: 'open',
          label: 'Production',
          title: 'Rédiger la description et le courriel',
          instructions: 'Rédige la description commerciale du surmatelas (5 à 6 lignes), puis le courriel d’envoi à Mathis Garnier.',
          helps: ['Transforme chaque caractéristique en avantage pour le client.', 'Commence par le bénéfice principal : un sommeil réparateur.', 'Le courriel : objet, formule d’appel, pièce jointe annoncée, politesse.'],
          outcomeIds: R12,
          prompts: [
            { id: 'description', label: 'Description commerciale', lines: 6 },
            { id: 'courriel', label: 'Courriel d’envoi', lines: 5 },
          ],
          selfCheck: ['Les avantages client sont mis en valeur.', 'Les deux tailles et leurs prix sont indiqués.', 'Le courriel est professionnel et annonce la pièce jointe.'],
        },
        {
          id: 'd10-m4-a3',
          kind: 'fields',
          label: 'Annexe (légende)',
          title: 'Légender la fiche produit',
          instructions: 'Associe chaque repère de la fiche (document 3) à l’élément qu’il représente.',
          helps: ['Compare avec l’exemple du document 2 de la mission.', 'Les pictogrammes rassurent : c’est la réassurance.', '« Nos clients ont aussi aimé » : suggestions d’achat.'],
          outcomeIds: R1,
          fields: (
            [
              ['r1', 'Repère 1', 'intitule'],
              ['r2', 'Repère 2', 'visuels'],
              ['r3', 'Repère 3', 'prix'],
              ['r4', 'Repère 4', 'bouton'],
              ['r5', 'Repère 5', 'reassurance'],
              ['r6', 'Repère 6', 'description'],
              ['r7', 'Repère 7', 'cross'],
              ['r8', 'Repère 8', 'partage'],
            ] as const
          ).map(([id, label, answer]): Field => ({
            id,
            label,
            kind: 'choice',
            select: true,
            options: [
              { value: 'intitule', label: 'Intitulé et avis' },
              { value: 'visuels', label: 'Visuels du produit' },
              { value: 'prix', label: 'Prix et disponibilité' },
              { value: 'bouton', label: 'Boutons d’achat' },
              { value: 'reassurance', label: 'Informations de réassurance' },
              { value: 'description', label: 'Description et caractéristiques' },
              { value: 'cross', label: 'Suggestions d’achat complémentaires' },
              { value: 'partage', label: 'Favoris et partage sur les réseaux' },
            ],
            answer,
            explain: 'Élément de la fiche produit.',
          })),
        },
        {
          id: "d10-revision-4",
          label: "Annexe complémentaire",
          title: "Rédiger une fiche à partir des seules données disponibles",
          instructions: "Lis le document 4. Rédige tes réponses en t’appuyant sur les faits du document. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Donne les éléments qui évitent une mauvaise surprise après l’achat.",
            "Relis le document 4 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "Kit Balcon S, 24,90 € TTC. Pour démarrer le basilic sur un balcon abrité. Comprend trois pots de 12 cm, leurs coupelles et un sachet de graines de basilic. Terreau vendu séparément."
          ],
          outcomeIds: [
            "d10-r1",
            "d10-r2"
          ],
          fields: [
            {
              id: "q1",
              label: "Écris la fiche courte prête à publier.",
              kind: "written",
              lines: 3,
              model: "Kit Balcon S, 24,90 € TTC. Pour démarrer le basilic sur un balcon abrité. Comprend trois pots de 12 cm, leurs coupelles et un sachet de graines de basilic. Terreau vendu séparément."
            },
            {
              id: "q2",
              label: "Rédige le texte alternatif de la photo.",
              kind: "written",
              lines: 3,
              model: "Trois pots de 12 cm avec leurs coupelles et un sachet de graines de basilic."
            }
          ]
        },
      ],
    },
    {
      id: 'mission-5',
      kind: 'mission',
      number: 5,
      title: 'Intégrer les réseaux sociaux pour créer du lien',
      guidance: 'autonome',
      message: { from: 'Mathis Garnier', role: 'Directeur des ventes en ligne', text: ['Fais un état des lieux de nos réseaux sociaux : objectif de nos publications sur chacun, puis propose trois nouveaux outils d’interaction avec nos clients.'] },
      documents: [
        {
          id: 'd10-m5-doc1',
          number: 1,
          title: 'Nos publications sur les réseaux',
          look: 'texte',
          blocks: [{ type: 'list', items: ['Réseau de partage communautaire (type Facebook) : annonces d’ateliers et de sorties nature en magasin, réponses aux questions des clients.', 'Réseau de photos (type Instagram) : belles photos de produits mis en scène dans la nature, stories, liens vers le site.', 'Réseau de tableaux d’inspiration (type Pinterest) : idées de décoration, de jardinage et de bricolage à épingler.'] }],
        },
        {
          id: 'd10-m5-doc2',
          number: 2,
          title: 'Des outils qui créent du lien',
          look: 'texte',
          blocks: [{ type: 'table', head: ['Outil', 'Principe'], rows: [['Forum', 'Discuter d’un thème entre membres d’une communauté.'], ['Tchat client', 'Échanger en direct avec un conseiller.'], ['Blog', 'Publier régulièrement des articles.'], ['Avis clients', 'Partager une évaluation des produits.'], ['Agent conversationnel (chatbot)', 'Assistant virtuel qui répond 24 h/24.'], ['FAQ', 'Questions fréquentes et leurs réponses.']] }],
        },
        {
          id: "d10-revision-5-doc",
          number: 3,
          title: "Relier une publication à la page attendue",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Une publication « Kit Balcon S disponible » renvoie vers l’accueil. Sur 100 clics vers le site, 14 visites atteignent la fiche Balcon S. La fiche est en ligne et le stock est confirmé. L’équipe prévoit une nouvelle publication avec le lien direct."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd10-m5-a1',
          kind: 'fields',
          label: 'Annexe 1',
          title: 'Objectifs des publications',
          instructions: 'Associe chaque réseau à l’objectif principal de ses publications.',
          helps: ['Un réseau communautaire sert à échanger.', 'Un réseau de photos sert à inspirer et à donner envie.', 'Un réseau de tableaux sert à collectionner des idées.'],
          outcomeIds: R2,
          fields: (
            [
              ['communaute', 'Réseau communautaire', 'echanger'],
              ['photos', 'Réseau de photos', 'envie'],
              ['tableaux', 'Réseau de tableaux d’inspiration', 'idees'],
            ] as const
          ).map(([id, label, answer]): Field => ({
            id,
            label,
            kind: 'choice',
            options: [
              { value: 'echanger', label: 'Informer des événements et échanger avec la communauté' },
              { value: 'envie', label: 'Donner envie par des visuels et renvoyer vers le site' },
              { value: 'idees', label: 'Inspirer par des idées pratiques à conserver' },
            ],
            answer,
            explain: 'Chaque réseau a son usage.',
          })),
        },
        {
          id: 'd10-m5-a2',
          kind: 'fields',
          label: 'Annexe 2',
          title: 'Proposer de nouveaux outils d’interaction',
          instructions: 'Choisis l’outil le plus adapté à chaque besoin.',
          helps: ['Un besoin immédiat la nuit : un assistant automatique.', 'Partager des conseils de passionnés : un espace communautaire.', 'Rassurer avant d’acheter : l’avis des autres clients.'],
          outcomeIds: R2,
          fields: (
            [
              ['nuit', 'Répondre aux questions sur la livraison à toute heure', 'chatbot'],
              ['passion', 'Permettre aux passionnés d’astronomie d’échanger leurs conseils', 'forum'],
              ['confiance', 'Rassurer un client qui hésite à acheter une paire de jumelles', 'avis'],
              ['conseil', 'Conseiller en direct un client qui choisit une huile essentielle', 'tchat'],
            ] as const
          ).map(([id, label, answer]): Field => ({
            id,
            label,
            kind: 'choice',
            select: true,
            options: [
              { value: 'chatbot', label: 'Agent conversationnel' },
              { value: 'forum', label: 'Forum' },
              { value: 'avis', label: 'Avis clients' },
              { value: 'tchat', label: 'Tchat avec un conseiller' },
              { value: 'blog', label: 'Blog' },
            ],
            answer,
            explain: 'Outil adapté au besoin.',
          })),
        },
        {
          id: 'd10-m5-a3',
          kind: 'fields',
          label: 'Annexe 2 (suite)',
          title: 'Justifier trois nouveaux outils d’interaction',
          instructions: 'Choisis trois outils pour Terre & Curieux et justifie chacun.',
          helps: ['Relis le document 2.', 'Pense aux familles qui préparent un cadeau, aux passionnés, aux questions fréquentes.', 'Une justification = un besoin du client + un bénéfice pour l’enseigne.'],
          outcomeIds: R2,
          layout: 'columns',
          columns: ['Outil', 'Justification'],
          fields: [
            w('o1.0', 'Outil 1', 'Un agent conversationnel (chatbot) sur le site', undefined, 1),
            w('o1.1', 'Outil 1', 'Il répond 24 h/24 aux questions sur la livraison et les retours, sans attendre.', ['Besoin + bénéfice.'], 2),
            w('o2.0', 'Outil 2', 'Un blog de conseils nature et bien-être', undefined, 1),
            w('o2.1', 'Outil 2', 'Des articles sur le jardinage, l’astronomie ou le bien-être renforcent l’expertise et améliorent le référencement.', ['Besoin + bénéfice.'], 2),
            w('o3.0', 'Outil 3', 'Des avis clients sur chaque fiche produit', undefined, 1),
            w('o3.1', 'Outil 3', 'Ils rassurent les futurs acheteurs et donnent la parole à la communauté.', ['Besoin + bénéfice.'], 2),
          ],
        },
        {
          id: "d10-revision-5",
          label: "Annexe complémentaire",
          title: "Relier une publication à la page attendue",
          instructions: "Lis le document 3. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Un bon lien prolonge la promesse du message.",
            "Relis le document 3 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "14 ÷ 100 × 100 = 14 %."
          ],
          outcomeIds: [
            "d10-r2"
          ],
          fields: [
            {
              id: "q1",
              label: "Quelle part des clics atteint la fiche lors du premier relevé ?",
              kind: "number",
              answer: 14,
              explain: "14 ÷ 100 × 100 = 14 %."
            },
            {
              id: "q2",
              label: "Écris le nouveau message et indique les données à comparer.",
              kind: "written",
              lines: 3,
              model: "« Envie de cultiver du basilic sur un balcon abrité ? Découvre le contenu du kit Balcon S et sa disponibilité. » Relier au produit. Sur les deux publications, relever les clics et les arrivées sur la fiche sur la même durée."
            }
          ]
        },
      ],
    },
    {
      id: 'synthese',
      kind: 'synthese',
      title: 'Synthèse',
      documents: [],
      activities: [
        {
          id: 'd10-s-a1',
          kind: 'fields',
          label: 'Synthèse',
          title: 'Complète la synthèse',
          instructions: 'Complète les trois parties de la synthèse.',
          helps: ['Missions 1 et 2 : ambiance et stylique.', 'Missions 3 et 4 : catalogue et fiche produit.', 'Mission 5 : facteurs sociaux.'],
          outcomeIds: R12,
          fields: [
            { id: 'ambiance', label: '1-2. Facteurs d’ambiance d’un site (plusieurs réponses)', kind: 'multi', options: [{ value: 'musique', label: 'Musique' }, { value: 'polices', label: 'Polices de caractères' }, { value: 'couleurs', label: 'Couleurs' }, { value: 'images', label: 'Illustrations et images' }, { value: 'ergonomie', label: 'Ergonomie' }], answers: ['musique', 'polices', 'couleurs', 'images'], explain: 'L’ergonomie est un facteur de stylique.' },
            { id: 'stylique', label: '1-2. Facteurs de stylique (plusieurs réponses)', kind: 'multi', options: [{ value: 'navigabilite', label: 'Navigabilité' }, { value: 'ergonomie', label: 'Ergonomie' }, { value: 'lisibilite', label: 'Lisibilité' }, { value: 'accessibilite', label: 'Accessibilité' }, { value: 'musique', label: 'Musique' }], answers: ['navigabilite', 'ergonomie', 'lisibilite', 'accessibilite'], explain: 'La musique est un facteur d’ambiance.' },
            { id: 'logiques', label: '3-4. Le catalogue peut être structuré selon deux logiques', kind: 'choice', options: [{ value: 'a', label: 'Critères techniques et critères thématiques' }, { value: 'b', label: 'Prix et couleurs' }], answer: 'a', explain: 'Famille, rayon, univers / thème.' },
            { id: 'fiche', label: '3-4. La fiche produit fait apparaître… (plusieurs réponses)', kind: 'multi', options: [{ value: 'visuel', label: 'Visuel et intitulé' }, { value: 'desc', label: 'Description et caractéristiques' }, { value: 'prix', label: 'Prix, disponibilité, livraison' }, { value: 'bouton', label: 'Bouton « Ajouter au panier »' }, { value: 'avis', label: 'Avis clients et partage' }, { value: 'marge', label: 'Marge réalisée' }], answers: ['visuel', 'desc', 'prix', 'bouton', 'avis'], explain: 'La marge n’est jamais affichée.' },
            { id: 'sociaux', label: '5. Facteurs sociaux (plusieurs réponses)', kind: 'multi', options: [{ value: 'forum', label: 'Forum de discussion' }, { value: 'avis', label: 'Avis clients' }, { value: 'chatbot', label: 'Agents virtuels' }, { value: 'tchat', label: 'Tchats clients' }, { value: 'blog', label: 'Blog' }, { value: 'faq', label: 'FAQ' }], answers: ['forum', 'avis', 'chatbot', 'tchat', 'blog', 'faq'], explain: 'Tous créent du lien.' },
          ],
        },
        {
          id: 'd10-s-quiz',
          kind: 'fields',
          label: 'Quiz',
          title: 'Quiz du dossier',
          instructions: 'Six questions rapides.',
          helps: ['Relis la fiche de révision.', 'Stylique : navigabilité, lisibilité, ergonomie, accessibilité.', 'Le fil d’Ariane indique où l’on se trouve.'],
          outcomeIds: R12,
          fields: [
            { id: 'q1', label: 'Le fil d’Ariane permet…', kind: 'choice', options: [{ value: 'a', label: 'De situer la page et de revenir en arrière' }, { value: 'b', label: 'De payer' }], answer: 'a', explain: 'Chemin de navigation.' },
            { id: 'q2', label: 'Un site « pure player »…', kind: 'choice', options: [{ value: 'a', label: 'Vend uniquement en ligne' }, { value: 'b', label: 'A aussi des magasins' }], answer: 'a', explain: 'Sans magasin physique.' },
            { id: 'q3', label: 'Le cross-selling consiste à…', kind: 'choice', options: [{ value: 'a', label: 'Suggérer des produits complémentaires' }, { value: 'b', label: 'Baisser le prix' }], answer: 'a', explain: 'Vente additionnelle.' },
            { id: 'q4', label: 'Un site « responsive » s’adapte…', kind: 'choice', options: [{ value: 'a', label: 'À tous les écrans : ordinateur, tablette, smartphone' }, { value: 'b', label: 'À la météo' }], answer: 'a', explain: 'Responsive webdesign.' },
            { id: 'q5', label: 'Le f-commerce désigne…', kind: 'choice', options: [{ value: 'a', label: 'La vente via un réseau social' }, { value: 'b', label: 'La vente en franchise' }], answer: 'a', explain: 'Achat sur un réseau social.' },
            { id: 'q6', label: 'L’ergonomie d’un site, c’est…', kind: 'choice', options: [{ value: 'a', label: 'Son confort, sa sécurité et son efficacité d’utilisation' }, { value: 'b', label: 'Ses couleurs' }], answer: 'a', explain: 'Facteur de stylique.' },
          ],
        },
      ],
      synthesis: [
        { title: 'Notions essentielles', kind: 'notions', items: ['Facteurs d’ambiance d’un site : couleurs, musique, polices, illustrations et vidéos.', 'Facteurs de stylique : navigabilité, ergonomie, lisibilité, accessibilité.', 'Structure : en-tête, espace de contenu, pied de page.', 'Catalogue : critères techniques (famille, rayon, univers) ou thématiques ; filtres.', 'Fiche produit : visuels, intitulé, description, prix et disponibilité, bouton d’achat, avis, partage.', 'Réseaux sociaux et outils de lien : forum, tchat, blog, avis, agent conversationnel, FAQ.'] },
        { title: 'Méthodes', kind: 'methodes', items: ['Vérifier la cohérence entre l’ambiance du site et les valeurs de l’enseigne.', 'Repérer les éléments de navigation et leur rôle.', 'Construire une fiche produit à partir des caractéristiques transformées en avantages.', 'Choisir un outil d’interaction selon le besoin du client.'] },
        { title: 'Erreurs fréquentes', kind: 'erreurs', items: ['Des couleurs sans lien avec l’identité de l’enseigne.', 'Un catalogue trop profond (plus de trois niveaux).', 'Une fiche sans prix, sans disponibilité ou sans bouton visible.', 'Publier le même message sur tous les réseaux sans l’adapter.'] },
        { title: 'Bonnes pratiques professionnelles', kind: 'pratiques', items: ['Tester le site sur ordinateur, tablette et smartphone.', 'Répondre rapidement aux messages et aux avis.', 'Mettre à jour les focus à chaque temps fort.'] },
        { title: 'Mots-clés', kind: 'mots-cles', items: ['Facteurs d’ambiance', 'Stylique', 'Navigabilité', 'Ergonomie', 'Lisibilité', 'Visibilité', 'Fiche produit', 'Facteurs sociaux'] },
        {
          title: "Les réflexes à retenir des nouveaux cas",
          kind: "pratiques",
          items: [
            "Chaque écran doit donner un repère et une prochaine action compréhensible.",
            "Un filtre et une fiche produit répondent à des questions différentes. Le filtre aide à choisir une liste, la fiche aide à décider.",
            "Vérifie le parcours depuis la publication jusqu’au produit sur le support réellement utilisé."
          ]
        },
      ],
    },
    {
      id: 'application-1',
      kind: 'application',
      number: 1,
      title: 'Adapter un site Web à tout support de connexion',
      guidance: 'autonome',
      message: { from: 'Inès Morel', role: 'Responsable, magasin Urban Fil, Limoges', text: ['Notre site doit s’afficher parfaitement sur tous les écrans. En groupe, compare son affichage sur ordinateur, tablette et smartphone.'] },
      documents: [
        { id: 'd10-a1-doc1', number: 1, title: 'Le « responsive webdesign »', look: 'texte', blocks: [{ type: 'p', text: 'Le responsive webdesign conçoit des sites qui s’adaptent à la taille de chaque écran, pour une lecture et une navigation optimales avec un minimum de zoom et de défilement. Les moteurs de recherche favorisent les sites adaptés au mobile : on dit qu’ils sont « mobile friendly ».' }] },
      ],
      activities: [
        {
          id: 'd10-a1-a1',
          kind: 'classify',
          label: '1',
          title: 'Différences d’affichage selon le support',
          instructions: 'Associe chaque constat au support sur lequel il s’observe le plus souvent.',
          helps: ['Sur smartphone, le menu se replie dans une icône « hamburger ».', 'Sur ordinateur, on voit plusieurs colonnes et un grand bandeau.', 'Sur tablette, une présentation intermédiaire.'],
          outcomeIds: R1,
          categories: [
            { id: 'pc', label: 'Ordinateur' },
            { id: 'tablette', label: 'Tablette' },
            { id: 'smartphone', label: 'Smartphone' },
          ],
          items: [
            { id: 'colonnes', text: 'Catalogue en 4 colonnes et grand bandeau d’accueil', answer: 'pc', explain: 'Grand écran.' },
            { id: 'hamburger', text: 'Menu replié dans une icône à trois traits', answer: 'smartphone', explain: 'Petit écran.' },
            { id: 'pouce', text: 'Gros boutons faciles à toucher du pouce, une colonne de produits', answer: 'smartphone', explain: 'Navigation tactile.' },
            { id: 'deux', text: 'Catalogue en 2 ou 3 colonnes, menu visible en mode paysage', answer: 'tablette', explain: 'Format intermédiaire.' },
            { id: 'survol', text: 'Menus déroulants qui s’ouvrent au survol de la souris', answer: 'pc', explain: 'Souris.' },
          ],
        },
        {
          id: 'd10-a1-a2',
          kind: 'open',
          label: '2',
          title: 'Conclure sur la qualité de l’interface',
          instructions: 'Conclus sur la qualité du site pour le m-commerce et le f-commerce : navigabilité, ergonomie, lisibilité, accessibilité.',
          helps: ['Un critère par paragraphe.', 'Donne un exemple observé pour chacun.', 'Termine par une amélioration possible.'],
          outcomeIds: R1,
          prompts: [{ id: 'conclusion', label: 'Conclusion', lines: 7 }],
          selfCheck: ['Les quatre critères sont traités.', 'Chaque critère est illustré par un exemple.', 'Une amélioration est proposée.'],
        },
        {
          id: 'd10-a1-a3',
          kind: 'fields',
          label: '1 (tableau)',
          title: 'Tableau comparatif des supports',
          instructions: 'Connecte-toi au site d’une enseigne de mode avec un ordinateur, une tablette et un smartphone. Note les différences sur le fond et sur la forme.',
          helps: ['Le fond : contenus, textes, catalogue, messages.', 'La forme : disposition, taille, boutons, menus.', 'Compare toujours au même écran : la page d’accueil.'],
          outcomeIds: R1,
          layout: 'columns',
          columns: ['Différences sur le fond', 'Différences sur la forme'],
          fields: [
            w('pc.0', 'Connexion par ordinateur', 'Tous les contenus : grand bandeau, plusieurs sélections, textes complets.', ['Contenu observé.'], 2),
            w('pc.1', 'Connexion par ordinateur', 'Plusieurs colonnes, menus déroulants au survol de la souris.', ['Forme observée.'], 2),
            w('tab.0', 'Connexion par tablette', 'Contenus presque complets, textes un peu raccourcis.', ['Contenu observé.'], 2),
            w('tab.1', 'Connexion par tablette', 'Deux ou trois colonnes, menu tactile, boutons plus grands.', ['Forme observée.'], 2),
            w('mob.0', 'Connexion par smartphone', 'Contenus essentiels, messages courts, catalogue simplifié.', ['Contenu observé.'], 2),
            w('mob.1', 'Connexion par smartphone', 'Une colonne, menu replié, boutons larges pour le pouce, défilement vertical.', ['Forme observée.'], 2),
          ],
        },
      ],
      selfAssessment: ['Je sais comparer l’affichage d’un site selon le support.'],
    },
    {
      id: 'application-2',
      kind: 'application',
      number: 2,
      title: 'Analyser l’ergonomie d’un site marchand',
      guidance: 'autonome',
      message: { from: 'Clara Vidal', role: 'Responsable marketing, Bio’Box', text: ['Bio’Box est un « pure player » qui vend des cosmétiques bio et des abonnements à des box beauté. Analyse notre site et nos fiches produits.'] },
      documents: [
        { id: 'd10-a2-doc1', number: 1, title: 'Page d’accueil de Bio’Box', look: 'site', url: 'biobox.example', blocks: [{ type: 'list', items: ['Bandeau vert sapin « Livraison offerte dès 35 € » ; logo à feuille stylisée.', 'Visuel principal : box de novembre posée sur du lin, avec des feuilles d’eucalyptus et une bougie.', 'Menu : La box du mois · E-shop · Promotions · Marque Bio’Box · Nouveautés · Marques.', 'Icônes : recherche, favoris, compte, panier ; bulle de tchat en bas à droite.', 'Pied de page : notre histoire (cosmétiques bio et engagés), réseaux sociaux, avis vérifiés 4,8/5.'] }] },
        { id: 'd10-a2-doc2', number: 2, title: 'Fiche produit : nettoyant visage solide au sel marin', look: 'site', url: 'biobox.example/nettoyant-sel-marin', blocks: [{ type: 'list', items: ['Photo du produit et de son étui ; note 4 étoiles (2 avis) ; prix 14 € ; prix abonné 12,60 €.', 'Pictos « Vegan » et « Conforme à la charte » ; quantité et bouton « Ajouter au panier ».', 'Onglets : description, conseils d’utilisation, ingrédients actifs ; bloc « Votre routine beauté » avec 4 produits complémentaires.'] }] },
      ],
      activities: [
        {
          id: 'd10-a2-a1',
          kind: 'fields',
          label: '1-4',
          title: 'Analyser le site',
          instructions: 'Réponds à l’aide des documents.',
          helps: ['Couleurs, matières naturelles, végétaux : l’univers du bio.', 'Le menu combine des critères thématiques et techniques.', 'Compare la fiche au modèle de la mission 4.'],
          outcomeIds: R1,
          fields: [
            { id: 'ambiance', label: '1. Facteurs d’ambiance utilisés (plusieurs réponses)', kind: 'multi', options: [{ value: 'couleurs', label: 'Couleurs naturelles (vert sapin)' }, { value: 'visuels', label: 'Visuels de matières naturelles' }, { value: 'logo', label: 'Logo végétal' }, { value: 'musique', label: 'Musique de fond' }], answers: ['couleurs', 'visuels', 'logo'], explain: 'Pas de musique.' },
            { id: 'coherence', label: '2. L’atmosphère est-elle cohérente avec les valeurs (bio, engagement) ?', kind: 'choice', options: OUI_NON, answer: 'oui', explain: 'Nature et douceur.' },
            { id: 'outils', label: '3. Outils d’aide à la navigation (plusieurs réponses)', kind: 'multi', options: [{ value: 'recherche', label: 'Moteur de recherche' }, { value: 'menu', label: 'Menu principal' }, { value: 'tchat', label: 'Tchat' }, { value: 'ariane', label: 'Fil d’Ariane' }], answers: ['recherche', 'menu', 'tchat'], explain: 'Pas de fil d’Ariane cité.' },
            {
              id: 'fiche',
              label: '4. Éléments présents sur la fiche (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'visuel', label: 'Visuel' },
                { value: 'prix', label: 'Prix' },
                { value: 'avis', label: 'Avis clients' },
                { value: 'bouton', label: 'Bouton d’ajout au panier' },
                { value: 'cross', label: 'Produits complémentaires' },
                { value: 'video', label: 'Vidéo' },
              ],
              answers: ['visuel', 'prix', 'avis', 'bouton', 'cross'],
              explain: 'Une vidéo pourrait être ajoutée.',
            },
            { id: 'amelioration', label: 'Amélioration à proposer pour la fiche', kind: 'choice', options: [{ value: 'a', label: 'Ajouter des vignettes sous plusieurs angles et une vidéo d’utilisation' }, { value: 'b', label: 'Retirer le prix' }], answer: 'a', explain: 'Visuels plus riches.' },
          ],
        },
        {
          id: 'd10-a2-a2',
          kind: 'fields',
          label: '2, 5 et 6',
          title: 'Atmosphère, réseaux sociaux et outils personnalisés',
          instructions: 'Réponds par écrit à l’aide des documents.',
          helps: ['Relie l’atmosphère aux valeurs bio et engagées.', 'Cherche les liens en pied de page.', 'La bulle de tchat et le programme de box sont des outils personnalisés.'],
          outcomeIds: R12,
          fields: [
            w('atmo', '2. Décris l’atmosphère du site et sa cohérence avec les valeurs de Bio’Box.', 'Une atmosphère douce et naturelle (vert sapin, lin, eucalyptus, bougie), cohérente avec des cosmétiques bio et engagés.', ['Je décris et je relie aux valeurs.']),
            w('reseaux', '5. Quels réseaux sociaux utiliser, pour quels types de publication ?', 'Un réseau de photos pour les routines beauté et les box du mois, un réseau communautaire pour les jeux-concours et l’actualité, des vidéos pour les tutoriels.', ['Au moins deux réseaux et leur usage.']),
            w('outils', '6. Quels outils d’aide personnalisés le site propose-t-il ?', 'Un tchat en direct, un espace client, un abonnement avec box personnalisée, un diagnostic beauté.', ['Au moins deux outils.']),
          ],
        },
      ],
      selfAssessment: ['Je sais analyser l’ergonomie d’un site et d’une fiche produit.'],
    },
    {
      id: 'application-3',
      kind: 'application',
      number: 3,
      title: 'Développer des éléments de lien social',
      guidance: 'autonome',
      message: { from: 'Hélène Roux', role: 'Responsable du site, Connecto (téléphonie)', text: ['Nous voulons créer des vidéos commerciales pour les réseaux sociaux. En groupe, réalisez le script d’une vidéo qui présente un de nos services, puis dites comment la publier.'] },
      documents: [
        { id: 'd10-a3-doc1', number: 1, title: 'Conseils pour une « story » efficace', look: 'procedure', blocks: [{ type: 'list', items: ['Définir l’objectif : faire connaître, déclencher l’achat…', 'Choisir le format : smartphone ou logiciel gratuit d’animation.', 'Écrire le scénario : un message clair, une cible, un personnage type confronté à une difficulté.', 'Montrer la solution et ses bénéfices, répondre aux questions et aux freins.', 'Finir sur le personnage satisfait, la marque, le logo et les réseaux sociaux.'] }] },
        { id: 'd10-a3-doc2', number: 2, title: 'Modèle de story-board', look: 'postit', blocks: [{ type: 'p', text: 'Une case par scène : un visuel + une phrase courte (message fort).' }] },
        {
          id: "d10-revision-6-doc",
          number: 3,
          title: "Corriger un parcours d’achat pour une papeterie",
          look: "fiche",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Le site d’une papeterie annonce « Cahiers A5 recyclés » sur un réseau social. Le lien arrive sur une catégorie A4. Sur mobile, le format A5 est caché dans un menu replié. La fiche A5 indique 4,90 € et 18 unités mais omet le nombre de pages. La fiche fournisseur confirme 96 pages lignées."
            }
          ]
        },
        {
          id: "d10-revision-dossier-doc1",
          number: 4,
          title: "Parcours constaté sur une semaine",
          look: "fiche",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Étape",
                "Mobile",
                "Ordinateur"
              ],
              rows: [
                [
                  "Clic sur la publication",
                  "300",
                  "100"
                ],
                [
                  "Arrivée sur la fiche du kit",
                  "90",
                  "75"
                ],
                [
                  "Ajout au panier",
                  "27",
                  "30"
                ],
                [
                  "Achat",
                  "9",
                  "18"
                ]
              ]
            },
            {
              type: "p",
              text: "La publication promet un « kit basilic prêt à planter ». Sur mobile, elle renvoie à l’accueil. Sur ordinateur, elle renvoie directement à la fiche."
            }
          ]
        },
        {
          id: "d10-revision-dossier-doc2",
          number: 5,
          title: "Données produit validées",
          look: "fiche",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Le kit contient trois pots, les coupelles et un sachet de basilic. Prix de 24,90 € TTC. Terreau vendu séparément. Dans la liste mobile, le filtre « En stock » affiche parfois le kit à tort. Les données de stock de la fiche sont fiables."
            }
          ]
        },
        {
          id: "d10-revision-dossier-doc3",
          number: 6,
          title: "Retours après premier correctif",
          look: "courriel",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Le lien direct mobile donne 180 arrivées sur la fiche pour 300 clics, 45 ajouts et 9 achats. Quatre testeurs sur six découvrent la mention sur le terreau après avoir ajouté le kit au panier."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd10-a3-a1',
          kind: 'open',
          label: '1-2',
          title: 'Script et plan de publication',
          instructions: 'Rédigez le script de la vidéo (4 à 6 scènes) et précisez comment la publier pour maximiser les vues.',
          helps: ['Scène 1 : le problème du personnage ; dernière scène : la solution et la marque.', 'Une vidéo courte (30 à 60 secondes) avec sous-titres.', 'Publication : réseaux de la cible, horaires de forte audience, hashtags, partage par les magasins.'],
          outcomeIds: R2,
          prompts: [
            { id: 'script', label: 'Script scène par scène (visuel + message)', lines: 10 },
            { id: 'publication', label: 'Plan de publication et justification', lines: 5 },
          ],
          selfCheck: ['Le personnage et sa difficulté sont clairs.', 'Les bénéfices du service sont montrés.', 'La marque et les réseaux apparaissent à la fin.', 'Le choix des réseaux est adapté à la cible.'],
        },
        {
          id: "d10-revision-6",
          label: "Nouveau cas d’application",
          title: "Corriger un parcours d’achat pour une papeterie",
          instructions: "Lis le document 3. Rédige tes réponses en t’appuyant sur les faits du document. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Pars du lien, continue par la catégorie, termine par la fiche.",
            "Relis le document 3 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "Rediriger la publication vers la catégorie ou la fiche A5. Rendre le filtre A5 visible et conserver le choix lors du retour à la liste. Ajouter « 96 pages lignées » sur la fiche avec le prix et le stock."
          ],
          outcomeIds: [
            "d10-r2"
          ],
          fields: [
            {
              id: "q1",
              label: "Écris un ticket de correction en trois actions ordonnées.",
              kind: "written",
              lines: 3,
              model: "Rediriger la publication vers la catégorie ou la fiche A5. Rendre le filtre A5 visible et conserver le choix lors du retour à la liste. Ajouter « 96 pages lignées » sur la fiche avec le prix et le stock."
            },
            {
              id: "q2",
              label: "Décris un test de recette complet.",
              kind: "written",
              lines: 3,
              model: "Sur un téléphone, ouvrir la publication, atteindre l’offre A5, lire le nombre de pages et le prix, puis ajouter l’article au panier. Vérifier que le panier contient bien le cahier A5 à 4,90 €."
            }
          ]
        },
        {
          id: "d10-revision-dossier",
          label: "Dossier de décision",
          title: "Corriger un parcours mobile sans déplacer le problème",
          instructions: "Lis les documents 4 et 5, puis écris ton diagnostic initial. Passe ensuite au document 6 pour revoir ta décision. Note tes calculs et les faits qui justifient chaque choix dans les zones de réponse. Après avoir répondu, clique sur « Vérifier mes réponses » pour comparer avec les propositions de corrigé.",
          kind: "fields",
          helps: [
            "Calcule des taux par étape, puis utilise les données du produit et les observations pour ordonner les corrections.",
            "Trace le parcours en quatre cases. Pour mesurer une perte entre deux cases, divise les personnes arrivées à la seconde par celles qui étaient à la première.",
            "Exemple. Si 40 personnes arrivent sur une fiche et 10 ajoutent au panier, le taux d’ajout est de 25 %. Si 4 achètent, le taux d’achat parmi les ajouts est de 40 %. Localise la perte avant de choisir ce qu’il faut corriger."
          ],
          outcomeIds: [
            "d10-r2"
          ],
          fields: [
            {
              id: "q1",
              label: "Repère deux différences entre mobile et ordinateur, avec les bons dénominateurs.",
              kind: "written",
              lines: 6,
              model: "Accès à la fiche de 30 % des clics sur mobile contre 75 % sur ordinateur. Achat après ajout de 9 ÷ 27, soit 33,3 %, contre 18 ÷ 30, soit 60 %. Le lien mobile pose un problème en amont et l’abandon après ajout mérite un test."
            },
            {
              id: "q2",
              label: "Prépare la première correction du lien et réécris la promesse à partir du document produit.",
              kind: "written",
              lines: 6,
              model: "Diriger le lien vers la fiche kit sur mobile. Publier « Kit basilic avec pots, coupelles et graines, 24,90 €. Terreau vendu séparément. Vérifiez la disponibilité sur la fiche. » Éviter de promettre un kit complet."
            },
            {
              id: "q3",
              label: "Le premier correctif suffit-il au vu des nouveaux taux ?",
              kind: "written",
              lines: 6,
              model: "L’accès à la fiche double, de 30 % à 60 %. Les achats restent à 9 et le taux d’achat après ajout passe de 33,3 % à 20 %. Replacer la mention terreau avant le bouton et corriger la disponibilité dans la liste. Tester ces deux points séparément si possible."
            },
            {
              id: "q4",
              label: "Rédige une recette mobile avec un cas disponible et un cas indisponible.",
              kind: "written",
              lines: 6,
              model: "Depuis la publication, atteindre la bonne fiche, voir le contenu et le terreau avant le bouton, puis contrôler le prix au panier. Quand le kit est indisponible, vérifier qu’il disparaît de la liste filtrée et que la fiche affiche l’indisponibilité sans autoriser un ajout erroné."
            }
          ]
        },
      ],
      selfAssessment: ['Je sais concevoir un contenu adapté aux réseaux sociaux.',
        "Je localise les pertes à chaque étape avec les bons dénominateurs.",
        "Je vérifie que la promesse correspond au contenu de la fiche.",
        "Je teste les cas disponible et indisponible jusqu’au panier."],
    },
    {
      id: 'bilan',
      kind: 'bilan',
      title: 'Évaluez votre réussite',
      documents: [],
      activities: [],
      selfAssessment: [
        'Je sais identifier les facteurs d’ambiance d’un site marchand.',
        'Je sais évaluer la navigation et l’ergonomie d’un site.',
        'Je sais analyser un catalogue en ligne et construire une fiche produit.',
        'Je sais choisir des réseaux et des outils pour créer du lien avec les clients.',
      ],
    },
  ],
};

function num(id: string, label: string, answer: number, explain: string): Field {
  return { id, label, kind: 'number', answer, explain };
}
