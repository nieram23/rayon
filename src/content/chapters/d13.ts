import type { Chapter, ChoiceOption, Field } from '../../domain/chapter';

const w = (id: string, label: string, model: string, criteria?: string[], lines = 3): Field => ({ id, label, kind: 'written', model, criteria, lines });

/**
 * DOSSIER 13 — Développer sa clientèle grâce aux canaux digitaux
 *
 * Progression calquée sur le manuel de référence (contexte, 5 missions, synthèse, 3 applications).
 * Entreprises, réseaux (décrits de façon générique), personnages et chiffres : ORIGINAUX et fictifs.
 */

const R1 = ['d13-r1']; // Supports conformes à la réglementation et attractifs.
const OUI_NON: ChoiceOption[] = [
  { value: 'oui', label: 'Oui' },
  { value: 'non', label: 'Non' },
];
export const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const num = (id: string, label: string, answer: number, explain: string, unit?: string, tolerance?: number): Field => ({ id, label, kind: 'number', answer, explain, unit, tolerance });

export const PANIERS = { abandonnes: 210, tauxRapide: 5, tauxLent: 2 };
export const VALIDES_LENT = Math.round((PANIERS.abandonnes * PANIERS.tauxLent) / 100);
export const VALIDES_RAPIDE = Math.round((PANIERS.abandonnes * PANIERS.tauxRapide) / 100);

const RESEAUX: ChoiceOption[] = [
  { value: 'communautaire', label: 'Réseau communautaire généraliste' },
  { value: 'photos', label: 'Réseau de photos et de stories' },
  { value: 'video', label: 'Plateforme de vidéos longues' },
  { value: 'courtes', label: 'Réseau de vidéos courtes' },
  { value: 'pro', label: 'Réseau professionnel' },
  { value: 'messages', label: 'Réseau de messages courts' },
];

export const NEWSLETTER = [
  ['titre', 'La newsletter comporte un titre', 'oui'],
  ['logo', 'Elle comporte le logo de l’entreprise', 'oui'],
  ['periodicite', 'La périodicité est indiquée', 'oui'],
  ['inscrit', 'Le lecteur est rappelé qu’il s’est inscrit', 'non'],
  ['desinscription', 'Un lien de désinscription figure en fin de document', 'non'],
  ['cta', 'Un appel à l’action (« cliquez ici ») est inséré', 'oui'],
  ['envie', 'Le contenu donne envie d’aller sur le site', 'oui'],
  ['lien', 'En cliquant, le lecteur arrive sur le site', 'oui'],
  ['pas-promo', 'Le contenu n’est pas uniquement promotionnel', 'oui'],
  ['conseils', 'Elle donne des conseils et des informations utiles', 'oui'],
  ['mise-en-page', 'La mise en page alterne photos et textes', 'oui'],
  ['perso', 'Elle est personnalisée (prénom du lecteur)', 'non'],
  ['vous', 'Elle s’adresse au lecteur (« vous »)', 'oui'],
] as const;

