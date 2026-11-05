/**
 * Calcul d'un cadencier. Il sert à générer à la fois les annexes et leur correction,
 * pour que les données soient toujours cohérentes.
 *
 * Règles (document « Le cadencier ») :
 *  - Stock      S(w) = S(w-1) + L(w-1) − V(w-1)
 *  - Ventes     V(w) = S(w) + L(w) − S(w+1)        (déduites des stocks quand elles manquent)
 *  - Livraison  L(w) = C(w-1)                      (livraison la semaine qui suit la commande)
 *  - Commande   C(w) = (V(w-2) + V(w-1)) ÷ 2 − S(w), arrondie au multiple du colisage supérieur,
 *                      0 si le résultat est négatif, + commande exceptionnelle éventuelle.
 */
export type CadCol = 'S' | 'C' | 'L' | 'V';

export interface CadencierInput {
  id: string;
  label: string;
  colisage: number;
  /** Ventes de chaque semaine. */
  sales: number[];
  firstOrder: number;
  firstDelivery: number;
  /** Commandes fixées par le responsable (index de semaine → quantité). */
  fixedOrders?: Record<number, number>;
  /** Quantités ajoutées à la commande calculée (anticipation d'un temps fort). */
  extraOrders?: Record<number, number>;
  /** Cases à compléter par l'élève, au format « semaine.colonne » (ex. « 1.S »). */
  blanks: string[];
}

export interface CadencierWeek {
  s: number;
  c: number;
  l: number;
  v: number;
  orderDetail: string;
}

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ','));

export function computeCadencier(input: CadencierInput): CadencierWeek[] {
  const out: CadencierWeek[] = [];
  input.sales.forEach((v, w) => {
    if (w === 0) {
      out.push({ s: 0, c: input.firstOrder, l: input.firstDelivery, v, orderDetail: 'Donnée de départ.' });
      return;
    }
    const p = out[w - 1];
    const s = p.s + p.l - p.v;
    const l = p.c;
    let c: number;
    let orderDetail: string;
    const fixed = input.fixedOrders?.[w];
    if (fixed !== undefined) {
      c = fixed;
      orderDetail = 'Commande fixée par le responsable.';
    } else {
      const v1 = input.sales[w - 2] ?? input.sales[w - 1];
      const v2 = input.sales[w - 1];
      const need = (v1 + v2) / 2 - s;
      const base = need <= 0 ? 0 : Math.ceil(need / input.colisage) * input.colisage;
      const extra = input.extraOrders?.[w] ?? 0;
      c = base + extra;
      orderDetail =
        `(${v1} + ${v2}) ÷ 2 − ${s} = ${fmt(need)}` +
        (need <= 0 ? ' : résultat négatif, pas de commande' : `, arrondi au colisage de ${input.colisage} : ${base}`) +
        (extra ? `, + ${extra} pour anticiper le temps fort = ${c}.` : '.');
    }
    out.push({ s, c, l, v, orderDetail });
  });
  return out;
}

/** Lignes d'annexe : les cases listées dans `blanks` sont à compléter, les autres sont données. */
export function cadencierRows(inputs: CadencierInput[]) {
  return inputs.map((inp) => {
    const weeks = computeCadencier(inp);
    const cols: CadCol[] = ['S', 'C', 'L', 'V'];
    const cells = weeks.flatMap((wk, w) =>
      cols.map((col) => {
        const value = { S: wk.s, C: wk.c, L: wk.l, V: wk.v }[col];
        if (!inp.blanks.includes(`${w}.${col}`)) return value;
        const prev = weeks[w - 1];
        const next = weeks[w + 1];
        const explain =
          col === 'S'
            ? `Stock = ${prev.s} + ${prev.l} − ${prev.v} = ${wk.s} (stock + livraison − ventes de la semaine précédente).`
            : col === 'L'
              ? `Livraison = commande passée la semaine précédente = ${prev.c}.`
              : col === 'C'
                ? `Commande : ${wk.orderDetail}`
                : `Ventes = ${wk.s} + ${wk.l} − ${next?.s ?? '?'} = ${wk.v} (stock + livraison − stock de la semaine suivante).`;
        return { answer: value, explain };
      }),
    );
    return { id: inp.id, label: inp.label, sub: `Colisage : ${inp.colisage}`, cells };
  });
}
