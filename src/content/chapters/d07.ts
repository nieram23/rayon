import type { Chapter, ChoiceOption, Field } from '../../domain/chapter';

/**
 * DOSSIER 7 — Gérer les retours et les échanges des clients
 *
 * Progression calquée sur le manuel de référence (contexte, 4 missions, synthèse, 4 applications).
 * Sites, enseignes, personnages, documents et chiffres : ORIGINAUX et fictifs.
 * Les règles légales (rétractation de 14 jours, garantie légale de conformité, RGPD, mentions légales) sont
 * présentées de façon simplifiée. Les décisions de remboursement sont calculées à partir des règles, puis testées.
 */

const R1 = ['d07-r1']; // Les axes d'amélioration proposés sont réalisables.

export const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const fr = (n: number, d = 2) => n.toLocaleString('fr-FR', { minimumFractionDigits: Number.isInteger(n) ? 0 : d, maximumFractionDigits: d });
const eur = (n: number) => `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const num = (id: string, label: string, answer: number, explain: string, unit?: string, tolerance?: number): Field => ({ id, label, kind: 'number', answer, explain, unit, tolerance });

const OUI_NON: ChoiceOption[] = [
  { value: 'oui', label: 'Oui' },
  { value: 'non', label: 'Non' },
];

/** Nombre de jours entre deux dates « jj/mm », la seconde pouvant être l'année suivante. */
export function daysBetween(from: string, to: string): number {
  const [d1, m1] = from.split('/').map(Number);
  const [d2, m2] = to.split('/').map(Number);
  const y2 = m2 < m1 || (m2 === m1 && d2 < d1) ? 2027 : 2026;
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(2026, m1 - 1, d1)) / 86400000);
}

/* =============================== Mission 2 : demandes de retour =============================== */

export const DELAI_LEGAL = 14;
export const DELAI_COMMERCIAL = 60;
export const MOTIFS: ChoiceOption[] = [
  { value: 'retractation', label: 'Rétractation dans les 14 jours : article et livraison remboursés' },
  { value: 'commercial', label: 'Retour sous 60 jours : article remboursé, livraison non remboursée' },
  { value: 'conformite', label: 'Article défectueux : garantie légale de conformité' },
  { value: 'hors-delai', label: 'Refus : délai de 60 jours dépassé' },
  { value: 'hygiene', label: 'Refus : produit d’hygiène ouvert et utilisé' },
  { value: 'porte', label: 'Refus : article porté, abîmé par le client' },
];

interface Demande {
  id: string;
  nom: string;
  livraison: string;
  demande: string;
  article: string;
  motif: string;
  valeur: number;
  port: number;
  /** Constat du service Réception. */
  constat: string;
  defaut?: boolean;
  hygiene?: boolean;
  porte?: boolean;
  echange?: boolean;
}
const RAW_DEMANDES: Demande[] = [
  { id: 'noel', nom: 'Noël', livraison: '10/11', demande: '20/03', article: 'T-shirt, réf. TS28', motif: 'Trop grand', valeur: 25, port: 0, constat: 'Article neuf, étiquettes présentes' },
  { id: 'dufranne', nom: 'Dufranne', livraison: '09/11', demande: '12/11', article: 'Sérum visage, réf. SV32', motif: 'Produit inefficace', valeur: 19.95, port: 3.9, constat: 'Flacon ouvert, utilisé aux trois quarts', hygiene: true },
  { id: 'nicolas', nom: 'Nicolas', livraison: '12/11', demande: '05/12', article: 'Chemise, réf. CH26', motif: 'N’aime pas la couleur', valeur: 20, port: 3.9, constat: 'Article neuf, étiquettes présentes' },
  { id: 'siou', nom: 'Siou', livraison: '13/11', demande: '17/11', article: 'Jean, réf. JN35', motif: 'Trop petit', valeur: 59, port: 0, constat: 'Article neuf. La cliente demande un échange contre la taille au-dessus', echange: true },
  { id: 'diagne', nom: 'Diagne', livraison: '14/11', demande: '30/11', article: 'Baskets, réf. BK89', motif: 'Semelle décollée', valeur: 79, port: 0, constat: 'La semelle est décollée : défaut de fabrication', defaut: true },
  { id: 'soigneux', nom: 'Soigneux', livraison: '15/11', demande: '20/11', article: 'Pull pure laine, réf. PL38', motif: 'Pull rétréci au lavage à 90 °C', valeur: 65, port: 0, constat: 'Pull lavé et totalement déformé', porte: true },
  { id: 'leroy', nom: 'Leroy', livraison: '02/12', demande: '08/12', article: 'Robe, réf. RB14', motif: 'Ne lui va pas', valeur: 22, port: 3.9, constat: 'Article neuf, étiquettes présentes' },
];
export const DEMANDES = RAW_DEMANDES.map((d) => {
  const jours = daysBetween(d.livraison, d.demande);
  let motifCode: string;
  if (d.defaut) motifCode = 'conformite';
  else if (d.hygiene) motifCode = 'hygiene';
  else if (d.porte) motifCode = 'porte';
  else if (jours > DELAI_COMMERCIAL) motifCode = 'hors-delai';
  else if (jours <= DELAI_LEGAL) motifCode = 'retractation';
  else motifCode = 'commercial';
  const accord = ['retractation', 'commercial', 'conformite'].includes(motifCode);
  const montant = motifCode === 'retractation' || motifCode === 'conformite' ? r2(d.valeur + d.port) : motifCode === 'commercial' ? d.valeur : 0;
  return { ...d, jours, motifCode, accord, montant };
});

/* =============================== Application 2 : retours boutique =============================== */

export const FRAIS_POSTE = 4.9;
export const RETOURS_APP2 = [
  { id: 'bourekba', nom: 'Bourekba', recu: '10/03', retour: '17/03', article: 'T-shirt', comment: 'T-shirt taché, déjà porté', prix: 34.9, poste: false, bon: true, porte: true },
  { id: 'derveaux', nom: 'Derveaux', recu: '08/04', retour: '11/04', article: 'Robe longue', comment: '—', prix: 59.9, poste: false, bon: true, porte: false },
  { id: 'charlet', nom: 'Charlet', recu: '10/04', retour: '13/04', article: 'Blouson', comment: 'Renvoyé par La Poste', prix: 159.9, poste: true, bon: true, porte: false },
  { id: 'verove', nom: 'Verove', recu: '15/04', retour: '19/04', article: 'Doudoune', comment: 'Colis sans bon de retour ni demande écrite', prix: 99.9, poste: false, bon: false, porte: false },
  { id: 'amoudou', nom: 'Amoudou', recu: '18/04', retour: '05/05', article: 'Jupe', comment: '—', prix: 29.9, poste: false, bon: true, porte: false },
].map((r) => {
  const jours = daysBetween(r.recu, r.retour);
  const raison = jours > 14 ? 'delai' : !r.bon ? 'bon' : r.porte ? 'porte' : 'ok';
  const accord = raison === 'ok';
  return { ...r, jours, raison, accord, montant: accord ? r2(r.prix - (r.poste ? FRAIS_POSTE : 0)) : 0 };
});

/* ================================================================================== */

export const D07: Chapter = {
  unitId: 'd07',
  mission:
    "Chez Modalia, les conseillers reçoivent des demandes de remboursement, d’échange et de suivi. Tu audites le parcours, qualifies les demandes à partir des documents et proposes une réponse précise. La responsable attend aussi une mesure pour réduire les retours évitables.",
  fictionNotice: 'Modalia, les autres sites et boutiques, leurs personnages et tous les chiffres de ce dossier sont imaginaires. Les règles légales sont présentées de façon simplifiée.',
  company: {
    name: 'Modalia — site marchand de mode',
    tagline: 'Vêtements, chaussures et accessoires en ligne',
    facts: [
      ['Ton poste', 'Élève en PFMP, service Retours'],
      ['Ton tuteur', 'Hugo Ferrand, responsable du service Retours'],
      ['Le service phare', '« Essayez d’abord, payez ensuite »'],
    ],
  },
  steps: [
    /* ================================ CONTEXTE ================================ */
    {
      id: 'ouverture',
      kind: 'ouverture',
      title: "Traiter les retours et améliorer le parcours client",
      hero: { id: 'd07-hero', alt: 'Personne consultant un site de vêtements sur un ordinateur portable, colis à côté' },
      message: {
        from: 'Hugo Ferrand',
        role: 'Responsable du service Retours, Modalia',
        text: [
          'Bienvenue au service Retours ! C’est un service stratégique : plus le retour est simple, plus nos clients reviennent commander.',
          'Notre formule « Essayez d’abord, payez ensuite » fait grimper les ventes, mais aussi le nombre de retours. Commence par découvrir l’entreprise.',
        ],
      },
      documents: [
        {
          id: "d07-revision-reperes",
          number: 2,
          title: "Trois repères pour commencer",
          look: "memo",
          blocks: [
            {
              type: "list",
              items: [
                "Commence par identifier la commande, le canal d’achat, le produit, la date, le motif et la preuve disponible.",
                "Distingue le droit applicable, la politique commerciale du magasin et la décision déjà validée sur un dossier. Appuie-toi sur les documents de la situation.",
                "Dans une réponse client, dis ce qui est confirmé, indique la prochaine action et donne l’échéance prévue."
              ]
            }
          ]
        },
        {
          id: 'd07-o-doc1',
          number: 1,
          title: 'Modalia en bref',
          look: 'article',
          blocks: [
            { type: 'p', text: 'Modalia est un site marchand français spécialisé dans la mode : plus de 1 500 marques de vêtements, de chaussures et d’accessoires, livrées en 48 heures en France et en Belgique.' },
            {
              type: 'facts',
              items: [
                ['Société', 'Modalia SAS, au capital de 2 400 000 €'],
                ['Siège', '12 quai des Chartrons, 33000 Bordeaux'],
                ['Activité', 'Vente à distance d’articles de mode'],
                ['Concurrents', 'Grands sites de mode en ligne, enseignes de prêt-à-porter qui vendent en ligne'],
              ],
            },
          ],
        },
      ],
      activities: [
        {
          id: 'd07-o-a1',
          kind: 'fields',
          label: 'Annexe',
          title: 'Fiche d’identité de l’entreprise',
          instructions: 'Complète la fiche d’identité à l’aide du document 1.',
          helps: ['Toutes les réponses sont dans le document 1.', 'Une entreprise qui vend uniquement en ligne est un « pure player ».', 'SAS = société par actions simplifiée.'],
          outcomeIds: R1,
          fields: [
            { id: 'raison', label: 'Raison sociale', kind: 'text', accept: ['Modalia SAS', 'Modalia'], placeholder: 'Nom de la société', explain: 'Modalia SAS.' },
            { id: 'activite', label: 'Activité', kind: 'choice', options: [{ value: 'vad', label: 'Vente à distance d’articles de mode' }, { value: 'fabrication', label: 'Fabrication de vêtements' }, { value: 'transport', label: 'Transport de colis' }], answer: 'vad', explain: 'Site marchand de mode.' },
            { id: 'type', label: 'Type de commerce', kind: 'choice', options: [{ value: 'pure', label: 'Commerce en ligne uniquement (pure player)' }, { value: 'magasin', label: 'Magasin physique avec site' }, { value: 'franchise', label: 'Franchise' }], answer: 'pure', explain: 'Modalia vend uniquement en ligne.' },
            { id: 'forme', label: 'Forme juridique', kind: 'given', value: 'SAS (société par actions simplifiée)' },
            { id: 'loc', label: 'Localisation du siège', kind: 'text', accept: ['Bordeaux', 'quai des Chartrons Bordeaux'], placeholder: 'Ville', explain: '12 quai des Chartrons, Bordeaux.' },
            { id: 'conc', label: 'Concurrents', kind: 'given', value: 'Grands sites de mode en ligne, enseignes qui vendent en ligne' },
          ],
        },
        {
          id: 'd07-o-a2',
          kind: 'fields',
          label: 'Questions',
          title: 'Pourquoi les clients retournent-ils un achat ?',
          instructions: 'Réponds avec tes connaissances.',
          helps: ['Pense à un achat en ligne qui ne t’a pas convenu.', 'Taille, aspect, défaut, changement d’avis…', 'Un client satisfait par un retour facile revient commander.'],
          outcomeIds: R1,
          fields: [
            {
              id: 'raisons',
              label: '1. Raisons pour lesquelles un client retourne un achat en ligne (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'taille', label: 'La taille ne convient pas' },
                { value: 'aspect', label: 'L’article ne ressemble pas à la photo' },
                { value: 'defaut', label: 'L’article est défectueux' },
                { value: 'avis', label: 'Il a changé d’avis' },
                { value: 'livraison', label: 'Il a été livré trop vite' },
              ],
              answers: ['taille', 'aspect', 'defaut', 'avis'],
              explain: 'Une livraison rapide n’est pas une raison de retour.',
            },
            { id: 'fidelite', label: '2. Quel lien entre la gestion des retours et la fidélisation ?', kind: 'choice', options: [{ value: 'a', label: 'Un retour simple et rapide rassure le client, qui commande à nouveau' }, { value: 'b', label: 'Les retours font fuir les clients fidèles' }, { value: 'c', label: 'Il n’y a aucun lien' }], answer: 'a', explain: 'La confiance née d’un retour bien géré fidélise.' },
          ],
        },
      ],
    },

    /* ================================ MISSION 1 ================================ */
    {
      id: 'mission-1',
      kind: 'mission',
      number: 1,
      title: 'Vérifier la conformité des mentions obligatoires sur le site marchand',
      guidance: 'guidé',
      message: {
        from: 'Hugo Ferrand',
        role: 'Responsable du service Retours',
        text: ['Avant de traiter les retours, familiarise-toi avec la réglementation de la vente à distance. Modalia doit être irréprochable. Vérifie que notre page « Mentions légales » (document 1) contient tout ce que la loi impose (documents 2 et 3).'],
      },
      documents: [
        {
          id: 'd07-m1-doc1',
          number: 1,
          title: 'Extrait du site : pied de page et mentions légales',
          look: 'site',
          url: 'modalia.example/mentions-legales',
          blocks: [
            { type: 'list', title: 'Pied de page', items: ['Aide et contact · Suivre ma commande · Retours et remboursements', 'Conditions générales de vente · Politique de confidentialité · Gérer mes cookies', 'Moyens de paiement : carte bancaire, PayPal, paiement en 3 fois'] },
            {
              type: 'facts',
              items: [
                ['Éditeur', 'Modalia SAS, au capital de 2 400 000 €'],
                ['Siège', '12 quai des Chartrons, 33000 Bordeaux'],
                ['Immatriculation', 'RCS Bordeaux 812 345 678'],
                ['TVA intracommunautaire', 'FR 45 812345678'],
                ['Contact', 'service-client@modalia.example · 05 56 00 12 34, du lundi au samedi'],
                ['Directrice de la publication', 'Claire Vasseur'],
              ],
            },
            { type: 'p', text: 'Données personnelles : vous pouvez consulter, rectifier ou supprimer vos données depuis votre compte, rubrique « Mes données ». À votre première visite, un bandeau vous permet d’accepter ou de refuser les cookies publicitaires.' },
          ],
        },
        {
          id: 'd07-m1-doc2',
          number: 2,
          title: 'Les mentions obligatoires d’un site marchand',
          look: 'texte',
          blocks: [
            { type: 'p', text: 'La loi pour la confiance dans l’économie numérique (2004) impose des mentions légales sur tout site professionnel.' },
            {
              type: 'table',
              head: ['Rubrique', 'Contenu obligatoire'],
              rows: [
                ['Identification', 'Raison sociale, forme juridique, montant du capital social'],
                ['Coordonnées', 'Adresse du siège, adresse électronique, téléphone, coordonnées de l’hébergeur du site'],
                ['Activité commerciale', 'Numéro d’immatriculation au RCS et numéro de TVA intracommunautaire'],
                ['Vente en ligne', 'Conditions générales de vente (CGV) accessibles'],
                ['Cookies', 'Information de l’internaute et recueil de son consentement avant le dépôt des traceurs publicitaires (durée maximale : 13 mois)'],
              ],
            },
          ],
        },
        {
          id: 'd07-m1-doc3',
          number: 3,
          title: 'La protection des données personnelles (RGPD)',
          look: 'texte',
          blocks: [
            { type: 'p', text: 'Le règlement général sur la protection des données (RGPD, 2018) protège les informations qui permettent d’identifier une personne : nom, adresse, téléphone, photo, adresse IP… La personne doit donner son accord pour leur utilisation et pouvoir les consulter, les rectifier et les supprimer. Les mineurs bénéficient d’une protection renforcée.' },
          ],
        },
        {
          id: "d07-revision-1-doc",
          number: 4,
          title: "Auditer l’accès aux informations de retour",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Le test interne exige que la politique de retour et le contact du service client soient accessibles avant paiement et depuis la confirmation. Sur mobile, la politique apparaît uniquement après paiement. Le lien contact de la confirmation renvoie vers une page indisponible. Le site fonctionne sur ordinateur."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd07-m1-a1',
          kind: 'fields',
          label: 'Annexe 1',
          title: 'Relever les mentions sur le site',
          instructions: 'Relève les informations du document 1.',
          helps: ['Tout est dans la rubrique « Éditeur ».', 'Le capital s’écrit en euros.', 'Les coordonnées comprennent l’adresse, le courriel et le téléphone.'],
          outcomeIds: R1,
          fields: [
            { id: 'raison', label: 'Raison sociale', kind: 'text', accept: ['Modalia', 'Modalia SAS'], explain: 'Modalia.' },
            { id: 'statut', label: 'Statut juridique', kind: 'choice', options: [{ value: 'sas', label: 'SAS' }, { value: 'sa', label: 'SA' }, { value: 'sarl', label: 'SARL' }], answer: 'sas', explain: 'Modalia SAS.' },
            num('capital', 'Capital social', 2400000, '2 400 000 €.', '€'),
            { id: 'coord', label: 'Coordonnées présentes (plusieurs réponses)', kind: 'multi', options: [{ value: 'adresse', label: 'Adresse du siège' }, { value: 'mail', label: 'Adresse électronique' }, { value: 'tel', label: 'Téléphone' }, { value: 'hebergeur', label: 'Coordonnées de l’hébergeur' }], answers: ['adresse', 'mail', 'tel'], explain: 'L’hébergeur n’est pas indiqué.' },
          ],
        },
        {
          id: 'd07-m1-a2',
          kind: 'fields',
          label: 'Annexe 2',
          title: 'Vérifier la conformité du site',
          instructions: 'Pour chaque obligation (documents 2 et 3), indique si elle est respectée sur le site.',
          helps: ['Compare chaque ligne du document 2 au document 1.', 'Cherche le RCS, la TVA, les CGV, les cookies, les droits sur les données.', 'Une seule obligation n’est pas respectée : les coordonnées de l’hébergeur.'],
          outcomeIds: R1,
          layout: 'checklist',
          fields: (
            [
              ['ident', 'Identification (raison sociale, forme, capital)', 'oui'],
              ['coord', 'Adresse, courriel et téléphone', 'oui'],
              ['heberg', 'Coordonnées de l’hébergeur', 'non'],
              ['rcs', 'Numéro RCS et TVA intracommunautaire', 'oui'],
              ['cgv', 'Conditions générales de vente accessibles', 'oui'],
              ['cookies', 'Consentement aux cookies publicitaires', 'oui'],
              ['rgpd', 'Droits de consultation, rectification et suppression des données', 'oui'],
            ] as const
          ).map(([id, label, answer]): Field => ({ id, label, kind: 'choice', options: OUI_NON, answer, explain: answer === 'oui' ? 'Mention présente.' : 'Absente : à ajouter en urgence.' })),
        },
        {
          id: 'd07-m1-a3',
          kind: 'fields',
          label: 'Annexe 3',
          title: 'Conclure',
          instructions: 'Conclus ta vérification.',
          helps: ['Combien d’obligations manquent ?', 'Que faut-il ajouter ?', 'Le RGPD concerne les données personnelles.'],
          outcomeIds: R1,
          fields: [
            { id: 'conforme', label: '1. Le site est-il entièrement conforme ?', kind: 'choice', options: OUI_NON, answer: 'non', explain: 'Les coordonnées de l’hébergeur manquent.' },
            { id: 'action', label: '2. Quelle action proposes-tu ?', kind: 'choice', options: [{ value: 'hebergeur', label: 'Ajouter le nom et l’adresse de l’hébergeur dans les mentions légales' }, { value: 'cookies', label: 'Supprimer le bandeau des cookies' }, { value: 'cgv', label: 'Retirer les CGV du pied de page' }], answer: 'hebergeur', explain: 'C’est la seule mention manquante.' },
            { id: 'donnees', label: '3. Parmi ces informations, lesquelles sont des données personnelles ? (plusieurs réponses)', kind: 'multi', options: [{ value: 'nom', label: 'Nom et prénom du client' }, { value: 'adresse', label: 'Adresse de livraison' }, { value: 'ip', label: 'Adresse IP' }, { value: 'prix', label: 'Prix d’un article' }], answers: ['nom', 'adresse', 'ip'], explain: 'Le prix d’un article n’identifie personne.' },
          ],
        },
        {
          id: "d07-revision-1",
          label: "Annexe complémentaire",
          title: "Auditer l’accès aux informations de retour",
          instructions: "Lis le document 4. Rédige tes réponses en t’appuyant sur les faits du document. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Teste le parcours jusqu’à la confirmation en distinguant la visibilité de chaque lien et son fonctionnement.",
            "Relis le document 4 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "Afficher un lien vers la politique de retour avant paiement sur mobile. Corriger le lien contact de la confirmation et pointer vers la page du service client. Indiquer les étapes de reproduction et le support utilisé."
          ],
          outcomeIds: [
            "d07-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Écris les deux tickets à transmettre à l’équipe web.",
              kind: "written",
              lines: 3,
              model: "Afficher un lien vers la politique de retour avant paiement sur mobile. Corriger le lien contact de la confirmation et pointer vers la page du service client. Indiquer les étapes de reproduction et le support utilisé."
            },
            {
              id: "q2",
              label: "Quel test permet de vérifier les corrections ?",
              kind: "written",
              lines: 3,
              model: "Sur un mobile, accéder à la politique avant de valider puis ouvrir le contact depuis une confirmation fictive. Refaire la vérification sur ordinateur pour s’assurer que les deux parcours fonctionnent."
            }
          ]
        },
      ],
    },

    /* ================================ MISSION 2 ================================ */
    {
      id: 'mission-2',
      kind: 'mission',
      number: 2,
      title: 'Appliquer les procédures de retour',
      guidance: 'accompagné',
      message: {
        from: 'Hugo Ferrand',
        role: 'Responsable du service Retours',
        text: ['Je dois m’absenter quelques jours. Je te confie le traitement des demandes de retour reçues (document 3). Applique à la lettre nos conditions (document 1) et la loi (document 2).'],
      },
      documents: [
        {
          id: 'd07-m2-doc1',
          number: 1,
          title: 'Extrait des conditions générales de vente de Modalia',
          look: 'contrat',
          blocks: [
            {
              type: 'list',
              title: 'Conditions de retour',
              items: [
                `Vous pouvez retourner gratuitement un article non porté dans un délai de ${DELAI_COMMERCIAL} jours après la livraison, dans son emballage d’origine, avec ses étiquettes. Un article simplement essayé n’est pas considéré comme porté.`,
                'Nous ne reprenons pas les produits d’hygiène et de beauté descellés après la livraison (cosmétiques, sous-vêtements).',
                'Nous ne proposons pas d’échange : retournez l’article, vous serez remboursé, puis commandez la bonne taille.',
                'Livraison offerte dès 25 € d’achat ; en dessous, 3,90 €.',
              ],
            },
            { type: 'note', text: 'Au-delà du délai légal de 14 jours, le retour sous 60 jours est un service commercial : seul le prix de l’article est remboursé, pas les frais de livraison.' },
          ],
        },
        {
          id: 'd07-m2-doc2',
          number: 2,
          title: 'Ce que dit la loi',
          look: 'texte',
          blocks: [
            {
              type: 'table',
              head: ['Règle', 'Contenu'],
              rows: [
                ['Droit de rétractation', 'Pour un achat à distance, le client peut se rétracter sans donner de motif pendant 14 jours après la réception. Il est remboursé du prix et des frais de livraison standard, dans les 14 jours.'],
                ['Exception', 'Le droit de rétractation ne s’applique pas aux produits scellés ouverts après la livraison pour des raisons d’hygiène ou de santé.'],
                ['Garantie légale de conformité', 'Un article défectueux doit être réparé, remplacé ou remboursé, sans frais pour le client, pendant 2 ans.'],
              ],
            },
          ],
        },
        {
          id: 'd07-m2-doc3',
          number: 3,
          title: 'Liste des demandes de retour',
          look: 'facture',
          blocks: [
            {
              type: 'table',
              head: ['Client', 'Livraison', 'Demande', 'Article', 'Valeur', 'Frais de livraison'],
              align: ['left', 'left', 'left', 'left', 'right', 'right'],
              rows: DEMANDES.map((d) => [d.nom, d.livraison, d.demande, d.article, eur(d.valeur), d.port ? eur(d.port) : 'Gratuits']),
            },
            { type: 'list', title: 'Motif du client et constat du service Réception', items: DEMANDES.map((d) => `${d.nom} — « ${d.motif} ». ${d.constat}.`) },
          ],
        },
        {
          id: "d07-revision-2-doc",
          number: 4,
          title: "Traiter une commande partiellement retournée",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "La commande M614 comprend une chemise à 42 € et un foulard à 18 €. Le service client a validé le retour de la chemise uniquement. L’entrepôt confirme la réception de la chemise dans le dossier M614. La note de traitement interne de ce dossier prévoit le remboursement du prix de la chemise sur le moyen de paiement initial."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd07-m2-a1',
          kind: 'fields',
          label: 'Annexe',
          title: 'Traiter les demandes de retour',
          instructions: 'Pour chaque client, compte les jours entre la livraison et la demande, décide du remboursement, choisis la règle appliquée et calcule le montant (0 en cas de refus).',
          helps: [
            'Vérifie d’abord l’état de l’article (défaut, hygiène, article porté), puis le délai.',
            'Jusqu’à 14 jours : article + livraison. De 15 à 60 jours : article seul. Au-delà de 60 jours : refus. Défaut : garantie légale, tout est remboursé.',
            'Nicolas : 12/11 → 05/12 = 23 jours : seule la chemise (20 €) est remboursée.',
          ],
          outcomeIds: R1,
          layout: 'columns',
          columns: ['Jours écoulés', 'Remboursement ?', 'Règle appliquée', 'Montant remboursé'],
          fields: DEMANDES.flatMap((d): Field[] => [
            num(`${d.id}.0`, d.nom, d.jours, `Du ${d.livraison} au ${d.demande} : ${d.jours} jours.`, 'j'),
            { id: `${d.id}.1`, label: d.nom, kind: 'choice', options: OUI_NON, answer: d.accord ? 'oui' : 'non', explain: MOTIFS.find((m) => m.value === d.motifCode)!.label + '.' },
            { id: `${d.id}.2`, label: d.nom, kind: 'choice', select: true, options: MOTIFS, answer: d.motifCode, explain: d.echange ? 'Pas d’échange possible : on rembourse, la cliente recommande la bonne taille.' : MOTIFS.find((m) => m.value === d.motifCode)!.label + '.' },
            num(`${d.id}.3`, d.nom, d.montant, d.montant ? `${eur(d.montant)} remboursés.` : 'Refus : 0 €.', '€', 0.011),
          ]),
        },
        {
          id: "d07-revision-2",
          label: "Annexe complémentaire",
          title: "Traiter une commande partiellement retournée",
          instructions: "Lis le document 4. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Rapproche le contenu reçu de la ligne déjà autorisée.",
            "Relis le document 4 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "Seule la ligne chemise à 42 € a été retournée et validée."
          ],
          outcomeIds: [
            "d07-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Quel remboursement en euros enregistres-tu dans ce dossier ?",
              kind: "number",
              answer: 42,
              explain: "Seule la ligne chemise à 42 € a été retournée et validée."
            },
            {
              id: "q2",
              label: "Écris la note interne et la réponse à la cliente.",
              kind: "written",
              lines: 3,
              model: "Dossier M614, chemise reçue et rapprochée du retour validé, remboursement de 42 € lancé sur le moyen initial. Bonjour, nous avons bien reçu votre chemise. Nous avons lancé le remboursement de 42 € sur le moyen de paiement utilisé pour la commande."
            }
          ]
        },
      ],
    },

    /* ================================ MISSION 3 ================================ */
    {
      id: 'mission-3',
      kind: 'mission',
      number: 3,
      title: 'Prendre en charge la communication avec les clients',
      guidance: 'accompagné',
      message: {
        from: 'Hugo Ferrand',
        role: 'Responsable du service Retours',
        text: ['Après avoir traité les demandes, n’oublie pas de répondre aux clients. Rédige les courriels d’accord ou de refus en intégrant les éléments qui justifient notre décision (documents 1 et 2).'],
      },
      documents: [
        {
          id: 'd07-m3-doc1',
          number: 1,
          title: 'Conseils de rédaction d’un courriel client',
          look: 'procedure',
          blocks: [
            {
              type: 'list',
              items: [
                'Objet : court et précis, par exemple « Votre demande de retour n° 2604 ».',
                'Formule d’appel personnalisée : « Bonjour Madame Diagne, ».',
                'Accuser réception de la demande et remercier le client.',
                'S’excuser du désagrément, puis aller droit au fait.',
                'Montrer qu’on a compris le problème et apporter une solution.',
                'Un paragraphe par idée, une ligne vide entre chaque paragraphe, un langage soutenu.',
                'Rester à disposition, puis conclure par une formule de politesse (« Bien cordialement, »).',
                'Signer avec son nom complet, sa fonction et le nom du site ; se relire.',
              ],
            },
          ],
        },
        {
          id: 'd07-m3-doc2',
          number: 2,
          title: 'Mots-clés selon la réponse',
          look: 'postit',
          blocks: [{ type: 'p', text: 'Accord : confirmer la réception du retour + rappeler le motif + indiquer le montant et le délai de remboursement. Refus : rappeler les conditions de vente + exprimer ses regrets + proposer une alternative si possible.' }],
        },
        {
          id: 'd07-m3-doc3',
          number: 3,
          title: 'Brouillon d’un stagiaire précédent',
          look: 'courriel',
          blocks: [
            { type: 'facts', items: [['À', 'soigneux@exemple.fr'], ['Objet', 'retour']] },
            { type: 'p', text: 'Salut, ton pull on peut pas le rembourser parce que c’est de ta faute tu l’as lavé à 90 lol. Voila. Modalia' },
          ],
        },
        {
          id: "d07-revision-3-doc",
          number: 4,
          title: "Répondre à une cliente qui a déjà relancé",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Message client. « Mon colis retour est indiqué livré depuis mardi. C’est ma deuxième relance. J’ai joint mon numéro de commande et le suivi du transporteur. » Le suivi est au statut livré, mais l’entrepôt n’a pas encore scanné le retour. Le service promet un point sous un jour ouvré lorsque le rapprochement est ouvert."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd07-m3-a1',
          kind: 'fields',
          label: 'Annexe 1',
          title: 'Repérer les erreurs du brouillon',
          instructions: 'Compare le brouillon (document 3) aux conseils (document 1).',
          helps: ['Regarde l’objet, la formule d’appel, le ton et la signature.', 'Le client a-t-il compris pourquoi il est refusé ?', 'Il manque les regrets, les conditions de vente et une formule de politesse.'],
          outcomeIds: R1,
          fields: [
            {
              id: 'erreurs',
              label: 'Quelles erreurs contient ce brouillon ? (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'objet', label: 'Objet trop vague' },
                { value: 'appel', label: 'Formule d’appel familière et non personnalisée' },
                { value: 'ton', label: 'Ton familier, tutoiement, reproche au client' },
                { value: 'cgv', label: 'Pas de rappel des conditions de vente' },
                { value: 'regrets', label: 'Aucun regret ni alternative' },
                { value: 'signature', label: 'Ni formule de politesse ni signature complète' },
                { value: 'long', label: 'Le message est trop long' },
              ],
              answers: ['objet', 'appel', 'ton', 'cgv', 'regrets', 'signature'],
              explain: 'Le message est au contraire trop court et sans explication.',
            },
          ],
        },
        {
          id: 'd07-m3-a2',
          kind: 'fields',
          label: 'Annexe 2',
          title: 'Construire le courriel d’accord à Mme Diagne',
          instructions: 'Choisis les bons éléments pour le courriel d’accord de remboursement.',
          helps: ['Un objet court qui annonce la réponse.', 'La garantie légale couvre le défaut de la semelle.', 'Indique le montant et le délai de remboursement de 14 jours.'],
          outcomeIds: R1,
          layout: 'extranet',
          windowTitle: 'Nouveau message — service-client@modalia.example',
          fields: [
            { id: 'a', label: 'À', kind: 'given', value: 'diagne@exemple.fr' },
            { id: 'objet', label: 'Objet', kind: 'choice', options: [{ value: 'a', label: 'Votre retour de baskets réf. BK89 : remboursement accepté' }, { value: 'b', label: 'Infos' }, { value: 'c', label: 'Réponse automatique, ne pas répondre' }], answer: 'a', explain: 'Court, précis et il annonce la réponse.' },
            { id: 'appel', label: 'Formule d’appel', kind: 'choice', options: [{ value: 'a', label: 'Bonjour Madame Diagne,' }, { value: 'b', label: 'Coucou,' }, { value: 'c', label: 'Madame, Monsieur,' }], answer: 'a', explain: 'Personnalisée et polie.' },
            {
              id: 'contenu',
              label: 'Éléments à intégrer (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'reception', label: 'Nous avons bien reçu vos baskets et vous remercions de votre retour.' },
                { value: 'excuse', label: 'Nous sommes désolés que la semelle se soit décollée.' },
                { value: 'montant', label: `Nous vous remboursons ${eur(DEMANDES.find((d) => d.id === 'diagne')!.montant)} sous 14 jours sur votre moyen de paiement.` },
                { value: 'dispo', label: 'Notre service client reste à votre disposition.' },
                { value: 'faute', label: 'Vous auriez dû faire plus attention en les portant.' },
              ],
              answers: ['reception', 'excuse', 'montant', 'dispo'],
              explain: 'Le défaut de fabrication n’est pas la faute de la cliente.',
            },
            { id: 'politesse', label: 'Formule de politesse', kind: 'choice', options: [{ value: 'a', label: 'Bien cordialement,' }, { value: 'b', label: 'Bisous,' }, { value: 'c', label: 'À plus,' }], answer: 'a', explain: 'Formule professionnelle.' },
            { id: 'signature', label: 'Signature', kind: 'choice', options: [{ value: 'a', label: 'Prénom Nom, service Retours, Modalia' }, { value: 'b', label: 'Le stagiaire' }], answer: 'a', explain: 'Nom complet, fonction et entreprise.' },
          ],
        },
        {
          id: 'd07-m3-a3',
          kind: 'open',
          label: 'Annexe 3',
          title: 'Rédiger les courriels d’impossibilité d’échange et de refus',
          instructions: 'Rédige deux courriels : à Mme Siou (pas d’échange possible, mais remboursement) et à M. Soigneux (refus de remboursement).',
          helps: ['Reprends la structure de l’annexe 2.', 'Mme Siou : explique qu’il n’y a pas d’échange, confirme le remboursement et invite-la à commander la bonne taille.', 'M. Soigneux : rappelle les conditions de vente (article abîmé par un lavage non conforme), exprime tes regrets, propose par exemple un conseil d’entretien ou un bon de réduction.'],
          outcomeIds: R1,
          prompts: [
            { id: 'siou', label: 'Courriel à Mme Siou (objet + message)', lines: 8 },
            { id: 'soigneux', label: 'Courriel à M. Soigneux (objet + message)', lines: 8 },
          ],
          selfCheck: ['Objet précis et formule d’appel personnalisée.', 'La décision est expliquée avec les conditions de vente.', 'Ton courtois : regrets, solution ou alternative.', 'Formule de politesse et signature complète, sans faute.'],
        },
        {
          id: "d07-revision-3",
          label: "Annexe complémentaire",
          title: "Répondre à une cliente qui a déjà relancé",
          instructions: "Lis le document 4. Rédige tes réponses en t’appuyant sur les faits du document. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Le statut du transporteur et le scan entrepôt sont deux preuves différentes.",
            "Relis le document 4 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "Bonjour, je comprends que cette attente vous gêne. Le suivi indique une livraison mardi et je vérifie l’enregistrement auprès de notre entrepôt à partir des références que vous avez transmises. Je vous ferai un point sous un jour ouvré."
          ],
          outcomeIds: [
            "d07-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Écris une réponse qui donne une suite et une échéance.",
              kind: "written",
              lines: 3,
              model: "Bonjour, je comprends que cette attente vous gêne. Le suivi indique une livraison mardi et je vérifie l’enregistrement auprès de notre entrepôt à partir des références que vous avez transmises. Je vous ferai un point sous un jour ouvré."
            },
            {
              id: "q2",
              label: "Qu’enregistres-tu pour le collègue qui reprend le dossier ?",
              kind: "written",
              lines: 3,
              model: "Inscrire la date de livraison du transporteur, l’absence de scan interne, le responsable du rapprochement et l’échéance du prochain message. Conserver les références dans le dossier du service client."
            }
          ]
        },
      ],
    },

    /* ================================ MISSION 4 ================================ */
    {
      id: 'mission-4',
      kind: 'mission',
      number: 4,
      title: 'Améliorer la politique de retour',
      guidance: 'autonome',
      message: {
        from: 'Hugo Ferrand',
        role: 'Responsable du service Retours',
        text: [
          'Nos retours nous coûtent très cher. Certains clients commandent un article en plusieurs tailles, d’autres retournent tout, systématiquement. Pourtant, nous ne voulons pas perdre de clients : leur satisfaction passe avant tout.',
          'Lis le petit dossier que j’ai préparé, puis propose une politique adaptée à chaque profil de client.',
        ],
      },
      documents: [
        {
          id: 'd07-m4-doc1',
          number: 1,
          title: 'Une politique de retour qui fait vendre',
          look: 'article',
          blocks: [
            { type: 'p', text: 'La politique de retour regroupe les délais, les conditions de remboursement, la procédure à suivre et le coût du retour. Une majorité d’acheteurs la consultent avant de commander : claire et visible, elle rassure et fait vendre.' },
            { type: 'list', items: ['Proposer plusieurs modes de retour : point relais, bureau de poste, boîte aux lettres, magasin.', 'Automatiser le remboursement dès réception du colis.', 'Aider à choisir la bonne taille : guide des tailles, avis clients sur la taille, conseiller virtuel.', 'Ne faire payer que les articles gardés (« essayez avant de payer »).'] },
          ],
        },
        {
          id: 'd07-m4-doc2',
          number: 2,
          title: 'Une enseigne contre les « retourneurs en série »',
          look: 'article',
          blocks: [{ type: 'p', text: 'L’enseigne en ligne Urbanista a annoncé des mesures contre les clients qui achètent et retournent sans cesse leurs vêtements. Après plusieurs avertissements, elle peut désactiver leur compte. Elle a ramené son délai de retour à 30 jours : passé ce délai, le colis est renvoyé au client, qui paie les frais de livraison.' }],
        },
        {
          id: "d07-revision-4-doc",
          number: 3,
          title: "Choisir une amélioration à partir des motifs",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Motif principal sur 90 retours",
                "Nombre"
              ],
              rows: [
                [
                  "Taille trop petite",
                  "36"
                ],
                [
                  "Couleur différente de la photo",
                  "18"
                ],
                [
                  "Article livré abîmé",
                  "9"
                ],
                [
                  "Autres motifs",
                  "27"
                ]
              ]
            },
            {
              type: "p",
              text: "La responsable peut modifier une famille de fiches produits avant la prochaine collection."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd07-m4-a1',
          kind: 'fields',
          label: 'Annexe',
          title: 'Adapter la politique de retour aux types de clients',
          instructions: 'Pour chaque client, choisis la mesure la plus adaptée et réaliste.',
          helps: ['Distingue les clients à rassurer, à fidéliser et à encadrer.', 'Un client méfiant a besoin de garanties ; un client fidèle mérite d’être récompensé.', 'Les abus se traitent par des contrôles et des règles claires, pas par l’exclusion immédiate.'],
          outcomeIds: R1,
          fields: (
            [
              ['dumange', 'Mme Dumange commande beaucoup de vêtements et les retourne après les avoir portés.', 'controle'],
              ['delestre', 'M. Delestre se méfie de la vente à distance : il redoute une mauvaise qualité.', 'rassurer'],
              ['baudson', 'M. Baudson renvoie souvent ses articles hors délai.', 'rappel'],
              ['grech', 'M. Grech est un client fidèle qui retourne rarement des produits.', 'fidelite'],
              ['ducornet', 'Mme Ducornet commande le même article en plusieurs tailles et retourne presque tout.', 'taille'],
            ] as const
          ).map(([id, label, answer]): Field => ({
            id,
            label,
            kind: 'choice',
            select: true,
            options: [
              { value: 'controle', label: 'Contrôler l’état des retours et avertir, puis limiter les retours gratuits en cas d’abus' },
              { value: 'rassurer', label: 'Mettre en avant les retours gratuits et le paiement après essai' },
              { value: 'rappel', label: 'Envoyer un rappel automatique quelques jours avant la fin du délai' },
              { value: 'fidelite', label: 'Lui offrir un délai prolongé et des avantages fidélité' },
              { value: 'taille', label: 'Lui proposer le guide des tailles et un conseiller taille personnalisé' },
            ],
            answer,
            explain: 'Une mesure ciblée qui protège les marges sans faire fuir les clients.',
          })),
        },
        {
          id: 'd07-m4-a2',
          kind: 'fields',
          label: 'Annexe 2',
          title: 'Choisir des axes d’amélioration réalisables',
          instructions: 'Sélectionne les axes d’amélioration réalistes pour Modalia.',
          helps: ['Un axe réalisable a un coût raisonnable et ne fait pas fuir les clients.', 'Supprimer tous les retours gratuits ferait fuir les clients.', 'Le choix de la taille est la première cause de retour dans la mode.'],
          outcomeIds: R1,
          fields: [
            {
              id: 'axes',
              label: 'Axes d’amélioration (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'guide', label: 'Ajouter un conseiller taille sur chaque fiche produit' },
                { value: 'modes', label: 'Proposer plus de points de dépôt des retours' },
                { value: 'auto', label: 'Rembourser automatiquement dès réception du colis' },
                { value: 'photos', label: 'Améliorer les photos et les descriptions des articles' },
                { value: 'supprimer', label: 'Supprimer complètement les retours' },
                { value: 'fermer', label: 'Fermer le compte de tout client qui fait un retour' },
              ],
              answers: ['guide', 'modes', 'auto', 'photos'],
              explain: 'Les deux dernières mesures sont illégales ou feraient fuir les clients.',
            },
          ],
        },
        {
          id: "d07-revision-4",
          label: "Annexe complémentaire",
          title: "Choisir une amélioration à partir des motifs",
          instructions: "Lis le document 3. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Relie le motif le plus fréquent à un changement observable sur la fiche.",
            "Relis le document 3 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "36 ÷ 90 × 100 = 40 %."
          ],
          outcomeIds: [
            "d07-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Quelle part des retours concerne la taille trop petite ?",
              kind: "number",
              answer: 40,
              explain: "36 ÷ 90 × 100 = 40 %."
            },
            {
              id: "q2",
              label: "Propose un test et un indicateur comparable entre les collections.",
              kind: "written",
              lines: 3,
              model: "Ajouter les mesures du vêtement, un conseil de coupe et une méthode pour prendre ses mesures. Comparer, à produit et période comparables, les retours pour taille trop petite rapportés aux unités vendues."
            }
          ]
        },
      ],
    },

    /* ================================ SYNTHÈSE ================================ */
    {
      id: 'synthese',
      kind: 'synthese',
      title: 'Synthèse',
      documents: [],
      activities: [
        {
          id: 'd07-s-a1',
          kind: 'fields',
          label: 'Synthèse',
          title: 'Complète la synthèse',
          instructions: 'Complète les quatre parties.',
          helps: ['Mentions légales : identification, coordonnées, CGV, cookies, données.', 'Délai légal de rétractation : 14 jours.', 'Accord : confirmation et motif ; refus : conditions de vente et regrets.'],
          outcomeIds: R1,
          fields: [
            { id: 'ident', label: '1. Mention légale : raison sociale, forme et capital = rubrique…', kind: 'choice', options: [{ value: 'ident', label: 'Identification' }, { value: 'cgv', label: 'CGV' }], answer: 'ident', explain: 'Identification.' },
            { id: 'cookies', label: '1. Les cookies publicitaires exigent…', kind: 'text', accept: ['le consentement', 'consentement', 'un consentement', 'l’accord', 'accord'], explain: 'Le consentement préalable de l’internaute.' },
            { id: 'rgpd', label: '1. Transparence sur le traitement des données personnelles :', kind: 'text', accept: ['RGPD', 'règlement général sur la protection des données', 'reglement general sur la protection des donnees'], explain: 'Le RGPD.' },
            num('delai', '2. Délai légal de rétractation', 14, '14 jours.', 'jours'),
            { id: 'excl', label: '2. Exclusions (plusieurs réponses)', kind: 'multi', options: [{ value: 'hygiene', label: 'Produits d’hygiène descellés' }, { value: 'porte', label: 'Articles portés ou abîmés' }, { value: 'delai', label: 'Retours hors délai' }, { value: 'neuf', label: 'Articles neufs avec étiquettes' }], answers: ['hygiene', 'porte', 'delai'], explain: 'Un article neuf avec ses étiquettes est repris.' },
            { id: 'accord', label: '3. Courriel d’accord : mots-clés', kind: 'choice', options: [{ value: 'a', label: 'Confirmation du retour + rappel du motif' }, { value: 'b', label: 'Rappel des CGV + regrets' }], answer: 'a', explain: 'Les regrets accompagnent un refus.' },
            { id: 'refus', label: '3. Courriel de refus : mots-clés', kind: 'choice', options: [{ value: 'b', label: 'Rappel des conditions de vente + regrets exprimés' }, { value: 'a', label: 'Confirmation du retour + rappel du motif' }], answer: 'b', explain: 'On explique et on regrette.' },
            { id: 'ameliorer', label: '4. Un axe pour réduire les retours', kind: 'choice', options: [{ value: 'taille', label: 'Aider à choisir la bonne taille' }, { value: 'interdire', label: 'Interdire les retours' }], answer: 'taille', explain: 'Avec l’automatisation et le paiement après essai.' },
          ],
        },
        {
          id: 'd07-s-quiz',
          kind: 'fields',
          label: 'Quiz',
          title: 'Quiz du dossier',
          instructions: 'Cinq questions rapides.',
          helps: ['Relis la fiche de révision.', 'Compte les jours à partir de la livraison.', 'Au-delà de 14 jours, les frais de livraison ne sont plus dus.'],
          outcomeIds: R1,
          fields: [
            num('q1', 'Livré le 3 mars, demande le 15 mars : nombre de jours ?', 12, '15 − 3 = 12 jours.', 'jours'),
            { id: 'q2', label: 'Ce client peut-il se rétracter ?', kind: 'choice', options: OUI_NON, answer: 'oui', explain: '12 jours ≤ 14 jours.' },
            num('q3', 'Article 30 €, livraison 3,90 €, retour sous 14 jours : montant remboursé ?', 33.9, '30 + 3,90 = 33,90 €.', '€', 0.001),
            { id: 'q4', label: 'Un rouge à lèvres ouvert peut-il être retourné ?', kind: 'choice', options: OUI_NON, answer: 'non', explain: 'Produit d’hygiène descellé.' },
            { id: 'q5', label: 'Le sigle RGPD désigne…', kind: 'choice', options: [{ value: 'a', label: 'Le règlement général sur la protection des données' }, { value: 'b', label: 'Le registre général des produits défectueux' }], answer: 'a', explain: 'Règlement européen de 2018.' },
          ],
        },
      ],
      synthesis: [
        { title: 'Notions essentielles', kind: 'notions', items: ['Mentions légales : identification, coordonnées et hébergeur, RCS et TVA, CGV, cookies.', 'RGPD : consentement et droits d’accès, de rectification et de suppression des données.', 'Droit de rétractation : 14 jours après la réception, sans motif.', 'Garantie légale de conformité : un article défectueux est réparé, remplacé ou remboursé.', 'Politique de retour : délais, conditions, procédure, coût.'] },
        { title: 'Méthodes', kind: 'methodes', items: ['Vérifier un site rubrique par rubrique.', 'Traiter une demande : état de l’article, puis délai, puis montant.', 'Rédiger un courriel : objet, appel, faits, décision justifiée, solution, politesse, signature.', 'Adapter la politique de retour au profil du client.'] },
        { title: 'Repères à connaître', kind: 'formules', items: ['Rétractation : 14 jours ; remboursement sous 14 jours', 'Jusqu’à 14 jours : article + frais de livraison', 'Retour commercial (ici 60 jours) : article seul', 'Cookies : 13 mois au maximum'] },
        { title: 'Erreurs fréquentes', kind: 'erreurs', items: ['Compter le délai à partir de la commande au lieu de la réception.', 'Refuser un article défectueux au motif du délai commercial.', 'Rédiger un refus sans expliquer la règle.', 'Confondre échange et remboursement.'] },
        { title: 'Bonnes pratiques professionnelles', kind: 'pratiques', items: ['Répondre vite, de façon personnalisée et courtoise.', 'Proposer une alternative en cas de refus.', 'Rendre la politique de retour visible et claire.'] },
        { title: 'Mots-clés', kind: 'mots-cles', items: ['Mentions légales', 'CGV', 'Cookies', 'RGPD', 'Droit de rétractation', 'Garantie légale de conformité', 'Politique de retour'] },
        {
          title: "Les réflexes à retenir des nouveaux cas",
          kind: "pratiques",
          items: [
            "Pars du canal, des dates, du motif et de l’état du produit avant de décider.",
            "Distingue les droits applicables, la politique commerciale de l’enseigne et le geste exceptionnel que le responsable peut autoriser.",
            "Une réponse au client indique la prochaine étape, son responsable et le moment du prochain point."
          ]
        },
      ],
    },

    /* ================================ APPLICATION 1 ================================ */
    {
      id: 'application-1',
      kind: 'application',
      number: 1,
      title: 'Respecter la protection des données',
      guidance: 'autonome',
      hero: { id: 'd07-donnees', alt: 'Écran d’ordinateur avec un cadenas symbolisant la sécurité des données' },
      message: {
        from: 'Nadia Perrin',
        role: 'Responsable commerciale, Isolis',
        text: ['Tu commences ta PFMP chez Isolis, qui vend des travaux d’isolation. Tu vas appeler des clients pour leur proposer nos offres. Avant cela, lis ce qui est arrivé à un concurrent : la protection des données n’est pas une option.'],
      },
      documents: [
        {
          id: 'd07-a1-doc1',
          number: 1,
          title: 'Prospection téléphonique : une entreprise sanctionnée',
          look: 'article',
          blocks: [
            { type: 'p', text: 'Une entreprise de rénovation confiait sa prospection téléphonique à des centres d’appels. Ces sous-traitants appelaient en masse, sans tenir compte de l’opposition des personnes. Après de nombreuses plaintes, la CNIL (Commission nationale de l’informatique et des libertés) a contrôlé l’entreprise.' },
            { type: 'list', title: 'Elle a constaté :', items: ['des appels répétés à des personnes qui avaient refusé d’être démarchées ;', 'des commentaires déplacés sur certains clients dans le fichier ;', 'l’enregistrement des appels sans en informer les personnes.'] },
            { type: 'p', text: 'Mise en demeure de se mettre en conformité sans résultat, l’entreprise a été condamnée à une amende de plusieurs centaines de milliers d’euros.' },
          ],
        },
        {
          id: 'd07-a1-doc2',
          number: 2,
          title: 'Pourquoi une fuite de données est-elle grave ?',
          look: 'texte',
          blocks: [{ type: 'p', text: 'Chaque année, des milliards de données sont piratées ou perdues dans le monde. Elles concernent les clients (identité, coordonnées bancaires) mais aussi l’entreprise : projets, innovations, fichiers fournisseurs. Une fuite peut être utilisée par des escrocs ou des concurrents ; médiatisée, elle fait perdre la confiance des clients, des partenaires et des investisseurs.' }],
        },
      ],
      activities: [
        {
          id: 'd07-a1-a1',
          kind: 'fields',
          label: '1',
          title: 'Analyser la sanction',
          instructions: 'Réponds à l’aide des documents.',
          helps: ['Relis la liste des constats de la CNIL.', 'Pense à l’usage que pourrait faire un escroc d’un numéro de carte ou d’une adresse.', 'Pour l’entreprise : sanctions, image, concurrence.'],
          outcomeIds: R1,
          fields: [
            { id: 'reproches', label: '1. Quels reproches sont faits à l’entreprise ? (plusieurs réponses)', kind: 'multi', options: [{ value: 'opposition', label: 'Démarcher des personnes qui avaient refusé' }, { value: 'commentaires', label: 'Noter des commentaires déplacés sur les clients' }, { value: 'enregistrement', label: 'Enregistrer les appels sans prévenir' }, { value: 'prix', label: 'Vendre trop cher' }], answers: ['opposition', 'commentaires', 'enregistrement'], explain: 'Le prix n’est pas un manquement au RGPD.' },
            { id: 'clients', label: '2. Conséquences possibles d’une fuite pour les clients (plusieurs réponses)', kind: 'multi', options: [{ value: 'fraude', label: 'Fraude bancaire, usurpation d’identité' }, { value: 'harcelement', label: 'Démarchage abusif, arnaques' }, { value: 'reduction', label: 'Des réductions de prix' }], answers: ['fraude', 'harcelement'], explain: 'Aucun avantage pour le client.' },
            { id: 'entreprise', label: '3. Risques pour l’entreprise (plusieurs réponses)', kind: 'multi', options: [{ value: 'amende', label: 'Amendes de la CNIL' }, { value: 'image', label: 'Perte de confiance et mauvaise image' }, { value: 'concurrents', label: 'Projets récupérés par des concurrents' }, { value: 'ventes', label: 'Hausse des ventes' }], answers: ['amende', 'image', 'concurrents'], explain: 'Une fuite fait baisser la confiance et les ventes.' },
            { id: 'bon', label: '4. Pendant tes appels, que dois-tu faire si un client refuse d’être rappelé ?', kind: 'choice', options: [{ value: 'a', label: 'Le noter et ne plus l’appeler' }, { value: 'b', label: 'Le rappeler la semaine suivante' }, { value: 'c', label: 'Insister poliment' }], answer: 'a', explain: 'Son opposition doit être respectée.' },
          ],
        },
      ],
      selfAssessment: ['Je connais les obligations liées aux données personnelles.', 'Je sais repérer un manquement au RGPD.'],
    },

    /* ================================ APPLICATION 2 ================================ */
    {
      id: 'application-2',
      kind: 'application',
      number: 2,
      title: 'Prendre en charge les remboursements clients',
      guidance: 'autonome',
      hero: { id: 'd07-boutique', alt: 'Façade d’une boutique de prêt-à-porter' },
      message: {
        from: 'Kevin Lambert',
        role: 'Responsable des retours en ligne, Line Urbaine',
        text: ['Tu m’assistes pour les retours des articles vendus sur notre site. Traite les derniers retours en respectant notre procédure, puis aide-moi à la rendre plus claire pour les clients.'],
      },
      documents: [
        {
          id: 'd07-a2-doc1',
          number: 1,
          title: 'Derniers retours reçus',
          look: 'facture',
          blocks: [
            {
              type: 'table',
              head: ['Client', 'Réception de l’article', 'Date du retour', 'Article', 'Commentaire', 'Prix'],
              align: ['left', 'left', 'left', 'left', 'left', 'right'],
              rows: RETOURS_APP2.map((r) => [r.nom, r.recu, r.retour, r.article, r.comment, eur(r.prix)]),
            },
          ],
        },
        {
          id: 'd07-a2-doc2',
          number: 2,
          title: 'Procédure de l’entreprise',
          look: 'procedure',
          blocks: [
            {
              type: 'list',
              items: [
                'La demande de retour doit être faite dans les 14 jours suivant la réception.',
                'Le client utilise l’étiquette retour fournie.',
                'Le colis contient le bon de retour ou, à défaut, une demande sur papier libre.',
                `Les retours sont gratuits, sauf par La Poste : ${eur(FRAIS_POSTE)} sont alors déduits du remboursement.`,
                'L’article est contrôlé : endommagé, sali ou porté, il n’est pas remboursé.',
                'Le remboursement a lieu dans les 14 jours suivant le retour.',
              ],
            },
          ],
        },
      ],
      activities: [
        {
          id: 'd07-a2-a1',
          kind: 'fields',
          label: '1',
          title: 'Décider des remboursements',
          instructions: 'Pour chaque retour, décide du remboursement, justifie et calcule le montant.',
          helps: ['Contrôle dans l’ordre : délai, bon de retour, état de l’article, mode de retour.', 'Amoudou : du 18/04 au 05/05 = 17 jours.', `Charlet : retour par La Poste → 159,90 − ${fr(FRAIS_POSTE)} = ${fr(r2(159.9 - FRAIS_POSTE))} €.`],
          outcomeIds: R1,
          layout: 'columns',
          columns: ['Remboursement ?', 'Justification', 'Montant'],
          fields: RETOURS_APP2.flatMap((r): Field[] => [
            { id: `${r.id}.0`, label: r.nom, kind: 'choice', options: OUI_NON, answer: r.accord ? 'oui' : 'non', explain: `${r.jours} jours entre réception et retour.` },
            {
              id: `${r.id}.1`,
              label: r.nom,
              kind: 'choice',
              select: true,
              options: [
                { value: 'ok', label: 'Procédure respectée' },
                { value: 'delai', label: 'Délai de 14 jours dépassé' },
                { value: 'bon', label: 'Ni bon de retour ni demande écrite' },
                { value: 'porte', label: 'Article porté ou sali' },
              ],
              answer: r.raison,
              explain: r.poste && r.accord ? 'Procédure respectée, frais postaux déduits.' : 'Règle de la procédure appliquée.',
            },
            num(`${r.id}.2`, r.nom, r.montant, r.montant ? `${eur(r.montant)}.` : 'Refus : 0 €.', '€', 0.011),
          ]),
        },
        {
          id: 'd07-a2-a2',
          kind: 'fields',
          label: '2',
          title: 'Schématiser la procédure de retour',
          instructions: 'Remets dans l’ordre les étapes d’un retour, pour un schéma destiné aux clients.',
          helps: ['Tout commence sur le compte client.', 'L’étiquette se colle après avoir emballé l’article.', 'Le remboursement arrive en dernier.'],
          outcomeIds: R1,
          fields: (() => {
            const steps = [
              ['compte', 'Se connecter à son compte et déclarer le retour'],
              ['bon', 'Imprimer et remplir le bon de retour'],
              ['colis', 'Emballer l’article et coller l’étiquette retour'],
              ['depot', 'Déposer le colis en point relais ou en magasin'],
              ['rembourse', 'Recevoir le remboursement sous 14 jours'],
            ];
            const options = [...steps].sort((a, b) => a[1].localeCompare(b[1], 'fr')).map(([value, label]) => ({ value, label }));
            return steps.map(([value], i): Field => ({ id: `e${i + 1}`, label: `Étape ${i + 1}`, kind: 'choice', select: true, options, answer: value, explain: steps[i][1] + '.' }));
          })(),
        },
      ],
      selfAssessment: ['Je sais appliquer une procédure de retour.', 'Je sais calculer un montant de remboursement.'],
    },

    /* ================================ APPLICATION 3 ================================ */
    {
      id: 'application-3',
      kind: 'application',
      number: 3,
      title: 'Respecter les mentions obligatoires et la législation',
      guidance: 'autonome',
      message: {
        from: 'Hugo Ferrand',
        role: 'Responsable du service Retours, Modalia',
        text: ['Nos commandes baissent : un concurrent, ModaFlash, casse les prix et recrute des clients grâce à des publicités sur les réseaux sociaux. Je me demande si ce site est fiable. Peux-tu vérifier ?'],
      },
      documents: [
        {
          id: 'd07-a3-doc1',
          number: 1,
          title: 'Ce que l’on trouve sur le site ModaFlash',
          look: 'site',
          url: 'modaflash.example',
          blocks: [
            { type: 'list', title: 'Rubriques du pied de page', items: ['À propos de nous : « Détaillant mondial de mode qui rend la mode accessible à tous. »', 'Nous contacter : discussion en ligne et formulaire, pas de téléphone.', 'Livraison : 1 à 3 jours de préparation, de 1,99 € à 8,90 €.', 'Retour : 45 jours avec l’étiquette fournie ; 4,50 € par colis supplémentaire ; transporteur local à vos frais.', 'Politique de confidentialité'] },
            { type: 'note', text: 'Aucune page « Mentions légales », aucune adresse de siège, aucun numéro RCS. Les CGV sont introuvables. Le bandeau cookies n’a pas de bouton « Refuser ». Plusieurs fautes : « livraizon rapide », « satisfait ou rembourcé ».' },
          ],
        },
        {
          id: 'd07-a3-doc2',
          number: 2,
          title: 'Avis de clients sur un site d’avis',
          look: 'texte',
          blocks: [
            { type: 'quote', author: 'Ilan', text: 'Couleurs plus fades que sur les photos, mais les tailles étaient bonnes et le colis est arrivé.' },
            { type: 'quote', author: 'Amira', text: 'Le renvoi coûtait trop cher, j’ai tout gardé. Qualité décevante.' },
            { type: 'quote', author: 'Mélanie', text: 'Impossible de les joindre par téléphone pour un simple échange de taille.' },
          ],
        },
        {
          id: 'd07-a3-doc3',
          number: 3,
          title: 'Vrai ou faux site ? Trois vérifications',
          look: 'procedure',
          blocks: [{ type: 'list', items: ['Chercher les mentions légales : nom, coordonnées, numéro d’immatriculation.', 'Lire les conditions générales de vente.', 'Repérer les fautes d’orthographe, signe de manque de sérieux.'] }],
        },
      ],
      activities: [
        {
          id: 'd07-a3-a1',
          kind: 'fields',
          label: '1',
          title: 'Vérifier les mentions du site',
          instructions: 'Pour chaque mention, indique si elle est présente et conforme.',
          helps: ['Compare le document 1 aux mentions obligatoires vues à la mission 1.', 'Un bandeau cookies doit permettre de refuser.', 'Les fautes d’orthographe sont un signal d’alerte.'],
          outcomeIds: R1,
          layout: 'checklist',
          fields: (
            [
              ['mentions', 'Page Mentions légales', 'non'],
              ['adresse', 'Adresse du siège et téléphone', 'non'],
              ['rcs', 'Numéro RCS', 'non'],
              ['cgv', 'Conditions générales de vente', 'non'],
              ['cookies', 'Choix d’accepter ou de refuser les cookies', 'non'],
              ['confid', 'Politique de confidentialité', 'oui'],
              ['retour', 'Conditions de retour', 'oui'],
              ['ortho', 'Orthographe soignée', 'non'],
            ] as const
          ).map(([id, label, answer]): Field => ({ id, label, kind: 'choice', options: OUI_NON, answer, explain: answer === 'oui' ? 'Présent.' : 'Absent ou non conforme.' })),
        },
        {
          id: 'd07-a3-a2',
          kind: 'fields',
          label: '2',
          title: 'Conclure',
          instructions: 'Donne ton avis argumenté.',
          helps: ['Combien de mentions obligatoires manquent ?', 'Que disent les avis clients sur le service après-vente ?', 'Un concurrent peut attirer des clients même s’il est peu fiable, grâce à ses prix.'],
          outcomeIds: R1,
          fields: [
            { id: 'fiable', label: '1. Le site te semble-t-il fiable ?', kind: 'choice', options: [{ value: 'non', label: 'Non : mentions obligatoires absentes, service client difficile à joindre, fautes' }, { value: 'oui', label: 'Oui : il a une politique de confidentialité' }], answer: 'non', explain: 'Plusieurs obligations légales ne sont pas respectées.' },
            { id: 'concurrent', label: '2. Est-il un vrai concurrent pour Modalia ?', kind: 'choice', options: [{ value: 'prix', label: 'Oui, par ses prix bas, mais Modalia peut se démarquer par la confiance et le service' }, { value: 'non', label: 'Non, aucun client n’y achète' }], answer: 'prix', explain: 'Les prix attirent ; la fiabilité et les retours simples fidélisent.' },
          ],
        },
      ],
      selfAssessment: ['Je sais évaluer la fiabilité d’un site marchand.'],
    },

    /* ================================ APPLICATION 4 ================================ */
    {
      id: 'application-4',
      kind: 'application',
      number: 4,
      title: 'Réduire son taux de retour client',
      guidance: 'autonome',
      hero: { id: 'd07-taille', alt: 'Rayon de costumes avec un écran tactile de conseil' },
      message: {
        from: 'Sarah Benoît',
        role: 'Chef de projet, Kidéa (vêtements pour enfants en ligne)',
        text: ['Les retours nous coûtent très cher. Certains concurrents utilisent un conseiller de taille, TailleJuste. Étudie ce principe et dis-moi s’il pourrait nous être utile.'],
      },
      documents: [
        {
          id: 'd07-a4-doc1',
          number: 1,
          title: 'TailleJuste, le conseiller de taille',
          look: 'site',
          url: 'taillejuste.example',
          blocks: [
            { type: 'p', text: 'Dans l’habillement, 15 à 20 % des articles vendus en ligne sont retournés, le plus souvent à cause d’une taille qui ne convient pas. TailleJuste s’intègre aux fiches produits : le client indique sa taille, son poids, son âge et sa morphologie, ou compare avec un vêtement qu’il possède déjà. L’outil recommande la taille adaptée à chaque modèle.' },
            { type: 'list', title: 'Utilisations', items: ['Sur le site marchand : conseil de taille sur chaque fiche produit.', 'En magasin : application sur tablette pour les vendeurs.', 'Partenaires : enseignes de prêt-à-porter, de chaussures et de sport, en ligne et en magasin.'] },
          ],
        },
        {
          id: "d07-revision-5-doc",
          number: 2,
          title: "Résoudre deux demandes dans une boutique de chaussures",
          look: "fiche",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Dossier",
                "Demande",
                "Décision interne déjà validée"
              ],
              rows: [
                [
                  "C21",
                  "La cliente a reçu un 39 alors qu’elle a commandé un 38",
                  "Remplacement sans frais. Un 38 est disponible."
                ],
                [
                  "C22",
                  "Le client attend un remboursement de 65 € déjà lancé",
                  "Le paiement est en traitement. Prochain point dans deux jours ouvrés."
                ]
              ]
            },
            {
              type: "p",
              text: "L’équipe utilise les dossiers clients individuels et doit inscrire le responsable de la prochaine action."
            }
          ]
        },
        {
          id: "d07-revision-dossier-doc1",
          number: 3,
          title: "Dossiers reçus à 9 h",
          look: "fiche",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Dossier",
                "Commande",
                "Demande",
                "Trace disponible"
              ],
              rows: [
                [
                  "M401",
                  "Pull 52 € et foulard 18 €",
                  "Retour du pull validé",
                  "Transporteur indique livré, aucun scan entrepôt"
                ],
                [
                  "M402",
                  "Pantalon taille 40, 48 €",
                  "Reçu en taille 42",
                  "Photo de l’étiquette et préparation confirmée en 42"
                ],
                [
                  "M403",
                  "Tee-shirt 24 €",
                  "Remboursement demandé une seconde fois",
                  "Remboursement déjà initié hier"
                ]
              ]
            }
          ]
        },
        {
          id: "d07-revision-dossier-doc2",
          number: 4,
          title: "Procédure interne des dossiers déjà qualifiés",
          look: "fiche",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Pour M401, rapprocher colis et dossier avant le remboursement du produit retourné et informer la cliente sous un jour ouvré. Pour M402, proposer un remplacement sans frais si le stock est confirmé. Sinon, proposer un retour sans frais avec remboursement après réception ou une alerte de disponibilité. Donner un point sous un jour ouvré. Pour M403, consulter l’état du premier remboursement avant toute nouvelle saisie. Donner le prochain point sous deux jours ouvrés si le paiement est encore en traitement."
            }
          ]
        },
        {
          id: "d07-revision-dossier-doc3",
          number: 5,
          title: "Point de situation de 11 h",
          look: "courriel",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "L’entrepôt retrouve M401. Le colis contient le pull et le foulard, mais seul le pull figure dans le retour validé. Le stock de taille 40 de M402 tombe à zéro après contrôle. Le paiement de M403 est toujours en traitement."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd07-a4-a1',
          kind: 'fields',
          label: '1',
          title: 'Étudier la solution',
          instructions: 'Réponds à l’aide du document.',
          helps: ['Quelle est la première cause de retour ?', 'Quelles informations le client doit-il fournir ?', 'Moins de retours = moins de frais logistiques et des clients plus satisfaits.'],
          outcomeIds: R1,
          fields: [
            { id: 'utile', label: '1. En quoi l’outil serait-il utile à Kidéa ?', kind: 'choice', options: [{ value: 'a', label: 'Il réduit les retours liés à la taille, donc les coûts, et rassure les parents' }, { value: 'b', label: 'Il permet d’augmenter les prix' }, { value: 'c', label: 'Il supprime la livraison' }], answer: 'a', explain: 'La taille est la première cause de retour.' },
            { id: 'infos', label: '2. Informations qui permettent de choisir la bonne taille (plusieurs réponses)', kind: 'multi', options: [{ value: 'taille', label: 'Taille et poids' }, { value: 'age', label: 'Âge' }, { value: 'morpho', label: 'Morphologie' }, { value: 'vetement', label: 'Comparaison avec un vêtement possédé' }, { value: 'couleur', label: 'Couleur préférée' }], answers: ['taille', 'age', 'morpho', 'vetement'], explain: 'La couleur ne change rien à la taille.' },
            { id: 'magasin', label: '3. À quoi sert l’application en magasin ?', kind: 'choice', options: [{ value: 'a', label: 'Aider les vendeurs à conseiller la bonne taille' }, { value: 'b', label: 'Encaisser les clients' }], answer: 'a', explain: 'Un conseil plus sûr et plus rapide.' },
            { id: 'partenaires', label: '4. Quels commerces utilisent ce principe ?', kind: 'choice', options: [{ value: 'a', label: 'Prêt-à-porter, chaussures, sport, en ligne et en magasin' }, { value: 'b', label: 'Uniquement les supermarchés' }], answer: 'a', explain: 'Tous les secteurs où la taille compte.' },
          ],
        },
        {
          id: "d07-revision-5",
          label: "Nouveau cas d’application",
          title: "Résoudre deux demandes dans une boutique de chaussures",
          instructions: "Lis le document 2. Rédige tes réponses en t’appuyant sur les faits du document. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Annonce pour chaque personne uniquement l’action réellement confirmée.",
            "Relis le document 2 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "C21. Confirmer le remplacement sans frais, réserver le 38 et transmettre les modalités de retour. C22. Confirmer que les 65 € ont été lancés, préciser que le traitement est en cours et annoncer un point sous deux jours ouvrés. Assigner C21 au service expédition et C22 au suivi des paiements."
          ],
          outcomeIds: [
            "d07-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Rédige les deux réponses et une note de suivi.",
              kind: "written",
              lines: 3,
              model: "C21. Confirmer le remplacement sans frais, réserver le 38 et transmettre les modalités de retour. C22. Confirmer que les 65 € ont été lancés, préciser que le traitement est en cours et annoncer un point sous deux jours ouvrés. Assigner C21 au service expédition et C22 au suivi des paiements."
            },
            {
              id: "q2",
              label: "Quelle action pourrait éviter le retour C21 sur une prochaine commande ?",
              kind: "written",
              lines: 3,
              model: "Scanner la pointure de la boîte au prélèvement et vérifier sa correspondance avec la commande avant la fermeture du colis."
            }
          ]
        },
        {
          id: "d07-revision-dossier",
          label: "Dossier de décision",
          title: "Distinguer retour autorisé, erreur de préparation et remboursement en attente",
          instructions: "Lis les documents 3 et 4, puis écris ton diagnostic initial. Passe ensuite au document 5 pour revoir ta décision. Note tes calculs et les faits qui justifient chaque choix dans les zones de réponse. Après avoir répondu, clique sur « Vérifier mes réponses » pour comparer avec les propositions de corrigé.",
          kind: "fields",
          helps: [
            "Dans chaque dossier, sépare ce qui est confirmé, ce qui demande une décision et ce qu’il faut annoncer.",
            "Prépare trois colonnes par dossier, « confirmé », « décision à obtenir » et « réponse au client ». Reprends-les après chaque nouvelle information.",
            "Exemple. Un client a renvoyé deux produits, mais seul le premier figure dans l’accord. Enregistre les deux produits observés et fais qualifier le second. Annonce séparément le traitement confirmé du premier et le prochain point sur le second."
          ],
          outcomeIds: [
            "d07-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Réalise le tableau de suivi de 9 h avec montant concerné, preuve et prochaine action.",
              kind: "written",
              lines: 6,
              model: "M401, 52 € autorisés, livraison transporteur, rechercher le scan. M402, 48 € pour le produit concerné, erreur confirmée, contrôler et réserver le stock. M403, 24 € déjà engagés, contrôler le statut du premier remboursement."
            },
            {
              id: "q2",
              label: "À 11 h, quel montant est déjà autorisé pour M401 et quel traitement réserves-tu au second article ?",
              kind: "written",
              lines: 6,
              model: "52 € pour le pull. Identifier et isoler le foulard de 18 € dans le dossier et demander à la responsable de qualifier son retour avant de le rembourser ou de fixer la suite. Garder une trace des deux produits reçus."
            },
            {
              id: "q3",
              label: "Rédige les réponses à M402 et M403 à partir de la nouvelle situation.",
              kind: "written",
              lines: 6,
              model: "M402. Reconnaître l’erreur, expliquer que le 40 n’est actuellement pas disponible et proposer un retour sans frais avec remboursement après réception ou une alerte de disponibilité. Annoncer un point sous un jour ouvré. M403. Confirmer qu’un remboursement de 24 € a déjà été initié et reste en traitement. Annoncer un point sous deux jours ouvrés et garder la première opération en suivi."
            },
            {
              id: "q4",
              label: "Propose une correction de processus en amont et une mesure de contrôle.",
              kind: "written",
              lines: 6,
              model: "Scanner la taille sur l’étiquette du produit au prélèvement et bloquer la fermeture en cas d’écart. Suivre le nombre d’erreurs de taille rapporté aux commandes préparées sur des semaines comparables."
            }
          ]
        },
      ],
      selfAssessment: ['Je sais proposer une solution réaliste pour réduire les retours.',
        "Je distingue les articles reçus, les montants validés et les décisions en attente.",
        "Je réponds au client à partir de la dernière information vérifiée.",
        "Je propose un contrôle préventif et son indicateur."],
    },

    /* ================================ BILAN ================================ */
    {
      id: 'bilan',
      kind: 'bilan',
      title: 'Évaluez votre réussite',
      documents: [],
      activities: [],
      selfAssessment: [
        'Je sais vérifier les mentions obligatoires d’un site marchand.',
        'Je connais le droit de rétractation et la garantie légale de conformité.',
        'Je sais traiter une demande de retour et calculer un remboursement.',
        'Je sais rédiger un courriel d’accord ou de refus.',
        'Je sais proposer des améliorations réalisables de la politique de retour.',
      ],
    },
  ],
};
