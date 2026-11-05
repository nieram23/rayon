/**
 * Version papier d'un dossier : un vrai cahier mis en page (A4), généré en PDF.
 * Couverture, sommaire, une partie par étape (documents puis annexes à compléter),
 * coups de pouce en fin de cahier. Option « corrigé » pour le professeur.
 */
import { Document, Image, Page, Polygon, Circle, Rect, StyleSheet, Svg, Text, View } from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';
import type { ReactNode } from 'react';
import type {
  Activity,
  Chapter,
  ChapterDocument,
  ChapterStep,
  DocBlock,
  Field,
  FieldsActivity,
  PlanningSymbol,
} from '../domain/chapter';
import type { LearningUnit } from '../domain/types';
import { C, FONT_BODY, FONT_MATH, FONT_TITLE, PART_COLORS, ZONE_TONES, clean, splitMath } from './theme';

export interface PdfAssets {
  /** Pictogrammes et plans dessinés, convertis en images (clé → data URL PNG). */
  images: Record<string, string>;
  /** Photos disponibles au format JPG ou PNG (id → URL). */
  photos: Record<string, string>;
}

export interface PdfOptions {
  corrige: boolean;
  partTitle: string;
  generatedOn: string;
}

const KIND_LABEL: Record<ChapterStep['kind'], string> = {
  ouverture: 'Ouverture',
  mission: 'Mission',
  synthese: 'Synthèse',
  application: 'Application',
  bilan: 'Bilan',
};
export const stepLabel = (s: ChapterStep) => (s.number ? `${KIND_LABEL[s.kind]} ${s.number}` : KIND_LABEL[s.kind]);

const LOOK_LABEL: Record<ChapterDocument['look'], string> = {
  texte: 'Document',
  fiche: 'Fiche produit',
  courriel: 'Courriel',
  contrat: 'Extrait de contrat',
  facture: 'Document commercial',
  article: 'Article',
  procedure: 'Procédure',
  memo: 'Note interne',
  site: 'Site internet',
  postit: 'Note',
};

const SELF_LEVELS = ['Pas encore', 'Avec de l’aide', 'Oui', 'Oui, et je sais l’expliquer'];

export const signKey = (s: string) => `sign:${s}`;
export const planKey = (stepId: string, docId: string, i: number) => `plan:${stepId}:${docId}:${i}`;

/* ============================== Styles ============================== */

const s = StyleSheet.create({
  page: { fontFamily: FONT_BODY, fontSize: 9.6, lineHeight: 1.42, color: C.ink, paddingTop: 54, paddingBottom: 54, paddingHorizontal: 42 },
  header: { position: 'absolute', top: 22, left: 42, right: 42, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 0.6, borderBottomColor: C.line, paddingBottom: 5, fontSize: 7.6, color: C.ink3 },
  footer: { position: 'absolute', top: 804, left: 42, right: 42, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7.6, color: C.ink3, borderTopWidth: 0.6, borderTopColor: C.line, paddingTop: 5 },
  h1: { fontFamily: FONT_TITLE, fontWeight: 800, fontSize: 21, lineHeight: 1.12 },
  h2: { fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 13.5, lineHeight: 1.2 },
  h3: { fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 11, lineHeight: 1.25 },
  eyebrow: { fontSize: 7.4, fontWeight: 700, letterSpacing: 1.1, textTransform: 'uppercase', color: C.ink3 },
  bold: { fontWeight: 700 },
  small: { fontSize: 8, color: C.ink3 },
  italic: { fontStyle: 'italic' },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', marginTop: 14, marginBottom: 7 },
  sectionRule: { flexGrow: 1, height: 0.8, backgroundColor: C.line, marginLeft: 8 },
  card: { borderWidth: 0.8, borderColor: C.line, borderRadius: 5, backgroundColor: C.card, padding: 10, marginBottom: 9 },
  badge: { fontSize: 7.4, fontWeight: 700, color: C.white, backgroundColor: C.ink, paddingHorizontal: 5, paddingVertical: 1.5, borderRadius: 3 },
  table: { borderWidth: 0.7, borderColor: C.line, borderRadius: 3, marginVertical: 4 },
  tr: { flexDirection: 'row', borderTopWidth: 0.6, borderTopColor: C.lineSoft },
  th: { backgroundColor: C.ink, color: C.white, fontWeight: 700, fontSize: 8, paddingHorizontal: 4, paddingVertical: 3.5 },
  td: { paddingHorizontal: 4, paddingVertical: 3, fontSize: 8.6 },
  box: { minHeight: 15, borderWidth: 0.8, borderColor: C.ink3, borderRadius: 2.5, backgroundColor: C.white, justifyContent: 'center', paddingHorizontal: 4 },
  answer: { color: C.answer, fontWeight: 700 },
  line: { height: 19, borderBottomWidth: 0.6, borderBottomColor: '#b9b3a6', borderBottomStyle: 'dotted' },
  check: { width: 8, height: 8, borderWidth: 0.8, borderColor: C.ink2, borderRadius: 1.5, marginRight: 3.5 },
});

/* ============================== Primitives ============================== */

/** Texte avec police de secours pour les symboles (≥, →…). */
function T({ children, style }: { children: string; style?: Style | Style[] }) {
  const parts = splitMath(clean(children));
  if (parts.length === 1 && !parts[0].math) return <Text style={style}>{parts[0].t}</Text>;
  return (
    <Text style={style}>
      {parts.map((p, i) =>
        p.math ? (
          <Text key={i} style={{ fontFamily: FONT_MATH }}>
            {p.t}
          </Text>
        ) : (
          p.t
        ),
      )}
    </Text>
  );
}

function Check({ on }: { on?: boolean }) {
  return <View style={[s.check, on ? { backgroundColor: C.answer, borderColor: C.answer } : {}]} />;
}

function Lines({ n, model, corrige }: { n: number; model?: string; corrige: boolean }) {
  if (corrige && model)
    return (
      <View style={{ backgroundColor: C.answerSoft, borderLeftWidth: 2, borderLeftColor: C.answer, padding: 6, marginTop: 3, borderRadius: 2 }}>
        <T style={[s.small, { color: C.answer, fontWeight: 700, marginBottom: 1 }]}>Proposition de corrigé</T>
        <T style={{ color: C.ink, fontSize: 8.8 }}>{model}</T>
      </View>
    );
  return (
    <View style={{ marginTop: 2 }}>
      {Array.from({ length: n }, (_, i) => (
        <View key={i} style={s.line} />
      ))}
    </View>
  );
}

