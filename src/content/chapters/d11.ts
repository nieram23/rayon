import type { Chapter, ChoiceOption, Field } from '../../domain/chapter';

const w = (id: string, label: string, model: string, criteria?: string[], lines = 3): Field => ({ id, label, kind: 'written', model, criteria, lines });

/**
 * DOSSIER 11 — Préparer l'action commerciale
 *
 * Progression calquée sur le manuel de référence (contexte, 5 missions, synthèse, 3 applications).
 * Enseignes, marques, personnages et chiffres : ORIGINAUX et fictifs. Les calculs sont faits ici puis testés.
 */

const R1 = ['d11-r1']; // Propositions argumentées et cohérentes avec les objectifs.
const R2 = ['d11-r2']; // Recommandations de l'enseigne respectées.
const R12 = ['d11-r1', 'd11-r2'];
export const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const fr = (n: number, d = 2) => n.toLocaleString('fr-FR', { minimumFractionDigits: Number.isInteger(n) ? 0 : d, maximumFractionDigits: d });
const eur = (n: number) => `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const num = (id: string, label: string, answer: number, explain: string, unit?: string, tolerance?: number): Field => ({ id, label, kind: 'number', answer, explain, unit, tolerance });

/* Mission 2 : segmentation */
const CRITERES: ChoiceOption[] = [
  { value: 'socio', label: 'Sociodémographique' },
  { value: 'psycho', label: 'Psychologique' },
  { value: 'comport', label: 'Comportemental' },
];

/* Mission 3 : veille concurrentielle */
export const VEILLE = [
  { id: 'robot', name: 'Figurine robot de l’espace', prix: { nous: 84.99, jouet: 89.99, web: 84.99, discount: 84.99 } },
  { id: 'plateau', name: 'Jeu de plateau « Empire »', prix: { nous: 19.59, jouet: 24.99, web: 33.1, discount: 27.24 } },
  { id: 'chateau', name: 'Château à construire', prix: { nous: 84.99, jouet: 109.99, web: 84.99, discount: 84.99 } },
  { id: 'dessin', name: 'Jeu « Dessine et devine »', prix: { nous: 24.99, jouet: 29.99, web: 17.37, discount: 18.74 } },
].map((v) => {
  const autres = [v.prix.jouet, v.prix.web, v.prix.discount];
  const min = Math.min(...autres);
  return { ...v, min, position: v.prix.nous <= min ? 'aligne' : 'plus-cher', ecart: r2(v.prix.nous - min) };
});

/* Mission 4 : coffrets */
export const COFFRETS = [
  { ref: 'Super-héros, coffret', prix: 75, stock: 5, univers: 'Comics' },
  { ref: 'Ninja Saga', prix: 34.5, stock: 2, univers: 'Mangas' },
  { ref: 'Reporter Tom, intégrale', prix: 99, stock: 3, univers: 'BD' },
  { ref: 'L’école des sorciers', prix: 84.9, stock: 7, univers: 'Enfants' },
  { ref: 'Elfes et Dragons', prix: 75.85, stock: 6, univers: 'BD' },
  { ref: 'Titans, coffret', prix: 118, stock: 5, univers: 'Comics' },
  { ref: 'Proust, l’œuvre', prix: 271, stock: 2, univers: 'Littérature' },
  { ref: 'Archives secrètes, artbook', prix: 199.95, stock: 3, univers: 'BD' },
  { ref: 'Le grand livre de la pâtisserie', prix: 40.5, stock: 7, univers: 'Illustré' },
  { ref: 'Cap Horn, tome 15', prix: 150, stock: 2, univers: 'BD' },
].map((c) => ({ ...c, valeur: r2(c.prix * c.stock) }));
/** Consigne : privilégier les stocks les plus importants en valeur, en variant les univers (un produit par univers). */
export const COFFRETS_CHOIX = (() => {
  const sorted = [...COFFRETS].sort((a, b) => b.valeur - a.valeur);
  const pris: typeof COFFRETS = [];
  for (const c of sorted) if (!pris.some((p) => p.univers === c.univers) && pris.length < 4) pris.push(c);
  return pris;
})();

/* Application 1 : segmentation */
export const SEG = { sexes: 2, plateformes: 4, genres: 7 };
export const NB_SEGMENTS = SEG.sexes * SEG.plateformes * SEG.genres;
export const FIDELES = 6200;
export const PART_HOMMES = 57;
export const HOMMES = Math.round((FIDELES * PART_HOMMES) / 100);
export const HOMMES_PLAY = Math.round((HOMMES * 39) / 100);

/* Application 2 : clientèle potentielle */
export const VILLE = 41200;
export const PART_JOUEURS = 73;
export const JOUEURS = Math.round((VILLE * PART_JOUEURS) / 100);

export const D11: Chapter = {
  unitId: 'd11',
  mission:
    "Chez Page & Jeu, la fréquentation du mercredi a baissé. Tu lis les données clients, proposes une cible, repères un créneau propice, sélectionnes les articles et construis une action dont le responsable pourra mesurer les résultats.",
  fictionNotice: 'Page & Jeu, les concurrents, les produits, les personnages et les chiffres de ce dossier sont imaginaires.',
  company: {
    name: 'Page & Jeu — Brive',
    tagline: 'Grande surface spécialisée : livres, loisirs créatifs, jeux, musique, papeterie',
    facts: [
      ['Ton poste', 'Élève en PFMP, secteur « Livres »'],
      ['Ton tuteur', 'Éric Sabatier, chef du secteur « Livres »'],
      ['Le directeur', 'Karim Belaïd'],
    ],
  },
  steps: [
    {
      id: 'ouverture',
      kind: 'ouverture',
      title: "Préparer une opération commerciale à partir de besoins observés",
      hero: { id: 'd11-hero', alt: 'Cliente feuilletant un livre dans les rayons d’une librairie' },
      message: { from: 'Karim Belaïd', role: 'Directeur, Page & Jeu Brive', text: ['Notre enseigne veut rendre la culture accessible dans les zones commerciales. Je te demande de proposer des actions pour attirer de nouveaux clients et créer du trafic. Tu commences au secteur « Livres ».'] },
      documents: [
        {
          id: "d11-revision-reperes",
          number: 2,
          title: "Trois repères pour commencer",
          look: "memo",
          blocks: [
            {
              type: "list",
              items: [
                "Un segment est un groupe de clients qui partagent un besoin ou un comportement observable.",
                "Une enquête décrit les répondants. Les ventes décrivent les achats enregistrés. Croise ces données avant de choisir une cible.",
                "Vérifie le stock vendable, le créneau, la capacité et le coût avant de promettre une opération."
              ]
            }
          ]
        },
        {
          id: 'd11-o-doc1',
          number: 1,
          title: 'L’enseigne Page & Jeu',
          look: 'article',
          blocks: [
            { type: 'p', text: 'Page & Jeu est un réseau français de grandes surfaces spécialisées dans les loisirs culturels et créatifs : près de 800 000 références de livres, jeux, papeterie, musique et beaux-arts. L’enseigne multiplie les ateliers, les dédicaces et les animations pour fidéliser sa clientèle.' },
            { type: 'facts', items: [['Société', 'Page & Jeu SAS'], ['Magasin', 'Zone commerciale de l’Ouest, 19100 Brive'], ['Concurrents', 'Grands sites de vente en ligne, autres enseignes culturelles, espaces culturels des hypermarchés'], ['Stratégie', 'Faciliter l’accès à la culture et développer la clientèle par les animations']] },
          ],
        },
      ],
      activities: [
        {
          id: 'd11-o-a1',
          kind: 'fields',
          label: 'Annexe',
          title: 'Fiche d’identité de l’entreprise',
          instructions: 'Complète la fiche d’identité à l’aide du document 1.',
          helps: ['Toutes les réponses sont dans le document 1.', 'GSS = grande surface spécialisée.', 'La stratégie est dans la dernière ligne.'],
          outcomeIds: R1,
          fields: [
            { id: 'raison', label: 'Raison sociale', kind: 'text', accept: ['Page & Jeu SAS', 'Page et Jeu SAS', 'Page & Jeu', 'Page et Jeu'], explain: 'Page & Jeu SAS.' },
            { id: 'activite', label: 'Activité', kind: 'choice', options: [{ value: 'culture', label: 'Vente de produits culturels et de loisirs créatifs' }, { value: 'edition', label: 'Édition de livres' }], answer: 'culture', explain: 'GSS culturelle.' },
            { id: 'type', label: 'Type de commerce', kind: 'choice', options: [{ value: 'gss', label: 'Grande surface spécialisée' }, { value: 'superette', label: 'Commerce de proximité' }], answer: 'gss', explain: 'Grande surface spécialisée.' },
            { id: 'loc', label: 'Localisation', kind: 'text', accept: ['Brive', 'Brive-la-Gaillarde', 'zone commerciale de l’Ouest Brive'], explain: 'Brive.' },
            { id: 'strat', label: 'Stratégie commerciale', kind: 'choice', options: [{ value: 'a', label: 'Faciliter l’accès à la culture et développer la clientèle par des animations' }, { value: 'b', label: 'Vendre uniquement en ligne' }], answer: 'a', explain: 'Document 1.' },
          ],
        },
        {
          id: 'd11-o-a2',
          kind: 'fields',
          label: 'Questions',
          title: 'Comprendre le message de l’enseigne',
          instructions: 'Réponds par écrit à l’aide du document 1.',
          helps: ['Que veut l’enseigne pour ses clients ?', 'Relis la liste des familles de produits.', 'Les animations sont un service.'],
          outcomeIds: R1,
          fields: [
            w('message', '1. Quel message l’enseigne veut-elle transmettre ?', 'Rendre la culture et les loisirs accessibles à tous, avec plaisir et proximité, près de chez soi.', ['Je parle de l’accès à la culture.']),
            w('produits', '2. Quels produits et services met-elle en avant ?', 'Livres, jeux, papeterie, musique, beaux-arts ; ateliers, dédicaces et animations en magasin.', ['Produits + services.']),
          ],
        },
      ],
    },
    {
      id: 'mission-1',
      kind: 'mission',
      number: 1,
      title: 'Exploiter les informations sur la clientèle',
      guidance: 'guidé',
      message: { from: 'Éric Sabatier', role: 'Chef du secteur « Livres »', text: ['Le secteur « Livres » compte un très grand nombre de références : il faut suivre les tendances de consommation. J’ai rassemblé des informations issues de nos outils et d’organismes extérieurs. Aide-moi à les analyser.'] },
      documents: [
        {
          id: 'd11-m1-doc1',
          number: 1,
          title: 'Enquête auprès des clients encartés (après un achat de livre)',
          look: 'fiche',
          blocks: [
            { type: 'table', head: ['Question', 'Réponses'], rows: [['Ce qui vous a déçu', 'Attente en caisse ; trop de monde les jours de dédicace'], ['Ce qui vous comblerait', 'Moins d’attente ; des espaces pour s’asseoir ; plus de mises en avant des meilleures ventes et des nouveautés'], ['Ce qui vous a enthousiasmé', 'Le choix, le conseil, l’ambiance, les dédicaces'], ['Recommanderiez-vous le rayon (0 à 10) ?', '0 à 6 : 24 % ; 7 et 8 : 59 % ; 9 et 10 : 17 %'], ['Sexe', 'Femmes 64 % ; hommes 36 %'], ['Âge', 'Moins de 18 ans 3 % ; 18-34 ans 35 % ; 35-54 ans 41 % ; 55 ans et plus 18 %']] },
          ],
        },
        {
          id: 'd11-m1-doc2',
          number: 2,
          title: 'Étude d’un institut sur les lecteurs',
          look: 'texte',
          blocks: [{ type: 'list', items: ['Profil des plus grands lecteurs : femmes de 65 ans et plus, diplômées, retraitées.', 'Livres préférés : arts de vivre et loisirs (49 %), histoire (45 %), romans policiers (43 %).', 'Lecteurs de livres numériques : surtout les 25-34 ans, autant de femmes que d’hommes.'] }],
        },
        {
          id: 'd11-m1-doc3',
          number: 3,
          title: 'Données internes du magasin',
          look: 'memo',
          blocks: [{ type: 'list', items: ['Consultation du site du magasin : +4 % sur un an.', 'Hausses : livres jeunesse 4-7 ans (+12 %), BD et mangas (+16 %), livres jeunesse 8-10 ans (+8 %).', 'Baisse : livres numériques jeunesse (−3 %).', 'Top 5 des ventes : deux BD et trois romans de fiction hors poche.'] }],
        },
        {
          id: 'd11-m1-doc4',
          number: 4,
          title: 'Communiqué de la fédération du e-commerce',
          look: 'article',
          blocks: [{ type: 'list', items: ['La moitié des produits achetés en ligne sont des biens culturels.', 'Livraison : à domicile (86 % des acheteurs), en point relais (64 %), en retrait magasin (41 %).', 'Panier moyen en ligne : 36 €.', 'Les acheteurs en ligne de biens culturels sont plus jeunes et plus souvent des hommes, et des familles.'] }],
        },
        {
          id: "d11-revision-1-doc",
          number: 5,
          title: "Comparer deux sources sur les besoins des clients",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Le questionnaire du magasin a recueilli 50 réponses. 30 personnes demandent un atelier découverte de jeux courts. Sur les six dernières semaines, 18 jeux de moins de 20 minutes ont été vendus le mercredi, contre 8 jeux plus longs. Le questionnaire a surtout été proposé à la sortie du rayon jeux."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd11-m1-a1',
          kind: 'classify',
          label: 'Annexe 1',
          title: 'Sources d’information internes ou externes',
          instructions: 'Classe chaque source.',
          helps: ['Interne : produite par l’entreprise elle-même.', 'Externe : produite par un organisme extérieur.', 'Les enquêtes auprès des clients encartés sont internes.'],
          outcomeIds: R1,
          categories: [
            { id: 'interne', label: 'Source interne' },
            { id: 'externe', label: 'Source externe' },
          ],
          items: [
            { id: 'enquete', text: 'Enquête auprès des clients encartés', answer: 'interne', explain: 'Réalisée par le magasin.' },
            { id: 'donnees', text: 'Données de ventes et de consultation du site', answer: 'interne', explain: 'Système d’information du magasin.' },
            { id: 'institut', text: 'Étude d’un institut sur les lecteurs', answer: 'externe', explain: 'Organisme d’études.' },
            { id: 'federation', text: 'Communiqué de la fédération du e-commerce', answer: 'externe', explain: 'Organisme professionnel.' },
          ],
        },
        {
          id: 'd11-m1-a2',
          kind: 'fields',
          label: 'Annexe 2',
          title: 'Analyser la clientèle et les tendances',
          instructions: 'Réponds à l’aide des documents 1 à 4.',
          helps: ['Relis le profil des grands lecteurs et des clients encartés.', 'Cherche les hausses et les baisses dans le document 3.', 'Le taux de recommandation correspond aux notes 9 et 10.'],
          outcomeIds: R1,
          fields: [
            { id: 'passionnes', label: '1. Clients les plus intéressés par une action « Livres »', kind: 'choice', options: [{ value: 'a', label: 'Les femmes de 35 ans et plus' }, { value: 'b', label: 'Les moins de 18 ans' }], answer: 'a', explain: '64 % de femmes, 59 % de 35 ans et plus.' },
            { id: 'numerique', label: '2. Cible du livre numérique', kind: 'choice', options: [{ value: 'a', label: 'Les 25-34 ans, femmes et hommes' }, { value: 'b', label: 'Les 65 ans et plus' }], answer: 'a', explain: 'Document 2.' },
            { id: 'categorie', label: '3. Catégorie de livres la plus recherchée', kind: 'choice', options: [{ value: 'vivre', label: 'Arts de vivre et loisirs' }, { value: 'histoire', label: 'Histoire' }, { value: 'policier', label: 'Romans policiers' }], answer: 'vivre', explain: '49 %.' },
            { id: 'hausse', label: '4. Produit en plus forte hausse', kind: 'choice', options: [{ value: 'bd', label: 'BD et mangas (+16 %)' }, { value: 'jeunesse', label: 'Jeunesse 4-7 ans (+12 %)' }], answer: 'bd', explain: '+16 %.' },
            { id: 'delaisse', label: '5. Produit délaissé, à redynamiser', kind: 'choice', options: [{ value: 'ebook', label: 'Livres numériques jeunesse' }, { value: 'bd', label: 'BD' }], answer: 'ebook', explain: '−3 %.' },
            num('panier', '6. Panier moyen d’un achat culturel en ligne', 36, '36 €.', '€'),
            {
              id: 'suggestions',
              label: '7. Suggestions des clients (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'attente', label: 'Moins d’attente en caisse' },
                { value: 'assis', label: 'Des espaces pour s’asseoir' },
                { value: 'mises', label: 'Plus de mises en avant des nouveautés' },
                { value: 'prix', label: 'Des prix plus élevés' },
              ],
              answers: ['attente', 'assis', 'mises'],
              explain: 'Document 1.',
            },
            num('recommandation', '8. Taux de recommandation (notes 9 et 10)', 17, '17 %.', '%'),
            { id: 'evolution', label: '9. Comparé à l’enquête précédente (15 %), ce taux…', kind: 'choice', options: [{ value: 'hausse', label: 'Progresse' }, { value: 'baisse', label: 'Recule' }], answer: 'hausse', explain: '17 % > 15 %.' },
          ],
        },
        {
          id: 'd11-m1-a3',
          kind: 'fields',
          label: 'Annexe 2 (suite)',
          title: 'Compléter l’analyse des tendances de consommation',
          instructions: 'Rédige les rubriques de l’annexe à partir des documents 1 à 4.',
          helps: ['Typologie : qui sont les clients du secteur Livres ?', 'Habitudes : produits recherchés, en hausse, en baisse.', 'E-commerce et satisfaction : documents 1 et 4.'],
          outcomeIds: R1,
          fields: [
            w('passionnes', 'Typologie : les clients passionnés, les plus intéressés par des actions sur le secteur', 'Des femmes de 35 ans et plus, diplômées ; les plus grands lecteurs sont les femmes retraitées.', ['Sexe + âge.']),
            w('bd', 'Habitudes : produits « BD / mangas » et littérature à mettre en avant', 'Les BD et mangas (+16 %) et les deux BD du top 5 ; les romans de fiction hors poche du top 5.', ['Je cite les hausses.']),
            w('ecommerce', 'Évolution du e-commerce et typologie de l’acheteur en ligne', 'La moitié des achats en ligne sont des biens culturels ; l’acheteur en ligne est plus jeune, plus souvent un homme, et souvent une famille.', ['Ventes + profil.']),
            w('freins', 'Satisfaction : suggestions et freins des clients', 'Freins : attente en caisse, trop de monde aux dédicaces. Suggestions : espaces pour s’asseoir, mises en avant des nouveautés.', ['Freins + suggestions.']),
          ],
        },
        {
          id: "d11-revision-1",
          label: "Annexe complémentaire",
          title: "Comparer deux sources sur les besoins des clients",
          instructions: "Lis le document 5. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Vérifie ce que chaque source mesure et qui elle représente.",
            "Relis le document 5 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "30 ÷ 50 × 100 = 60 %."
          ],
          outcomeIds: [
            "d11-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Quelle part des réponses cite l’atelier ?",
              kind: "number",
              answer: 60,
              explain: "30 ÷ 50 × 100 = 60 %."
            },
            {
              id: "q2",
              label: "Rédige une conclusion et une donnée à chercher.",
              kind: "written",
              lines: 3,
              model: "Les répondants et les achats observés soutiennent un essai autour des jeux courts. Comme le questionnaire touche surtout les visiteurs du rayon jeux, interroger aussi des familles qui traversent le magasin sans entrer dans le rayon."
            }
          ]
        },
      ],
    },
    {
      id: 'mission-2',
      kind: 'mission',
      number: 2,
      title: 'Segmenter la clientèle',
      guidance: 'accompagné',
      message: { from: 'Éric Sabatier', role: 'Chef du secteur « Livres »', text: ['Pour personnaliser nos offres, je dois segmenter mes clients. Classe d’abord les critères, rapproche deux clients des familles de livres qui leur conviennent, puis propose les bons critères pour chacun de mes projets.'] },
      documents: [
        { id: 'd11-m2-doc1', number: 1, title: 'La segmentation', look: 'texte', blocks: [{ type: 'p', text: 'Segmenter, c’est découper la clientèle en groupes homogènes, selon des critères, pour adresser à chaque groupe une offre adaptée. Critères sociodémographiques : âge, sexe, situation familiale, lieu de vie, revenus, métier. Critères psychologiques : personnalité, centres d’intérêt, valeurs. Critères comportementaux : fréquence d’achat, date du dernier achat, montant dépensé, canal utilisé, ancienneté, pages visitées.' }] },
        {
          id: 'd11-m2-doc2',
          number: 2,
          title: 'Deux clients encartés',
          look: 'fiche',
          blocks: [
            { type: 'facts', items: [['Lina, 33 ans', 'Célibataire, centre-ville, assistante commerciale. Passions : les voyages et les arts appliqués ; voyage en Asie, lit deux romans en format poche par mois. Achète au moins une fois par mois, le samedi après-midi ; un quart de ses achats en ligne avec retrait en magasin. 27 € en moyenne.'], ['Joël, 52 ans', 'En couple, deux enfants, périphérie. Agent d’assurances. Passions : le sport et la lecture ; course à pied en club, adore la BD. Achète tous les deux mois ; 10 % de livres numériques ; préfère le magasin au site. 23 € en moyenne.']] },
          ],
        },
        { id: 'd11-m2-doc3', number: 3, title: 'Familles du secteur « Livres »', look: 'postit', blocks: [{ type: 'p', text: 'Livres pour enfants · Vie pratique (cuisine, loisirs créatifs, passions, art) · Voyages · Romans poche · Littérature · Romans policiers · BD (BD, mangas, comics) · Fantasy et science-fiction · Santé · Livres numériques' }] },
        {
          id: "d11-revision-2-doc",
          number: 4,
          title: "Construire une cible sur des besoins",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Groupe interrogé",
                "Personnes",
                "Attente principale"
              ],
              rows: [
                [
                  "Parents de jeunes enfants",
                  "24",
                  "Séance courte avant 17 h"
                ],
                [
                  "Joueurs experts",
                  "16",
                  "Jeux plus longs en soirée"
                ],
                [
                  "Acheteurs de cadeaux",
                  "10",
                  "Conseil rapide le samedi"
                ]
              ]
            },
            {
              type: "p",
              text: "Un animateur est disponible uniquement mercredi de 15 h à 17 h. Le magasin peut proposer des jeux de 15 minutes."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd11-m2-a1',
          kind: 'fields',
          label: 'Annexe 1',
          title: 'Classer les critères de segmentation',
          instructions: 'Indique le type de chaque critère.',
          helps: ['Qui est le client ? → sociodémographique.', 'Ce qu’il aime, ce qu’il est → psychologique.', 'Comment il achète → comportemental.'],
          outcomeIds: R1,
          fields: (
            [
              ['age', 'Âge, situation familiale', 'socio'],
              ['lieu', 'Lieu de vie (centre-ville, périphérie)', 'socio'],
              ['metier', 'Métier', 'socio'],
              ['passions', 'Passions (voyages, sport…)', 'psycho'],
              ['mode', 'Mode de vie', 'psycho'],
              ['frequence', 'Fréquence d’achat', 'comport'],
              ['dernier', 'Date du dernier achat', 'comport'],
              ['canal', 'Achat en ligne ou en magasin', 'comport'],
              ['depense', 'Montant moyen dépensé', 'comport'],
            ] as const
          ).map(([id, label, answer]): Field => ({ id, label, kind: 'choice', options: CRITERES, answer, explain: CRITERES.find((c) => c.value === answer)!.label + '.' })),
        },
        {
          id: 'd11-m2-a2',
          kind: 'fields',
          label: 'Annexe 2',
          title: 'Rapprocher clients et familles de produits',
          instructions: 'Choisis les familles susceptibles d’intéresser chaque client.',
          helps: ['Relis les passions et les habitudes de lecture.', 'Lina : voyages, arts, romans poche.', 'Joël : sport, BD, livres numériques, et ses enfants.'],
          outcomeIds: R1,
          fields: [
            { id: 'lina', label: 'Lina (plusieurs réponses)', kind: 'multi', options: [{ value: 'voyages', label: 'Voyages' }, { value: 'pratique', label: 'Vie pratique : art, loisirs créatifs' }, { value: 'poche', label: 'Romans poche' }, { value: 'bd', label: 'BD' }, { value: 'enfants', label: 'Livres pour enfants' }], answers: ['voyages', 'pratique', 'poche'], explain: 'Passions et habitudes de Lina.' },
            { id: 'joel', label: 'Joël (plusieurs réponses)', kind: 'multi', options: [{ value: 'bd', label: 'BD' }, { value: 'sport', label: 'Vie pratique : passions (sport, course)' }, { value: 'numerique', label: 'Livres numériques' }, { value: 'enfants', label: 'Livres pour enfants' }, { value: 'voyages', label: 'Voyages en Asie' }], answers: ['bd', 'sport', 'numerique', 'enfants'], explain: 'Passions de Joël et ses enfants.' },
          ],
        },
        {
          id: 'd11-m2-a3',
          kind: 'fields',
          label: 'Annexe 3',
          title: 'Choisir les critères selon l’objectif',
          instructions: 'Pour chaque projet du chef de secteur, choisis le critère de segmentation à utiliser.',
          helps: ['Un âge précis : critère sociodémographique.', 'La fidélité, la fréquence, le canal : critères comportementaux.', 'Une zone géographique : lieu de vie.'],
          outcomeIds: R12,
          fields: (
            [
              ['contes', 'Inviter les enfants de 6 à 10 ans et leurs parents à une lecture de contes', 'age'],
              ['guides', 'Mettre en avant une nouvelle collection de guides de voyage', 'interet'],
              ['anciennete', 'Récompenser les encartés selon leur ancienneté, à chaque anniversaire', 'anciennete'],
              ['actifs', 'Récompenser les clients très actifs en visites et en achats', 'frequence'],
              ['online', 'Faire des offres aux clients qui commandent sur le site', 'canal'],
              ['zone', 'Informer par une publicité dans les boîtes aux lettres de la zone de chalandise', 'lieu'],
              ['periode', 'Trouver la meilleure période pour une action en magasin', 'date'],
            ] as const
          ).map(([id, label, answer]): Field => ({
            id,
            label,
            kind: 'choice',
            select: true,
            options: [
              { value: 'age', label: 'Âge et situation familiale (avoir des enfants)' },
              { value: 'interet', label: 'Centre d’intérêt : les voyages' },
              { value: 'anciennete', label: 'Ancienneté de la carte' },
              { value: 'frequence', label: 'Fréquence d’achat et de visite' },
              { value: 'canal', label: 'Canal d’achat : en ligne' },
              { value: 'lieu', label: 'Lieu de vie' },
              { value: 'date', label: 'Jours et périodes d’achat' },
            ],
            answer,
            explain: 'Critère adapté à l’objectif.',
          })),
        },
        {
          id: "d11-revision-2",
          label: "Annexe complémentaire",
          title: "Construire une cible sur des besoins",
          instructions: "Lis le document 4. Rédige tes réponses en t’appuyant sur les faits du document. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Rapproche l’attente principale des moyens disponibles.",
            "Relis le document 4 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "Les parents de jeunes enfants qui cherchent une activité de courte durée le mercredi avant 17 h. Prévoir une démonstration de 15 minutes, accessible sans inscription si une place est libre."
          ],
          outcomeIds: [
            "d11-r1",
            "d11-r2"
          ],
          fields: [
            {
              id: "q1",
              label: "Quel public retiens-tu et comment le décris-tu dans le brief ?",
              kind: "written",
              lines: 3,
              model: "Les parents de jeunes enfants qui cherchent une activité de courte durée le mercredi avant 17 h. Prévoir une démonstration de 15 minutes, accessible sans inscription si une place est libre."
            },
            {
              id: "q2",
              label: "Comment pourrais-tu garder une trace des attentes des autres groupes ?",
              kind: "written",
              lines: 3,
              model: "Consigner les demandes de soirée et de conseil du samedi séparément, puis relever leur fréquence avant de proposer une autre opération."
            }
          ]
        },
      ],
    },
    {
      id: 'mission-3',
      kind: 'mission',
      number: 3,
      title: 'Repérer les opportunités d’action commerciale',
      guidance: 'accompagné',
      message: { from: 'Sonia Leroux', role: 'Cheffe du secteur « Jouets »', text: ['Les fêtes du calendrier sont autant d’occasions d’action. Au rayon « Jouets », nous voulons profiter du « Black Friday » avec le thème « La semaine à tout prix ». Aide-moi à exploiter notre veille sur quatre références clés.'] },
      documents: [
        { id: 'd11-m3-doc1', number: 1, title: 'Calendrier des événements', look: 'texte', blocks: [{ type: 'table', head: ['Mois', 'Événements'], rows: [['Janvier', 'Jour de l’An, Épiphanie, soldes d’hiver, nuit de la lecture, festival de la BD d’Angoulême'], ['Février', 'Chandeleur, Nouvel An chinois, Saint-Valentin, carnaval'], ['Mars', 'Fête des grands-mères, Printemps des poètes, salon du livre'], ['Avril-mai', 'Pâques, fête des mères'], ['Juin', 'Fête des pères, bac, fête de la musique, soldes d’été'], ['Juillet-août', 'Vacances d’été, Tour de France, nuit des étoiles'], ['Septembre', 'Rentrée des classes'], ['Octobre', 'Fête des grands-pères, Halloween'], ['Novembre', 'Black Friday, prix littéraires'], ['Décembre', 'Cyber Monday, Noël, réveillon']] }] },
        {
          id: 'd11-m3-doc2',
          number: 2,
          title: 'Relevé de prix (veille concurrentielle)',
          look: 'facture',
          blocks: [
            { type: 'table', head: ['Référence', 'Page & Jeu', 'Magasin de jouets', 'Site marchand', 'Site discount'], align: ['left', 'right', 'right', 'right', 'right'], rows: VEILLE.map((v) => [v.name, eur(v.prix.nous), eur(v.prix.jouet), eur(v.prix.web), eur(v.prix.discount)]) },
            { type: 'note', text: 'Les concurrents en ligne proposent le paiement en 3 ou 4 fois ; le magasin de jouets offre des crédits sur sa carte de fidélité. Sa page de réseau social organise un jeu-concours : « Racontez votre jouet préféré, gagnez des chèques cadeaux ».' },
          ],
        },
        {
          id: "d11-revision-3-doc",
          number: 3,
          title: "Choisir une date après une veille locale",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Créneau",
                "Événement voisin",
                "Ressources du magasin"
              ],
              rows: [
                [
                  "Mercredi 15 h",
                  "Sortie de médiathèque à 14 h 45",
                  "Animateur et 12 places"
                ],
                [
                  "Samedi 16 h",
                  "Fête du quartier et rue fermée",
                  "Animateur et 8 places"
                ],
                [
                  "Vendredi 18 h",
                  "Aucun événement signalé",
                  "Aucun animateur"
                ]
              ]
            },
            {
              type: "p",
              text: "Le public visé cherche une activité courte et doit pouvoir accéder à pied."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd11-m3-a1',
          kind: 'classify',
          label: 'Annexe 1',
          title: 'Classer les événements',
          instructions: 'Classe chaque événement dans sa catégorie.',
          helps: ['Les fêtes calendaires reviennent chaque année à date fixe.', 'Les événements commerciaux sont créés par le commerce.', 'Les saisons et l’actualité littéraire, musicale et sportive forment les autres catégories.'],
          outcomeIds: R1,
          categories: [
            { id: 'fete', label: 'Fête calendaire' },
            { id: 'litteraire', label: 'Actualité littéraire' },
            { id: 'musicale', label: 'Actualité musicale' },
            { id: 'sport', label: 'Actualité sportive' },
            { id: 'saison', label: 'Événement saisonnier' },
            { id: 'commercial', label: 'Événement commercial' },
          ],
          items: [
            { id: 'noel', text: 'Noël', answer: 'fete', explain: 'Fête calendaire.' },
            { id: 'meres', text: 'Fête des mères', answer: 'fete', explain: 'Fête calendaire.' },
            { id: 'bd', text: 'Festival de la BD', answer: 'litteraire', explain: 'Actualité littéraire.' },
            { id: 'prix', text: 'Prix littéraires de novembre', answer: 'litteraire', explain: 'Actualité littéraire.' },
            { id: 'victoires', text: 'Cérémonie des récompenses de la musique', answer: 'musicale', explain: 'Actualité musicale.' },
            { id: 'euro', text: 'Championnat d’Europe de football', answer: 'sport', explain: 'Actualité sportive.' },
            { id: 'vacances', text: 'Vacances d’été', answer: 'saison', explain: 'Événement saisonnier.' },
            { id: 'musique', text: 'Fête de la musique', answer: 'musicale', explain: 'Actualité musicale.' },
            { id: 'tour', text: 'Tour de France', answer: 'sport', explain: 'Actualité sportive.' },
            { id: 'rentree', text: 'Rentrée des classes', answer: 'saison', explain: 'Événement saisonnier.' },
            { id: 'soldes', text: 'Soldes d’été', answer: 'commercial', explain: 'Événement commercial.' },
            { id: 'black', text: 'Black Friday', answer: 'commercial', explain: 'Événement commercial.' },
          ],
        },
        {
          id: 'd11-m3-a2',
          kind: 'fields',
          label: 'Annexe 2',
          title: 'Exploiter la veille concurrentielle',
          instructions: 'Pour chaque référence, compare le prix de Page & Jeu au prix le plus bas des concurrents, puis réponds.',
          helps: ['Cherche le prix le plus bas parmi les trois concurrents.', 'Écart = prix Page & Jeu − prix le plus bas.', 'Un écart nul ou négatif : nous sommes alignés ou moins chers.'],
          outcomeIds: R12,
          layout: 'columns',
          columns: ['Prix le plus bas des concurrents', 'Écart (€)', 'Positionnement'],
          fields: [
            ...VEILLE.flatMap((v): Field[] => [
              num(`${v.id}.0`, v.name, v.min, `${eur(v.min)}.`, '€', 0.001),
              num(`${v.id}.1`, v.name, v.ecart, `${fr(v.prix.nous)} − ${fr(v.min)} = ${fr(v.ecart)} €.`, '€', 0.011),
              { id: `${v.id}.2`, label: v.name, kind: 'choice', options: [{ value: 'aligne', label: 'Aligné ou moins cher' }, { value: 'plus-cher', label: 'Plus cher : à valoriser' }], answer: v.position, explain: v.position === 'aligne' ? 'Prix compétitif.' : 'Prix plus élevé : une action est nécessaire.' },
            ]),
            {
              id: 'avantages',
              label: 'Avantages des concurrents qui pourraient inspirer Page & Jeu (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'fois', label: 'Paiement en plusieurs fois' },
                { value: 'credits', label: 'Crédits sur la carte de fidélité' },
                { value: 'concours', label: 'Jeu-concours sur les réseaux sociaux' },
                { value: 'hausse', label: 'Hausse des prix' },
              ],
              answers: ['fois', 'credits', 'concours'],
              explain: 'Trois leviers repérés.',
            },
            { id: 'objectif', label: 'Objectif de la veille concurrentielle', kind: 'choice', options: [{ value: 'a', label: 'Garder une longueur d’avance en prix, promotions et offre' }, { value: 'b', label: 'Copier tous les prix des concurrents' }], answer: 'a', explain: 'Surveiller pour se positionner.' },
          ],
        },
        {
          id: 'd11-m3-a3',
          kind: 'fields',
          label: 'Annexe 2 (suite)',
          title: 'Stratégie d’offre et utilité de la veille',
          instructions: 'Complète par écrit l’exploitation de la veille concurrentielle.',
          helps: ['Les outils : relevés de prix, sites, pages des réseaux sociaux, alertes.', 'Pour chaque référence plus chère : quelle action pour la valoriser ?', 'La veille sert à garder une longueur d’avance.'],
          outcomeIds: R12,
          fields: [
            w('outils', '1. Outils de veille utilisés', 'Relevé de prix en magasin et sur les sites, consultation des pages des concurrents sur les réseaux sociaux.', ['Au moins deux outils.']),
            w('dessin', '2. Action pour valoriser le jeu « Dessine et devine », plus cher que la concurrence', 'Une démonstration du jeu en magasin le samedi, ou un lot « jeu + carnet » au même prix pour justifier l’écart.', ['Une action précise.']),
            w('reseaux', '3. Utilité de surveiller les pages des enseignes concurrentes sur les réseaux sociaux', 'Repérer leurs jeux-concours, leurs promotions et les réactions des clients, pour réagir vite et s’en inspirer.', ['Je cite au moins deux utilités.']),
            w('objectifs', '4. Objectifs de la veille concurrentielle', 'Connaître les prix et les actions des concurrents pour se positionner, anticiper et rester attractif.', ['Positionner + anticiper.']),
          ],
        },
        {
          id: "d11-revision-3",
          label: "Annexe complémentaire",
          title: "Choisir une date après une veille locale",
          instructions: "Lis le document 3. Rédige tes réponses en t’appuyant sur les faits du document. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Choisis un créneau à la fois proche de la cible et réalisable.",
            "Relis le document 3 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "Choisir mercredi 15 h, juste après la sortie de la médiathèque, avec animateur et douze places. Vérifier auprès de la médiathèque la fin effective de l’activité et l’accès au magasin."
          ],
          outcomeIds: [
            "d11-r1",
            "d11-r2"
          ],
          fields: [
            {
              id: "q1",
              label: "Rédige une recommandation argumentée.",
              kind: "written",
              lines: 3,
              model: "Choisir mercredi 15 h, juste après la sortie de la médiathèque, avec animateur et douze places. Vérifier auprès de la médiathèque la fin effective de l’activité et l’accès au magasin."
            },
            {
              id: "q2",
              label: "Prévois un plan de repli si le créneau voisin est annulé.",
              kind: "written",
              lines: 3,
              model: "Maintenir le mercredi si l’animateur est disponible et si les réservations confirment l’intérêt. Si les inscriptions sont faibles, réduire à une session et communiquer l’horaire confirmé."
            }
          ]
        },
      ],
    },
    {
      id: 'mission-4',
      kind: 'mission',
      number: 4,
      title: 'Sélectionner les produits à mettre en avant',
      guidance: 'autonome',
      message: { from: 'Karim Belaïd', role: 'Directeur', text: ['Décembre est capital pour notre chiffre d’affaires. Prépare la sélection de produits du podium « Idées cadeaux » et aide le secteur « Livres » à choisir les coffrets à mettre en avant.'] },
      documents: [
        { id: 'd11-m4-doc1', number: 1, title: 'Consigne de la cheffe du rayon « Jouets »', look: 'postit', blocks: [{ type: 'p', text: 'Sélectionne 4 jouets pour le podium destiné aux enfants de plus de 8 ans. Thème : « L’expérience ». Varie les fabricants et les gammes de prix pour répondre à tous les budgets.' }] },
        {
          id: 'd11-m4-doc2',
          number: 2,
          title: 'Jouets éducatifs en stock',
          look: 'fiche',
          blocks: [
            { type: 'table', head: ['Jouet', 'Fabricant', 'Prix', 'Âge'], rows: [['Coffret potions', 'Alchimia', '27,99 €', '8 ans et +'], ['Microscope 50 expériences', 'Optika', '59,99 €', '8 ans et +'], ['Globe interactif', 'Mappa', '49,99 €', '7 ans et +'], ['Micro karaoké', 'Voxa', '49,99 €', '6 ans et +'], ['Cristaux à faire pousser', 'Optika', '19,99 €', '8 ans et +'], ['Atlas sonore', 'Mappa', '39,99 €', '4-7 ans'], ['Robot à programmer', 'Robotix', '45,99 €', '8 ans et +'], ['Labo de sciences', 'Alchimia', '35,99 €', '8 ans et +'], ['Pâte gluante fluo', 'Slimy', '17,99 €', '8 ans et +']] },
          ],
        },
        { id: 'd11-m4-doc3', number: 3, title: 'Stocks de coffrets de Noël — secteur « Livres »', look: 'facture', blocks: [{ type: 'table', head: ['Coffret', 'Prix TTC', 'Stock', 'Univers'], align: ['left', 'right', 'right', 'left'], rows: COFFRETS.map((c) => [c.ref, eur(c.prix), String(c.stock), c.univers]) }, { type: 'note', text: 'Le chef de secteur souhaite privilégier les stocks les plus importants en valeur (prix × stock) et varier les univers : un seul coffret par univers.' }] },
        {
          id: 'd11-m4-doc4',
          number: 4,
          title: 'Courriel du siège : opération « Déstockage déco et calendriers »',
          look: 'courriel',
          blocks: [
            { type: 'facts', items: [['De', 'Siège Page & Jeu'], ['À', 'Karim Belaïd'], ['Objet', 'Déstockage déco et calendriers de Noël']] },
            { type: 'p', text: 'Nous vous rappelons la mise en place de l’opération « Déstockage déco et calendriers — 30 % » dès le 25 novembre, en magasin et en ligne. Comme l’an dernier, elle doit liquider au maximum le rayon saisonnier « Noël ». Pour la première phase, jusqu’au 10 décembre, sélectionnez 2 segments de produits. La seconde phase aura lieu après le 10 décembre pour les autres segments.' },
          ],
        },
        {
          id: "d11-revision-4-doc",
          number: 5,
          title: "Sélectionner les produits de démonstration et de vente",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Jeu",
                "Durée",
                "Stock",
                "Marge unitaire"
              ],
              rows: [
                [
                  "Cartes minute",
                  "12 min",
                  "18",
                  "6 €"
                ],
                [
                  "Mission jungle",
                  "15 min",
                  "10",
                  "8 €"
                ],
                [
                  "Stratégie des îles",
                  "45 min",
                  "12",
                  "12 €"
                ]
              ]
            },
            {
              type: "p",
              text: "Pour deux références mises en avant, il faut au moins 8 exemplaires vendables par référence après avoir réservé un exemplaire de démonstration. Une partie doit durer 15 minutes au plus."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd11-m4-a1',
          kind: 'fields',
          label: 'Annexe 1',
          title: 'Sélectionner les jouets du podium',
          instructions: 'Choisis 4 jouets qui respectent toutes les consignes.',
          helps: ['Élimine d’abord les jouets pour moins de 8 ans.', 'Garde des fabricants différents.', 'Varie les prix : un petit budget, deux moyens, un plus élevé.'],
          outcomeIds: R2,
          fields: [
            { id: 'selection', label: 'Jouets retenus (4 réponses)', kind: 'multi', options: [{ value: 'potions', label: 'Coffret potions (Alchimia, 27,99 €)' }, { value: 'microscope', label: 'Microscope (Optika, 59,99 €)' }, { value: 'globe', label: 'Globe interactif (7 ans et +)' }, { value: 'karaoke', label: 'Micro karaoké (6 ans et +)' }, { value: 'robot', label: 'Robot à programmer (Robotix, 45,99 €)' }, { value: 'atlas', label: 'Atlas sonore (4-7 ans)' }, { value: 'slime', label: 'Pâte gluante fluo (Slimy, 17,99 €)' }], answers: ['potions', 'microscope', 'robot', 'slime'], explain: 'Plus de 8 ans, 4 fabricants différents, prix de 17,99 € à 59,99 €. Le labo et les cristaux répètent un fabricant déjà retenu.' },
          ],
        },
        {
          id: 'd11-m4-a2',
          kind: 'fields',
          label: 'Annexe 2',
          title: 'Sélectionner les coffrets',
          instructions: 'Calcule la valeur du stock des coffrets demandés, puis choisis les 4 coffrets à mettre en avant.',
          helps: ['Valeur = prix × stock.', 'Classe les coffrets par valeur décroissante.', 'Ne garde qu’un coffret par univers.'],
          outcomeIds: R12,
          fields: [
            ...COFFRETS.slice(0, 4).map((c) => num(`v-${c.ref}`, `Valeur du stock : ${c.ref}`, c.valeur, `${fr(c.prix)} × ${c.stock} = ${fr(c.valeur)} €.`, '€', 0.011)),
            { id: 'coffrets', label: 'Coffrets à mettre en avant (4 réponses)', kind: 'multi', options: COFFRETS.map((c) => ({ value: c.ref, label: `${c.ref} (${c.univers})` })), answers: COFFRETS_CHOIX.map((c) => c.ref), explain: COFFRETS_CHOIX.map((c) => `${c.ref} : ${eur(c.valeur)}`).join(' ; ') + '.' },
          ],
        },
        {
          id: 'd11-m4-a3',
          kind: 'fields',
          label: 'Annexe 3',
          title: 'Segments du rayon saisonnier « Noël »',
          instructions: 'Choisis les 2 segments de la première phase (document 4), puis justifie.',
          helps: ['Quels produits doivent être achetés avant le 1er décembre ?', 'Un calendrier de l’Avent commence le 1er décembre.', 'Le sapin et la décoration s’installent début décembre.'],
          outcomeIds: R12,
          fields: [
            { id: 'segments', label: 'Segments retenus pour la phase 1 (2 réponses)', kind: 'multi', options: [{ value: 'paquets', label: 'Je fais mes paquets-cadeaux' }, { value: 'avent', label: 'Je choisis mon calendrier de l’Avent' }, { value: 'sapin', label: 'Je prépare mon sapin et ma décoration' }, { value: 'enfants', label: 'Je prépare Noël avec les enfants' }, { value: 'table', label: 'Je décore ma table de Noël' }, { value: 'gourmandises', label: 'Je prépare mes gourmandises' }], answers: ['avent', 'sapin'], explain: 'Ce sont les achats faits le plus tôt : après le 1er décembre, ils ne se vendent plus.' },
            w('justif', 'Justification', 'Le calendrier de l’Avent et la décoration du sapin s’achètent fin novembre ou début décembre ; après le 10, ils ne se vendent presque plus. Les paquets, la table et les gourmandises se préparent plus tard.', ['Je parle du calendrier des achats.']),
          ],
        },
        {
          id: "d11-revision-4",
          label: "Annexe complémentaire",
          title: "Sélectionner les produits de démonstration et de vente",
          instructions: "Lis le document 5. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Déduis la démonstration du stock avant de vérifier le seuil.",
            "Relis le document 5 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "10 − 1 = 9 exemplaires."
          ],
          outcomeIds: [
            "d11-r2",
            "d11-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Combien d’exemplaires de Mission jungle sont vendables après réservation ?",
              kind: "number",
              answer: 9,
              explain: "10 − 1 = 9 exemplaires."
            },
            {
              id: "q2",
              label: "Choisis les deux jeux et défends le choix face à l’argument de marge.",
              kind: "written",
              lines: 3,
              model: "Retenir Cartes minute et Mission jungle. Ils respectent la durée et laissent 17 et 9 unités vendables. La marge supérieure de Stratégie des îles ne compense pas ses 45 minutes pour cet atelier."
            }
          ]
        },
      ],
    },
    {
      id: 'mission-5',
      kind: 'mission',
      number: 5,
      title: 'Proposer des actions génératrices de trafic dans le point de vente',
      guidance: 'autonome',
      message: { from: 'Karim Belaïd', role: 'Directeur', text: ['Nous cherchons toujours de nouvelles idées pour attirer de nouveaux clients et garder nos fidèles. Sois original : propose une action pour chaque événement et précise son objectif.'] },
      documents: [
        { id: 'd11-m5-doc1', number: 1, title: 'Actions déjà menées dans le réseau', look: 'texte', blocks: [{ type: 'list', items: ['Rencontres et dédicaces d’auteurs.', 'Opérations promotionnelles et concours.', 'Avantages pour les clients encartés.', 'Événements éphémères : tournois de jeux de cartes, bourses d’échange.', 'Mises en avant de sélections de produits.', 'Nouveaux services : billetterie, retrait des commandes en magasin (web-to-store).', 'Ateliers et cours : décoration, loisirs créatifs.', 'Partenariats : lectures de contes avec une association.', 'Expériences clients : jeux d’énigmes en magasin.'] }] },
        {
          id: "d11-revision-5-doc",
          number: 2,
          title: "Formuler un objectif compatible avec la capacité",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Deux sessions sont possibles, chacune de 12 places. Le responsable souhaite 18 participants et 6 ventes liées à l’atelier. Il prévoit une feuille anonyme de comptage des participants et un code en caisse pour les ventes liées."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd11-m5-a1',
          kind: 'fields',
          label: 'Annexe',
          title: 'Associer un type d’action à chaque opportunité',
          instructions: 'Pour chaque événement, choisis l’action la plus adaptée et son objectif.',
          helps: ['Un festival de BD : la rencontre avec un auteur.', 'Carnaval : une expérience ou un atelier costumé.', 'La rentrée : une offre promotionnelle sur les fournitures.'],
          outcomeIds: R12,
          layout: 'columns',
          columns: ['Type d’action', 'Objectif'],
          fields: (
            [
              ['bd', 'Festival de la BD (fin janvier) — rayon BD', 'dedicace', 'trafic'],
              ['carnaval', 'Carnaval (fin février) — magasin', 'atelier', 'experience'],
              ['musique', 'Fête de la musique (fin juin) — rayon Musique', 'concert', 'trafic'],
              ['rentree', 'Rentrée (début septembre) — fournitures', 'promo', 'ca'],
            ] as const
          ).flatMap(([id, label, action, objectif]): Field[] => [
            {
              id: `${id}.0`,
              label,
              kind: 'choice',
              select: true,
              options: [
                { value: 'dedicace', label: 'Séance de dédicace d’un auteur de BD' },
                { value: 'atelier', label: 'Atelier de maquillage et de masques pour enfants' },
                { value: 'concert', label: 'Mini-concert d’un groupe local en magasin' },
                { value: 'promo', label: 'Offre « 3 cahiers achetés, 1 offert » et liste scolaire préparée' },
              ],
              answer: action,
              explain: 'Action adaptée à l’événement.',
            },
            {
              id: `${id}.1`,
              label,
              kind: 'choice',
              select: true,
              options: [
                { value: 'trafic', label: 'Créer du trafic et attirer de nouveaux clients' },
                { value: 'experience', label: 'Faire vivre une expérience et fidéliser les familles' },
                { value: 'ca', label: 'Augmenter le chiffre d’affaires d’un rayon' },
              ],
              answer: objectif,
              explain: 'Objectif cohérent avec l’action.',
            },
          ]),
        },
        {
          id: 'd11-m5-a2',
          kind: 'open',
          label: 'Proposition',
          title: 'Proposer une action originale',
          instructions: 'Propose une action originale de ton choix pour le magasin : type, description, période, cible et objectif.',
          helps: ['Choisis un événement du calendrier.', 'Décris concrètement l’action : qui, quoi, où, quand.', 'Fixe un objectif mesurable (nombre de participants, CA).'],
          outcomeIds: R1,
          prompts: [{ id: 'action', label: 'Mon action', lines: 7 }],
          selfCheck: ['Le type d’action est clair.', 'La cible est précisée.', 'L’objectif est mesurable.', 'L’action respecte l’image de l’enseigne.'],
        },
        {
          id: "d11-revision-5",
          label: "Annexe complémentaire",
          title: "Formuler un objectif compatible avec la capacité",
          instructions: "Lis le document 2. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Calcule l’occupation attendue avant de retenir le format.",
            "Relis le document 2 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "18 ÷ 24 × 100 = 75 %."
          ],
          outcomeIds: [
            "d11-r1",
            "d11-r2"
          ],
          fields: [
            {
              id: "q1",
              label: "Quel taux d’occupation correspond à l’objectif ?",
              kind: "number",
              answer: 75,
              explain: "18 ÷ 24 × 100 = 75 %."
            },
            {
              id: "q2",
              label: "Rédige le brief d’action en quatre lignes.",
              kind: "written",
              lines: 3,
              model: "Mercredi, deux démonstrations courtes pour les familles, avec douze places chacune. Objectifs de 18 participants et 6 ventes. Réserver les jeux de démonstration avant ouverture. Compter les présences et les ventes au code atelier."
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
          id: 'd11-s-a1',
          kind: 'fields',
          label: 'Synthèse',
          title: 'Complète la synthèse',
          instructions: 'Complète les cinq parties de la synthèse.',
          helps: ['Les informations servent à connaître le client et à adapter l’offre.', 'Trois familles de critères de segmentation.', 'Critères de sélection : ventes, cible, objectif, saisonnalité.'],
          outcomeIds: R12,
          fields: [
            { id: 'infos', label: '1. Les informations sur la clientèle sont étudiées pour…', kind: 'choice', options: [{ value: 'a', label: 'Mieux connaître les clients et proposer une offre qui répond à leurs besoins' }, { value: 'b', label: 'Remplir les obligations comptables' }], answer: 'a', explain: 'Connaître et adapter.' },
            { id: 'criteres', label: '2. Les critères de segmentation peuvent être…', kind: 'multi', options: CRITERES, answers: ['socio', 'psycho', 'comport'], explain: 'Les trois familles.' },
            { id: 'idees', label: '3. Pour trouver des opportunités, on utilise… (plusieurs réponses)', kind: 'multi', options: [{ value: 'veille', label: 'La veille concurrentielle' }, { value: 'calendrier', label: 'Le calendrier des événements' }, { value: 'interne', label: 'Les opportunités internes (nouveautés, ventes, offres fournisseurs)' }, { value: 'hasard', label: 'Le hasard' }], answers: ['veille', 'calendrier', 'interne'], explain: 'Trois sources d’opportunités.' },
            { id: 'selection', label: '4. Critères de sélection des produits (plusieurs réponses)', kind: 'multi', options: [{ value: 'ventes', label: 'Les ventes' }, { value: 'cible', label: 'La cible' }, { value: 'objectif', label: 'L’objectif de l’action' }, { value: 'saison', label: 'La saisonnalité' }, { value: 'couleur', label: 'La couleur de l’emballage' }], answers: ['ventes', 'cible', 'objectif', 'saison'], explain: 'Ce qui guide le choix.' },
            { id: 'actions', label: '5. Actions génératrices de trafic (plusieurs réponses)', kind: 'multi', options: [{ value: 'experience', label: 'Surprendre par des expériences en magasin' }, { value: 'services', label: 'Proposer plus de services, miser sur le web-to-store' }, { value: 'partenariats', label: 'Mettre en place des partenariats' }, { value: 'evenements', label: 'Organiser des événements éphémères' }, { value: 'promos', label: 'Organiser des actions promotionnelles' }], answers: ['experience', 'services', 'partenariats', 'evenements', 'promos'], explain: 'Toutes créent du trafic.' },
          ],
        },
        {
          id: 'd11-s-quiz',
          kind: 'fields',
          label: 'Quiz',
          title: 'Quiz du dossier',
          instructions: 'Cinq questions rapides.',
          helps: ['Relis la fiche de révision.', 'Interne ou externe : qui produit l’information ?', 'Trois familles de critères de segmentation.'],
          outcomeIds: R12,
          fields: [
            { id: 'q1', label: 'Une étude d’un institut de sondage est une source…', kind: 'choice', options: [{ value: 'externe', label: 'Externe' }, { value: 'interne', label: 'Interne' }], answer: 'externe', explain: 'Produite hors de l’entreprise.' },
            { id: 'q2', label: 'La fréquence d’achat est un critère…', kind: 'choice', options: CRITERES, answer: 'comport', explain: 'Comportemental.' },
            { id: 'q3', label: 'Les centres d’intérêt sont un critère…', kind: 'choice', options: CRITERES, answer: 'psycho', explain: 'Psychologique.' },
            { id: 'q4', label: 'Le Black Friday est…', kind: 'choice', options: [{ value: 'commercial', label: 'Un événement commercial' }, { value: 'fete', label: 'Une fête calendaire' }], answer: 'commercial', explain: 'Créé par le commerce.' },
            num('q5', 'Stock de 4 coffrets à 75 € : valeur du stock ?', 300, '4 × 75 = 300 €.', '€'),
          ],
        },
      ],
      synthesis: [
        { title: 'Notions essentielles', kind: 'notions', items: ['Sources d’information internes et externes ; tendances de consommation.', 'Segmentation : critères sociodémographiques, psychologiques, comportementaux.', 'Opportunités d’action : calendrier, événements commerciaux, veille concurrentielle, nouveautés.', 'Critères de sélection des produits : ventes, cible, saisonnalité, stock, marge.', 'Actions génératrices de trafic : dédicaces, promotions, ateliers, événements éphémères, services, partenariats, expériences.'] },
        { title: 'Méthodes', kind: 'methodes', items: ['Classer une information selon sa source, puis en tirer une tendance.', 'Choisir le critère de segmentation selon l’objectif.', 'Comparer ses prix au prix le plus bas des concurrents.', 'Sélectionner les produits en respectant toutes les consignes de l’enseigne.'] },
        { title: 'Erreurs fréquentes', kind: 'erreurs', items: ['Proposer une action sans objectif mesurable.', 'Oublier une consigne de l’enseigne (âge, fabricants, budget).', 'Confondre critère psychologique et comportemental.'] },
        { title: 'Bonnes pratiques professionnelles', kind: 'pratiques', items: ['Faire une veille régulière (alertes, pages des concurrents, relevés de prix).', 'Préparer le calendrier des actions plusieurs mois à l’avance.', 'Justifier chaque proposition par des chiffres.'] },
        { title: 'Mots-clés', kind: 'mots-cles', items: ['Segmentation', 'Veille concurrentielle', 'Opportunité commerciale', 'Trafic', 'Cible'] },
        {
          title: "Les réflexes à retenir des nouveaux cas",
          kind: "pratiques",
          items: [
            "Une observation terrain, un historique de ventes et une réponse à un questionnaire éclairent des aspects différents du besoin.",
            "Un segment utile se décrit avec un besoin et des critères observables.",
            "Avant de lancer une action, rapproche le public, les stocks, la marge et la capacité d’accueil."
          ]
        },
      ],
    },
    {
      id: 'application-1',
      kind: 'application',
      number: 1,
      title: 'Segmenter la clientèle',
      guidance: 'autonome',
      hero: { id: 'd11-jeux', alt: 'Deux adolescents jouant à un jeu vidéo sur un canapé' },
      message: { from: 'Bruno Lacombe', role: 'Responsable, magasin Pixel Zone', text: ['Nous vendons consoles et jeux vidéo. Voici notre projet de segmentation des clients encartés : aide-moi à cibler les bons segments pour nos prochaines offres.'] },
      documents: [
        { id: 'd11-a1-doc1', number: 1, title: 'Segmentation des clients encartés', look: 'texte', blocks: [{ type: 'p', text: `${FIDELES.toLocaleString('fr-FR')} clients fidélisés, segmentés selon le sexe (hommes ${PART_HOMMES} %, femmes ${100 - PART_HOMMES} %), puis selon la plateforme de jeu (PC, console Nova, console Xenon, console portable Kiri), puis selon le genre de jeu préféré (action, aventure, rôle, plateforme, stratégie, simulation, tir). Chez les hommes, 39 % jouent sur console Nova.` }] },
      ],
      activities: [
        {
          id: 'd11-a1-a1',
          kind: 'fields',
          label: '1-3',
          title: 'Analyser la segmentation',
          instructions: 'Réponds à l’aide du document.',
          helps: ['Trois critères successifs.', `Nombre de segments = ${SEG.sexes} × ${SEG.plateformes} × ${SEG.genres}.`, 'Un nouveau jeu de football : genre « simulation » sport, sur les plateformes où il sort.'],
          outcomeIds: R1,
          fields: [
            { id: 'criteres', label: '1. Critères utilisés (plusieurs réponses)', kind: 'multi', options: [{ value: 'sexe', label: 'Le sexe' }, { value: 'plateforme', label: 'La plateforme de jeu' }, { value: 'genre', label: 'Le genre de jeu préféré' }, { value: 'age', label: 'L’âge' }], answers: ['sexe', 'plateforme', 'genre'], explain: 'Trois critères.' },
            num('segments', '2. Nombre de segments obtenus', NB_SEGMENTS, `${SEG.sexes} × ${SEG.plateformes} × ${SEG.genres} = ${NB_SEGMENTS}.`),
            num('hommes', '3. Nombre de clients hommes', HOMMES, `${FIDELES} × ${PART_HOMMES} % = ${HOMMES}.`),
            num('nova', '4. Hommes jouant sur console Nova', HOMMES_PLAY, `${HOMMES} × 39 % = ${HOMMES_PLAY}.`),
            { id: 'foot', label: '5. Pour la sortie d’un jeu de football sur Nova, Xenon et PC, quels segments cibler ?', kind: 'choice', options: [{ value: 'a', label: 'Hommes et femmes, plateformes Nova, Xenon et PC, genre simulation' }, { value: 'b', label: 'Tous les clients de la console portable' }], answer: 'a', explain: 'Plateformes concernées et genre du jeu.' },
            { id: 'xenon', label: '6. Pour une promotion sur les accessoires Xenon, quels segments cibler ?', kind: 'choice', options: [{ value: 'a', label: 'Tous les joueurs Xenon, hommes et femmes, tous genres' }, { value: 'b', label: 'Les joueurs PC' }], answer: 'a', explain: 'Seule la plateforme compte.' },
          ],
        },
      ],
      selfAssessment: ['Je sais analyser et utiliser une segmentation.'],
    },
    {
      id: 'application-2',
      kind: 'application',
      number: 2,
      title: 'Exploiter les informations sur la clientèle',
      guidance: 'autonome',
      message: { from: 'Bruno Lacombe', role: 'Responsable, magasin Pixel Zone', text: ['Voici les résultats d’une étude nationale sur les joueurs de jeux vidéo. Complète le profil du joueur type et estime notre clientèle potentielle.'] },
      documents: [
        { id: 'd11-a2-doc1', number: 1, title: 'Étude « Les Français et le jeu vidéo »', look: 'texte', blocks: [{ type: 'list', items: [`${PART_JOUEURS} % des Français de 10 ans et plus jouent au moins occasionnellement.`, 'Joueurs réguliers : 53 % d’hommes, 47 % de femmes ; âge moyen 38 ans.', 'Fréquence : un tiers jouent tous les jours ou presque.', 'Support le plus utilisé : le smartphone (51 %), devant la console de salon (49 %).', 'Genres préférés : jeux « casual » (cartes, puzzles), plateforme, jeux de rôle.', 'Achat : 58 % en magasin, 42 % sur Internet ; 69 % préfèrent le format physique.'] }] },
      ],
      activities: [
        {
          id: 'd11-a2-a1',
          kind: 'fields',
          label: 'Annexe',
          title: 'Profil du joueur et clientèle potentielle',
          instructions: `Complète le profil, puis calcule le nombre de joueurs potentiels dans une ville de ${VILLE.toLocaleString('fr-FR')} habitants de 10 ans et plus.`,
          helps: ['Tout est dans le document.', `Joueurs potentiels = ${VILLE} × ${PART_JOUEURS} %.`, 'Arrondis à l’unité.'],
          outcomeIds: R1,
          fields: [
            { id: 'sexe', label: 'Sexe dominant', kind: 'choice', options: [{ value: 'h', label: 'Légèrement plus d’hommes (53 %)' }, { value: 'f', label: 'Très majoritairement des femmes' }], answer: 'h', explain: '53 % / 47 %.' },
            num('age', 'Âge moyen', 38, '38 ans.', 'ans'),
            { id: 'support', label: 'Support le plus utilisé', kind: 'choice', options: [{ value: 'smartphone', label: 'Smartphone' }, { value: 'pc', label: 'Ordinateur' }], answer: 'smartphone', explain: '51 %.' },
            { id: 'lieu', label: 'Lieu d’achat préféré', kind: 'choice', options: [{ value: 'magasin', label: 'Magasin' }, { value: 'internet', label: 'Internet' }], answer: 'magasin', explain: '58 %.' },
            { id: 'format', label: 'Format préféré', kind: 'choice', options: [{ value: 'physique', label: 'Physique' }, { value: 'demat', label: 'Dématérialisé' }], answer: 'physique', explain: '69 %.' },
            num('potentiel', 'Joueurs potentiels dans la ville', JOUEURS, `${VILLE} × ${PART_JOUEURS} % = ${JOUEURS}.`, undefined, 1),
          ],
        },
      ],
      selfAssessment: ['Je sais exploiter une étude pour décrire une clientèle.'],
    },
    {
      id: 'application-3',
      kind: 'application',
      number: 3,
      title: 'Sélectionner des produits et proposer une action commerciale',
      guidance: 'autonome',
      message: { from: 'Damien Royer', role: 'Directeur, magasin Électro Plus', text: ['Notre grande surface spécialisée en électroménager et multimédia doit se dynamiser. En binôme, choisissez une opportunité et proposez-moi une action commerciale.'] },
      documents: [
        { id: 'd11-a3-doc1', number: 1, title: 'Opportunités repérées', look: 'texte', blocks: [{ type: 'table', head: ['Événements', 'Opportunités internes', 'Veille et marché'], rows: [['Fête des mères, Halloween, rentrée, Chandeleur, Noël', 'Nouveau robot cuiseur, ventes de téléviseurs en baisse, stock important de congélateurs, 10 ans du magasin', 'Remboursement de 10 € offert par une marque de petit électroménager ; un concurrent annonce jusqu’à −50 % sur l’électroménager']] }] },
        {
          id: "d11-revision-6-doc",
          number: 2,
          title: "Préparer un atelier dans une boutique de cyclisme",
          look: "fiche",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Sur 40 répondants, 25 demandent un atelier réparation de crevaison, 10 souhaitent comparer des casques et 5 parlent d’éclairage. La boutique dispose d’un mécanicien samedi de 10 h à 11 h, de 8 places et de 12 kits de réparation, dont 2 pour la démonstration."
            }
          ]
        },
        {
          id: "d11-revision-dossier-doc1",
          number: 3,
          title: "Enquête et ventes",
          look: "fiche",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Sur 60 personnes interrogées, 36 demandent un atelier de jeux courts, 14 une soirée jeux experts et 10 une animation cadeaux. Les questionnaires ont été distribués un mercredi après-midi. Sur quatre mercredis, les jeux courts ont vendu 28 unités contre 12 pour les jeux experts. Aucun relevé équivalent du samedi n’est disponible."
            }
          ]
        },
        {
          id: "d11-revision-dossier-doc2",
          number: 4,
          title: "Ressources et offres",
          look: "fiche",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Produit",
                "Partie",
                "Stock",
                "Marge par vente"
              ],
              rows: [
                [
                  "Cartes minute",
                  "12 min",
                  "16",
                  "6 €"
                ],
                [
                  "Mission jungle",
                  "15 min",
                  "10",
                  "8 €"
                ],
                [
                  "Îles stratégiques",
                  "45 min",
                  "9",
                  "12 €"
                ]
              ]
            },
            {
              type: "p",
              text: "L’équipe dispose de deux sessions de 10 places le mercredi. Une partie doit durer au plus 15 minutes afin de garder du temps pour accueillir le groupe. Chaque référence animée mobilise un exemplaire et doit conserver au moins huit unités vendables. Budget direct de 40 €."
            }
          ]
        },
        {
          id: "d11-revision-dossier-doc3",
          number: 5,
          title: "Modification avant l’annonce",
          look: "courriel",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Le stock confirmé de Mission jungle tombe à 8. L’équipe peut garder deux sessions avec Cartes minute, ou en maintenir une et organiser un coin conseil cadeaux. Le partenaire voisin confirme une sortie de médiathèque à 14 h 45."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd11-a3-a1',
          kind: 'open',
          label: '1-4',
          title: 'Proposer une action commerciale',
          instructions: 'Choisissez une opportunité, proposez une action qui crée du trafic, sélectionnez la gamme de produits et précisez les objectifs. Préparez une présentation orale.',
          helps: ['Exemple : Chandeleur + nouveau robot cuiseur → démonstration de crêpes en magasin.', 'Sélectionnez 3 à 5 produits cohérents (robot, crêpière, ustensiles).', 'Objectifs : nombre de participants, ventes du robot, nouveaux encartés.'],
          outcomeIds: R12,
          prompts: [
            { id: 'opportunite', label: 'Opportunité choisie', lines: 1 },
            { id: 'action', label: 'Action proposée', lines: 4 },
            { id: 'produits', label: 'Produits retenus', lines: 3 },
            { id: 'objectifs', label: 'Objectifs chiffrés', lines: 3 },
          ],
          selfCheck: ['L’action est liée à l’opportunité.', 'Les produits sont cohérents avec l’action.', 'Les objectifs sont chiffrés.', 'La présentation est prête.'],
        },
        {
          id: "d11-revision-6",
          label: "Nouveau cas d’application",
          title: "Préparer un atelier dans une boutique de cyclisme",
          instructions: "Lis le document 2. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Fais correspondre le besoin majoritaire, la capacité et le stock réellement vendable.",
            "Relis le document 2 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "12 − 2 = 10 kits."
          ],
          outcomeIds: [
            "d11-r1",
            "d11-r2"
          ],
          fields: [
            {
              id: "q1",
              label: "Combien de kits restent vendables ?",
              kind: "number",
              answer: 10,
              explain: "12 − 2 = 10 kits."
            },
            {
              id: "q2",
              label: "Rédige un brief précisant cible, animation et mesure.",
              kind: "written",
              lines: 3,
              model: "Cibler les cyclistes qui souhaitent apprendre à réparer une crevaison. Organiser une démonstration le samedi entre 10 h et 11 h pour huit personnes. Proposer les dix kits vendables et relever présences et ventes liées."
            }
          ]
        },
        {
          id: "d11-revision-dossier",
          label: "Dossier de décision",
          title: "Choisir une opération malgré des données clients incomplètes",
          instructions: "Lis les documents 3 et 4, puis écris ton diagnostic initial. Passe ensuite au document 5 pour revoir ta décision. Note tes calculs et les faits qui justifient chaque choix dans les zones de réponse. Après avoir répondu, clique sur « Vérifier mes réponses » pour comparer avec les propositions de corrigé.",
          kind: "fields",
          helps: [
            "Associe les preuves à la cible, vérifie la faisabilité, puis recalcule le seuil de couverture du budget après le changement.",
            "Vérifie le public observé, la durée du jeu, les exemplaires vendables après démonstration et la capacité de la salle. Recalcule le programme si l’une de ces conditions change.",
            "Exemple. Avec 9 articles et un exemplaire de démonstration, il reste 8 vendables. Avec 28 € de coût et une marge de 5 € par vente, il faut 6 ventes pour couvrir le coût, car 5 ventes donnent seulement 25 €."
          ],
          outcomeIds: [
            "d11-r1",
            "d11-r2"
          ],
          fields: [
            {
              id: "q1",
              label: "Justifie la cible et donne une limite à l’enquête.",
              kind: "written",
              lines: 6,
              model: "Prioriser les familles disponibles mercredi et intéressées par les jeux courts. Elles représentent 60 % de l’enquête et les ventes du mercredi vont dans le même sens. L’échantillon ne permet pas de conclure pour les clients du samedi ni pour les soirées."
            },
            {
              id: "q2",
              label: "Construis le programme initial et vérifie le stock vendable.",
              kind: "written",
              lines: 6,
              model: "Deux sessions après la sortie de médiathèque, maximum 20 participants, avec Cartes minute et Mission jungle. Après exemplaires de démonstration, 15 et 9 unités vendables. Îles stratégiques dépasse la durée adaptée."
            },
            {
              id: "q3",
              label: "Revois le programme après la baisse de stock et calcule le minimum de ventes pour couvrir 40 €.",
              kind: "written",
              lines: 6,
              model: "Mission jungle laisse 7 unités vendables, sous le seuil. Garder Cartes minute seul pour les deux sessions si la demande le justifie, avec 15 unités vendables. Il faut 7 ventes à 6 € de marge, car 6 ventes ne donnent que 36 €."
            },
            {
              id: "q4",
              label: "Présente au responsable les décisions et la manière de les réexaminer.",
              kind: "written",
              lines: 6,
              model: "Valider une animation mercredi après 14 h 45, réserver l’exemplaire de test, fixer un objectif de 16 participants sur 20 et 7 ventes attribuées. Relever participation, achats et remarques. Collecter des données à un autre créneau avant de proposer une deuxième cible."
            }
          ]
        },
      ],
      selfAssessment: ['Je sais proposer une action commerciale argumentée.',
        "Je relie la cible aux preuves et aux limites de l’enquête.",
        "Je revois le programme si le stock vendable passe sous le seuil.",
        "Je calcule les ventes nécessaires pour couvrir le budget direct."],
    },
    {
      id: 'bilan',
      kind: 'bilan',
      title: 'Évaluez votre réussite',
      documents: [],
      activities: [],
      selfAssessment: [
        'Je sais exploiter des informations sur la clientèle.',
        'Je sais segmenter une clientèle selon l’objectif.',
        'Je sais repérer des opportunités et exploiter une veille concurrentielle.',
        'Je sais sélectionner des produits en respectant les consignes de l’enseigne.',
        'Je sais proposer des actions qui créent du trafic.',
      ],
    },
  ],
};
