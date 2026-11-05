import type { Chapter, ChoiceOption, Field } from '../../domain/chapter';

const w = (id: string, label: string, model: string, criteria?: string[], lines = 3): Field => ({ id, label, kind: 'written', model, criteria, lines });
const num = (id: string, label: string, answer: number, explain: string, unit?: string, tolerance?: number): Field => ({ id, label, kind: 'number', answer, explain, unit, tolerance });

/**
 * DOSSIER 9 — Mettre en scène l'offre
 *
 * Progression calquée sur le manuel de référence (contexte, 4 missions, synthèse, 2 applications).
 * Enseignes, marques, personnages et documents : ORIGINAUX et fictifs.
 */

const R1 = ['d09-r1']; // Attractivité analysée, remédiations mises en place.

const SENS: ChoiceOption[] = [
  { value: 'vue', label: 'La vue' },
  { value: 'ouie', label: 'L’ouïe' },
  { value: 'odorat', label: 'L’odorat' },
  { value: 'gout', label: 'Le goût' },
  { value: 'toucher', label: 'Le toucher' },
];

export const FACTEURS = [
  { id: 'vitrine', label: 'La vitrine', desc: 'Premier élément visuel de la boutique vu de l’extérieur ; on peut y ajouter la façade et l’enseigne.', effet: 'attirer' },
  { id: 'sol', label: 'Le sol', desc: 'Signalisation au sol qui aide le client à s’orienter.', effet: 'orienter' },
  { id: 'eclairage', label: 'L’éclairage', desc: 'Il assure une bonne visibilité et joue avec l’ombre et la lumière pour valoriser les produits.', effet: 'valoriser' },
  { id: 'couleurs', label: 'Les couleurs', desc: 'Elles renforcent l’ambiance et reflètent la personnalité de la marque.', effet: 'identite' },
  { id: 'personnel', label: 'Le personnel', desc: 'Éléments humains de contact ; tenue et badge renforcent le professionnalisme.', effet: 'relation' },
  { id: 'mobilier', label: 'Le mobilier', desc: 'Il expose l’offre ; ses matériaux (bois brut, toile de jute) expriment les valeurs de la marque.', effet: 'valeurs' },
  { id: 'decoration', label: 'La décoration', desc: 'Touches finales d’originalité qui « théâtralisent » l’offre.', effet: 'theatraliser' },
  { id: 'degustation', label: 'La dégustation', desc: 'Elle permet au client de goûter avant de choisir.', effet: 'tester' },
  { id: 'signaletique', label: 'La signalétique', desc: 'Panneaux de repérage des espaces, des directions et des informations.', effet: 'orienter' },
  { id: 'musique', label: 'La musique', desc: 'Fond sonore agréable, au volume réduit, renouvelé régulièrement.', effet: 'detendre' },
  { id: 'odeurs', label: 'Les odeurs', desc: 'Senteurs perçues dans la boutique, ici celle du café torréfié sur place.', effet: 'experience' },
  { id: 'hygiene', label: 'Le gel hydroalcoolique', desc: 'Il permet aux clients et aux vendeurs de se désinfecter les mains.', effet: 'securite' },
];
const EFFETS: ChoiceOption[] = [
  { value: 'attirer', label: 'Attirer le client et créer du trafic' },
  { value: 'orienter', label: 'Faciliter le repérage et orienter' },
  { value: 'valoriser', label: 'Valoriser les produits, capter l’attention' },
  { value: 'identite', label: 'Créer une identité de marque' },
  { value: 'relation', label: 'Créer du lien et développer la relation' },
  { value: 'valeurs', label: 'Conforter les valeurs de la marque' },
  { value: 'theatraliser', label: 'Mettre en scène l’offre' },
  { value: 'tester', label: 'Permettre de tester pour déclencher l’achat' },
  { value: 'detendre', label: 'Apaiser, détendre, contribuer au bien-être' },
  { value: 'experience', label: 'Créer une atmosphère propice à une expérience unique' },
  { value: 'securite', label: 'Assurer la sécurité et l’hygiène' },
];

export const PRODUITS_VITRINE = [
  { id: 'cap-matin', name: 'Capsules café « Réveil matin » × 10', italie: false },
  { id: 'cap-italien', name: 'Capsules café « Ristretto italien » × 10', italie: true },
  { id: 'blend', name: 'Café en grains « Blend italien » 250 g', italie: true },
  { id: 'rooibos', name: 'Infusion rooibos agrumes × 15', italie: false },
  { id: 'menthe', name: 'Thé vert à la menthe × 15', italie: false },
  { id: 'tasse', name: 'Tasse à expresso 7 cl', italie: true },
  { id: 'cafetiere', name: 'Cafetière italienne 6 tasses', italie: true },
  { id: 'theiere', name: 'Théière en verre 1 L', italie: false },
  { id: 'amaretti', name: 'Biscuits amaretti 125 g', italie: true },
  { id: 'calissons', name: 'Mini-calissons 125 g', italie: false },
];