function Box({ value, width, corrige, unit }: { value?: string; width?: number | string; corrige: boolean; unit?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={[s.box, { width: width ?? 70 }]}>{corrige && value ? <T style={[s.answer, { fontSize: 8.6 }]}>{value}</T> : <Text> </Text>}</View>
      {unit ? <T style={{ marginLeft: 3, fontSize: 8.6 }}>{unit}</T> : null}
    </View>
  );
}

/** N'ajoute pas de numéro si la consigne en porte déjà un (« 1. », « 2) »…). */
const numbered = (n: number | undefined, label: string) => (n && !/^\s*\d+\s*[.)–-]/.test(label) ? `${n}. ${label}` : label);

const fmt = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 2 });

/** Largeurs de colonnes proportionnelles au contenu. */
function colWeights(head: string[], rows: string[][]): number[] {
  return head.map((h, i) => {
    const max = Math.max(h.length * 0.8, ...rows.map((r) => (r[i] ?? '').length));
    return Math.sqrt(Math.min(Math.max(max, 4), 60));
  });
}

function SectionTitle({ children, color }: { children: string; color: string }) {
  return (
    <View style={s.sectionTitle} minPresenceAhead={60}>
      <View style={{ width: 4, height: 11, backgroundColor: color, borderRadius: 1, marginRight: 6 }} />
      <Text style={[s.eyebrow, { color: C.ink, fontSize: 8 }]}>{children}</Text>
      <View style={s.sectionRule} />
    </View>
  );
}

/* ============================== Blocs de documents ============================== */

function Table({ head, rows, caption, align }: { head: string[]; rows: string[][]; caption?: string; align?: Array<'left' | 'right' | 'center'> }) {
  const w = colWeights(head, rows);
  const dense = head.length > 6;
  const ta = (i: number) => (align?.[i] ?? 'left') as 'left' | 'right' | 'center';
  return (
    <View style={{ marginVertical: 3 }}>
      <View style={s.table}>
        <View style={{ flexDirection: 'row' }} fixed={false}>
          {head.map((h, i) => (
            <View key={i} style={[s.th, { flex: w[i], borderTopLeftRadius: i === 0 ? 2.5 : 0, borderTopRightRadius: i === head.length - 1 ? 2.5 : 0 }]}>
              <T style={{ textAlign: ta(i), fontSize: dense ? 7.2 : 8 }}>{h}</T>
            </View>
          ))}
        </View>
        {rows.map((r, ri) => (
          <View key={ri} style={[s.tr, { backgroundColor: ri % 2 ? '#faf8f2' : C.white }]} wrap={false}>
            {head.map((_, i) => (
              <View key={i} style={[s.td, { flex: w[i] }]}>
                <T style={{ textAlign: ta(i), fontSize: dense ? 7.6 : 8.6, fontWeight: i === 0 ? 700 : 400 }}>{r[i] ?? ''}</T>
              </View>
            ))}
          </View>
        ))}
      </View>
      {caption ? <T style={[s.small, s.italic]}>{caption}</T> : null}
    </View>
  );
}

function Block({ b, assets, stepId, docId, index }: { b: DocBlock; assets: PdfAssets; stepId: string; docId: string; index: number }) {
  switch (b.type) {
    case 'p':
      return <T style={{ marginBottom: 4 }}>{b.text}</T>;
    case 'list':
      return (
        <View style={{ marginBottom: 4 }}>
          {b.title ? <T style={[s.bold, { marginBottom: 2 }]}>{b.title}</T> : null}
          {b.items.map((it, i) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 1.5 }}>
              <Text style={{ width: 10, color: C.ink3 }}>•</Text>
              <T style={{ flex: 1 }}>{it}</T>
            </View>
          ))}
        </View>
      );
    case 'table':
      return <Table head={b.head} rows={b.rows} caption={b.caption} align={b.align} />;
    case 'facts':
      return (
        <View style={{ marginVertical: 3, borderTopWidth: 0.6, borderTopColor: C.lineSoft }}>
          {b.items.map(([k, v], i) => (
            <View key={i} style={{ flexDirection: 'row', borderBottomWidth: 0.6, borderBottomColor: C.lineSoft, paddingVertical: 2.5 }} wrap={false}>
              <T style={{ width: '36%', color: C.ink3, fontSize: 8.6, paddingRight: 6 }}>{k}</T>
              <T style={{ flex: 1, fontWeight: 700, fontSize: 8.8 }}>{v}</T>
            </View>
          ))}
        </View>
      );
    case 'note':
      return (
        <View style={{ backgroundColor: C.tagSoft, borderLeftWidth: 2.5, borderLeftColor: C.tag, padding: 6, marginVertical: 4, borderRadius: 2 }} wrap={false}>
          <T style={{ fontSize: 9 }}>{b.text}</T>
        </View>
      );
    case 'formula':
      return (
        <View style={{ borderWidth: 0.8, borderColor: C.ink, borderRadius: 4, padding: 7, marginVertical: 4, alignItems: 'center' }} wrap={false}>
          <T style={{ fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 10.5, textAlign: 'center' }}>{b.text}</T>
          {b.example ? <T style={[s.small, { marginTop: 2, textAlign: 'center' }]}>{`Exemple : ${b.example}`}</T> : null}
        </View>
      );
    case 'quote':
      return (
        <View style={{ borderLeftWidth: 2.5, borderLeftColor: C.ink3, paddingLeft: 8, marginVertical: 4 }} wrap={false}>
          <T style={s.italic}>{`« ${b.text} »`}</T>
          <T style={[s.small, { marginTop: 1 }]}>{`— ${b.author}`}</T>
        </View>
      );
    case 'image': {
      const src = assets.photos[b.image.id];
      if (!src) return null;
      return (
        <View style={{ marginVertical: 4 }} wrap={false}>
          <Image src={src} style={{ width: '100%', maxHeight: 190, objectFit: 'cover', borderRadius: 3 }} />
          {b.image.caption ? <T style={[s.small, s.italic, { marginTop: 2 }]}>{b.image.caption}</T> : null}
        </View>
      );
    }
    case 'zones':
      return (
        <View style={{ marginVertical: 4 }} wrap={false}>
          {b.title ? <T style={[s.bold, { marginBottom: 3 }]}>{b.title}</T> : null}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -2 }}>
            {b.zones.map((z) => (
              <View key={z.id} style={{ width: z.wide ? '50%' : '25%', padding: 2 }}>
                <View style={{ backgroundColor: ZONE_TONES[z.tone] ?? ZONE_TONES.gris, borderWidth: 0.6, borderColor: '#c9c2b2', borderRadius: 3, minHeight: 38, padding: 4, alignItems: 'center', justifyContent: 'center' }}>
                  <T style={{ fontWeight: 700, fontSize: 8.4, textAlign: 'center' }}>{z.label}</T>
                  {z.sub ? <T style={{ fontSize: 7.4, textAlign: 'center', color: C.ink2 }}>{z.sub}</T> : null}
                </View>
              </View>
            ))}
          </View>
        </View>
      );
    case 'signs':
      return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 4 }} wrap={false}>
          {b.signs.map((sg, i) => (
            <View key={i} style={{ width: 66, alignItems: 'center', marginRight: 6, marginBottom: 4 }}>
              {assets.images[signKey(sg)] ? <Image src={assets.images[signKey(sg)]} style={{ width: 46, height: 46 }} /> : <View style={{ width: 46, height: 46, borderWidth: 0.6, borderColor: C.line }} />}
              {b.labels?.[i] ? <T style={{ fontSize: 7, textAlign: 'center', marginTop: 2 }}>{b.labels[i]}</T> : null}
            </View>
          ))}
        </View>
      );
    case 'plan': {
      const src = assets.images[planKey(stepId, docId, index)];
      return (
        <View style={{ marginVertical: 4 }} wrap={false}>
          {b.plan.title ? <T style={[s.bold, { marginBottom: 3 }]}>{b.plan.title}</T> : null}
          {src ? (
            <Image src={src} style={{ width: '100%', borderWidth: 0.6, borderColor: C.line, borderRadius: 3 }} />
          ) : (
            <View style={{ height: 120, borderWidth: 0.6, borderColor: C.line, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={s.small}>Plan du magasin</Text>
            </View>
          )}
          {b.plan.legend ? <T style={[s.small, { marginTop: 2 }]}>{b.plan.legend}</T> : null}
        </View>
      );
    }
  }
}