export const D13: Chapter = {
  unitId: 'd13',
  mission:
    "Herbes & Vous veut développer la vente de ses infusions en ligne. Tu choisis un réseau selon les données d’audience, rédiges une publication, améliores une page de recherche et repères une perte dans le parcours d’achat. Ton bilan distingue les visites utiles des visites qui repartent.",
  fictionNotice: 'Herbes & Vous, les autres entreprises, les personnages et les chiffres de ce dossier sont imaginaires. Les réseaux sociaux sont décrits par leur type.',
  company: {
    name: 'Herbes & Vous',
    tagline: 'Site marchand de thés, tisanes et compléments alimentaires bio',
    facts: [
      ['Ton poste', 'Assistant commercial (alternance)'],
      ['Ton responsable', 'Lucas Brémont, gérant'],
      ['Cible', 'Femmes de 30 à 60 ans, soucieuses de leur santé, amatrices de thé'],
    ],
  },
  steps: [
    {
      id: 'ouverture',
      kind: 'ouverture',
      title: "Attirer une clientèle qualifiée et la conduire jusqu’à l’achat",
      hero: { id: 'd13-hero', alt: 'Tasse de tisane à la lavande et sucre roux sur une table en bois' },
      message: { from: 'Lucas Brémont', role: 'Gérant, Herbes & Vous', text: ['J’ai créé ce site marchand et un blog de conseils pour partager mes connaissances. Le site a besoin de visibilité pour être visité et générer des ventes. Tu vas m’aider à développer sa notoriété, notamment grâce aux réseaux sociaux.'] },
      documents: [
        {
          id: "d13-revision-reperes",
          number: 2,
          title: "Trois repères pour commencer",
          look: "memo",
          blocks: [
            {
              type: "list",
              items: [
                "Un canal est un moyen d’atteindre les clients, comme une lettre d’information, un réseau social ou la recherche.",
                "Un taux de conversion correspond au nombre d’actions obtenues divisé par le nombre de personnes qui pouvaient les réaliser.",
                "Le coût par achat divise les frais de campagne par les achats attribués. L’attribution associe un achat à un canal selon une règle de mesure."
              ]
            }
          ]
        },
        { id: 'd13-o-doc1', number: 1, title: 'L’entreprise', look: 'fiche', blocks: [{ type: 'facts', items: [['Société', 'EURL Herbes & Vous'], ['Activité', 'Vente en ligne de compléments alimentaires, thés, tisanes et boissons santé bio'], ['Concurrents', 'Magasins bio et autres sites de produits bio'], ['Développement de la clientèle', 'Blog et réseaux sociaux']] }] },
      ],
      activities: [
        {
          id: 'd13-o-a1',
          kind: 'fields',
          label: 'Questions',
          title: 'Identifier l’entreprise et ses enjeux',
          instructions: 'Réponds à l’aide du document et de tes connaissances.',
          helps: ['Le site vend uniquement en ligne.', 'Un site récent n’est pas connu : il apparaît peu dans les recherches.', 'Canaux digitaux : site, réseaux sociaux, courriel, moteur de recherche…'],
          outcomeIds: R1,
          fields: [
            { id: 'raison', label: 'Raison sociale', kind: 'text', accept: ['EURL Herbes & Vous', 'EURL Herbes et Vous', 'Herbes & Vous', 'Herbes et Vous'], explain: 'EURL Herbes & Vous.' },
            { id: 'methode', label: '1. Méthode de commercialisation', kind: 'choice', options: [{ value: 'vad', label: 'Vente à distance, en ligne uniquement' }, { value: 'magasin', label: 'Vente en magasin' }], answer: 'vad', explain: 'Site marchand.' },
            { id: 'visibilite', label: '2. Pourquoi le site a-t-il besoin de visibilité ?', kind: 'choice', options: [{ value: 'a', label: 'Il est récent : sans visiteurs, pas de ventes' }, { value: 'b', label: 'Il a trop de clients' }], answer: 'a', explain: 'Il faut attirer du trafic.' },
            { id: 'canaux', label: '3. Canaux digitaux (plusieurs réponses)', kind: 'multi', options: [{ value: 'reseaux', label: 'Réseaux sociaux' }, { value: 'mail', label: 'Courriel, newsletter' }, { value: 'seo', label: 'Moteurs de recherche' }, { value: 'blog', label: 'Blog' }, { value: 'flyer', label: 'Flyer papier' }], answers: ['reseaux', 'mail', 'seo', 'blog'], explain: 'Le flyer papier n’est pas digital.' },
          ],
        },
      ],
    },
    {
      id: 'mission-1',
      kind: 'mission',
      number: 1,
      title: 'Sélectionner des réseaux sociaux',
      guidance: 'guidé',
      message: { from: 'Lucas Brémont', role: 'Gérant', text: ['J’ai ouvert un compte sur un réseau de photos, mais je n’y ai publié que quelques images. Compare les réseaux, puis conseille-moi deux autres réseaux en justifiant leur intérêt.'] },
      documents: [
        {
          id: 'd13-m1-doc1',
          number: 1,
          title: 'Quel réseau social choisir ?',
          look: 'texte',
          blocks: [
            { type: 'p', text: 'Le choix dépend des objectifs, de la cible et de l’audience du réseau.' },
            { type: 'table', head: ['Type de réseau', 'Public et usage'], rows: [['Plateforme de vidéos longues', 'Très large audience ; tutoriels, démonstrations, conseils'], ['Réseau communautaire généraliste', 'Le plus utilisé, tous âges, beaucoup d’adultes ; fidéliser, informer, jeux-concours'], ['Réseau de photos et de stories', 'Jeunes adultes et de plus en plus toutes les classes d’âge ; photos, hashtags, ton ludique'], ['Réseau de messages courts', 'Actualité, expertise, notoriété ; messages brefs'], ['Réseau professionnel', 'Contacts professionnels, prospection d’entreprises'], ['Réseau de vidéos courtes', 'Surtout les 18-34 ans ; vidéos très courtes, fort engagement']] },
          ],
        },
        {
          id: "d13-revision-1-doc",
          number: 2,
          title: "Choisir le réseau selon le contenu et le public",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Canal observé",
                "Public majoritaire",
                "Format que l’équipe sait produire",
                "Clics vers le site sur le dernier mois"
              ],
              rows: [
                [
                  "Réseau photo",
                  "25–44 ans",
                  "Tutoriels illustrés",
                  "240"
                ],
                [
                  "Réseau vidéo courte",
                  "16–24 ans",
                  "Aucun format régulier",
                  "110"
                ],
                [
                  "Réseau local",
                  "45 ans et plus",
                  "Annonce d’événement",
                  "90"
                ]
              ]
            },
            {
              type: "p",
              text: "La cible de la prochaine infusion est constituée d’adultes de 25 à 44 ans qui préparent des boissons à la maison. L’équipe a deux heures par semaine."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd13-m1-a0',
          kind: 'fields',
          label: 'Annexe 1 (comparaison)',
          title: 'Comparer quatre réseaux sociaux',
          instructions: 'Pour chacun des quatre réseaux, décris son public et le type de publication qui y fonctionne (document 1).',
          helps: ['Relis la colonne « Public et usage ».', 'Un public = âge, profil ; une publication = format (photo, vidéo, texte court).', 'Pense à ce que pourrait y publier Herbes & Vous.'],
          outcomeIds: R1,
          layout: 'columns',
          columns: ['Public', 'Type de publication'],
          fields: [
            w('com.0', 'Réseau communautaire généraliste', 'Le plus utilisé, tous âges, beaucoup d’adultes et de parents.', ['Âge et profil.'], 2),
            w('com.1', 'Réseau communautaire généraliste', 'Articles, photos, vidéos, jeux-concours, actualités de la boutique.', ['Formats.'], 2),
            w('msg.0', 'Réseau de messages courts', 'Professionnels, journalistes, public qui suit l’actualité.', ['Âge et profil.'], 2),
            w('msg.1', 'Réseau de messages courts', 'Messages brefs avec hashtags : actualité, expertise, nouveautés.', ['Formats.'], 2),
            w('vid.0', 'Plateforme de vidéos longues', 'Une très large audience, de tous âges.', ['Âge et profil.'], 2),
            w('vid.1', 'Plateforme de vidéos longues', 'Tutoriels, démonstrations, conseils de préparation du thé.', ['Formats.'], 2),
            w('pho.0', 'Réseau de photos et de stories', 'Jeunes adultes, et de plus en plus toutes les classes d’âge.', ['Âge et profil.'], 2),
            w('pho.1', 'Réseau de photos et de stories', 'Belles photos de produits, stories, hashtags, ton ludique.', ['Formats.'], 2),
          ],
        },
        {
          id: 'd13-m1-a1',
          kind: 'fields',
          label: 'Annexe 1',
          title: 'Associer un besoin au réseau adapté',
          instructions: 'Choisis le réseau le plus adapté à chaque besoin.',
          helps: ['Relis la colonne « Public et usage ».', 'Expliquer la préparation d’un thé : une vidéo de démonstration.', 'Prospecter des entreprises : réseau professionnel.'],
          outcomeIds: R1,
          fields: (
            [
              ['tuto', 'Montrer en vidéo comment préparer un thé', 'video'],
              ['fideliser', 'Fidéliser des femmes de 30 à 60 ans et organiser un jeu-concours', 'communautaire'],
              ['photos', 'Publier de belles photos de tisanes avec des hashtags', 'photos'],
              ['b2b', 'Proposer des coffrets à des comités d’entreprise', 'pro'],
              ['ados', 'Toucher surtout les 18-25 ans par des vidéos très courtes', 'courtes'],
            ] as const
          ).map(([id, label, answer]): Field => ({ id, label, kind: 'choice', select: true, options: RESEAUX, answer, explain: RESEAUX.find((r) => r.value === answer)!.label + '.' })),
        },
        {
          id: 'd13-m1-a2',
          kind: 'fields',
          label: 'Annexe 2',
          title: 'Choisir deux nouveaux réseaux',
          instructions: 'Choisis les deux réseaux les plus adaptés à la cible d’Herbes & Vous.',
          helps: ['Cible : femmes de 30 à 60 ans.', 'Le site veut fidéliser et conseiller.', 'Communautaire (adultes) et vidéos longues (conseils).'],
          outcomeIds: R1,
          fields: [
            { id: 'choix', label: 'Réseaux sélectionnés (2 réponses)', kind: 'multi', options: RESEAUX, answers: ['communautaire', 'video'], explain: 'Le réseau communautaire touche la cible ; les vidéos permettent de partager des conseils.' },
          ],
        },
        {
          id: 'd13-m1-a3',
          kind: 'fields',
          label: 'Annexe 2 (justification)',
          title: 'Justifier le choix des deux réseaux',
          instructions: 'Rédige la justification de ton choix pour Lucas Brémont.',
          helps: ['Relie chaque réseau à la cible : femmes de 30 à 60 ans.', 'Relie chaque réseau aux objectifs : notoriété, conseil, fidélisation.', 'Cite un exemple de publication.'],
          outcomeIds: R1,
          fields: [w('justif', 'Justification', 'Le réseau communautaire touche directement les femmes de 30 à 60 ans et permet de fidéliser (jeux-concours, actualités). La plateforme de vidéos permet de partager les conseils du blog en tutoriels (préparer un thé, choisir une tisane) et renforce l’expertise.', ['Cible citée.', 'Un exemple de publication par réseau.'], 5)],
        },
        {
          id: "d13-revision-1",
          label: "Annexe complémentaire",
          title: "Choisir le réseau selon le contenu et le public",
          instructions: "Lis le document 2. Rédige tes réponses en t’appuyant sur les faits du document. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Croise la cible, le format et la capacité à publier régulièrement.",
            "Relis le document 2 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "Le réseau photo correspond au public et aux tutoriels que l’équipe peut produire. Relever les clics vers la fiche et les achats attribués au lien sur la même période."
          ],
          outcomeIds: [
            "d13-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Quel canal choisis-tu et que mesures-tu après quatre publications ?",
              kind: "written",
              lines: 3,
              model: "Le réseau photo correspond au public et aux tutoriels que l’équipe peut produire. Relever les clics vers la fiche et les achats attribués au lien sur la même période."
            },
            {
              id: "q2",
              label: "Quelle place donner au réseau local ?",
              kind: "written",
              lines: 3,
              model: "L’utiliser pour annoncer une dégustation ou un retrait local si l’objectif change. Mesurer alors inscriptions ou retraits, avec un lien distinct."
            }
          ]
        },
      ],
    },
    {
      id: 'mission-2',
      kind: 'mission',
      number: 2,
      title: 'Publier sur les réseaux sociaux et développer sa communauté',
      guidance: 'accompagné',
      message: { from: 'Lucas Brémont', role: 'Gérant', text: ['Une trentaine de personnes seulement suivent notre compte photos, surtout des proches. Analyse la publication que j’envisage et propose-moi mieux.'] },
      documents: [
        { id: 'd13-m2-doc1', number: 1, title: 'Développer sa communauté', look: 'procedure', blocks: [{ type: 'list', items: ['Soigner les publications : des contenus qui intéressent la cible.', 'Interagir avec d’autres comptes liés à l’activité : suivre, aimer, commenter.', 'Utiliser les bons hashtags : proches des valeurs de l’entreprise, recherchés par la cible (30 au maximum).', 'Proposer un jeu-concours pour créer de la viralité et gagner des abonnés.'] }, { type: 'note', text: 'Communauté : ensemble des abonnés d’une marque. Viralité : diffusion rapide d’un contenu.' }] },
        { id: 'd13-m2-doc2', number: 2, title: 'Publication envisagée', look: 'site', url: 'reseau-photos.example/herbesetvous', blocks: [{ type: 'p', text: 'Photo : un coucher de soleil sur une savane, avec un acacia. Texte : « Coucher de soleil au parc national… quelle sérénité ! #savane #safari ».' }] },
        {
          id: 'd13-m2-doc3',
          number: 3,
          title: 'Quel hashtag choisir ?',
          look: 'texte',
          blocks: [{ type: 'p', text: 'Sur les réseaux de photos, on recherche par hashtags (#). Ils regroupent et classent les contenus : bien choisis (30 au maximum), ils permettent à la cible de trouver l’entreprise. Un hashtag trop général (#thé) est noyé parmi des millions de publications ; il vaut mieux des hashtags proches des valeurs de l’entreprise (#tisanebio, #pausebienetre) et ceux utilisés par la cible ou par les influenceurs du secteur.' }],
        },
        {
          id: 'd13-m2-doc4',
          number: 4,
          title: 'Exemple de jeu-concours',
          look: 'site',
          url: 'reseau-photos.example/latelierdesrobes',
          blocks: [{ type: 'p', text: 'Une créatrice de mode lance un concours de co-création : « Imaginez votre robe idéale pour l’été, du 25 janvier au 15 février, avec #LAtelierCréatif. » Résultat : 60 commentaires et 30 partages en quelques heures.' }],
        },
        {
          id: "d13-revision-2-doc",
          number: 5,
          title: "Publier puis traiter les commentaires",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "La publication présente une infusion verveine-citron de 40 g à 5,90 €. L’équipe l’a testée chaude et en boisson froide. Un commentaire demande la composition, un autre signale une boîte cabossée reçue hier. L’équipe dispose d’une fiche ingrédients et d’un canal privé d’assistance."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd13-m2-a1',
          kind: 'fields',
          label: 'Annexe',
          title: 'Analyser la publication et proposer mieux',
          instructions: 'Analyse la publication, puis choisis les éléments d’une meilleure publication.',
          helps: ['La photo parle-t-elle de thé ou de bien-être ?', 'Un hashtag efficace est proche de l’activité, sans être trop général.', 'Hors publication : interagir et organiser un jeu-concours.'],
          outcomeIds: R1,
          fields: [
            { id: 'contenu', label: '1. Le contenu est-il adapté à la cible ?', kind: 'choice', options: OUI_NON, answer: 'non', explain: 'Aucun lien avec les produits.' },
            { id: 'hashtags', label: '2. Les hashtags sont-ils pertinents ?', kind: 'choice', options: OUI_NON, answer: 'non', explain: 'Ils attirent des amateurs de voyage, pas la cible.' },
            { id: 'photo', label: '3. Meilleur contenu', kind: 'choice', options: [{ value: 'a', label: 'Une tasse de tisane fumante, des plantes séchées, une lumière douce' }, { value: 'b', label: 'Le logo seul sur fond blanc' }], answer: 'a', explain: 'Visuel qui évoque le produit et le bien-être.' },
            { id: 'tags', label: '4. Hashtags à utiliser (plusieurs réponses)', kind: 'multi', options: [{ value: 'tisanebio', label: '#tisanebio' }, { value: 'bienetre', label: '#bienetrenaturel' }, { value: 'pausethe', label: '#pausethé' }, { value: 'photo', label: '#photo' }, { value: 'safari', label: '#safari' }], answers: ['tisanebio', 'bienetre', 'pausethe'], explain: '#photo est trop général, #safari hors sujet.' },
            { id: 'hors', label: '5. En dehors de la publication, pour développer la communauté (plusieurs réponses)', kind: 'multi', options: [{ value: 'interagir', label: 'Suivre et commenter des comptes bien-être' }, { value: 'concours', label: 'Organiser un jeu-concours' }, { value: 'regularite', label: 'Publier régulièrement' }, { value: 'acheter', label: 'Acheter des faux abonnés' }], answers: ['interagir', 'concours', 'regularite'], explain: 'Les faux abonnés nuisent à la crédibilité.' },
          ],
        },
        {
          id: 'd13-m2-a2',
          kind: 'fields',
          label: 'Annexe (proposition)',
          title: 'Rédiger la proposition de publication',
          instructions: 'Rédige le message de ta publication et une idée de jeu-concours.',
          helps: ['Un message court, chaleureux, qui parle à la cible.', 'Intègre 3 à 5 hashtags pertinents.', 'Jeu-concours : une action simple (photo de sa pause thé) et un cadeau.'],
          outcomeIds: R1,
          fields: [
            w('message', 'Message de la publication', 'Une pause rien qu’à vous : notre tisane bio camomille-tilleul vous accompagne en douceur chaque soir. Et vous, quel est votre rituel détente ? #tisanebio #pausebienetre #rituelsoir', ['Message adapté à la cible.', 'Hashtags pertinents.'], 3),
            w('concours', 'Idée de jeu-concours', 'Publiez la photo de votre pause thé avec #MaPauseHerbes, abonnez-vous et identifiez une amie : tirage au sort d’un coffret de 6 tisanes.', ['Modalités + cadeau.'], 3),
          ],
        },
        {
          id: "d13-revision-2",
          label: "Annexe complémentaire",
          title: "Publier puis traiter les commentaires",
          instructions: "Lis le document 5. Rédige tes réponses en t’appuyant sur les faits du document. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Réponds publiquement à ce qui peut aider tout le monde, et oriente le cas individuel vers l’assistance.",
            "Relis le document 5 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "« Une infusion au citron, chaude ou froide ? Découvrez notre infusion verveine-citron, 40 g à 5,90 €. Retrouvez la composition et les deux modes de préparation sur la fiche. »"
          ],
          outcomeIds: [
            "d13-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Écris le texte de publication avec une action précise.",
              kind: "written",
              lines: 3,
              model: "« Une infusion au citron, chaude ou froide ? Découvrez notre infusion verveine-citron, 40 g à 5,90 €. Retrouvez la composition et les deux modes de préparation sur la fiche. »"
            },
            {
              id: "q2",
              label: "Rédige les deux réponses aux commentaires.",
              kind: "written",
              lines: 3,
              model: "Indiquer où lire la composition vérifiée et proposer un lien direct à la personne qui la demande. Pour la boîte cabossée, reconnaître le problème et inviter à transmettre la référence de commande en privé pour traiter le dossier."
            }
          ]
        },
      ],
    },
    {
      id: 'mission-3',
      kind: 'mission',
      number: 3,
      title: 'Améliorer la visibilité de son site marchand',
      guidance: 'accompagné',
      message: { from: 'Lucas Brémont', role: 'Gérant', text: ['Pour aller vite, j’ai payé un référencement publicitaire, mais cela coûte cher. Depuis que je l’ai arrêté, le trafic est en forte baisse. Rappelle-moi les règles du référencement naturel et propose des mots-clés.'] },
      documents: [
        { id: 'd13-m3-doc1', number: 1, title: 'Le référencement sur les moteurs de recherche', look: 'texte', blocks: [{ type: 'p', text: 'Pour être visité, un site doit apparaître dans les premiers résultats de recherche. Deux solutions : le référencement payant (SEA, Search Engine Advertising), le plus simple mais coûteux, qui place des annonces en tête des résultats ; le référencement naturel (SEO, Search Engine Optimization), gratuit mais plus long : il faut identifier les mots et expressions que tapent les internautes et les intégrer aux titres, descriptions, images et articles du site.' }] },
        { id: 'd13-m3-doc2', number: 2, title: 'Trouver de bons mots-clés', look: 'texte', blocks: [{ type: 'p', text: 'On réfléchit à tous les mots liés aux produits et aux thèmes traités (remue-méninges), en précisant les activités : « tisane sommeil », « thé vert bio », « infusion détox ». Pour chaque mot-clé, on se demande : peut-il mener à mon site ? Mène-t-il à mes concurrents ? Est-il trop courant ?' }] },
        {
          id: "d13-revision-3-doc",
          number: 3,
          title: "Faire correspondre une page à une recherche",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Les recherches internes les plus fréquentes sont « infusion verveine citron », « infusion à boire froide » et « tisane au citron ». La page produit s’intitule seulement « Mélange n° 4 ». La fiche fournisseur confirme la verveine et le citron ainsi qu’une préparation chaude ou froide."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd13-m3-a1',
          kind: 'fields',
          label: 'Annexe',
          title: 'Réponse à Lucas Brémont',
          instructions: 'Réponds sur le référencement, puis choisis les mots-clés.',
          helps: ['SEA : payant, annonces. SEO : naturel, gratuit.', 'Un mot-clé trop général (« thé ») mène vers des millions de pages.', 'Préfère des expressions précises liées aux produits.'],
          outcomeIds: R1,
          fields: [
            { id: 'sea', label: '1. Le référencement payant s’appelle…', kind: 'choice', options: [{ value: 'sea', label: 'SEA' }, { value: 'seo', label: 'SEO' }], answer: 'sea', explain: 'Search Engine Advertising.' },
            { id: 'seo', label: '2. Le référencement naturel est…', kind: 'choice', options: [{ value: 'a', label: 'Gratuit mais long à obtenir' }, { value: 'b', label: 'Payant et immédiat' }], answer: 'a', explain: 'Il demande du travail sur le contenu.' },
            { id: 'ou', label: '3. Où intégrer les mots-clés ? (plusieurs réponses)', kind: 'multi', options: [{ value: 'titres', label: 'Titres des pages' }, { value: 'desc', label: 'Descriptions des produits' }, { value: 'images', label: 'Noms et descriptions des images' }, { value: 'blog', label: 'Articles du blog' }], answers: ['titres', 'desc', 'images', 'blog'], explain: 'Partout où le moteur lit du texte.' },
            { id: 'mots', label: '4. Mots-clés efficaces (plusieurs réponses)', kind: 'multi', options: [{ value: 'sommeil', label: 'tisane bio sommeil' }, { value: 'vert', label: 'thé vert bio en vrac' }, { value: 'detox', label: 'infusion détox naturelle' }, { value: 'the', label: 'thé' }, { value: 'boisson', label: 'boisson' }], answers: ['sommeil', 'vert', 'detox'], explain: '« thé » et « boisson » sont trop courants.' },
          ],
        },
        {
          id: 'd13-m3-a2',
          kind: 'open',
          label: 'Courriel',
          title: 'Rédiger la réponse',
          instructions: 'Rédige le courriel de réponse à Lucas Brémont : différence SEA / SEO, règles du référencement naturel, liste de mots-clés.',
          helps: ['Un paragraphe par idée.', 'Explique pourquoi le trafic a baissé à l’arrêt du SEA.', 'Termine par 5 à 8 mots-clés.'],
          outcomeIds: R1,
          prompts: [{ id: 'courriel', label: 'Courriel', lines: 10 }],
          selfCheck: ['SEA et SEO sont expliqués.', 'La baisse du trafic est expliquée.', 'Les mots-clés sont précis.', 'Le courriel est professionnel.'],
        },
        {
          id: "d13-revision-3",
          label: "Annexe complémentaire",
          title: "Faire correspondre une page à une recherche",
          instructions: "Lis le document 3. Rédige tes réponses en t’appuyant sur les faits du document. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Choisis un titre qui décrit le produit et un texte fondé sur la fiche.",
            "Relis le document 3 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "« Infusion verveine-citron, chaude ou froide ». « Retrouvez la verveine et le citron dans une infusion en pot de 40 g. Deux modes de préparation sont indiqués sur la fiche. »"
          ],
          outcomeIds: [
            "d13-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Écris le titre de page et deux lignes descriptives.",
              kind: "written",
              lines: 3,
              model: "« Infusion verveine-citron, chaude ou froide ». « Retrouvez la verveine et le citron dans une infusion en pot de 40 g. Deux modes de préparation sont indiqués sur la fiche. »"
            },
            {
              id: "q2",
              label: "Quel relevé permet de vérifier si le changement aide les visiteurs ?",
              kind: "written",
              lines: 3,
              model: "Comparer les arrivées issues de recherches pertinentes et les clics vers la fiche sur des périodes comparables. Vérifier aussi que les recherches internes ciblées font remonter le bon produit."
            }
          ]
        },
      ],
    },
    {
      id: 'mission-4',
      kind: 'mission',
      number: 4,
      title: 'Améliorer son taux de conversion',
      guidance: 'autonome',
      message: { from: 'Lucas Brémont', role: 'Gérant', text: ['Beaucoup d’internautes remplissent leur panier puis l’abandonnent. Rédige un courriel de relance pour une cliente, Angèle, qui a laissé deux boîtes de thé dans son panier, et calcule le nombre de paniers que nous pouvons espérer récupérer.'] },
      documents: [
        { id: 'd13-m4-doc1', number: 1, title: 'La relance des paniers abandonnés', look: 'article', blocks: [{ type: 'p', text: `Entre la moitié et les trois quarts des internautes n’achèvent pas leur commande : moyens de paiement, délais ou frais de livraison, obligation de créer un compte… Un courriel de relance permet de récupérer une partie de ces clients. Envoyé dans les 20 minutes, il obtient un taux de conversion d’environ ${PANIERS.tauxRapide} % ; envoyé plus de 24 heures après l’abandon, environ ${PANIERS.tauxLent} %.` }] },
        { id: 'd13-m4-doc2', number: 2, title: 'L’e-réputation', look: 'texte', blocks: [{ type: 'p', text: 'Chaque publication, réponse, courriel ou faute d’orthographe engage la réputation en ligne de l’entreprise. Internet propage les contenus et les commentaires en quelques secondes : il faut être très vigilant.' }] },
        { id: 'd13-m4-doc3', number: 3, title: 'Conseils pour le courriel de relance', look: 'procedure', blocks: [{ type: 'list', items: ['Soigner l’objet : c’est la première chose que lit le client.', 'Personnaliser avec le prénom.', 'Travailler le design : visuel du produit, bouton bien visible.', 'Rappeler clairement les produits abandonnés.'] }] },
        {
          id: "d13-revision-4-doc",
          number: 4,
          title: "Localiser la perte dans le parcours d’achat",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Étape sur une même semaine",
                "Nombre"
              ],
              rows: [
                [
                  "Visites sur la fiche",
                  "500"
                ],
                [
                  "Ajouts au panier",
                  "100"
                ],
                [
                  "Débuts de paiement",
                  "60"
                ],
                [
                  "Achats",
                  "30"
                ]
              ]
            },
            {
              type: "p",
              text: "Sur cinq tests mobiles, trois personnes disent découvrir les frais de livraison au paiement. L’équipe peut rendre les frais plus visibles en amont."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd13-m4-a1',
          kind: 'fields',
          label: 'Annexe 2',
          title: 'Paniers validés suite à la relance',
          instructions: `Hier, ${PANIERS.abandonnes} paniers ont été abandonnés. Calcule les validations espérées.`,
          helps: ['Validations = paniers abandonnés × taux de conversion.', 'Arrondis à l’unité.', 'Compare les deux délais de relance.'],
          outcomeIds: R1,
          fields: [
            num('lent', `Relance plus de 24 h après (${PANIERS.tauxLent} %)`, VALIDES_LENT, `${PANIERS.abandonnes} × ${PANIERS.tauxLent} % = ${VALIDES_LENT}.`, 'paniers', 0.5),
            num('rapide', `Relance dans les 20 minutes (${PANIERS.tauxRapide} %)`, VALIDES_RAPIDE, `${PANIERS.abandonnes} × ${PANIERS.tauxRapide} % = ${fr1(PANIERS.abandonnes * PANIERS.tauxRapide / 100)} → ${VALIDES_RAPIDE}.`, 'paniers', 0.5),
            { id: 'conclu', label: 'Conclusion', kind: 'choice', options: [{ value: 'a', label: 'Automatiser la relance pour l’envoyer très vite' }, { value: 'b', label: 'Attendre une semaine avant de relancer' }], answer: 'a', explain: 'Plus la relance est rapide, plus elle convertit.' },
          ],
        },
        {
          id: 'd13-m4-a2',
          kind: 'open',
          label: 'Annexe 1',
          title: 'Rédiger le courriel de relance',
          instructions: 'Rédige le courriel de relance à Angèle (objet + message), sans aucune faute.',
          helps: ['Objet accrocheur et personnalisé.', 'Rappelle les deux boîtes de thé et leurs bienfaits.', 'Un bouton « Finaliser ma commande », éventuellement un petit avantage.'],
          outcomeIds: R1,
          prompts: [
            { id: 'objet', label: 'Objet', lines: 1 },
            { id: 'message', label: 'Message', lines: 8 },
          ],
          selfCheck: ['Le prénom est utilisé.', 'Les produits abandonnés sont rappelés.', 'Un appel à l’action est clair.', 'Aucune faute d’orthographe.'],
        },
        {
          id: "d13-revision-4",
          label: "Annexe complémentaire",
          title: "Localiser la perte dans le parcours d’achat",
          instructions: "Lis le document 4. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Calcule un taux global et un taux entre deux étapes pour situer le problème.",
            "Relis le document 4 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "30 ÷ 500 × 100 = 6 %."
          ],
          outcomeIds: [
            "d13-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Quel est le taux d’achat parmi les visites sur la fiche ?",
              kind: "number",
              answer: 6,
              explain: "30 ÷ 500 × 100 = 6 %."
            },
            {
              id: "q2",
              label: "Quel est le taux d’achat parmi les débuts de paiement ?",
              kind: "number",
              answer: 50,
              explain: "30 ÷ 60 × 100 = 50 %."
            },
            {
              id: "q3",
              label: "Propose une correction et un indicateur prioritaire.",
              kind: "written",
              lines: 3,
              model: "Afficher les frais ou leur mode de calcul près du panier avant paiement. Suivre d’abord le taux de finalisation après début de paiement, puis vérifier le taux global et les ajouts au panier."
            }
          ]
        },
      ],
    },
    {
      id: 'mission-5',
      kind: 'mission',
      number: 5,
      title: 'Générer du trafic',
      guidance: 'autonome',
      message: { from: 'Lucas Brémont', role: 'Gérant', text: ['J’ai préparé un brouillon de newsletter. Les inscriptions nous permettront de collecter des données, et la newsletter renverra vers le site. Vérifie qu’elle répond aux exigences d’une bonne newsletter.'] },
      documents: [
        { id: 'd13-m5-doc1', number: 1, title: 'La newsletter', look: 'texte', blocks: [{ type: 'p', text: 'Une newsletter est un courriel à caractère commercial envoyé régulièrement à des internautes qui ont accepté de la recevoir. Elle informe sur la marque et les produits, raconte des histoires, donne des conseils. Elle se distingue du courriel purement promotionnel. Elle doit toujours permettre de se désinscrire.' }] },
        {
          id: 'd13-m5-doc2',
          number: 2,
          title: 'Brouillon de la newsletter n° 1',
          look: 'courriel',
          blocks: [
            { type: 'facts', items: [['Objet', 'Votre newsletter n° 1 — Herbes & Vous']] },
            { type: 'list', items: ['Logo et titre « Votre newsletter n° 1 ».', 'Édito : « Chers abonnés, nous sommes heureux de vous faire parvenir notre première newsletter. Chaque semaine, vous recevrez nos actualités, nos nouveautés et nos conseils. »', 'Article « Le thé, un allié pour votre santé » avec photo.', 'Article « Préparer son thé : tout un art » (dosage, température, durée d’infusion).', 'Encadré : « Cliquez sur ce lien et entrez le code BIENVENUE pour bénéficier de −15 % sur votre commande. »'] },
            { type: 'note', text: 'Le brouillon ne contient ni prénom du destinataire, ni rappel de son inscription, ni lien de désinscription.' },
          ],
        },
        {
          id: "d13-revision-5-doc",
          number: 3,
          title: "Comparer deux sources de trafic selon l’objectif",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Source",
                "Visites vers la fiche",
                "Achats attribués",
                "Coût de diffusion"
              ],
              rows: [
                [
                  "Publication sponsorisée",
                  "300",
                  "6",
                  "36 €"
                ],
                [
                  "Lettre du magasin",
                  "120",
                  "9",
                  "18 €"
                ]
              ]
            },
            {
              type: "p",
              text: "L’objectif de la semaine est de produire des achats à coût maîtrisé. La lettre et la publication ont utilisé des liens de suivi distincts. Les visiteurs n’ont pas été répartis aléatoirement."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd13-m5-a1',
          kind: 'fields',
          label: 'Annexe',
          title: 'Vérifier le brouillon',
          instructions: 'Pour chaque exigence, indique si elle est respectée.',
          helps: ['Compare chaque ligne au brouillon.', 'Lis la note en bas du brouillon.', 'Trois exigences ne sont pas respectées.'],
          outcomeIds: R1,
          layout: 'checklist',
          fields: NEWSLETTER.map(([id, label, answer]): Field => ({ id, label, kind: 'choice', options: OUI_NON, answer, explain: answer === 'oui' ? 'Respecté.' : 'À ajouter avant l’envoi.' })),
        },
        {
          id: 'd13-m5-a2',
          kind: 'fields',
          label: 'Corrections',
          title: 'Proposer les corrections du brouillon',
          instructions: 'Rédige les trois corrections à apporter avant l’envoi.',
          helps: ['Reprends les « Non » de ta vérification.', 'Une phrase par correction.', 'Sans lien de désinscription, l’envoi n’est pas conforme.'],
          outcomeIds: R1,
          fields: [
            w('inscrit', 'Correction 1', 'Ajouter en haut : « Vous recevez cette newsletter car vous vous êtes inscrit sur notre site. »', ['Rappel de l’inscription.'], 2),
            w('desinscription', 'Correction 2', 'Ajouter en bas un lien « Se désinscrire » bien visible.', ['Lien de désinscription.'], 2),
            w('perso', 'Correction 3', 'Personnaliser l’édito avec le prénom de l’abonné : « Chère Angèle, ».', ['Personnalisation.'], 2),
          ],
        },
        {
          id: "d13-revision-5",
          label: "Annexe complémentaire",
          title: "Comparer deux sources de trafic selon l’objectif",
          instructions: "Lis le document 3. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Ne choisis pas à partir du seul volume de visites.",
            "Relis le document 3 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "18 ÷ 9 = 2 € par achat."
          ],
          outcomeIds: [
            "d13-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Quel coût par achat obtient-on avec la lettre ?",
              kind: "number",
              answer: 2,
              explain: "18 ÷ 9 = 2 € par achat."
            },
            {
              id: "q2",
              label: "Rédige le conseil et une limite de comparaison.",
              kind: "written",
              lines: 3,
              model: "Privilégier la lettre pour le prochain essai d’achat, avec 2 € par achat contre 6 € pour la publication. Les publics sont différents, donc vérifier le résultat lors d’une autre campagne avant d’en faire une règle."
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
          id: 'd13-s-a1',
          kind: 'fields',
          label: 'Synthèse',
          title: 'Complète la synthèse',
          instructions: 'Complète les deux parties de la synthèse.',
          helps: ['Réseaux sociaux : choisir, créer une communauté, publier, proposer des jeux-concours.', 'Site : visibilité, conversion, trafic, e-réputation.', 'Followers = abonnés.'],
          outcomeIds: R1,
          fields: [
            { id: 'communaute', label: '1-2. Après avoir sélectionné les réseaux, il faut…', kind: 'choice', options: [{ value: 'a', label: 'Développer sa communauté (followers, abonnés)' }, { value: 'b', label: 'Fermer son site' }], answer: 'a', explain: 'Étape 2.' },
            { id: 'publier', label: '1-2. Exemple de contenu à publier', kind: 'choice', options: [{ value: 'a', label: 'Photos de produits, conseils, vidéos, actualités' }, { value: 'b', label: 'Les factures fournisseurs' }], answer: 'a', explain: 'Étape 3.' },
            { id: 'objectifs', label: '1-2. Likes, partages, commentaires visent à… (plusieurs réponses)', kind: 'multi', options: [{ value: 'visibilite', label: 'Augmenter la visibilité de l’entreprise' }, { value: 'clientele', label: 'Développer sa clientèle' }, { value: 'prix', label: 'Augmenter les prix' }], answers: ['visibilite', 'clientele'], explain: 'Objectifs.' },
            { id: 'sea', label: '3-5. Référencement payant :', kind: 'text', accept: ['SEA'], explain: 'SEA.' },
            { id: 'seo', label: '3-5. Référencement naturel :', kind: 'text', accept: ['SEO'], explain: 'SEO.' },
            { id: 'conversion', label: '3-5. Améliorer la conversion :', kind: 'choice', options: [{ value: 'a', label: 'Relancer les paniers abandonnés par courriel' }, { value: 'b', label: 'Supprimer le panier' }], answer: 'a', explain: 'Relance.' },
            { id: 'trafic', label: '3-5. Générer du trafic :', kind: 'choice', options: [{ value: 'a', label: 'Proposer l’inscription à la newsletter pour collecter des contacts' }, { value: 'b', label: 'Envoyer des messages sans consentement' }], answer: 'a', explain: 'Newsletter avec consentement.' },
          ],
        },
        {
          id: 'd13-s-quiz',
          kind: 'fields',
          label: 'Quiz',
          title: 'Quiz du dossier',
          instructions: 'Six questions rapides.',
          helps: ['Relis la fiche de révision.', 'SEO = naturel ; SEA = payant.', 'La viralité est la diffusion rapide d’un contenu.'],
          outcomeIds: R1,
          fields: [
            { id: 'q1', label: 'La communauté d’une marque, c’est…', kind: 'choice', options: [{ value: 'a', label: 'L’ensemble de ses abonnés' }, { value: 'b', label: 'Ses salariés' }], answer: 'a', explain: 'Abonnés.' },
            { id: 'q2', label: 'Le référencement naturel se nomme…', kind: 'choice', options: [{ value: 'seo', label: 'SEO' }, { value: 'sea', label: 'SEA' }], answer: 'seo', explain: 'Search Engine Optimization.' },
            num('q3', '300 paniers abandonnés, conversion de 5 % : validations ?', 15, '300 × 5 % = 15.', 'paniers'),
            { id: 'q4', label: 'Une newsletter doit toujours contenir…', kind: 'choice', options: [{ value: 'a', label: 'Un lien de désinscription' }, { value: 'b', label: 'Un code promotionnel' }], answer: 'a', explain: 'Obligation.' },
            { id: 'q5', label: 'Le reciblage publicitaire (retargeting) consiste à…', kind: 'choice', options: [{ value: 'a', label: 'Montrer une publicité à un internaute qui a déjà visité le site' }, { value: 'b', label: 'Envoyer un catalogue papier' }], answer: 'a', explain: 'Faire revenir le visiteur.' },
            { id: 'q6', label: 'Face à un avis négatif, il faut…', kind: 'choice', options: [{ value: 'a', label: 'S’excuser, comprendre et proposer une solution' }, { value: 'b', label: 'Ignorer l’avis' }], answer: 'a', explain: 'Montrer qu’on s’implique.' },
          ],
        },
      ],
      synthesis: [
        { title: 'Notions essentielles', kind: 'notions', items: ['Choisir les réseaux sociaux selon la cible et les objectifs.', 'Communauté, abonnés, publications, hashtags, jeux-concours, viralité.', 'Référencement payant (SEA) et naturel (SEO), mots-clés.', 'Taux de conversion, relance des paniers abandonnés, reciblage publicitaire.', 'Newsletter : générer du trafic et collecter des contacts.', 'E-réputation : réputation en ligne, réponses aux avis.'] },
        { title: 'Méthodes', kind: 'methodes', items: ['Analyser une publication : contenu adapté à la cible, hashtags pertinents.', 'Choisir des mots-clés précis, liés aux produits.', 'Calculer des conversions : abandons × taux.', 'Répondre à un avis négatif : s’excuser, comprendre, proposer, remercier.'] },
        { title: 'Erreurs fréquentes', kind: 'erreurs', items: ['Publier des contenus sans lien avec l’activité.', 'Utiliser des hashtags trop généraux.', 'Oublier le lien de désinscription.', 'Laisser des fautes d’orthographe dans un message client.'] },
        { title: 'Bonnes pratiques professionnelles', kind: 'pratiques', items: ['Publier régulièrement et répondre aux commentaires.', 'Automatiser les relances de paniers.', 'Surveiller les avis en ligne chaque semaine.'] },
        { title: 'Mots-clés', kind: 'mots-cles', items: ['Réseaux sociaux', 'Communauté', 'Publication', 'Référencement', 'Panier abandonné', 'Newsletter', 'E-réputation'] },
        {
          title: "Les réflexes à retenir des nouveaux cas",
          kind: "pratiques",
          items: [
            "Choisis un canal selon le public et l’action attendue, puis définis comment les relier.",
            "Le référencement répond à une recherche. La conversion mesure le passage à une action définie.",
            "Un tableau de suivi doit préciser le dénominateur et la période de chaque taux."
          ]
        },
      ],
    },
    {
      id: 'application-1',
      kind: 'application',
      number: 1,
      title: 'Organiser un jeu-concours sur un réseau social',
      guidance: 'autonome',
      hero: { id: 'd13-smartphone', alt: 'Mains tenant un smartphone dans une boutique de réparation' },
      message: { from: 'Yannick Fabre', role: 'Responsable, boutique Répar’Phone', text: ['Nous réparons et vendons des smartphones reconditionnés. Je veux attirer les jeunes du lycée voisin grâce à un jeu-concours sur notre réseau de photos. Aide-moi à l’organiser.'] },
      documents: [
        { id: 'd13-a1-doc1', number: 1, title: 'Les types de jeux-concours', look: 'texte', blocks: [{ type: 'list', items: ['Jeu « simple » : aimer, partager, commenter ou identifier des amis, puis tirage au sort. Très viral et simple.', 'Concours photo ou vidéo : les participants publient une création, les votes désignent les gagnants. Forte viralité.', 'Quiz, test, roue de la fortune : un lien vers le site augmente le trafic.'] }] },
      ],
      activities: [
        {
          id: 'd13-a1-a1',
          kind: 'fields',
          label: '1-2',
          title: 'Intérêt et modalités du jeu-concours',
          instructions: 'Réponds, puis choisis les modalités du jeu.',
          helps: ['Un jeu-concours augmente la visibilité et la communauté.', 'Pour des lycéens, un jeu simple et viral.', 'Toujours un lien vers le site et un cadeau attractif.'],
          outcomeIds: R1,
          fields: [
            { id: 'interet', label: '1. Intérêt pour la boutique (plusieurs réponses)', kind: 'multi', options: [{ value: 'abonnes', label: 'Gagner des abonnés' }, { value: 'visibilite', label: 'Augmenter la visibilité' }, { value: 'contacts', label: 'Générer des contacts' }, { value: 'prix', label: 'Augmenter les prix' }], answers: ['abonnes', 'visibilite', 'contacts'], explain: 'Objectifs d’un jeu-concours.' },
            { id: 'type', label: '2. Type de jeu', kind: 'choice', options: [{ value: 'simple', label: 'Jeu simple avec tirage au sort' }, { value: 'quiz', label: 'Quiz de 50 questions' }], answer: 'simple', explain: 'Simple et viral pour des lycéens.' },
            { id: 'modalites', label: '3. Modalités (plusieurs réponses)', kind: 'multi', options: [{ value: 'aimer', label: 'Faire aimer la publication' }, { value: 'taguer', label: 'Identifier deux amis' }, { value: 'abonner', label: 'S’abonner au compte' }, { value: 'lien', label: 'Lien vers le site' }, { value: 'tirage', label: 'Tirage au sort avec une coque et des écouteurs à gagner' }], answers: ['aimer', 'taguer', 'abonner', 'lien', 'tirage'], explain: 'Toutes ces modalités renforcent la viralité.' },
          ],
        },
        {
          id: 'd13-a1-a2',
          kind: 'fields',
          label: '2 (détails)',
          title: 'Détailler l’opération',
          instructions: 'Rédige les détails du jeu-concours : texte de la publication, durée, cadeau, règlement.',
          helps: ['Le texte annonce le cadeau et les modalités en 3 lignes.', 'Une durée courte (1 à 2 semaines) crée l’urgence.', 'Le règlement précise les dates, le tirage au sort et l’annonce du gagnant.'],
          outcomeIds: R1,
          fields: [
            w('texte', 'Texte de la publication', 'Gagnez une coque et des écouteurs ! Aimez ce post, abonnez-vous et identifiez deux amis. Tirage au sort vendredi 18 h.', ['Cadeau + modalités.'], 3),
            w('duree', 'Durée et date du tirage', 'Du lundi au vendredi de la même semaine ; tirage au sort vendredi à 18 h en direct.', ['Dates précises.'], 2),
            w('reglement', 'Règlement (points essentiels)', 'Jeu gratuit, une participation par personne, gagnant annoncé en commentaire et contacté par message, lot à retirer en boutique.', ['Au moins trois règles.'], 3),
          ],
        },
      ],
      selfAssessment: ['Je sais organiser un jeu-concours sur un réseau social.'],
    },
    {
      id: 'application-2',
      kind: 'application',
      number: 2,
      title: 'Soigner son e-réputation',
      guidance: 'autonome',
      hero: { id: 'd13-chaussures', alt: 'Vendeuse souriante tenant des boîtes de chaussures' },
      message: { from: 'Virginie Morand', role: 'Cogérante, boutique Pas de Côté', text: ['À notre retour de vacances, nous avons découvert des commentaires négatifs sur les réseaux et sur notre fiche de moteur de recherche. Aide-nous à réagir.'] },
      documents: [
        { id: 'd13-a2-doc1', number: 1, title: 'Le poids des avis', look: 'texte', blocks: [{ type: 'p', text: 'La grande majorité des internautes consultent les avis avant d’acheter et y font confiance. Beaucoup renoncent à un achat après un avis négatif. Face à un avis négatif, il faut s’excuser, poser des questions, apporter une solution et chercher à s’améliorer ; il faut aussi remercier pour les avis positifs.' }] },
        { id: 'd13-a2-doc2', number: 2, title: 'Les commentaires', look: 'texte', blocks: [{ type: 'quote', author: 'Commentaire 1', text: 'J’ai toujours adoré ce magasin, mais ma dernière visite a été décevante : le nouveau responsable n’était pas à la hauteur.' }, { type: 'quote', author: 'Commentaire 2', text: 'Attente interminable en caisse, un seul vendeur. Heureusement, le choix est toujours incroyable.' }, { type: 'quote', author: 'Avis 4/5', text: 'Déco sympa et les meilleures marques. Je recommande !' }, { type: 'note', text: 'Note moyenne sur le moteur de recherche : 3,3/5 (48 avis).' }] },
      ],
      activities: [
        {
          id: 'd13-a2-a1',
          kind: 'fields',
          label: '1-2',
          title: 'Mesurer l’impact',
          instructions: 'Réponds à l’aide des documents.',
          helps: ['Un avis négatif fait renoncer à l’achat.', 'Une note de 3,3 est moyenne.', 'Le nombre d’avis compte aussi.'],
          outcomeIds: R1,
          fields: [
            { id: 'impact', label: '1. Impact de ces commentaires', kind: 'choice', options: [{ value: 'a', label: 'Perte de clients potentiels et d’image' }, { value: 'b', label: 'Aucun impact' }], answer: 'a', explain: 'Les avis influencent l’achat.' },
            { id: 'note', label: '2. La note de 3,3/5 est…', kind: 'choice', options: [{ value: 'a', label: 'Moyenne : elle peut freiner de nouveaux clients' }, { value: 'b', label: 'Excellente' }], answer: 'a', explain: 'À améliorer.' },
          ],
        },
        {
          id: 'd13-a2-a2',
          kind: 'open',
          label: '3',
          title: 'Répondre aux commentaires',
          instructions: 'Rédige une réponse à chacun des trois commentaires.',
          helps: ['Commentaires négatifs : s’excuser, expliquer, proposer une solution.', 'Avis positif : remercier chaleureusement.', 'Ton courtois, jamais agressif.'],
          outcomeIds: R1,
          prompts: [
            { id: 'r1', label: 'Réponse au commentaire 1', lines: 4 },
            { id: 'r2', label: 'Réponse au commentaire 2', lines: 4 },
            { id: 'r3', label: 'Réponse à l’avis positif', lines: 2 },
          ],
          selfCheck: ['Chaque réponse est personnalisée.', 'Les réponses négatives contiennent excuses et solution.', 'Aucune faute.'],
        },
      ],
      selfAssessment: ['Je sais répondre aux avis pour protéger l’e-réputation.'],
    },
    {
      id: 'application-3',
      kind: 'application',
      number: 3,
      title: 'Améliorer son taux de conversion grâce au reciblage',
      guidance: 'autonome',
      message: { from: 'Clémence Arnaud', role: 'Fondatrice, Bijoux d’Écume (bijoux fantaisie en ligne)', text: ['Pour améliorer notre taux de conversion, je m’intéresse au reciblage publicitaire. Aide-moi à en comprendre le principe.'] },
      documents: [
        { id: 'd13-a3-doc1', number: 1, title: 'Le reciblage publicitaire', look: 'texte', blocks: [{ type: 'p', text: 'Le reciblage (« retargeting » en anglais) consiste à afficher des publicités ciblées à des internautes qui ont déjà visité un site, pendant qu’ils naviguent ailleurs : sur un réseau social, dans le fil d’actualité ou sur le côté de l’écran. Un petit fichier enregistré lors de la visite permet de les reconnaître.' }] },
        {
          id: "d13-revision-6-doc",
          number: 2,
          title: "Choisir une campagne pour un atelier de réparation",
          look: "fiche",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Un atelier vélo souhaite obtenir des réservations de diagnostic. En sept jours, une courte vidéo apporte 240 visites et 12 réservations pour 48 €. Une lettre à la clientèle apporte 80 visites et 8 réservations pour 16 €. Sur mobile, trois testeurs sur cinq ne trouvent pas le bouton de réservation sans défiler."
            }
          ]
        },
        {
          id: "d13-revision-dossier-doc1",
          number: 3,
          title: "Résultats de deux canaux sur sept jours",
          look: "fiche",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Canal",
                "Visites sur la fiche",
                "Ajouts",
                "Achats attribués",
                "Coût direct de diffusion"
              ],
              rows: [
                [
                  "Réseau photo",
                  "400",
                  "80",
                  "16",
                  "64 €"
                ],
                [
                  "Lettre aux abonnés",
                  "160",
                  "48",
                  "12",
                  "12 €"
                ]
              ]
            },
            {
              type: "p",
              text: "Marge moyenne de 5 € par achat avant diffusion. L’attribution correspond au dernier lien de campagne repéré. Les personnes peuvent avoir vu plusieurs messages."
            }
          ]
        },
        {
          id: "d13-revision-dossier-doc2",
          number: 4,
          title: "Observations sur le parcours",
          look: "fiche",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "La campagne renvoie vers une fiche d’infusion. Quatre testeurs sur six cherchent le montant de livraison avant d’ajouter au panier. La fiche a un titre vague, alors que les recherches internes mentionnent souvent « infusion verveine citron »."
            }
          ]
        },
        {
          id: "d13-revision-dossier-doc3",
          number: 5,
          title: "Résultat du changement de fiche",
          look: "courriel",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Pour le réseau photo, la nouvelle semaine donne 300 visites, 75 ajouts, 18 achats et un coût de 60 €. Le titre a été précisé et l’information sur la livraison a été déplacée au même moment. La lettre n’a pas été envoyée cette semaine."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd13-a3-a1',
          kind: 'fields',
          label: '1-3',
          title: 'Comprendre le reciblage',
          instructions: 'Réponds et remets les étapes dans l’ordre.',
          helps: ['Retargeting = reciblage publicitaire.', 'L’objectif est de faire revenir le visiteur.', 'Visite → départ → publicité → retour.'],
          outcomeIds: R1,
          fields: [
            { id: 'trad', label: '1. Traduction de « retargeting »', kind: 'text', accept: ['reciblage', 'reciblage publicitaire', 'le reciblage'], explain: 'Reciblage publicitaire.' },
            { id: 'objectif', label: '2. Objectif', kind: 'choice', options: [{ value: 'a', label: 'Faire revenir sur le site des visiteurs qui n’ont pas acheté' }, { value: 'b', label: 'Supprimer les cookies' }], answer: 'a', explain: 'Améliorer la conversion.' },
            ...(() => {
              const steps = [
                ['visite', 'Des visiteurs consultent le site sans acheter'],
                ['quitte', 'Ils quittent le site et continuent leur navigation'],
                ['pub', 'Une publicité du site leur est affichée ailleurs'],
                ['retour', 'En cliquant, ils reviennent sur le site et achètent'],
              ];
              const options = [...steps].sort((a, b) => a[1].localeCompare(b[1], 'fr')).map(([value, label]) => ({ value, label }));
              return steps.map(([value], i): Field => ({ id: `e${i + 1}`, label: `3. Étape ${i + 1}`, kind: 'choice', select: true, options, answer: value, explain: steps[i][1] + '.' }));
            })(),
          ],
        },
        {
          id: 'd13-a3-a2',
          kind: 'fields',
          label: '4',
          title: 'Mettre en place le reciblage',
          instructions: 'Réponds par écrit.',
          helps: ['Le reciblage doit respecter le consentement aux cookies.', 'Une publicité trop répétée agace.', 'Montrer le produit consulté, avec un avantage.'],
          outcomeIds: R1,
          fields: [
            w('conditions', 'Quelle condition légale faut-il respecter ?', 'Recueillir le consentement de l’internaute aux cookies publicitaires avant de le recibler.', ['Je cite le consentement.'], 2),
            w('message', 'Quelle publicité proposer à un visiteur qui a regardé des boucles d’oreilles ?', 'Une publicité montrant les boucles d’oreilles consultées, avec la livraison offerte pendant 48 heures.', ['Produit consulté + avantage.'], 2),
          ],
        },
        {
          id: "d13-revision-6",
          label: "Nouveau cas d’application",
          title: "Choisir une campagne pour un atelier de réparation",
          instructions: "Lis le document 2. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Compare les campagnes selon la réservation et identifie un frein commun à traiter.",
            "Relis le document 2 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "8 ÷ 80 × 100 = 10 %."
          ],
          outcomeIds: [
            "d13-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Quel taux de réservation obtient la lettre en pourcentage ?",
              kind: "number",
              answer: 10,
              explain: "8 ÷ 80 × 100 = 10 %."
            },
            {
              id: "q2",
              label: "Quel coût par réservation obtient la vidéo en euros ?",
              kind: "number",
              answer: 4,
              explain: "48 ÷ 12 = 4 €."
            },
            {
              id: "q3",
              label: "Rédige la décision de la semaine suivante.",
              kind: "written",
              lines: 3,
              model: "Rejouer la lettre pour l’objectif de coût, puisqu’elle donne 2 € par réservation et un taux de 10 %. Remonter le bouton sur mobile pour les deux canaux et suivre les réservations à l’aide de liens distincts."
            }
          ]
        },
        {
          id: "d13-revision-dossier",
          label: "Dossier de décision",
          title: "Développer les ventes sans confondre trafic, attribution et rentabilité",
          instructions: "Lis les documents 3 et 4, puis écris ton diagnostic initial. Passe ensuite au document 5 pour revoir ta décision. Note tes calculs et les faits qui justifient chaque choix dans les zones de réponse. Après avoir répondu, clique sur « Vérifier mes réponses » pour comparer avec les propositions de corrigé.",
          kind: "fields",
          helps: [
            "Sépare les mesures d’audience, le coût d’acquisition et la contribution après diffusion. Garde les mêmes dénominateurs entre les périodes.",
            "Calcule pour chaque canal les achats divisés par les visites, les frais divisés par les achats et la marge totale moins les frais de diffusion.",
            "Exemple. 5 achats sur 100 visites donnent 5 %. Avec 20 € de frais, le coût par achat est 4 €. Si chaque achat apporte 6 € de marge avant diffusion, la contribution directe vaut 5 × 6 − 20 = 10 €."
          ],
          outcomeIds: [
            "d13-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Compare les deux canaux initiaux avec taux d’achat, coût par achat et contribution directe.",
              kind: "written",
              lines: 6,
              model: "Réseau photo, 4 % d’achat, 4 € par achat et 16 × 5 − 64 = 16 € de contribution. Lettre, 7,5 %, 1 € par achat et 12 × 5 − 12 = 48 €. La lettre est plus rentable dans ce relevé, pour un public différent."
            },
            {
              id: "q2",
              label: "Propose deux améliorations précises, chacune avec son indicateur.",
              kind: "written",
              lines: 6,
              model: "Titre « Infusion verveine-citron » pour répondre à la recherche, suivi des accès depuis les recherches pertinentes. Affichage des modalités de livraison avant l’ajout, suivi du taux achat parmi les ajouts et des retours de test."
            },
            {
              id: "q3",
              label: "Compare les deux semaines du réseau photo.",
              kind: "written",
              lines: 6,
              model: "Le taux d’achat passe de 4 % à 6 %, le coût par achat de 4 € à environ 3,33 € et la contribution de 16 € à 30 €. L’achat après ajout passe de 20 % à 24 %. Le titre et la livraison ont changé ensemble et le volume de visites diffère."
            },
            {
              id: "q4",
              label: "Écris une décision de campagne et un plan de vérification de l’attribution.",
              kind: "written",
              lines: 6,
              model: "Relancer la lettre sur le public prévu et tester le réseau photo à budget proche. Utiliser des liens distincts et garder les mêmes règles de suivi. Tester séparément un changement de titre ou de livraison. Interpréter le dernier clic comme une règle de mesure, pas comme la preuve qu’un seul message a déclenché l’achat."
            }
          ]
        },
      ],
      selfAssessment: ['Je sais expliquer le principe du reciblage publicitaire.',
        "Je compare la conversion, le coût d’acquisition et la contribution.",
        "Je propose une mesure distincte pour chaque modification du parcours.",
        "Je formule la limite de l’attribution au dernier clic."],
    },
    {
      id: 'bilan',
      kind: 'bilan',
      title: 'Évaluez votre réussite',
      documents: [],
      activities: [],
      selfAssessment: [
        'Je sais choisir des réseaux sociaux adaptés à une cible.',
        'Je sais publier et développer une communauté.',
        'Je sais expliquer le référencement et choisir des mots-clés.',
        'Je sais améliorer la conversion et générer du trafic.',
        'Je sais soigner l’e-réputation d’une entreprise.',
      ],
    },
  ],
};

function fr1(n: number) {
  return n.toLocaleString('fr-FR', { maximumFractionDigits: 1 });
}