export const D09: Chapter = {
  unitId: 'd09',
  mission:
    "Maison Arabica prépare une animation autour du café. Tu observes ce que le client voit, entend et ressent depuis la rue jusqu’au comptoir. Tu choisis une ambiance et des supports adaptés, puis tu évalues leurs effets sur le repérage et les essais.",
  fictionNotice: 'Maison Arabica, les autres enseignes, les marques et les personnages de ce dossier sont imaginaires.',
  company: {
    name: 'Maison Arabica — Tulle',
    tagline: 'Torréfacteur : cafés, thés et chocolats',
    facts: [
      ['Ton poste', 'Élève en PFMP, vente et mise en valeur de l’offre'],
      ['Ta tutrice', 'Léa Fontaine, responsable de la boutique'],
      ['Devise', '« Torréfacteurs passionnés »'],
    ],
  },
  steps: [
    {
      id: 'ouverture',
      kind: 'ouverture',
      title: "Créer une ambiance qui facilite le choix et l’achat",
      hero: { id: 'd09-hero', alt: 'Intérieur chaleureux d’une boutique de café avec sacs de grains et torréfacteur' },
      message: {
        from: 'Léa Fontaine',
        role: 'Responsable, Maison Arabica Tulle',
        text: ['Bienvenue ! Notre mission : rendre le café de qualité accessible, authentique et simple, sous toutes ses formes (grains, moulu, capsules). Chez nous, on torréfie sur place : cela se voit… et se sent !'],
      },
      documents: [
        {
          id: "d09-revision-reperes",
          number: 2,
          title: "Trois repères pour commencer",
          look: "memo",
          blocks: [
            {
              type: "list",
              items: [
                "Un facteur d’ambiance est un élément que le client perçoit, par exemple la lumière, le son ou l’odeur.",
                "La PLV attire l’attention sur l’offre. L’ILV indique un prix, un usage ou une direction pour aider le client à choisir.",
                "Mesure l’effet sur une étape observable du parcours, comme trouver le rayon, essayer ou acheter."
              ]
            }
          ]
        },
        {
          id: 'd09-o-doc1',
          number: 1,
          title: 'L’enseigne Maison Arabica',
          look: 'article',
          blocks: [
            { type: 'p', text: 'Maison Arabica est un réseau de 80 boutiques franchisées spécialisées dans le café, le thé et le chocolat. Chaque boutique dispose d’un atelier de torréfaction visible des clients, d’un comptoir de dégustation et de quelques tables pour consommer sur place.' },
            { type: 'facts', items: [['Société', 'SASU Arabica Tulle'], ['Adresse', 'Rue Jean-Jaurès, 19000 Tulle'], ['Concurrents', 'Autres torréfacteurs, rayons café des supermarchés, sites de vente de capsules']] },
          ],
        },
      ],
      activities: [
        {
          id: 'd09-o-a1',
          kind: 'fields',
          label: 'Annexe',
          title: 'Fiche d’identité de l’entreprise',
          instructions: 'Complète la fiche d’identité à l’aide du document 1.',
          helps: ['Toutes les réponses sont dans le document 1.', 'Réseau de boutiques franchisées : commerce associé.', 'SASU = société par actions simplifiée unipersonnelle.'],
          outcomeIds: R1,
          fields: [
            { id: 'raison', label: 'Raison sociale', kind: 'text', accept: ['SASU Arabica Tulle', 'Arabica Tulle'], explain: 'SASU Arabica Tulle, enseigne Maison Arabica.' },
            { id: 'activite', label: 'Activité', kind: 'choice', options: [{ value: 'cafe', label: 'Vente de cafés, thés et chocolats' }, { value: 'resto', label: 'Restauration' }, { value: 'epicerie', label: 'Épicerie générale' }], answer: 'cafe', explain: 'Torréfacteur spécialisé.' },
            { id: 'type', label: 'Type de commerce', kind: 'choice', options: [{ value: 'franchise', label: 'Commerce associé : franchise' }, { value: 'integre', label: 'Commerce intégré' }], answer: 'franchise', explain: 'Réseau de boutiques franchisées.' },
            { id: 'statut', label: 'Statut juridique', kind: 'given', value: 'SASU' },
            { id: 'loc', label: 'Localisation', kind: 'text', accept: ['Tulle', 'rue Jean-Jaurès Tulle'], explain: 'Tulle.' },
          ],
        },
        {
          id: 'd09-o-a2',
          kind: 'fields',
          label: 'Questions',
          title: 'Première impression',
          instructions: 'Réponds en quelques phrases à partir de la description de la boutique.',
          helps: ['Que voit, que sent et qu’entend le client en entrant ?', 'Les espaces (torréfaction, dégustation, vente) sont distincts.', 'Signalétique, mobilier et atelier visible délimitent les zones.'],
          outcomeIds: R1,
          fields: [
            w('impression', '1. Quelle est la première impression lorsqu’on entre dans la boutique ?', 'Une impression de chaleur et d’authenticité : le bois, les sacs de jute, les couleurs chaudes et l’odeur du café torréfié sur place plongent le client dans l’univers du café dès l’entrée.', ['Je cite au moins deux éléments observés.', 'Je parle d’une émotion ou d’une ambiance.']),
            w('reperage', '2. Pourquoi est-il facile de repérer les différents espaces proposés ?', 'Chaque espace est signalé par des panneaux et des ardoises ; le mobilier délimite les zones (comptoir de dégustation, étagères de vente, tables) et l’atelier de torréfaction est visible de tous.', ['Je cite la signalétique.', 'Je cite le mobilier ou l’agencement.']),
            w('message', '3. Que veut transmettre l’enseigne à ses clients ?', 'Une passion pour le café de qualité, accessible à tous, authentique et simple : on montre la torréfaction, on fait goûter, on conseille.', ['Je reprends la mission de l’enseigne.']),
          ],
        },
      ],
    },
    {
      id: 'mission-1',
      kind: 'mission',
      number: 1,
      title: 'Identifier les facteurs d’ambiance du point de vente',
      guidance: 'guidé',
      message: {
        from: 'Léa Fontaine',
        role: 'Responsable',
        text: ['Nous avons trois types d’achat : l’achat quotidien (café, thé), l’achat d’impulsion (gourmandises) et l’achat cadeau (20 % de l’activité). La consommation sur place ne représente que 10 % de l’activité, mais elle crée du trafic toute la journée. La décoration et l’ambiance font vivre une expérience unique : identifie nos facteurs d’ambiance et leurs effets.'],
      },
      documents: [
        {
          id: 'd09-m1-doc1',
          number: 1,
          title: 'Les facteurs d’ambiance de la boutique',
          look: 'texte',
          blocks: [
            {
              type: 'list',
              items: [
                'Vitrine éclairée avec l’enseigne en lettres dorées, sacs de jute et cafetières anciennes.',
                'Vendeurs en tablier noir brodé et badge à leur prénom.',
                'Tapis à l’entrée « Café, thé, chocolat », flèches au sol vers l’espace dégustation.',
                'Suspensions industrielles et spots orientés sur les étagères.',
                'Murs rouge brique, bois clair, ardoises écrites à la craie.',
                'Musique jazz douce, sélection renouvelée chaque mois.',
                'Odeur du café torréfié chaque matin dans l’atelier visible.',
                'Dégustation offerte du « café du moment » au comptoir.',
                'Distributeur de gel hydroalcoolique à l’entrée.',
              ],
            },
          ],
        },
        {
          id: "d09-revision-1-doc",
          number: 2,
          title: "Diagnostiquer les hésitations dans la boutique",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Sur trente visites observées, 12 clients demandent où se trouve le café en grains. Huit s’arrêtent devant le meuble de dégustation mais repartent sans demander un essai. À la vitrine, le thème café est visible, mais le chemin vers le comptoir n’est indiqué nulle part."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd09-m1-a1',
          kind: 'fields',
          label: 'Annexe',
          title: 'Identifier les facteurs d’ambiance et leurs effets',
          instructions: 'Pour chaque description, retrouve le facteur d’ambiance, puis l’effet principal recherché.',
          helps: ['Commence par la colonne « Facteur » : chaque description correspond à un élément du document.', 'Plusieurs effets sont possibles, choisis le principal.', 'Le sol et la signalétique servent tous deux à orienter.'],
          outcomeIds: R1,
          layout: 'columns',
          columns: ['Facteur d’ambiance', 'Effet recherché'],
          fields: FACTEURS.flatMap((f): Field[] => [
            { id: `${f.id}.0`, label: f.desc, kind: 'choice', select: true, options: FACTEURS.map((x) => ({ value: x.id, label: x.label })), answer: f.id, explain: `${f.label}.` },
            { id: `${f.id}.1`, label: f.desc, kind: 'choice', select: true, options: EFFETS, answer: f.effet, explain: EFFETS.find((e) => e.value === f.effet)!.label + '.' },
          ]),
        },
        {
          id: 'd09-m1-a2',
          kind: 'fields',
          label: 'Question',
          title: 'Facteur d’ambiance et expérience client',
          instructions: 'En t’appuyant sur ton travail et sur tes expériences de client, explique simplement la notion de facteur d’ambiance et fais le lien avec l’expérience client.',
          helps: ['Un facteur d’ambiance agit sur les sens et les émotions.', 'L’expérience client, c’est ce que le client vit et retient de sa visite.', 'Le lien : une ambiance réussie rend la visite agréable et mémorable, donc fidélise.'],
          outcomeIds: R1,
          fields: [
            w('def', 'Qu’est-ce qu’un facteur d’ambiance ?', 'C’est un élément de l’environnement du point de vente (lumière, couleurs, musique, odeurs, décor, personnel…) qui agit sur les sens et les émotions du client.', ['Je donne une définition.', 'Je cite au moins trois exemples.'], 3),
            w('lien', 'Quel lien avec l’expérience client ?', 'Les facteurs d’ambiance créent une expérience agréable et unique : le client se sent bien, reste plus longtemps, achète davantage et a envie de revenir. Ils différencient le magasin d’Internet.', ['J’explique l’effet sur le comportement d’achat.', 'Je parle de fidélisation ou de différenciation.'], 4),
          ],
        },
        {
          id: "d09-revision-1",
          label: "Annexe complémentaire",
          title: "Diagnostiquer les hésitations dans la boutique",
          instructions: "Lis le document 2. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Distingue les difficultés de repérage et les hésitations à essayer.",
            "Relis le document 2 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "12 ÷ 30 × 100 = 40 %."
          ],
          outcomeIds: [
            "d09-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Calcule la part des visites avec une demande de repérage.",
              kind: "number",
              answer: 40,
              explain: "12 ÷ 30 × 100 = 40 %."
            },
            {
              id: "q2",
              label: "Propose deux modifications et le relevé de contrôle.",
              kind: "written",
              lines: 3,
              model: "Ajouter une flèche vers le café en grains et un panneau « Dégustation au comptoir » indiquant comment participer. Relever sur un autre créneau comparable les demandes d’orientation et les essais réalisés."
            }
          ]
        },
      ],
    },
    {
      id: 'mission-2',
      kind: 'mission',
      number: 2,
      title: 'Exploiter le marketing sensoriel',
      guidance: 'accompagné',
      message: { from: 'Léa Fontaine', role: 'Responsable', text: ['Fais le bilan de nos actions de marketing sensoriel, sens par sens, puis prépare la liste de contrôle des vendeurs.'] },
      documents: [
        {
          id: 'd09-m2-doc1',
          number: 1,
          title: 'Le marketing sensoriel',
          look: 'article',
          blocks: [
            { type: 'p', text: 'Le marketing sensoriel sollicite un ou plusieurs des cinq sens du client : la vue, l’ouïe, l’odorat, le goût et le toucher. Selon plusieurs études, une ambiance agréable incite les clients à rester plus longtemps et à revenir. La musique et les odeurs comptent parmi les facteurs les plus influents ; pouvoir voir et toucher les produits reste l’un des grands avantages du magasin sur Internet. L’important est la cohérence : toutes les sensations doivent raconter la même histoire.' },
          ],
        },
        {
          id: 'd09-m2-doc2',
          number: 2,
          title: 'Le « Mur des arômes »',
          look: 'memo',
          blocks: [{ type: 'p', text: 'Nouveau concept de la boutique : un mur de flacons à sentir, classés par famille d’arômes (épicé, floral, fruité, grillé, végétal). Le client sent les flacons, choisit son arôme préféré, et le vendeur lui conseille le café ou le thé correspondant.' }],
        },
        {
          id: "d09-revision-2-doc",
          number: 3,
          title: "Tester un facteur sensoriel à la fois",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Créneau de 30 min",
                "Visiteurs",
                "Essais",
                "Ambiance"
              ],
              rows: [
                [
                  "Mardi",
                  "40",
                  "8",
                  "Musique habituelle"
                ],
                [
                  "Jeudi",
                  "40",
                  "12",
                  "Musique moins forte"
                ]
              ]
            },
            {
              type: "p",
              text: "La dégustation, le café et l’emplacement sont identiques. Le responsable dispose de deux créneaux supplémentaires la semaine suivante."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd09-m2-a1',
          kind: 'fields',
          label: 'Annexe 1',
          title: 'Analyse du marketing sensoriel de la boutique',
          instructions: 'Pour chacun des cinq sens, explique comment la boutique le stimule (documents 1 et 2 de la mission 1 et document 2 ci-dessus).',
          helps: ['Relis la liste des facteurs d’ambiance de la mission 1.', 'Pense aussi au « Mur des arômes ».', 'Vue : vitrine, couleurs, lumière. Ouïe : musique, moulin. Odorat : torréfaction, flacons. Goût : dégustation. Toucher : tasses, sacs de grains.'],
          outcomeIds: R1,
          layout: 'columns',
          columns: ['Comment la boutique stimule-t-elle ce sens ?'],
          fields: [
            w('vue.0', 'La vue', 'Vitrine éclairée et décorée, murs rouge brique, bois clair, ardoises à la craie, spots orientés sur les étagères, atelier de torréfaction visible.', ['Au moins deux exemples.'], 2),
            w('ouie.0', 'L’ouïe', 'Musique jazz douce renouvelée chaque mois, bruit du moulin et de la machine à expresso.', ['Au moins un exemple.'], 2),
            w('odorat.0', 'L’odorat', 'Odeur du café torréfié chaque matin ; flacons du Mur des arômes à sentir pour choisir son café ou son thé.', ['J’associe l’odeur au produit.'], 2),
            w('gout.0', 'Le goût', 'Dégustation offerte du café du moment au comptoir, consommation sur place.', ['Au moins un exemple.'], 2),
            w('toucher.0', 'Le toucher', 'Tasses, cafetières et sacs de grains en libre accès, mobilier en bois brut, toile de jute.', ['Au moins un exemple.'], 2),
          ],
        },
        {
          id: 'd09-m2-a2',
          kind: 'classify',
          label: 'Annexe 2',
          title: 'Liste de contrôle des vendeurs',
          instructions: 'Classe chaque point de contrôle : sert-il le marketing sensoriel (MS) ou le respect de l’hygiène et de la sécurité (HS) ?',
          helps: ['MS : ce qui agit sur les sens et l’ambiance.', 'HS : ce qui protège la santé et la sécurité, ou que la réglementation impose.', 'Les dates limites et les prix relèvent de la réglementation.'],
          outcomeIds: R1,
          categories: [
            { id: 'ms', label: 'Marketing sensoriel' },
            { id: 'hs', label: 'Hygiène, sécurité, réglementation' },
          ],
          items: [
            { id: 'musique', text: 'Vérifier la diffusion de la musique', answer: 'ms', explain: 'L’ouïe.' },
            { id: 'prix', text: 'Afficher les prix sur les produits et en vitrine', answer: 'hs', explain: 'Obligation réglementaire.' },
            { id: 'sols', text: 'Veiller à la propreté des sols et du matériel', answer: 'hs', explain: 'Hygiène.' },
            { id: 'deguster', text: 'Inviter les clients à déguster', answer: 'ms', explain: 'Le goût.' },
            { id: 'eclairage', text: 'Veiller au bon fonctionnement des éclairages', answer: 'ms', explain: 'La vue.' },
            { id: 'dlc', text: 'Vérifier les dates limites des produits de dégustation', answer: 'hs', explain: 'Sécurité alimentaire.' },
            { id: 'flacons', text: 'Recharger les flacons du Mur des arômes', answer: 'ms', explain: 'L’odorat.' },
            { id: 'tenue', text: 'Garder une tenue professionnelle propre', answer: 'hs', explain: 'Hygiène.' },
            { id: 'vitrine', text: 'Maintenir la vitrine attractive et adaptée au thème', answer: 'ms', explain: 'La vue.' },
          ],
        },
        {
          id: 'd09-m2-a3',
          kind: 'fields',
          label: 'Conclusion',
          title: 'Conclure sur la pertinence',
          instructions: 'Conclus sur la pertinence du marketing sensoriel de la boutique.',
          helps: ['Combien de sens sont sollicités ?', 'Les sensations racontent-elles la même histoire (le café, l’authenticité) ?', 'Le magasin offre ce qu’Internet ne peut pas offrir.'],
          outcomeIds: R1,
          fields: [
            num('nb', 'Nombre de sens sollicités', 5, 'Les cinq sens.'),
            w('conclusion', 'Conclusion argumentée', 'Le marketing sensoriel est pertinent : la boutique stimule les cinq sens de façon cohérente autour de l’univers du café torréfié. Cette expérience complète, impossible à vivre en ligne, donne envie de rester, de goûter et de revenir.', ['Je cite le nombre de sens.', 'Je parle de cohérence.', 'Je compare au commerce en ligne.'], 4),
          ],
        },
        {
          id: 'd09-m2-a4',
          kind: 'fields',
          label: 'Annexe 3',
          title: 'Le « Mur des arômes »',
          instructions: 'Analyse le nouveau concept (document 2).',
          helps: ['Quel sens le client utilise-t-il devant le mur ?', 'Le vendeur intervient après le choix de l’arôme.', 'C’est une aide au choix, donc à l’achat.'],
          outcomeIds: R1,
          fields: [
            { id: 'sens', label: '1. Sens principalement sollicité', kind: 'choice', options: SENS, answer: 'odorat', explain: 'Le client sent les flacons.' },
            { id: 'familles', label: '2. Familles d’arômes proposées (plusieurs réponses)', kind: 'multi', options: [{ value: 'epice', label: 'Épicé' }, { value: 'floral', label: 'Floral' }, { value: 'fruite', label: 'Fruité' }, { value: 'grille', label: 'Grillé' }, { value: 'vegetal', label: 'Végétal' }, { value: 'sucre', label: 'Sucré' }], answers: ['epice', 'floral', 'fruite', 'grille', 'vegetal'], explain: 'Cinq familles.' },
            { id: 'interet', label: '3. Intérêt pour la boutique (plusieurs réponses)', kind: 'multi', options: [{ value: 'aide', label: 'Aider le client à choisir' }, { value: 'experience', label: 'Faire vivre une expérience originale' }, { value: 'conseil', label: 'Ouvrir le dialogue avec le vendeur' }, { value: 'stock', label: 'Réduire le stock en réserve' }], answers: ['aide', 'experience', 'conseil'], explain: 'Une aide à l’achat et un moment de conseil.' },
          ],
        },
        {
          id: "d09-revision-2",
          label: "Annexe complémentaire",
          title: "Tester un facteur sensoriel à la fois",
          instructions: "Lis le document 3. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Compare les proportions et cherche ce qui peut varier entre les deux jours.",
            "Relis le document 3 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "12 ÷ 40 × 100 = 30 %."
          ],
          outcomeIds: [
            "d09-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Quel taux d’essai observe-t-on jeudi ?",
              kind: "number",
              answer: 30,
              explain: "12 ÷ 40 × 100 = 30 %."
            },
            {
              id: "q2",
              label: "Rédige une conclusion prudente et le test suivant.",
              kind: "written",
              lines: 3,
              model: "Le taux passe de 20 % à 30 %. Le résultat suggère un essai supplémentaire avec des créneaux comparables, en alternant les niveaux sonores et en notant les conditions de fréquentation."
            }
          ]
        },
      ],
    },
    {
      id: 'mission-3',
      kind: 'mission',
      number: 3,
      title: 'Sélectionner les éléments d’ambiance pour une animation',
      guidance: 'accompagné',
      message: { from: 'Léa Fontaine', role: 'Responsable', text: ['Aide-moi pour l’opération promotionnelle « Dolce Vita », qui met en avant le café italien et ses produits dérivés. Sélectionne les couleurs, les produits et la décoration du podium de la vitrine.'] },
      documents: [
        {
          id: 'd09-m3-doc1',
          number: 1,
          title: 'Mémo : le café en Italie',
          look: 'texte',
          blocks: [{ type: 'p', text: 'En Italie, le café est un véritable art de vivre. L’expresso, inventé avec la machine à pression au début du XXᵉ siècle, se boit vite, souvent debout au comptoir, le matin, avec une petite pâtisserie. Cappuccino, ristretto, macchiato : les mots du café sont italiens dans le monde entier. À la maison, on utilise la cafetière italienne.' }],
        },
        {
          id: 'd09-m3-doc2',
          number: 2,
          title: 'Recommandations du siège',
          look: 'memo',
          blocks: [{ type: 'p', text: 'Pour l’opération « Dolce Vita », respectez les couleurs symboliques du pays. Les objets de décoration évoquent le produit (le café) et le pays. Prévoyez de la PLV pour soutenir l’action et théâtraliser l’offre. Le présentoir de vitrine doit interpeller le client depuis l’extérieur.' }],
        },
{
          id: 'd09-m3-doc3',
          number: 3,
          title: 'Catalogue des produits disponibles',
          look: 'texte',
          blocks: [{ type: 'table', head: ['Produit', 'Famille'], rows: PRODUITS_VITRINE.map((p) => [p.name, p.italie ? 'Café et accessoires' : p.name.includes('Thé') || p.name.includes('Infusion') || p.name.includes('Théière') ? 'Thés et infusions' : 'Gourmandises']) }],
        },
        {
          id: "d09-revision-3-doc",
          number: 4,
          title: "Sélectionner une ambiance dans un budget limité",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Budget de 90 €. Le thème est la préparation du café à la maison. La responsable souhaite une animation visuelle et une dégustation. Elle écarte tout équipement qui gêne le passage ou masque les informations du comptoir."
            },
            {
              type: "table",
              head: [
                "Option",
                "Coût",
                "Contrainte"
              ],
              rows: [
                [
                  "Affiche du thème",
                  "20 €",
                  "Mur disponible"
                ],
                [
                  "Kit de dégustation",
                  "45 €",
                  "Comptoir dédié"
                ],
                [
                  "Arche décorative",
                  "50 €",
                  "Occupe une partie du passage"
                ],
                [
                  "Porte-fiches recettes",
                  "15 €",
                  "Tient sur le comptoir"
                ]
              ]
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd09-m3-a1',
          kind: 'fields',
          label: 'Annexe',
          title: 'Préparer le podium',
          instructions: 'Sélectionne les éléments du podium en trois étapes.',
          helps: ['Le drapeau italien est vert, blanc et rouge.', 'Seuls les produits liés au café italien sont mis en avant.', 'La décoration évoque l’Italie et le café.'],
          outcomeIds: R1,
          fields: [
            { id: 'couleurs', label: 'Étape 1 — Couleurs dominantes (plusieurs réponses)', kind: 'multi', options: [{ value: 'vert', label: 'Vert' }, { value: 'blanc', label: 'Blanc' }, { value: 'rouge', label: 'Rouge' }, { value: 'bleu', label: 'Bleu' }, { value: 'jaune', label: 'Jaune' }], answers: ['vert', 'blanc', 'rouge'], explain: 'Les couleurs du drapeau italien.' },
            { id: 'produits', label: 'Étape 2 — Produits à mettre en avant (plusieurs réponses)', kind: 'multi', options: PRODUITS_VITRINE.map((p) => ({ value: p.id, label: p.name })), answers: PRODUITS_VITRINE.filter((p) => p.italie).map((p) => p.id), explain: 'Thés, infusions et calissons ne correspondent pas au thème.' },
            w('decoRedige', 'Étape 3 — Objets décoratifs, en lien avec le thème, qui permettront de mettre en scène la vitrine', 'Drapeaux et fanions vert-blanc-rouge, sacs de jute et grains de café, nappe à carreaux, maquette de scooter italien, tasses d’expresso empilées, affiche d’une place italienne.', ['Les objets évoquent l’Italie.', 'Les objets évoquent le café.', 'Les couleurs du drapeau sont reprises.'], 3),
            {
              id: 'deco',
              label: 'Vérifie ta liste : objets adaptés (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'drapeau', label: 'Petits drapeaux italiens' },
                { value: 'sacs', label: 'Sacs de jute et grains de café' },
                { value: 'vespa', label: 'Maquette de scooter italien' },
                { value: 'nappe', label: 'Nappe à carreaux rouges et blancs' },
                { value: 'sapin', label: 'Sapin de Noël' },
                { value: 'tour', label: 'Tour Eiffel miniature' },
              ],
              answers: ['drapeau', 'sacs', 'vespa', 'nappe'],
              explain: 'Le sapin et la tour Eiffel n’évoquent pas l’Italie.',
            },
          ],
        },
        {
          id: 'd09-m3-a2',
          kind: 'open',
          label: 'Justification',
          title: 'Justifier la sélection',
          instructions: 'Explique à Léa Fontaine pourquoi tu as retenu ces couleurs, ces produits et ces décorations.',
          helps: ['Appuie-toi sur les recommandations du siège.', 'Un paragraphe pour chaque étape.', 'Montre le lien avec la culture italienne du café (document 1).'],
          outcomeIds: R1,
          prompts: [{ id: 'justif', label: 'Justification', lines: 6 }],
          selfCheck: ['Les couleurs du pays sont justifiées.', 'Chaque produit retenu est lié au café italien.', 'La décoration évoque le produit et le pays.'],
        },
        {
          id: "d09-revision-3",
          label: "Annexe complémentaire",
          title: "Sélectionner une ambiance dans un budget limité",
          instructions: "Lis le document 4. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Vérifie le budget et la faisabilité avant d’ajouter un support.",
            "Relis le document 4 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "20 + 45 + 15 = 80 €."
          ],
          outcomeIds: [
            "d09-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Quel budget utilisent l’affiche, la dégustation et les recettes ?",
              kind: "number",
              answer: 80,
              explain: "20 + 45 + 15 = 80 €."
            },
            {
              id: "q2",
              label: "Explique l’usage de chaque élément le jour de l’animation.",
              kind: "written",
              lines: 3,
              model: "L’affiche annonce le thème, le kit permet l’essai au comptoir et les fiches prolongent l’expérience à la maison. Le passage reste dégagé et il reste 10 €."
            }
          ]
        },
      ],
    },
    {
      id: 'mission-4',
      kind: 'mission',
      number: 4,
      title: 'Mettre en scène l’offre et installer la PLV et l’ILV',
      guidance: 'autonome',
      message: { from: 'Léa Fontaine', role: 'Responsable', text: ['Propose-moi des éléments de PLV et d’ILV pour l’opération, puis décris la mise en place de la vitrine : affiche, stickers, présentoir et facteurs d’ambiance.'] },
      documents: [
        {
          id: 'd09-m4-doc1',
          number: 1,
          title: 'PLV et ILV',
          look: 'texte',
          blocks: [
            {
              type: 'table',
              head: ['Technique', 'Définition', 'Supports'],
              rows: [
                ['PLV — publicité sur le lieu de vente', 'Promouvoir de façon ponctuelle un produit ou une marque, souvent avec du matériel fourni par le fabricant.', 'Affiche, kakémono, présentoir carton, stop-rayon, stickers, totem vidéo'],
                ['ILV — information sur le lieu de vente', 'Informer, orienter et guider les clients de façon permanente.', 'Signalétique, panneaux de rayon, étiquettes, borne interactive, QR code, écran tactile'],
              ],
            },
          ],
        },
        {
          id: "d09-revision-4-doc",
          number: 2,
          title: "Installer la PLV et l’ILV le long du parcours",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Les supports disponibles sont une affiche « Découvrez notre café du mois », une flèche « Dégustation à gauche » et une fiche indiquant origine, poids et prix du paquet. L’équipe dispose de la vitrine, de l’entrée et du meuble de présentation."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd09-m4-a1',
          kind: 'classify',
          label: 'Annexe 1',
          title: 'PLV ou ILV ?',
          instructions: 'Classe chaque support.',
          helps: ['PLV : ponctuelle, pour promouvoir.', 'ILV : permanente, pour informer et orienter.', 'L’affiche de l’opération est de la PLV ; le panneau « Thés » est de l’ILV.'],
          outcomeIds: R1,
          categories: [
            { id: 'plv', label: 'PLV' },
            { id: 'ilv', label: 'ILV' },
          ],
          items: [
            { id: 'affiche', text: 'Affiche suspendue « Dolce Vita »', answer: 'plv', explain: 'Promotion ponctuelle.' },
            { id: 'stickers', text: 'Stickers « Grazie ! » sur la vitrine', answer: 'plv', explain: 'Animation de l’opération.' },
            { id: 'presentoir', text: 'Présentoir carton des capsules italiennes', answer: 'plv', explain: 'Mise en avant temporaire.' },
            { id: 'panneau', text: 'Panneau « Thés » au-dessus du rayon', answer: 'ilv', explain: 'Repérage permanent.' },
            { id: 'qr', text: 'QR code sur l’étagère renvoyant à la fiche d’origine des cafés', answer: 'ilv', explain: 'Information.' },
            { id: 'horaires', text: 'Affichage des horaires de torréfaction', answer: 'ilv', explain: 'Information permanente.' },
          ],
        },
        {
          id: 'd09-m4-a1b',
          kind: 'fields',
          label: 'Annexe 1 (suite)',
          title: 'Proposer des solutions d’ILV et de PLV pour la boutique',
          instructions: 'Propose trois supports (au moins un de PLV et un d’ILV), précise leur emplacement dans la boutique et justifie.',
          helps: ['Pense aux supports classiques (kakémono, stop-rayon, présentoir), tactiles (borne, QR code) et dynamiques (écran).', 'L’emplacement dépend de l’objectif : attirer (vitrine, entrée), informer (rayon), faire acheter (caisse).', 'Exemple : un QR code sur l’étagère des cafés italiens qui renvoie à l’histoire du produit.'],
          outcomeIds: R1,
          layout: 'columns',
          columns: ['Support', 'Emplacement', 'Justification'],
          fields: [
            w('s1.0', 'Proposition 1', 'Kakémono « Dolce Vita » (PLV).', undefined, 1),
            w('s1.1', 'Proposition 1', 'À l’entrée, visible depuis la rue.', undefined, 1),
            w('s1.2', 'Proposition 1', 'Il attire l’attention des passants et annonce l’opération.', undefined, 2),
            w('s2.0', 'Proposition 2', 'Stop-rayon sur les capsules et cafés italiens (PLV).', undefined, 1),
            w('s2.1', 'Proposition 2', 'Sur les étagères des cafés.', undefined, 1),
            w('s2.2', 'Proposition 2', 'Il interrompt le regard et met en avant les produits de l’opération.', undefined, 2),
            w('s3.0', 'Proposition 3', 'QR code sur l’origine des cafés (ILV).', undefined, 1),
            w('s3.1', 'Proposition 3', 'Sur les étiquettes du rayon café.', undefined, 1),
            w('s3.2', 'Proposition 3', 'Il informe le client sur le produit et prolonge l’expérience sur son smartphone.', undefined, 2),
          ],
        },
{
          id: 'd09-m4-a2',
          kind: 'open',
          label: 'Annexes 2 et 3',
          title: 'Décrire la vitrine de l’opération',
          instructions: 'Décris (ou dessine sur papier) la mise en place de la vitrine : position de l’affiche, des stickers, du présentoir et des produits, et les facteurs d’ambiance utilisés.',
          helps: ['Le présentoir au centre, à hauteur des yeux du passant.', 'Les produits phares devant, les accessoires autour.', 'Pense à l’éclairage et aux couleurs de l’Italie.'],
          outcomeIds: R1,
          prompts: [
            { id: 'vitrine', label: 'Mise en place de la vitrine', lines: 7 },
            { id: 'ambiance', label: 'Facteurs d’ambiance utilisés', lines: 3 },
          ],
          selfCheck: ['Les couleurs du thème sont respectées.', 'Seuls les produits du thème sont présentés.', 'La PLV interpelle depuis l’extérieur.', 'Au moins deux sens sont sollicités.'],
        },
        {
          id: "d09-revision-4",
          label: "Annexe complémentaire",
          title: "Installer la PLV et l’ILV le long du parcours",
          instructions: "Lis le document 2. Rédige tes réponses en t’appuyant sur les faits du document. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Associe le rôle du message à l’endroit où il sert.",
            "Relis le document 2 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "Affiche de PLV en vitrine pour attirer. Flèche d’ILV à l’entrée pour guider. Fiche d’ILV près du produit pour renseigner au moment du choix."
          ],
          outcomeIds: [
            "d09-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Classe les supports et propose leur emplacement.",
              kind: "written",
              lines: 3,
              model: "Affiche de PLV en vitrine pour attirer. Flèche d’ILV à l’entrée pour guider. Fiche d’ILV près du produit pour renseigner au moment du choix."
            },
            {
              id: "q2",
              label: "Quel contrôle réalises-tu depuis le trottoir puis dans la boutique ?",
              kind: "written",
              lines: 3,
              model: "Depuis l’extérieur, lire le thème. Depuis l’entrée, suivre la flèche sans revenir sur ses pas. Au meuble, vérifier que la fiche correspond au bon produit et que son prix est visible."
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
          id: 'd09-s-a1',
          kind: 'fields',
          label: 'Synthèse',
          title: 'Complète la synthèse',
          instructions: 'Complète les trois parties de la synthèse.',
          helps: ['Reprends les facteurs d’ambiance de la mission 1.', 'Un sens par type de marketing.', 'PLV : publicité ; ILV : information.'],
          outcomeIds: R1,
          fields: [
            w('role', '1. Les facteurs d’ambiance servent à…', 'Séduire le client en créant une identité visuelle et sensorielle ; ils agissent sur son inconscient et favorisent l’achat et la fidélisation.', undefined, 2),
            { id: 'personnel', label: '1. Tenue et badge conformes aux codes de l’entreprise : facteur…', kind: 'text', accept: ['personnel', 'le personnel'], explain: 'Le personnel.' },
            { id: 'eclairage', label: '1. Il valorise les produits (spots, néons…) : facteur…', kind: 'text', accept: ['éclairage', 'eclairage', 'l’éclairage', 'la lumière', 'lumiere'], explain: 'L’éclairage.' },
            { id: 'signal', label: '1. Tout élément qui guide et informe : facteur…', kind: 'text', accept: ['signalétique', 'signaletique', 'la signalétique', 'ILV'], explain: 'La signalétique (ILV).' },
            w('auditif', '2. Marketing auditif : exemple', 'Musique d’ambiance adaptée à la clientèle, volume réduit, bruit du moulin.', undefined, 1),
            w('olfactif', '2. Marketing olfactif : exemple', 'Odeur du café torréfié, diffuseurs de parfum.', undefined, 1),
            w('gustatif', '2. Marketing gustatif : exemple', 'Dégustation du produit du moment.', undefined, 1),
            { id: 'mise', label: '3-4. Mise en scène de l’offre : sélection des produits, réalisation de la vitrine et…', kind: 'text', accept: ['théâtralisation de l’offre', 'theatralisation de l offre', 'théâtralisation', 'theatralisation'], explain: 'Théâtralisation de l’offre.' },
            { id: 'plv', label: '3-4. P… L… V… : affiche, totem, présentoir', kind: 'text', accept: ['publicité sur le lieu de vente', 'publicite sur le lieu de vente'], explain: 'Publicité sur le lieu de vente.' },
            { id: 'ilv', label: '3-4. I… L… V… : borne, écran tactile', kind: 'text', accept: ['information sur le lieu de vente'], explain: 'Information sur le lieu de vente.' },
          ],
        },
        {
          id: 'd09-s-quiz',
          kind: 'fields',
          label: 'Quiz',
          title: 'Quiz du dossier',
          instructions: 'Six questions rapides.',
          helps: ['Relis la fiche de révision.', 'PLV = publicité, ILV = information.', 'Cinq sens : vue, ouïe, odorat, goût, toucher.'],
          outcomeIds: R1,
          fields: [
            { id: 'q1', label: 'Les facteurs d’ambiance agissent surtout sur…', kind: 'choice', options: [{ value: 'a', label: 'L’inconscient du client, pour favoriser l’achat et la fidélité' }, { value: 'b', label: 'Le prix des produits' }], answer: 'a', explain: 'Ils créent une identité visuelle et sensorielle.' },
            { id: 'q2', label: 'Le marketing olfactif utilise…', kind: 'choice', options: [{ value: 'odeurs', label: 'Les odeurs' }, { value: 'musique', label: 'La musique' }], answer: 'odeurs', explain: 'L’odorat.' },
            { id: 'q3', label: 'Une borne interactive est un support de…', kind: 'choice', options: [{ value: 'ilv', label: 'ILV' }, { value: 'plv', label: 'PLV' }], answer: 'ilv', explain: 'Elle informe et oriente.' },
            { id: 'q4', label: 'Un stop-rayon promotionnel est un support de…', kind: 'choice', options: [{ value: 'plv', label: 'PLV' }, { value: 'ilv', label: 'ILV' }], answer: 'plv', explain: 'Il promeut ponctuellement.' },
            { id: 'q5', label: 'Une dégustation relève du marketing…', kind: 'choice', options: [{ value: 'gustatif', label: 'Gustatif' }, { value: 'tactile', label: 'Tactile' }], answer: 'gustatif', explain: 'Le goût.' },
            { id: 'q6', label: 'Théâtraliser l’offre, c’est…', kind: 'choice', options: [{ value: 'a', label: 'La mettre en scène avec décor, PLV et ambiance autour d’un thème' }, { value: 'b', label: 'Baisser les prix' }], answer: 'a', explain: 'Mise en scène.' },
          ],
        },
      ],
      synthesis: [
        { title: 'Notions essentielles', kind: 'notions', items: ['Facteurs d’ambiance : vitrine, personnel, sol, décoration, éclairage, signalétique, musique, odeurs, animations.', 'Ils créent une identité visuelle et sensorielle, agissent sur l’inconscient et favorisent l’achat et la fidélité.', 'Marketing sensoriel : visuel, auditif, olfactif, gustatif, tactile.', 'PLV (publicité sur le lieu de vente) et ILV (information sur le lieu de vente).', 'Mise en scène de l’offre : vitrine, théâtralisation autour d’un thème.'] },
        { title: 'Méthodes', kind: 'methodes', items: ['Repérer chaque facteur d’ambiance et son effet.', 'Faire le bilan sens par sens.', 'Pour une animation : thème → couleurs → produits → décoration → PLV.', 'Vérifier la cohérence de toutes les sensations.'] },
        { title: 'Erreurs fréquentes', kind: 'erreurs', items: ['Mettre en vitrine des produits hors thème.', 'Confondre PLV (ponctuelle, promotion) et ILV (permanente, information).', 'Oublier l’hygiène et la sécurité au profit de l’ambiance.'] },
        { title: 'Bonnes pratiques professionnelles', kind: 'pratiques', items: ['Renouveler la vitrine à chaque temps fort.', 'Vérifier chaque matin musique, éclairage et propreté.', 'Proposer une dégustation en respectant les dates limites.'] },
        { title: 'Mots-clés', kind: 'mots-cles', items: ['Facteurs d’ambiance', 'Marketing sensoriel', 'Expérience client', 'PLV', 'ILV', 'Théâtralisation'] },
        {
          title: "Les réflexes à retenir des nouveaux cas",
          kind: "pratiques",
          items: [
            "Relie chaque facteur d’ambiance à une étape du parcours et à un comportement observable.",
            "La publicité sur le lieu de vente attire ou met en avant une offre. L’information sur le lieu de vente aide à comprendre ou à se repérer.",
            "Vérifie le confort, l’accès et la cohérence des messages pendant l’animation."
          ]
        },
      ],
    },
    {
      id: 'application-1',
      kind: 'application',
      number: 1,
      title: 'Analyser les facteurs d’ambiance',
      guidance: 'autonome',
      hero: { id: 'd09-cuisine', alt: 'Boutique d’ustensiles de cuisine colorée avec tables de présentation' },
      message: { from: 'Nathalie Brun', role: 'Responsable, boutique Toque & Tablier, Brive', text: ['Bienvenue ! Nous voulons être un lieu de découverte, de rencontre et d’initiation gourmande. Analyse nos facteurs d’ambiance.'] },
      documents: [
        {
          id: 'd09-a1-doc1',
          number: 1,
          title: 'Qui sommes-nous ?',
          look: 'texte',
          blocks: [
            { type: 'p', text: 'Toque & Tablier rassemble tout ce qui touche à l’art culinaire en quatre univers : l’épicerie fine, l’art de la table, les ustensiles et les livres de cuisine.' },
            { type: 'list', title: 'Ce que l’on voit et entend', items: ['Sol en carreaux de ciment colorés ; meubles en bois clair et vert anis.', 'Grandes vitrines lumineuses présentant une table dressée.', 'Spots orientés sur les produits, lumière naturelle.', 'Musique actuelle choisie par un prestataire, mise à jour chaque mois ; annonces au micro des offres en cours.', 'Senteurs d’épices le matin, de vanille l’après-midi.', 'Bar à sirops en dégustation ; démonstration culinaire chaque jour à 16 h, sauf le lundi.'] },
          ],
        },
        {
          id: 'd09-a1-doc2',
          number: 2,
          title: 'Autres facteurs d’ambiance mis en place',
          look: 'texte',
          blocks: [
            {
              type: 'table',
              head: ['Musique', 'Micro', 'Senteurs', 'Animations ponctuelles', 'Démonstrations'],
              rows: [['Style actuel, sélection d’un prestataire, mise à jour régulière', 'Annonce des offres en cours', 'Notes gourmandes le matin, épicées l’après-midi', 'Bar à sirops avec dégustation des produits vendus', 'Tous les jours à 16 h sauf le lundi ; une recette nouvelle chaque semaine']],
            },
          ],
        },
      ],
      activities: [
        {
          id: 'd09-a1-a1',
          kind: 'fields',
          label: '1-2',
          title: 'Repérer les univers et les facteurs d’ambiance',
          instructions: 'Réponds à l’aide du document.',
          helps: ['Les quatre univers sont dans la première phrase.', 'Relis la liste ligne par ligne.', 'Démonstration et bar à sirops : animations.'],
          outcomeIds: R1,
          fields: [
            { id: 'univers', label: '1. Les quatre univers de la boutique (plusieurs réponses)', kind: 'multi', options: [{ value: 'epicerie', label: 'Épicerie fine' }, { value: 'table', label: 'Art de la table' }, { value: 'ustensiles', label: 'Ustensiles' }, { value: 'livres', label: 'Livres de cuisine' }, { value: 'electro', label: 'Gros électroménager' }], answers: ['epicerie', 'table', 'ustensiles', 'livres'], explain: 'Pas de gros électroménager.' },
            { id: 'sol', label: '2. Sol', kind: 'choice', options: [{ value: 'a', label: 'Carreaux de ciment colorés' }, { value: 'b', label: 'Moquette grise' }], answer: 'a', explain: 'Ambiance chaleureuse et colorée.' },
            { id: 'mobilier', label: '2. Mobilier', kind: 'choice', options: [{ value: 'a', label: 'Bois clair et vert anis' }, { value: 'b', label: 'Métal noir' }], answer: 'a', explain: 'Naturel et gai.' },
            { id: 'vitrine', label: '2. Vitrine', kind: 'choice', options: [{ value: 'a', label: 'Grande, lumineuse, avec une table dressée' }, { value: 'b', label: 'Fermée par un rideau' }], answer: 'a', explain: 'Mise en scène de l’offre.' },
          ],
        },
        {
          id: 'd09-a1-a2',
          kind: 'fields',
          label: '2-3',
          title: 'Caractériser les éléments d’ambiance et les 5 sens',
          instructions: 'Décris chaque facteur d’ambiance de la boutique, puis explique comment elle stimule chacun des cinq sens.',
          helps: ['Attention au verbe « caractériser » : décrire précisément.', 'Appuie-toi sur la liste « Ce que l’on voit et entend ».', 'Le toucher : les ustensiles en libre accès.'],
          outcomeIds: R1,
          layout: 'columns',
          columns: ['Description'],
          fields: [
            w('sol.0', 'Sol', 'Carreaux de ciment colorés : ambiance gaie, chaleureuse et artisanale.', undefined, 2),
            w('couleurs.0', 'Couleurs', 'Bois clair et vert anis : nature, fraîcheur, gourmandise.', undefined, 2),
            w('mobilier.0', 'Mobilier', 'Meubles en bois clair, tables de présentation thématiques par univers.', undefined, 2),
            w('eclairage.0', 'Éclairage', 'Spots orientés sur les produits et lumière naturelle qui valorise les couleurs.', undefined, 2),
            w('vitrine.0', 'Vitrine', 'Grandes vitrines lumineuses avec une table dressée : mise en scène de l’art de la table.', undefined, 2),
            w('vue.0', 'La vue', 'Couleurs, vitrines, tables dressées, spots.', undefined, 1),
            w('ouie.0', 'L’ouïe', 'Musique actuelle renouvelée chaque mois, annonces au micro.', undefined, 1),
            w('odorat.0', 'L’odorat', 'Senteurs d’épices le matin, de vanille l’après-midi.', undefined, 1),
            w('gout.0', 'Le goût', 'Bar à sirops et démonstrations culinaires quotidiennes.', undefined, 1),
            w('toucher.0', 'Le toucher', 'Ustensiles et vaisselle en libre accès à manipuler.', undefined, 1),
          ],
        },
        {
          id: 'd09-a1-a3',
          kind: 'fields',
          label: '2 (suite)',
          title: 'Caractériser les autres éléments d’ambiance',
          instructions: 'Décris l’éclairage et les couleurs, puis l’effet des démonstrations culinaires.',
          helps: ['Relis le document 1.', 'Les couleurs : bois clair, vert anis, carreaux colorés.', 'Une démonstration fait goûter, voir et donne envie de revenir.'],
          outcomeIds: R1,
          fields: [
            { id: 'eclairage', label: 'Éclairage', kind: 'choice', options: [{ value: 'a', label: 'Spots orientés sur les produits et lumière naturelle' }, { value: 'b', label: 'Néons blancs uniformes' }], answer: 'a', explain: 'Il valorise les produits.' },
            { id: 'couleurs', label: 'Couleurs', kind: 'choice', options: [{ value: 'a', label: 'Couleurs gaies et naturelles : bois clair, vert anis, carreaux colorés' }, { value: 'b', label: 'Noir et argent' }], answer: 'a', explain: 'Univers chaleureux de la cuisine.' },
            { id: 'demo', label: 'Effets des démonstrations (plusieurs réponses)', kind: 'multi', options: [{ value: 'trafic', label: 'Créer du trafic à heure fixe' }, { value: 'fideliser', label: 'Faire revenir chaque semaine (nouvelle recette)' }, { value: 'ventes', label: 'Vendre les ustensiles et ingrédients utilisés' }, { value: 'stock', label: 'Vider la réserve' }], answers: ['trafic', 'fideliser', 'ventes'], explain: 'Animation génératrice de trafic et de ventes.' },
          ],
        },
      ],
      selfAssessment: ['Je sais caractériser les facteurs d’ambiance d’un magasin.', 'Je sais relier une action au sens qu’elle stimule.'],
    },
    {
      id: 'application-2',
      kind: 'application',
      number: 2,
      title: 'Étudier des solutions modernes de facteurs d’ambiance',
      guidance: 'autonome',
      hero: { id: 'd09-connecte', alt: 'Supérette moderne illuminée avec écrans et terrasse' },
      message: { from: 'Romain Delage', role: 'Chef de projet, enseigne Ville&Vous', text: ['Notre magasin connecté du centre de Limoges est ouvert 24 h/24, sans caisse classique. Analyse en groupe ses facteurs d’ambiance et conclus sur l’expérience proposée.'] },
      documents: [
        {
          id: 'd09-a2-doc1',
          number: 1,
          title: 'Ville&Vous, le magasin de demain',
          look: 'article',
          blocks: [
            { type: 'list', items: ['400 m² sur trois niveaux : produits frais, épicerie fine et bar au rez-de-chaussée ; produits secs au sous-sol ; à l’étage, un espace de coworking et un showroom déco.', 'Une borne vocale « Où se trouve… ? » affiche le trajet vers le produit sur un plan en 3D et l’envoie sur le smartphone du client.', 'Un mur d’écrans tactiles permet de commander des courses livrées à domicile.', 'Étiquettes électroniques avec QR code : composition et origine des produits ; bandeaux lumineux animés sur les étagères.', 'Vitrines en réalité augmentée ; odeur de café, jeux de lumière, terrasse et bar au centre de l’espace.', 'Pas de caissier : le personnel est en rayon (caviste, coupe, conseil).'] },
          ],
        },
        {
          id: "d09-revision-5-doc",
          number: 2,
          title: "Concevoir un essai dans une boutique de décoration",
          look: "fiche",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Une boutique veut faire toucher des tissus. Sur 50 visites, 10 clients touchent les échantillons placés derrière la caisse. Un îlot bas accessible est libre près du rayon rideaux. Une affichette, les échantillons et les fiches d’entretien sont disponibles. Le test suivant portera sur 50 visites comparables."
            }
          ]
        },
        {
          id: "d09-revision-dossier-doc1",
          number: 3,
          title: "Observation initiale",
          look: "fiche",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Sur 80 entrées, 24 personnes essaient le café et 6 achètent. Six des personnes qui ont goûté demandent le prix du sachet. Cinq autres se trompent de file en cherchant le comptoir. Le client doit pouvoir circuler même si plusieurs personnes attendent."
            }
          ]
        },
        {
          id: "d09-revision-dossier-doc2",
          number: 4,
          title: "Budget et dispositifs",
          look: "fiche",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Dispositif",
                "Coût",
                "Effet attendu"
              ],
              rows: [
                [
                  "Affiche de vitrine",
                  "22 €",
                  "Annoncer le thème"
                ],
                [
                  "Flèche vers le comptoir",
                  "12 €",
                  "Guider les visiteurs"
                ],
                [
                  "Fiches produit et prix",
                  "16 €",
                  "Aider au choix"
                ],
                [
                  "Bar à dégustation supplémentaire",
                  "48 €",
                  "Augmenter le nombre d’essais"
                ]
              ]
            },
            {
              type: "p",
              text: "Budget de 55 €. Le comptoir actuel peut rester en service. Un bar supplémentaire n’a pas d’emplacement libre hors de la circulation."
            }
          ]
        },
        {
          id: "d09-revision-dossier-doc3",
          number: 5,
          title: "Deuxième observation",
          look: "courriel",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Après installation de la flèche et des fiches et remplacement de l’affiche de vitrine, 96 clients entrent, 30 goûtent, 11 achètent et deux personnes se trompent de file. Le deuxième créneau se déroule un samedi, le premier un jeudi."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd09-a2-a1',
          kind: 'classify',
          label: '1',
          title: 'Analyser les facteurs d’ambiance du magasin connecté',
          instructions: 'Classe chaque élément selon son rôle principal.',
          helps: ['Orienter et informer : ILV digitale.', 'Créer une ambiance : sens et lieu de vie.', 'Faciliter l’achat : services.'],
          outcomeIds: R1,
          categories: [
            { id: 'informer', label: 'Informer et orienter' },
            { id: 'ambiance', label: 'Créer une ambiance, un lieu de vie' },
            { id: 'service', label: 'Faciliter l’achat (service)' },
          ],
          items: [
            { id: 'borne', text: 'Borne vocale avec plan en 3D', answer: 'informer', explain: 'Repérage des produits.' },
            { id: 'qr', text: 'Étiquettes électroniques avec QR code', answer: 'informer', explain: 'Information produit.' },
            { id: 'odeur', text: 'Odeur de café et jeux de lumière', answer: 'ambiance', explain: 'Marketing sensoriel.' },
            { id: 'coworking', text: 'Bar, terrasse et espace de coworking', answer: 'ambiance', explain: 'Lieu de vie.' },
            { id: 'mur', text: 'Mur d’écrans pour commander en livraison', answer: 'service', explain: 'Offre augmentée.' },
            { id: 'horaires', text: 'Ouverture 24 h/24 sans caisse', answer: 'service', explain: 'Accessibilité.' },
            { id: 'ra', text: 'Vitrines en réalité augmentée', answer: 'ambiance', explain: 'Mise en scène spectaculaire.' },
          ],
        },
        {
          id: 'd09-a2-a2',
          kind: 'open',
          label: '2',
          title: 'Conclure sur l’expérience client',
          instructions: 'Rédige en groupe une conclusion sur la qualité de l’expérience proposée : points forts et limites.',
          helps: ['Points forts : innovation, lieu de vie, sens sollicités.', 'Limites possibles : clients peu à l’aise avec le numérique, moins de contacts humains en caisse.', 'Conclus : expérience impossible à vivre devant un écran.'],
          outcomeIds: R1,
          prompts: [{ id: 'conclusion', label: 'Conclusion', lines: 7 }],
          selfCheck: ['Au moins trois points forts sont cités.', 'Au moins une limite est discutée.', 'La conclusion répond à la question posée.'],
        },
        {
          id: "d09-revision-5",
          label: "Nouveau cas d’application",
          title: "Concevoir un essai dans une boutique de décoration",
          instructions: "Lis le document 2. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Prépare à la fois la mise en scène et l’observation qui permettra de la juger.",
            "Relis le document 2 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "10 ÷ 50 × 100 = 20 %."
          ],
          outcomeIds: [
            "d09-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Quel est le taux initial de manipulation des tissus ?",
              kind: "number",
              answer: 20,
              explain: "10 ÷ 50 × 100 = 20 %."
            },
            {
              id: "q2",
              label: "Décris l’installation et le critère de décision.",
              kind: "written",
              lines: 3,
              model: "Poser les échantillons à portée sur l’îlot avec une invitation à les toucher et les fiches d’entretien au point de choix. Compter les manipulations et vérifier la circulation. Comparer au taux initial de 20 %."
            }
          ]
        },
        {
          id: "d09-revision-dossier",
          label: "Dossier de décision",
          title: "Repenser une dégustation qui attire sans faciliter l’achat",
          instructions: "Lis les documents 3 et 4, puis écris ton diagnostic initial. Passe ensuite au document 5 pour revoir ta décision. Note tes calculs et les faits qui justifient chaque choix dans les zones de réponse. Après avoir répondu, clique sur « Vérifier mes réponses » pour comparer avec les propositions de corrigé.",
          kind: "fields",
          helps: [
            "Compare les étapes du parcours avec des taux. L’augmentation du nombre d’entrées peut expliquer une partie de la hausse des achats.",
            "Pour chaque taux, écris ce que tu comptes au numérateur et quel groupe a eu la possibilité de le faire au dénominateur.",
            "Exemple. Sur 50 entrées, 10 personnes goûtent et 4 achètent après l’essai. Le taux d’essai est 10 ÷ 50 = 20 %. Le taux d’achat parmi les personnes qui goûtent est 4 ÷ 10 = 40 %."
          ],
          outcomeIds: [
            "d09-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Diagnostique le premier parcours et calcule deux taux.",
              kind: "written",
              lines: 6,
              model: "Taux d’essai 24 ÷ 80 = 30 %. Taux d’achat après essai 6 ÷ 24 = 25 %. Les hésitations portent sur le prix et le repérage, ce qui justifie de revoir l’information en plus de l’ambiance."
            },
            {
              id: "q2",
              label: "Choisis les supports et situe-les, avec budget et fonction.",
              kind: "written",
              lines: 6,
              model: "Affiche en vitrine pour annoncer, flèche à l’entrée pour guider et fiche de prix près de la dégustation pour choisir. Coût 50 €, reste 5 €. Le bar à 48 € gênerait la circulation et ne corrige pas les deux observations prioritaires."
            },
            {
              id: "q3",
              label: "Compare le deuxième relevé au premier.",
              kind: "written",
              lines: 6,
              model: "Essai de 31,25 %, soit +1,25 point. Achat après essai d’environ 36,7 %, soit +11,7 points. Deux erreurs de file au lieu de cinq. Les observations suggèrent un meilleur repérage, mais les jours et les publics diffèrent."
            },
            {
              id: "q4",
              label: "Propose un test qui distingue l’effet des supports de celui du jour.",
              kind: "written",
              lines: 6,
              model: "Comparer deux créneaux du même jour de semaine avec une offre, une durée et une équipe comparables. Noter entrées, essais, achats et erreurs de file. Tester séparément un autre support si on veut isoler son effet."
            }
          ]
        },
      ],
      selfAssessment: ['Je sais analyser des facteurs d’ambiance innovants.',
        "Je relie une observation du parcours à une action et à son coût.",
        "Je compare des taux avec le bon dénominateur.",
        "Je propose un test qui rend les créneaux comparables."],
    },
    {
      id: 'bilan',
      kind: 'bilan',
      title: 'Évaluez votre réussite',
      documents: [],
      activities: [],
      selfAssessment: [
        'Je sais identifier les facteurs d’ambiance et leurs effets.',
        'Je sais analyser le marketing sensoriel d’un point de vente.',
        'Je sais sélectionner les éléments d’une animation commerciale.',
        'Je sais distinguer PLV et ILV et proposer une mise en scène de l’offre.',
      ],
    },
  ],
};