function DocCard({ doc, assets, stepId, part }: { doc: ChapterDocument; assets: PdfAssets; stepId: string; part: { main: string; soft: string } }) {
  const bg = doc.look === 'postit' ? '#fbe6a6' : doc.look === 'memo' ? C.tagSoft : doc.look === 'facture' || doc.look === 'site' ? C.white : C.card;
  const long = doc.blocks.length > 4 || doc.blocks.some((b) => b.type === 'table' && b.rows.length > 8);
  return (
    <View style={[s.card, { backgroundColor: bg }]} wrap={long}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }} minPresenceAhead={40}>
        <Text style={[s.badge, { backgroundColor: part.main }]}>{`DOC ${doc.number}`}</Text>
        <Text style={[s.eyebrow, { marginLeft: 6 }]}>{LOOK_LABEL[doc.look]}</Text>
      </View>
      <T style={[s.h3, { marginBottom: 5 }]}>{doc.title}</T>
      {doc.look === 'site' && doc.url ? (
        <View style={{ backgroundColor: '#ecebe7', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2.5, marginBottom: 6 }}>
          <T style={{ fontSize: 7.6, color: C.ink2 }}>{doc.url}</T>
        </View>
      ) : null}
      {doc.blocks.map((b, i) => (
        <Block key={i} b={b} assets={assets} stepId={stepId} docId={doc.id} index={i} />
      ))}
      {doc.source ? <T style={[s.small, s.italic, { marginTop: 3, textAlign: 'right' }]}>{`Source : ${doc.source}`}</T> : null}
    </View>
  );
}

/* ============================== Champs et activités ============================== */

function fieldAnswer(f: Field): string | undefined {
  switch (f.kind) {
    case 'number':
      return fmt(f.answer);
    case 'text':
      return f.accept[0];
    case 'choice':
      return f.options.find((o) => o.value === f.answer)?.label;
    case 'multi':
      return f.options.filter((o) => f.answers.includes(o.value)).map((o) => o.label).join(', ');
    case 'given':
      return f.value;
    default:
      return undefined;
  }
}

function Options({ f, corrige }: { f: Extract<Field, { kind: 'choice' | 'multi' }>; corrige: boolean }) {
  const good = (v: string) => (f.kind === 'choice' ? f.answer === v : f.answers.includes(v));
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 }}>
      {f.options.map((o) => (
        <View key={o.value} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10, marginBottom: 2.5 }}>
          <Check on={corrige && good(o.value)} />
          <T style={[{ fontSize: 8.8 }, corrige && good(o.value) ? s.answer : {}]}>{o.label}</T>
        </View>
      ))}
    </View>
  );
}

function FieldRow({ f, n, corrige, last, first }: { f: Field; n?: number; corrige: boolean; last: boolean; first: boolean }) {
  const border: Style = {
    borderLeftWidth: 0.8,
    borderRightWidth: 0.8,
    borderLeftColor: C.line,
    borderRightColor: C.line,
    borderBottomWidth: last ? 0.8 : 0.6,
    borderBottomColor: last ? C.line : C.lineSoft,
    ...(first ? { borderTopWidth: 0.8, borderTopColor: C.line, borderTopLeftRadius: 4, borderTopRightRadius: 4 } : {}),
    ...(last ? { borderBottomLeftRadius: 4, borderBottomRightRadius: 4 } : {}),
    ...(f.kind === 'given' ? {} : { backgroundColor: C.white }),
  };
  const label = (
    <T style={{ fontWeight: 700, fontSize: 9 }}>{numbered(n, f.label)}</T>
  );
  if (f.kind === 'given')
    return (
      <View style={[{ flexDirection: 'row', paddingVertical: 4, paddingHorizontal: 6, backgroundColor: '#f6f4ee' }, border]} wrap={false}>
        <T style={{ flex: 1, fontSize: 9, color: C.ink2 }}>{f.label}</T>
        <T style={{ fontWeight: 700, fontSize: 9 }}>{f.value}</T>
      </View>
    );
  if (f.kind === 'number' || f.kind === 'text')
    return (
      <View style={[{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 6 }, border]} wrap={false}>
        <View style={{ flex: 1, paddingRight: 8 }}>{label}</View>
        <Box value={fieldAnswer(f)} corrige={corrige} unit={f.kind === 'number' ? f.unit : undefined} width={f.kind === 'text' ? 150 : 72} />
      </View>
    );
  if (f.kind === 'choice' || f.kind === 'multi')
    return (
      <View style={[{ paddingVertical: 4, paddingHorizontal: 6 }, border]} wrap={false}>
        {label}
        {f.kind === 'multi' ? <T style={s.small}>Plusieurs réponses possibles.</T> : null}
        <Options f={f} corrige={corrige} />
      </View>
    );
  // written
  return (
    <View style={[{ paddingVertical: 4, paddingHorizontal: 6 }, border]} wrap={(f.lines ?? 3) > 6}>
      {label}
      <Lines n={Math.max(2, f.lines ?? 3)} model={f.model} corrige={corrige} />
      {corrige && f.criteria?.length ? <T style={[s.small, { marginTop: 2 }]}>{`Critères : ${f.criteria.join(' · ')}`}</T> : null}
    </View>
  );
}

function FieldsBody({ a, corrige, assets }: { a: FieldsActivity; corrige: boolean; assets: PdfAssets }) {
  if (a.layout === 'columns' && a.columns) {
    const cols = a.columns;
    const rows: Array<{ key: string; label: string; cells: Field[] | null; single?: Field }> = [];
    for (const f of a.fields) {
      const [row, col] = f.id.split('.');
      if (col === undefined) {
        rows.push({ key: f.id, label: f.label, cells: null, single: f });
        continue;
      }
      let r = rows.find((x) => x.key === row && x.cells);
      if (!r) {
        r = { key: row, label: f.label, cells: [] };
        rows.push(r);
      }
      r.cells![Number(col)] = f;
    }
    const first = 2.2;
    const cell = (f: Field | undefined) => {
      if (!f) return null;
      if (f.kind === 'given') return <T style={{ fontSize: 8.6, textAlign: 'center' }}>{f.value}</T>;
      if (f.kind === 'written') return corrige ? <T style={[s.answer, { fontSize: 8 }]}>{f.model}</T> : <View style={{ height: 30 }} />;
      if (f.kind === 'choice' || f.kind === 'multi') return <Options f={f} corrige={corrige} />;
      return <Box value={fieldAnswer(f)} corrige={corrige} width="100%" unit={f.kind === 'number' ? f.unit : undefined} />;
    };
    return (
      <View style={s.table}>
        <View style={{ flexDirection: 'row' }}>
          <View style={[s.th, { flex: first }]}>
            <Text> </Text>
          </View>
          {cols.map((c) => (
            <View key={c} style={[s.th, { flex: 1 }]}>
              <T style={{ textAlign: 'center', fontSize: 7.6 }}>{c}</T>
            </View>
          ))}
        </View>
        {rows.map((r) => (
          <View key={r.key} style={[s.tr, { alignItems: 'center', minHeight: 22 }]} wrap={false}>
            <View style={[s.td, { flex: first }]}>
              <T style={{ fontWeight: 700, fontSize: 8.6 }}>{r.label}</T>
            </View>
            {r.cells ? (
              cols.map((c, i) => (
                <View key={c} style={[s.td, { flex: 1, borderLeftWidth: 0.6, borderLeftColor: C.lineSoft }]}>
                  {cell(r.cells![i])}
                </View>
              ))
            ) : (
              <View style={[s.td, { flex: cols.length }]}>{cell(r.single)}</View>
            )}
          </View>
        ))}
      </View>
    );
  }

  if (a.layout === 'signs')
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -3 }}>
        {a.fields.map((f, i) => (
          <View key={f.id} style={{ width: '50%', padding: 3 }} wrap={false}>
            <View style={{ borderWidth: 0.8, borderColor: C.line, borderRadius: 4, padding: 6, backgroundColor: C.white, minHeight: 90 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={[s.small, s.bold, { marginRight: 6 }]}>{String(i + 1)}</Text>
                {f.kind === 'choice' && f.sign && assets.images[signKey(f.sign)] ? <Image src={assets.images[signKey(f.sign)]} style={{ width: 44, height: 44, marginRight: 6 }} /> : null}
                {f.kind === 'choice' && f.image && assets.photos[f.image.id] ? <Image src={assets.photos[f.image.id]} style={{ width: 70, height: 48, objectFit: 'cover', marginRight: 6 }} /> : null}
                <View style={{ flex: 1 }}>
                  {!(f.kind === 'choice' && (f.sign || f.image)) ? <T style={{ fontWeight: 700, fontSize: 8.8 }}>{f.label}</T> : null}
                  {f.kind === 'choice' || f.kind === 'multi' ? <Options f={f} corrige={corrige} /> : <Lines n={2} corrige={corrige} model={fieldAnswer(f)} />}
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    );

  let n = 0;
  const list = (
    <View>
      {a.fields.map((f, i) => (
        <FieldRow key={f.id} f={f} n={f.kind === 'given' ? undefined : ++n} corrige={corrige} first={i === 0} last={i === a.fields.length - 1} />
      ))}
    </View>
  );
  if (a.layout === 'extranet')
    return (
      <View>
        <View style={{ backgroundColor: C.ink, borderTopLeftRadius: 4, borderTopRightRadius: 4, paddingHorizontal: 8, paddingVertical: 4, flexDirection: 'row', alignItems: 'center' }}>
          {[C.danger, C.tag, '#74b04a'].map((c) => (
            <View key={c} style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: c, marginRight: 3 }} />
          ))}
          <T style={{ color: C.white, fontWeight: 700, fontSize: 8.4, marginLeft: 5 }}>{a.windowTitle ?? 'Extranet fournisseur'}</T>
        </View>
        {list}
      </View>
    );
  return list;
}

function PlanningGlyph({ symbol, size = 9 }: { symbol: PlanningSymbol; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20">
      {symbol === 'commande' && <Polygon points="10,2 18,17 2,17" fill="#74b04a" />}
      {symbol === 'prevue' && <Circle cx={10} cy={10} r={7} fill="none" stroke="#3f63c9" strokeWidth={2.5} />}
      {symbol === 'effective' && <Circle cx={10} cy={10} r={8} fill="#3f63c9" />}
      {symbol === 'relance' && <Rect x={3} y={3} width={14} height={14} fill="#c8372d" />}
    </Svg>
  );
}

const PLANNING_LABEL: Record<PlanningSymbol, string> = {
  commande: 'Date de commande',
  prevue: 'Date prévisionnelle de livraison',
  effective: 'Date effective de livraison',
  relance: 'Date de relance',
};

function ActivityBody({ a, corrige, assets }: { a: Activity; corrige: boolean; assets: PdfAssets }) {
  switch (a.kind) {
    case 'fields':
      return <FieldsBody a={a} corrige={corrige} assets={assets} />;
    case 'classify': {
      const groups = [...new Set(a.categories.map((c) => c.group ?? ''))];
      const many = a.categories.length > 5;
      if (many || groups.length > 1)
        return (
          <View>
            {a.items.map((it, i) => (
              <View key={it.id} style={{ padding: 5, borderWidth: 0.8, borderColor: C.line, borderRadius: 3, backgroundColor: C.white, marginBottom: 3 }} wrap={false}>
                <T style={{ fontWeight: 700, fontSize: 8.8, marginBottom: 2 }}>{numbered(i + 1, it.text)}</T>
                {groups.map((g) => (
                  <View key={g} style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                    {g ? <T style={[s.small, s.bold, { marginRight: 6 }]}>{g}</T> : null}
                    {a.categories
                      .filter((c) => (c.group ?? '') === g)
                      .map((c) => (
                        <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 9, marginBottom: 2 }}>
                          <Check on={corrige && it.answer === c.id} />
                          <T style={[{ fontSize: 8.4 }, corrige && it.answer === c.id ? s.answer : {}]}>{c.label}</T>
                        </View>
                      ))}
                  </View>
                ))}
              </View>
            ))}
          </View>
        );
      return (
        <View style={s.table}>
          <View style={{ flexDirection: 'row' }}>
            <View style={[s.th, { flex: 3 }]}>
              <Text>Élément</Text>
            </View>
            {a.categories.map((c) => (
              <View key={c.id} style={[s.th, { flex: 1 }]}>
                <T style={{ textAlign: 'center', fontSize: 7.6 }}>{c.label}</T>
              </View>
            ))}
          </View>
          {a.items.map((it, i) => (
            <View key={it.id} style={[s.tr, { alignItems: 'center', backgroundColor: i % 2 ? '#faf8f2' : C.white }]} wrap={false}>
              <View style={[s.td, { flex: 3 }]}>
                <T style={{ fontSize: 8.6 }}>{it.text}</T>
              </View>
              {a.categories.map((c) => (
                <View key={c.id} style={[s.td, { flex: 1, alignItems: 'center' }]}>
                  <Check on={corrige && it.answer === c.id} />
                </View>
              ))}
            </View>
          ))}
        </View>
      );
    }
    case 'circuit':
      return (
        <View>
          {a.circuits.map((c, ci) => (
            <View key={c.id} style={{ borderWidth: 0.8, borderColor: C.line, borderRadius: 4, padding: 7, marginBottom: 6, backgroundColor: C.white }} wrap={false}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: 5 }}>
                <T style={[s.bold, { marginRight: 8 }]}>{`Circuit ${ci + 1} · type :`}</T>
                {c.typeOptions.map((o) => (
                  <View key={o.value} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 9 }}>
                    <Check on={corrige && c.typeAnswer === o.value} />
                    <T style={[{ fontSize: 8.6 }, corrige && c.typeAnswer === o.value ? s.answer : {}]}>{o.label}</T>
                  </View>
                ))}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                {c.slots.map((sl, i) => (
                  <View key={sl.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                    <View style={[s.box, { width: 92, minHeight: 24, alignItems: 'center', backgroundColor: sl.fixed ? '#f6f4ee' : C.white }]}>
                      {sl.fixed ? (
                        <T style={{ fontSize: 8, fontWeight: 700, textAlign: 'center' }}>{sl.fixed}</T>
                      ) : corrige ? (
                        <T style={[s.answer, { fontSize: 7.8, textAlign: 'center' }]}>{c.slotOptions.find((o) => o.value === sl.answer)?.label ?? ''}</T>
                      ) : (
                        <Text> </Text>
                      )}
                    </View>
                    {i < c.slots.length - 1 ? <Text style={{ fontFamily: FONT_MATH, marginHorizontal: 3, color: C.ink3 }}>→</Text> : null}
                  </View>
                ))}
              </View>
              <T style={[s.small, { marginTop: 3 }]}>{`Maillons possibles : ${c.slotOptions.map((o) => o.label).join(' · ')}`}</T>
            </View>
          ))}
        </View>
      );
    case 'grid': {
      const cols = a.groups.flatMap((g) => g.columns);
      const dense = cols.length > 8;
      return (
        <View>
          <View style={s.table}>
            <View style={{ flexDirection: 'row' }}>
              <View style={[s.th, { flex: 2.6 }]}>
                <Text> </Text>
              </View>
              {a.groups.map((g) => (
                <View key={g.label} style={[s.th, { flex: g.columns.length, borderLeftWidth: 0.6, borderLeftColor: '#555' }]}>
                  <T style={{ textAlign: 'center', fontSize: dense ? 6.8 : 7.8 }}>{g.label}</T>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: 'row', backgroundColor: '#3b3f48' }}>
              <View style={{ flex: 2.6 }} />
              {cols.map((c, i) => (
                <View key={i} style={{ flex: 1, paddingVertical: 2 }}>
                  <T style={{ textAlign: 'center', fontSize: dense ? 6.4 : 7.4, color: C.white, fontWeight: 700 }}>{c}</T>
                </View>
              ))}
            </View>
            {a.rows.map((r, ri) => (
              <View key={r.id} style={[s.tr, { alignItems: 'center', minHeight: 20, backgroundColor: ri % 2 ? '#faf8f2' : C.white }]} wrap={false}>
                <View style={[s.td, { flex: 2.6 }]}>
                  <T style={{ fontWeight: 700, fontSize: dense ? 7.6 : 8.4 }}>{r.label}</T>
                  {r.sub ? <T style={{ fontSize: 6.8, color: C.ink3 }}>{r.sub}</T> : null}
                </View>
                {r.cells.map((c, i) => (
                  <View key={i} style={{ flex: 1, paddingHorizontal: 1.5, paddingVertical: 2, borderLeftWidth: 0.5, borderLeftColor: C.lineSoft, alignItems: 'center' }}>
                    {typeof c === 'object' ? (
                      <View style={[s.box, { width: '100%', minHeight: 13, paddingHorizontal: 1, alignItems: 'center' }]}>
                        {corrige ? <T style={[s.answer, { fontSize: dense ? 6.8 : 7.8 }]}>{fmt(c.answer)}</T> : <Text> </Text>}
                      </View>
                    ) : (
                      <T style={{ fontSize: dense ? 7 : 8.2 }}>{typeof c === 'number' ? fmt(c) : c}</T>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>
          {a.legend ? <T style={[s.small, { marginTop: 2 }]}>{a.legend}</T> : null}
        </View>
      );
    }
    case 'open':
      return (
        <View>
          {a.prompts.map((p, i) => (
            <View key={p.id} style={{ marginBottom: 5 }} wrap={(p.lines ?? 4) > 8}>
              <T style={{ fontWeight: 700, fontSize: 9 }}>{numbered(i + 1, p.label)}</T>
              <Lines n={Math.max(3, p.lines ?? 4)} corrige={false} />
            </View>
          ))}
          {a.selfCheck.length ? (
            <View style={{ backgroundColor: '#f6f4ee', borderRadius: 3, padding: 6, marginTop: 2 }} wrap={false}>
              <T style={[s.bold, { fontSize: 8.6, marginBottom: 2 }]}>Avant de rendre, je vérifie :</T>
              {a.selfCheck.map((c, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 1.5 }}>
                  <Check />
                  <T style={{ fontSize: 8.4, flex: 1 }}>{c}</T>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      );
    case 'planning':
      return (
        <View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 }}>
            {(Object.keys(PLANNING_LABEL) as PlanningSymbol[]).map((k) => (
              <View key={k} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
                <PlanningGlyph symbol={k} />
                <T style={{ fontSize: 7.8, marginLeft: 3 }}>{PLANNING_LABEL[k]}</T>
              </View>
            ))}
          </View>
          <View style={s.table}>
            <View style={{ flexDirection: 'row' }}>
              <View style={[s.th, { flex: 2.4 }]}>
                <Text>Commande</Text>
              </View>
              {a.days.map((d) => (
                <View key={d.id} style={[s.th, { flex: 1, paddingHorizontal: 1, alignItems: 'center' }]}>
                  <T style={{ fontSize: 6.4, textAlign: 'center' }}>{d.dow}</T>
                  <T style={{ fontSize: 7.6, textAlign: 'center' }}>{String(d.num)}</T>
                </View>
              ))}
            </View>
            {a.rows.map((r) => (
              <View key={r.id} style={[s.tr, { minHeight: 22, alignItems: 'stretch' }]} wrap={false}>
                <View style={[s.td, { flex: 2.4, justifyContent: 'center' }]}>
                  <T style={{ fontWeight: 700, fontSize: 8 }}>{r.label}</T>
                </View>
                {a.days.map((d) => {
                  const marks = [...r.given.filter((g) => g.day === d.id).map((g) => g.symbol), ...(corrige ? r.expected.filter((e) => e.day === d.id).map((e) => e.symbol) : [])];
                  return (
                    <View key={d.id} style={{ flex: 1, borderLeftWidth: 0.5, borderLeftColor: C.lineSoft, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', flexWrap: 'wrap' }}>
                      {marks.map((m, i) => (
                        <PlanningGlyph key={i} symbol={m} size={8} />
                      ))}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
          <T style={s.small}>{`Mois : ${[...new Set(a.days.map((d) => d.month))].join(' – ')}`}</T>
        </View>
      );
  }
}

function ActivityCard({ a, corrige, assets }: { a: Activity; corrige: boolean; assets: PdfAssets }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }} minPresenceAhead={80}>
        <Text style={[s.badge, { backgroundColor: C.tag, color: C.ink }]}>{a.label.toUpperCase()}</Text>
        <T style={[s.h3, { marginLeft: 6, flex: 1 }]}>{a.title}</T>
      </View>
      <T style={{ fontSize: 8.8, color: C.ink2, marginBottom: 5 }}>{a.instructions.replace(/\s*Clique sur « Vérifier mes réponses »[^.]*\./g, '').replace(/\s*Après avoir répondu, clique[^.]*\./g, '')}</T>
      <ActivityBody a={a} corrige={corrige} assets={assets} />
    </View>
  );
}

/* ============================== Pages ============================== */

function SelfAssessment({ criteria }: { criteria: string[] }) {
  return (
    <View style={s.table} wrap={false}>
      <View style={{ flexDirection: 'row' }}>
        <View style={[s.th, { flex: 3.2 }]}>
          <Text>Je sais…</Text>
        </View>
        {SELF_LEVELS.map((l) => (
          <View key={l} style={[s.th, { flex: 1 }]}>
            <T style={{ textAlign: 'center', fontSize: 7 }}>{l}</T>
          </View>
        ))}
      </View>
      {criteria.map((c, i) => (
        <View key={i} style={[s.tr, { alignItems: 'center' }]}>
          <View style={[s.td, { flex: 3.2 }]}>
            <T style={{ fontSize: 8.6 }}>{c}</T>
          </View>
          {SELF_LEVELS.map((l) => (
            <View key={l} style={[s.td, { flex: 1, alignItems: 'center' }]}>
              <Check />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function StepSection({ step, chapter, assets, corrige, part }: { step: ChapterStep; chapter: Chapter; assets: PdfAssets; corrige: boolean; part: { main: string; dark: string; soft: string } }) {
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <Text style={[s.badge, { backgroundColor: part.main, fontSize: 8.4, paddingHorizontal: 7, paddingVertical: 2.5 }]}>{stepLabel(step).toUpperCase()}</Text>
        {step.guidance ? <Text style={[s.eyebrow, { marginLeft: 8 }]}>{`Niveau ${step.guidance}`}</Text> : null}
      </View>
      <T style={[s.h1, { fontSize: 18, marginBottom: 8 }]}>{step.title}</T>

      {step.kind === 'ouverture' ? (
        <View style={{ flexDirection: 'row', marginBottom: 8 }} wrap={false}>
          <View style={{ flex: 1, backgroundColor: part.soft, borderRadius: 5, padding: 9, marginRight: 8 }}>
            <Text style={[s.eyebrow, { color: part.dark }]}>Ton entreprise</Text>
            <T style={[s.h2, { marginTop: 2 }]}>{chapter.company.name}</T>
            <T style={{ fontSize: 8.8, color: C.ink2, marginBottom: 4 }}>{chapter.company.tagline}</T>
            {chapter.company.facts.map(([k, v], i) => (
              <View key={i} style={{ flexDirection: 'row', marginBottom: 1 }}>
                <T style={{ width: '42%', fontSize: 8.2, color: C.ink3 }}>{k}</T>
                <T style={{ flex: 1, fontSize: 8.4, fontWeight: 700 }}>{v}</T>
              </View>
            ))}
          </View>
          <View style={{ flex: 1, borderWidth: 0.8, borderColor: C.line, borderRadius: 5, padding: 9 }}>
            <Text style={s.eyebrow}>Ta mission</Text>
            <T style={{ marginTop: 3 }}>{chapter.mission}</T>
          </View>
        </View>
      ) : null}

      {step.message ? (
        <View style={{ borderWidth: 0.8, borderColor: C.line, borderLeftWidth: 3, borderLeftColor: part.main, borderRadius: 4, padding: 8, marginBottom: 8, backgroundColor: C.card }} wrap={false}>
          <T style={[s.small, { marginBottom: 3 }]}>{`Message de ${step.message.from} · ${step.message.role}`}</T>
          {step.message.text.map((p, i) => (
            <T key={i} style={{ marginBottom: 2.5 }}>
              {p}
            </T>
          ))}
        </View>
      ) : null}

      {step.documents.length ? <SectionTitle color={part.main}>{step.documents.length > 1 ? 'Documents' : 'Document'}</SectionTitle> : null}
      {step.documents.map((d) => (
        <DocCard key={d.id} doc={d} assets={assets} stepId={step.id} part={part} />
      ))}

      {step.synthesis?.length ? (
        <>
          <SectionTitle color={part.main}>L’essentiel à retenir</SectionTitle>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 }}>
            {step.synthesis.map((sec, i) => (
              <View key={i} style={{ width: sec.items.length > 5 ? '100%' : '50%', padding: 4 }} wrap={false}>
                <View style={{ borderWidth: 0.8, borderColor: C.line, borderRadius: 4, padding: 7, backgroundColor: sec.kind === 'erreurs' ? '#fbe9e7' : sec.kind === 'formules' ? part.soft : C.card }}>
                  <T style={[s.h3, { fontSize: 10, marginBottom: 3 }]}>{sec.title}</T>
                  {sec.items.map((it, j) => (
                    <View key={j} style={{ flexDirection: 'row', marginBottom: 1.5 }}>
                      <Text style={{ width: 9, color: C.ink3 }}>•</Text>
                      <T style={{ flex: 1, fontSize: 8.6 }}>{it}</T>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </>
      ) : null}

      {step.activities.length ? <SectionTitle color={C.tag}>{step.activities.length > 1 ? 'Annexes à compléter' : 'Annexe à compléter'}</SectionTitle> : null}
      {step.activities.map((a) => (
        <ActivityCard key={a.id} a={a} corrige={corrige} assets={assets} />
      ))}

      {step.selfAssessment?.length ? (
        <>
          <SectionTitle color={part.main}>Mon autoévaluation</SectionTitle>
          <SelfAssessment criteria={step.selfAssessment} />
        </>
      ) : null}
    </View>
  );
}

function Cover({ unit, chapter, opts, part }: { unit: LearningUnit; chapter: Chapter; opts: PdfOptions; part: { main: string; dark: string; soft: string } }) {
  const code = unit.kind === 'dossier' ? `Dossier ${unit.number}` : `Scénario ${unit.number}`;
  return (
    <Page size="A4" style={[s.page, { padding: 0 }]}>
      <View style={{ backgroundColor: part.main, paddingHorizontal: 42, paddingTop: 46, paddingBottom: 30, color: C.white }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontFamily: FONT_TITLE, fontWeight: 800, fontSize: 13 }}>rayon</Text>
          <Text style={{ fontSize: 8, letterSpacing: 1.2 }}>BAC PRO MCV · OPTION A</Text>
        </View>
        <Text style={{ fontFamily: FONT_TITLE, fontWeight: 800, fontSize: 64, lineHeight: 1, marginTop: 40, opacity: 0.95 }}>{String(unit.number).padStart(2, '0')}</Text>
        <T style={{ fontSize: 9, letterSpacing: 1.1, textTransform: 'uppercase', marginTop: 6, fontWeight: 700 }}>{`${code} · ${opts.partTitle}`}</T>
        <T style={{ fontFamily: FONT_TITLE, fontWeight: 800, fontSize: 26, lineHeight: 1.1, marginTop: 8 }}>{unit.title}</T>
        {opts.corrige ? (
          <View style={{ marginTop: 14, alignSelf: 'flex-start', backgroundColor: C.white, borderRadius: 3, paddingHorizontal: 7, paddingVertical: 3 }}>
            <Text style={{ color: part.dark, fontWeight: 700, fontSize: 9 }}>VERSION PROFESSEUR · AVEC CORRIGÉ</Text>
          </View>
        ) : null}
      </View>

      <View style={{ paddingHorizontal: 42, paddingTop: 22 }}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1.15, marginRight: 14 }}>
            <Text style={s.eyebrow}>Ton entreprise</Text>
            <T style={[s.h2, { fontSize: 16, marginTop: 2 }]}>{chapter.company.name}</T>
            <T style={{ color: C.ink2, marginBottom: 6 }}>{chapter.company.tagline}</T>
            {chapter.company.facts.map(([k, v], i) => (
              <View key={i} style={{ flexDirection: 'row', borderBottomWidth: 0.6, borderBottomColor: C.lineSoft, paddingVertical: 2.5 }}>
                <T style={{ width: '42%', color: C.ink3, fontSize: 8.6 }}>{k}</T>
                <T style={{ flex: 1, fontWeight: 700, fontSize: 8.8 }}>{v}</T>
              </View>
            ))}
            <Text style={[s.eyebrow, { marginTop: 14 }]}>Ta mission</Text>
            <T style={{ marginTop: 3, fontSize: 10 }}>{chapter.mission}</T>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ borderWidth: 1, borderColor: C.ink, borderRadius: 5, padding: 10 }}>
              {['Nom', 'Prénom', 'Classe', 'Commencé le'].map((l) => (
                <View key={l} style={{ flexDirection: 'row', alignItems: 'flex-end', height: 22 }}>
                  <Text style={{ fontWeight: 700, fontSize: 9, width: 66 }}>{l}</Text>
                  <View style={{ flex: 1, borderBottomWidth: 0.6, borderBottomColor: C.ink3, borderBottomStyle: 'dotted', marginBottom: 3 }} />
                </View>
              ))}
            </View>
            <Text style={[s.eyebrow, { marginTop: 14 }]}>Compétences travaillées</Text>
            {unit.skills.map((sk) => (
              <View key={sk.id} style={{ flexDirection: 'row', marginTop: 3 }}>
                <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: part.main, marginTop: 4, marginRight: 6 }} />
                <T style={{ flex: 1, fontSize: 9 }}>{sk.text}</T>
              </View>
            ))}
          </View>
        </View>

        <Text style={[s.eyebrow, { marginTop: 18, marginBottom: 4 }]}>Au sommaire</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -3 }}>
          {chapter.steps.map((st) => (
            <View key={st.id} style={{ width: '50%', padding: 3 }}>
              <View style={{ flexDirection: 'row', borderWidth: 0.6, borderColor: C.line, borderRadius: 4, padding: 5, backgroundColor: C.card }}>
                <Text style={{ width: 70, fontSize: 7.6, fontWeight: 700, color: part.dark }}>{stepLabel(st).toUpperCase()}</Text>
                <T style={{ flex: 1, fontSize: 8.4 }}>{st.title}</T>
              </View>
            </View>
          ))}
        </View>
      </View>
      <View style={{ position: 'absolute', bottom: 24, left: 42, right: 42 }}>
        <T style={[s.small, s.italic]}>{chapter.fictionNotice}</T>
        <Text style={[s.small, { marginTop: 3 }]}>{`Cahier généré par Rayon le ${opts.generatedOn}.`}</Text>
      </View>
    </Page>
  );
}

function Outcomes({ unit, part }: { unit: LearningUnit; part: { main: string; soft: string } }) {
  const list = [...unit.outcomes, ...unit.plannedCriteria];
  return (
    <View>
      <Text style={s.eyebrow}>Grille d’évaluation</Text>
      <T style={[s.h1, { fontSize: 18, marginBottom: 8 }]}>Résultats attendus</T>
      <View style={s.table}>
        <View style={{ flexDirection: 'row' }}>
          <View style={[s.th, { flex: 4 }]}>
            <Text>Résultat attendu</Text>
          </View>
          {['NE', '1', '2', '3', '4'].map((l) => (
            <View key={l} style={[s.th, { flex: 0.55, alignItems: 'center' }]}>
              <Text>{l}</Text>
            </View>
          ))}
        </View>
        {list.map((o) => (
          <View key={o.id} style={[s.tr, { alignItems: 'center' }]} wrap={false}>
            <View style={[s.td, { flex: 4 }]}>
              <T style={{ fontSize: 8.8 }}>{o.text}</T>
            </View>
            {['NE', '1', '2', '3', '4'].map((l) => (
              <View key={l} style={[s.td, { flex: 0.55, alignItems: 'center' }]}>
                <Check />
              </View>
            ))}
          </View>
        ))}
      </View>
      <T style={[s.small, { marginTop: 3 }]}>NE : non évalué · 1 : insuffisant · 2 : fragile · 3 : satisfaisant · 4 : très bonne maîtrise. Grille remplie par le professeur.</T>
      <View style={{ marginTop: 10, borderWidth: 0.8, borderColor: C.line, borderRadius: 4, padding: 8, backgroundColor: part.soft }}>
        <Text style={[s.bold, { marginBottom: 2 }]}>Appréciation</Text>
        <Lines n={4} corrige={false} />
      </View>
    </View>
  );
}

function Helps({ chapter, part }: { chapter: Chapter; part: { main: string; soft: string } }) {
  const items = chapter.steps.flatMap((st) => st.activities.map((a) => ({ st, a })));
  return (
    <View>
      <Text style={s.eyebrow}>En cas de blocage</Text>
      <T style={[s.h1, { fontSize: 18, marginBottom: 4 }]}>Coups de pouce</T>
      <T style={{ color: C.ink2, marginBottom: 8 }}>Lis d’abord l’indice. Si tu bloques encore, lis le rappel de méthode. Essaie toujours de répondre seul avant de regarder.</T>
      {items.map(({ st, a }) => (
        <View key={a.id} style={{ borderBottomWidth: 0.6, borderBottomColor: C.lineSoft, paddingVertical: 4 }} wrap={false}>
          <T style={{ fontWeight: 700, fontSize: 8.8 }}>{`${stepLabel(st)} · ${a.label} — ${a.title}`}</T>
          <View style={{ flexDirection: 'row', marginTop: 1.5 }}>
            <Text style={{ width: 52, fontSize: 7.8, fontWeight: 700, color: part.main }}>INDICE</Text>
            <T style={{ flex: 1, fontSize: 8.4 }}>{a.helps[0]}</T>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 1 }}>
            <Text style={{ width: 52, fontSize: 7.8, fontWeight: 700, color: part.main }}>MÉTHODE</Text>
            <T style={{ flex: 1, fontSize: 8.4 }}>{a.helps[1]}</T>
          </View>
        </View>
      ))}
    </View>
  );
}

function ContentPage({ title, right, children }: { title: string; right: string; children: ReactNode }) {
  return (
    <Page size="A4" style={s.page}>
      <View style={s.header} fixed>
        <T style={{ fontWeight: 700, color: C.ink2, maxWidth: '75%' }}>{title}</T>
        <Text>{right}</Text>
      </View>
      <View style={s.footer} fixed>
        <Text>Rayon · Bac Pro MCV option A</Text>
        <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </View>
      {children}
    </Page>
  );
}

export function ChapterPdf({ unit, chapter, assets, opts }: { unit: LearningUnit; chapter: Chapter; assets: PdfAssets; opts: PdfOptions }) {
  const part = PART_COLORS[unit.partId] ?? PART_COLORS.p1;
  const code = unit.kind === 'dossier' ? `Dossier ${unit.number}` : `Scénario ${unit.number}`;
  const title = `${code} · ${unit.title}`;
  return (
    <Document title={`Rayon · ${title}${opts.corrige ? ' (corrigé)' : ''}`} author="Rayon · Bac Pro MCV" subject={unit.summary} language="fr-FR" creator="Rayon">
      <Cover unit={unit} chapter={chapter} opts={opts} part={part} />
      {chapter.steps.map((st) => (
        <ContentPage key={st.id} title={title} right={opts.corrige ? 'Corrigé professeur' : chapter.company.name}>
          <StepSection step={st} chapter={chapter} assets={assets} corrige={opts.corrige} part={part} />
        </ContentPage>
      ))}
      {!opts.corrige && chapter.steps.some((st) => st.activities.length) ? (
        <ContentPage title={title} right={chapter.company.name}>
          <Helps chapter={chapter} part={part} />
        </ContentPage>
      ) : null}
      {unit.outcomes.length + unit.plannedCriteria.length ? (
        <ContentPage title={title} right={opts.corrige ? 'Corrigé professeur' : chapter.company.name}>
          <Outcomes unit={unit} part={part} />
        </ContentPage>
      ) : null}
    </Document>
  );
}

