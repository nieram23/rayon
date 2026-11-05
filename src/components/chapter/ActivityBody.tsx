import { useId } from 'react';
import { ArrowDown, ArrowRight, Check, X } from 'lucide-react';
import type { Activity, AnswerValue, ChoiceOption, Field, GridActivity, PlanningActivity, PlanningSymbol } from '../../domain/chapter';
import { SafetySign } from './SafetySign';
import { Photo } from './Photo';
import { useState } from 'react';
import { cx } from '../../lib/theme';

type Marks = Record<string, { ok: boolean; expected?: string }> & { __reveal?: { ok: boolean } };
interface BodyProps {
  activity: Activity;
  values: Record<string, AnswerValue>;
  setValue: (k: string, v: AnswerValue) => void;
  marks: Marks;
}

/* ------------------------------ Repères de correction ------------------------------ */

function Mark({ m }: { m?: Marks[string] }) {
  if (!m) return null;
  return m.ok ? (
    <span className="inline-flex items-center gap-1 text-[0.8rem] font-bold text-p1-dark">
      <Check className="size-4" aria-hidden /> Juste
    </span>
  ) : (
    <span className="inline-flex flex-wrap items-center gap-1 text-[0.8rem] font-bold text-[#9a6210]">
      <X className="size-4" aria-hidden /> À revoir{m.expected && <span className="font-normal text-ink-2">· attendu : <strong>{m.expected}</strong></span>}
    </span>
  );
}

const markRing = (m?: Marks[string]) => (m ? (m.ok ? 'border-p1 ring-2 ring-p1/25' : 'border-m2 ring-2 ring-m2/30') : 'border-line-2');

/* ------------------------------ Entrées élémentaires ------------------------------ */

function NumberInput({ id, value, onChange, unit, mark, label, compact, wide }: { id: string; value?: AnswerValue; onChange: (v: string) => void; unit?: string; mark?: Marks[string]; label: string; compact?: boolean; wide?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        aria-label={label}
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
        className={cx(
          'rounded-lg border-2 bg-white text-right font-bold tabular-nums outline-none focus:border-ink',
          compact ? cx('h-10 px-1.5 text-[0.95rem]', wide ? 'w-20' : 'w-14') : 'h-11 w-36 px-3',
          markRing(mark),
        )}
      />
      {!compact && <span className="w-12 text-[0.9rem] text-ink-3">{unit ?? ''}</span>}
    </span>
  );
}

function ChoicePills({ name, options, value, onChange, multi, mark, label }: { name: string; options: ChoiceOption[]; value?: AnswerValue; onChange: (v: AnswerValue) => void; multi?: boolean; mark?: Marks[string]; label: string }) {
  const selected = multi ? (Array.isArray(value) ? value : []) : value;
  return (
    <div role={multi ? 'group' : 'radiogroup'} aria-label={label} className={cx('flex flex-wrap gap-2 rounded-xl p-0.5', mark && (mark.ok ? 'ring-2 ring-p1/30' : 'ring-2 ring-m2/40'))}>
      {options.map((o) => {
        const on = multi ? (selected as string[]).includes(o.value) : selected === o.value;
        return (
          <button
            key={o.value}
            type="button"
            name={name}
            role={multi ? 'checkbox' : 'radio'}
            aria-checked={on}
            onClick={() => {
              if (multi) {
                const s = selected as string[];
                onChange(on ? s.filter((x) => x !== o.value) : [...s, o.value]);
              } else onChange(o.value);
            }}
            className={cx(
              'min-h-11 rounded-xl border-2 px-3.5 py-2 text-left text-[0.93rem] leading-snug font-bold transition-colors',
              on ? 'border-ink bg-ink text-paper' : 'border-line-2 bg-white hover:border-ink',
            )}
          >
            {multi && <span className={cx('mr-2 inline-grid size-4 place-items-center rounded border-2 align-[-2px]', on ? 'border-paper' : 'border-ink-3')}>{on && <Check className="size-3" />}</span>}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------ Champs ------------------------------ */

function FieldInput({ f, values, setValue, marks, compact }: { f: Field; values: BodyProps['values']; setValue: BodyProps['setValue']; marks: Marks; compact?: boolean }) {
  const uid = useId();
  if (f.kind === 'given') return <span className="font-bold">{f.value}</span>;
  if (f.kind === 'written')
    return (
      <div className="flex w-full flex-col gap-2">
        <textarea
          id={uid}
          aria-label={f.label}
          rows={f.lines ?? 3}
          placeholder={f.placeholder ?? 'Rédige ta réponse en phrases complètes…'}
          value={typeof values[f.id] === 'string' ? (values[f.id] as string) : ''}
          onChange={(e) => setValue(f.id, e.target.value)}
          className="w-full rounded-lg border-2 border-line-2 bg-white px-3 py-2 leading-relaxed outline-none focus:border-ink"
        />
        {marks.__reveal && (
          <div className="rounded-lg border-l-4 border-p1 bg-p1-soft/60 px-3 py-2 text-[0.9rem]">
            <p className="font-bold">Corrigé possible — compare avec ta réponse</p>
            <p className="mt-0.5 leading-relaxed">{f.model}</p>
            {f.criteria && f.criteria.length > 0 && (
              <ul className="mt-1.5 flex flex-col gap-0.5">
                {f.criteria.map((c) => (
                  <li key={c}>☐ {c}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    );
  if (f.kind === 'text')
    return (
      <input
        id={uid}
        aria-label={f.label}
        autoComplete="off"
        placeholder={f.placeholder}
        value={typeof values[f.id] === 'string' ? (values[f.id] as string) : ''}
        onChange={(e) => setValue(f.id, e.target.value)}
        className={cx('h-11 w-full max-w-sm rounded-lg border-2 bg-white px-3 font-bold outline-none focus:border-ink', markRing(marks[f.id]))}
      />
    );
  if (f.kind === 'number')
    return <NumberInput id={uid} label={f.label} value={values[f.id]} onChange={(v) => setValue(f.id, v)} unit={f.unit} mark={marks[f.id]} compact={compact} />;
  if (f.kind === 'choice' && f.select)
    return (
      <select
        id={uid}
        aria-label={f.label}
        value={(values[f.id] as string) ?? ''}
        onChange={(e) => setValue(f.id, e.target.value)}
        className={cx('h-11 w-full max-w-xs rounded-lg border-2 bg-white px-2 font-bold', markRing(marks[f.id]))}
      >
        <option value="">Choisir…</option>
        {f.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  return (
    <ChoicePills name={uid} label={f.label} options={f.options} value={values[f.id]} onChange={(v) => setValue(f.id, v)} multi={f.kind === 'multi'} mark={marks[f.id]} />
  );
}

function FieldsBody({ activity, values, setValue, marks }: BodyProps & { activity: Extract<Activity, { kind: 'fields' }> }) {
  if (activity.layout === 'extranet')
    return (
      <div className="overflow-hidden rounded-xl border-2 border-ink">
        <div className="flex items-center gap-2 bg-ink px-4 py-2 text-paper">
          <span className="flex gap-1" aria-hidden>
            <span className="size-2.5 rounded-full bg-m1" />
            <span className="size-2.5 rounded-full bg-tag" />
            <span className="size-2.5 rounded-full bg-m3" />
          </span>
          <span className="ml-2 font-display text-[0.95rem] font-bold">{activity.windowTitle ?? 'Toupie Pro · Commandes'}</span>
          {!activity.windowTitle && <span className="ml-auto text-[0.75rem] text-paper/60">Magasin 0231 — Guéret</span>}
        </div>
        <div className="grid gap-4 bg-white p-4 sm:grid-cols-2">
          {activity.fields.map((f) => (
            <div key={f.id} className={cx('flex flex-col gap-1.5', f.kind === 'choice' && 'sm:col-span-2')}>
              <span className="flex flex-wrap items-center justify-between gap-2 text-[0.8rem] font-bold tracking-wide text-ink-3 uppercase">
                {f.label} <Mark m={marks[f.id]} />
              </span>
              <FieldInput f={f} values={values} setValue={setValue} marks={marks} />
            </div>
          ))}
        </div>
      </div>
    );

  if (activity.layout === 'signs')
    return (
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {activity.fields.map((f, i) => (
          <li key={f.id} className={cx('flex flex-col items-center gap-2 rounded-xl border-2 bg-white p-3', markRing(marks[f.id]))}>
            <span className="self-start text-[0.78rem] font-bold text-ink-3">{i + 1}</span>
            {f.kind === 'choice' && f.sign && <SafetySign sign={f.sign} label={`Pictogramme ${i + 1}`} />}
            {f.kind === 'choice' && f.image && <Photo image={f.image} className="h-28 w-full" showCaption={false} />}
            {!(f.kind === 'choice' && (f.sign || f.image)) && <p className="text-center text-[0.9rem] font-bold">{f.label}</p>}
            <FieldInput f={f} values={values} setValue={setValue} marks={marks} />
            <Mark m={marks[f.id]} />
          </li>
        ))}
      </ul>
    );

  if (activity.layout === 'columns' && activity.columns) {
    const cols = activity.columns;
    // Regroupe les champs « ligne.colonne » par ligne, en gardant l'ordre d'apparition.
    const rows: Array<{ key: string; label: string; cells: Field[] | null; single?: Field }> = [];
    for (const f of activity.fields) {
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
    return (
      <>
        <div className="hidden overflow-x-auto rounded-xl border border-line md:block">
          <table className="w-full border-collapse bg-white text-[0.93rem]">
            <thead>
              <tr className="bg-ink text-paper">
                <th className="px-3 py-2 text-left">
                  <span className="sr-only">Élément</span>
                </th>
                {cols.map((c) => (
                  <th key={c} className="px-3 py-2 text-center">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className="border-t border-line">
                  <th scope="row" className="px-3 py-2 text-left font-bold">
                    {r.label}
                  </th>
                  {r.cells ? (
                    cols.map((c, i) => (
                      <td key={c} className="px-3 py-2 text-center">
                        {r.cells![i] && (
                          <span className="inline-flex flex-col items-center gap-1">
                            <FieldInput f={r.cells![i]} values={values} setValue={setValue} marks={marks} />
                            <Mark m={marks[r.cells![i].id]} />
                          </span>
                        )}
                      </td>
                    ))
                  ) : (
                    <td colSpan={cols.length} className="px-3 py-2 text-center">
                      <span className="inline-flex flex-col items-center gap-1">
                        <FieldInput f={r.single!} values={values} setValue={setValue} marks={marks} />
                        <Mark m={marks[r.single!.id]} />
                      </span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 md:hidden">
          {rows.map((r) => (
            <div key={r.key} className="rounded-xl border border-line bg-white p-3">
              <p className="mb-2 font-bold">{r.label}</p>
              {r.cells ? (
                <div className="flex flex-col gap-2">
                  {cols.map((c, i) =>
                    r.cells![i] ? (
                      <div key={c} className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[0.85rem] text-ink-2">{c}</span>
                        <span className="flex items-center gap-2">
                          <FieldInput f={r.cells![i]} values={values} setValue={setValue} marks={marks} />
                        </span>
                        <Mark m={marks[r.cells![i].id]} />
                      </div>
                    ) : null,
                  )}
                </div>
              ) : (
                <>
                  <FieldInput f={r.single!} values={values} setValue={setValue} marks={marks} />
                  <Mark m={marks[r.single!.id]} />
                </>
              )}
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
      {activity.fields.map((f) => (
        <li key={f.id} className={cx('flex flex-col gap-2 p-3 sm:px-4', f.kind === 'given' ? 'bg-ink/3' : 'bg-white', (activity.layout === 'checklist' && f.kind !== 'written') || f.kind === 'number' || f.kind === 'text' ? 'sm:flex-row sm:items-center sm:justify-between' : '')}>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-[0.97rem] font-bold">{f.label}</span>
            <Mark m={marks[f.id]} />
          </span>
          <div className={cx(activity.layout === 'checklist' && f.kind !== 'written' && 'shrink-0')}>
            <FieldInput f={f} values={values} setValue={setValue} marks={marks} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------ Classement ------------------------------ */

function ClassifyBody({ activity, values, setValue, marks }: BodyProps & { activity: Extract<Activity, { kind: 'classify' }> }) {
  const groups = [...new Set(activity.categories.map((c) => c.group ?? ''))];
  return (
    <ul className="flex flex-col gap-3">
      {activity.items.map((it) => {
        const v = values[it.id];
        return (
          <li key={it.id} className={cx('rounded-xl border-2 bg-white p-3', markRing(marks[it.id]))}>
            <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
              <p className="font-bold">{it.text}</p>
              <Mark m={marks[it.id]} />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {groups.map((g) => (
                <div key={g} role="radiogroup" aria-label={`${it.text} — ${g}`} className="flex items-center gap-1.5">
                  {g && <span className="text-[0.78rem] font-bold text-ink-3">{g}</span>}
                  {activity.categories
                    .filter((c) => (c.group ?? '') === g)
                    .map((c) => {
                      const on = v === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          aria-label={`${g} — ${c.label}`}
                          onClick={() => setValue(it.id, c.id)}
                          className={cx(
                            'min-h-10 rounded-lg border-2 px-3 text-[0.85rem] font-bold',
                            on ? (c.label.startsWith('Avantage') ? 'border-p1 bg-p1 text-white' : 'border-p2 bg-p2 text-white') : 'border-line-2 hover:border-ink',
                          )}
                        >
                          {c.label}
                        </button>
                      );
                    })}
                </div>
              ))}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------ Circuit ------------------------------ */

function CircuitBody({ activity, values, setValue, marks }: BodyProps & { activity: Extract<Activity, { kind: 'circuit' }> }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {activity.circuits.map((c) => (
        <div key={c.id} className="rounded-xl border border-line bg-white p-4">
          <p className="mb-3 font-display text-lg font-bold">Circuit {c.id}</p>
          <ol className="flex flex-col items-stretch gap-1">
            {c.slots.map((s, i) => (
              <li key={s.id} className="flex flex-col items-center gap-1">
                {s.fixed ? (
                  <div className="w-full rounded-lg bg-ink px-3 py-2.5 text-center font-bold text-paper">{s.fixed}</div>
                ) : (
                  <div className="w-full">
                    <label className="sr-only" htmlFor={`${activity.id}-${c.id}-${s.id}`}>
                      Circuit {c.id}, maillon {i + 1}
                    </label>
                    <select
                      id={`${activity.id}-${c.id}-${s.id}`}
                      value={(values[`${c.id}.${s.id}`] as string) ?? ''}
                      onChange={(e) => setValue(`${c.id}.${s.id}`, e.target.value)}
                      className={cx('h-11 w-full rounded-lg border-2 bg-white px-3 font-bold', markRing(marks[`${c.id}.${s.id}`]))}
                    >
                      <option value="">Choisir un maillon…</option>
                      {c.slotOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    {marks[`${c.id}.${s.id}`]?.expected && <p className="mt-1 text-[0.8rem]">Attendu : {marks[`${c.id}.${s.id}`].expected}</p>}
                  </div>
                )}
                {i < c.slots.length - 1 && <ArrowDown className="size-5 text-ink-3" aria-hidden />}
              </li>
            ))}
          </ol>
          <div className="mt-4 border-t border-line pt-3">
            <p className="mb-2 flex items-center gap-2 text-[0.9rem] font-bold">
              <ArrowRight className="size-4" aria-hidden /> Type de canal <Mark m={marks[`${c.id}.type`]} />
            </p>
            <ChoicePills name={`${activity.id}-${c.id}-t`} label={`Type de canal du circuit ${c.id}`} options={c.typeOptions} value={values[`${c.id}.type`]} onChange={(v) => setValue(`${c.id}.type`, v)} mark={marks[`${c.id}.type`]} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ Grille (cadencier) ------------------------------ */

function GridBody({ activity, values, setValue, marks }: BodyProps & { activity: GridActivity }) {
  const cols = activity.groups.flatMap((g, gi) => g.columns.map((c, ci) => ({ g, gi, c, ci })));
  const cell = (rowId: string, i: number, cellDef: GridActivity['rows'][number]['cells'][number], label: string) => {
    if (typeof cellDef !== 'object') return <span className="font-bold tabular-nums text-ink-2">{typeof cellDef === 'number' ? (Number.isInteger(cellDef) ? String(cellDef) : cellDef.toFixed(2).replace('.', ',')) : cellDef}</span>;
    const k = `${rowId}.${i}`;
    return (
      <span className="flex flex-col items-center">
        <NumberInput id={`${activity.id}-${k}`} label={label} value={values[k]} onChange={(v) => setValue(k, v)} mark={marks[k]} compact wide={Number.isInteger(cellDef.answer) ? false : true} />
        {marks[k]?.expected && <span className="text-[0.7rem] font-bold text-[#9a6210]">{marks[k].expected}</span>}
      </span>
    );
  };
  return (
    <div className="flex flex-col gap-3">
      {/* Tableau : tablette et ordinateur */}
      <div className="hidden overflow-x-auto rounded-xl border border-line md:block">
        <table className="w-full border-collapse bg-white text-center text-[0.9rem]">
          <thead>
            <tr className="bg-ink text-paper">
              <th rowSpan={2} className="px-3 py-2 text-left">
                Référence
              </th>
              {activity.groups.map((g) => (
                <th key={g.label} colSpan={g.columns.length} className="border-l border-paper/20 px-2 py-1.5">
                  {g.label}
                </th>
              ))}
            </tr>
            <tr className="bg-ink/85 text-paper">
              {cols.map(({ g, c, ci }) => (
                <th key={g.label + c} className={cx('px-1 py-1 text-[0.8rem]', ci === 0 && 'border-l border-paper/20')}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activity.rows.map((r) => (
              <tr key={r.id} className="border-t border-line">
                <th scope="row" className="min-w-44 px-3 py-2 text-left text-[0.85rem] leading-snug">
                  {r.label}
                  {r.sub && <span className="block font-normal text-ink-3">{r.sub}</span>}
                </th>
                {r.cells.map((cd, i) => (
                  <td key={i} className={cx('px-1 py-1.5', cols[i].ci === 0 && 'border-l border-line', cols[i].gi % 2 === 1 && 'bg-ink/3')}>
                    {cell(r.id, i, cd, `${r.label}, ${cols[i].g.label}, ${cols[i].c}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Cartes : smartphone */}
      <div className="flex flex-col gap-3 md:hidden">
        {activity.rows.map((r) => (
          <div key={r.id} className="rounded-xl border border-line bg-white p-3">
            <p className="font-bold leading-snug">{r.label}</p>
            {r.sub && <p className="mb-2 text-[0.82rem] text-ink-3">{r.sub}</p>}
            <div className="flex flex-col gap-2">
              {activity.groups.map((g, gi) => (
                <div key={g.label} className="rounded-lg bg-ink/4 p-2">
                  <p className="mb-1 text-[0.78rem] font-bold text-ink-3">{g.label}</p>
                  <div className={cx('grid gap-1 text-center', g.columns.length > 4 ? 'grid-cols-3' : 'grid-cols-4')}>
                    {g.columns.map((c, ci) => {
                      const i = activity.groups.slice(0, gi).reduce((n, x) => n + x.columns.length, 0) + ci;
                      return (
                        <div key={c} className="flex flex-col items-center gap-0.5">
                          <span className="text-[0.75rem] font-bold">{c}</span>
                          {cell(r.id, i, r.cells[i], `${r.label}, ${g.label}, ${c}`)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {activity.legend && <p className="text-[0.82rem] text-ink-3">{activity.legend}</p>}
    </div>
  );
}

/* ------------------------------ Production ouverte ------------------------------ */

function OpenBody({ activity, values, setValue }: BodyProps & { activity: Extract<Activity, { kind: 'open' }> }) {
  const checks = (values.__checks as string[] | undefined) ?? [];
  return (
    <div className="flex flex-col gap-4">
      {activity.prompts.map((p) => (
        <div key={p.id}>
          <label htmlFor={`${activity.id}-${p.id}`} className="mb-1.5 block font-bold">
            {p.label}
          </label>
          <textarea
            id={`${activity.id}-${p.id}`}
            rows={p.lines ?? 4}
            value={(values[p.id] as string) ?? ''}
            onChange={(e) => setValue(p.id, e.target.value)}
            className="w-full rounded-xl border-2 border-line-2 bg-white p-3 leading-relaxed outline-none focus:border-ink"
            placeholder="Rédige ta réponse en phrases complètes…"
          />
        </div>
      ))}
      <fieldset className="rounded-xl bg-p1-soft/60 p-3">
        <legend className="px-1 text-[0.9rem] font-bold">Avant d’enregistrer, je vérifie :</legend>
        <ul className="flex flex-col gap-1.5">
          {activity.selfCheck.map((c) => {
            const on = checks.includes(c);
            return (
              <li key={c}>
                <label className="flex cursor-pointer items-start gap-2 text-[0.92rem]">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => setValue('__checks', on ? checks.filter((x) => x !== c) : [...checks, c])}
                    className="mt-1 size-4 accent-[#1f8a70]"
                  />
                  {c}
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>
    </div>
  );
}

/* ------------------------------ Planning de livraisons ------------------------------ */

const SYMBOLS: Array<{ id: PlanningSymbol; label: string }> = [
  { id: 'commande', label: 'Date de commande' },
  { id: 'prevue', label: 'Date prévisionnelle de livraison' },
  { id: 'effective', label: 'Date effective de livraison' },
  { id: 'relance', label: 'Date de relance' },
];

export function PlanningGlyph({ symbol, size = 18 }: { symbol: PlanningSymbol; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden>
      {symbol === 'commande' && <path d="M10 2 18 17H2z" fill="#74b04a" />}
      {symbol === 'prevue' && <circle cx="10" cy="10" r="7" fill="none" stroke="#3f63c9" strokeWidth="2.5" />}
      {symbol === 'effective' && <circle cx="10" cy="10" r="8" fill="#3f63c9" />}
      {symbol === 'relance' && <rect x="3" y="3" width="14" height="14" fill="#c8372d" />}
    </svg>
  );
}

function PlanningBody({ activity, values, setValue, marks }: BodyProps & { activity: PlanningActivity }) {
  const [tool, setTool] = useState<PlanningSymbol>('effective');
  const placed = Array.isArray(values.__marks) ? (values.__marks as string[]) : [];
  const toggle = (rowId: string, day: string) => {
    const k = `${rowId}|${day}|${tool}`;
    setValue('__marks', placed.includes(k) ? placed.filter((x) => x !== k) : [...placed, k]);
  };
  const extras = marks.__extras;
  return (
    <div className="flex flex-col gap-3">
      <div role="radiogroup" aria-label="Repère à poser" className="flex flex-wrap gap-2">
        {SYMBOLS.map((s) => (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={tool === s.id}
            onClick={() => setTool(s.id)}
            className={cx('flex min-h-10 items-center gap-2 rounded-full border-2 px-3 text-[0.85rem] font-bold', tool === s.id ? 'border-ink bg-ink text-paper' : 'border-line-2 bg-white')}
          >
            <span className="grid size-6 place-items-center rounded-full bg-white">
              <PlanningGlyph symbol={s.id} />
            </span>
            {s.label}
          </button>
        ))}
      </div>
      <p className="text-[0.85rem] text-ink-3">Choisis un repère, puis touche la case du jour. Touche à nouveau pour l’enlever. Les repères grisés sont déjà enregistrés.</p>
      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="border-collapse text-center text-[0.8rem]">
          <thead>
            <tr className="bg-ink text-paper">
              <th className="sticky left-0 z-10 bg-ink px-2 py-1.5 text-left">N° cde</th>
              {activity.days.map((d) => (
                <th key={d.id} className="min-w-9 px-0.5 py-1 font-bold">
                  <span className="block text-[0.7rem] text-paper/70">{d.dow}</span>
                  {d.num}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activity.rows.map((r) => (
              <tr key={r.id} className="border-t border-line">
                <th scope="row" className="sticky left-0 z-10 bg-white px-2 py-1 text-left font-bold">
                  {r.label}
                </th>
                {activity.days.map((d) => {
                  const given = r.given.filter((g) => g.day === d.id);
                  const mine = SYMBOLS.filter((s) => placed.includes(`${r.id}|${d.id}|${s.id}`));
                  const markFor = mine.map((s) => marks[`${r.id}|${d.id}|${s.id}`]).find(Boolean);
                  const wrongExtra = extras && !extras.ok && mine.some((s) => !(`${r.id}|${d.id}|${s.id}` in marks));
                  return (
                    <td key={d.id} className="border-l border-line/60 p-0">
                      <button
                        type="button"
                        onClick={() => toggle(r.id, d.id)}
                        aria-label={`Commande ${r.label}, ${d.num} ${d.month}`}
                        className={cx(
                          'flex h-10 w-9 flex-wrap items-center justify-center gap-0.5 hover:bg-tag-soft',
                          markFor && (markFor.ok ? 'bg-p1-soft' : 'bg-m2/20'),
                          wrongExtra && 'bg-m2/20',
                        )}
                      >
                        {given.map((g) => (
                          <span key={g.symbol} className="opacity-45">
                            <PlanningGlyph symbol={g.symbol} size={14} />
                          </span>
                        ))}
                        {mine.map((s) => (
                          <PlanningGlyph key={s.id} symbol={s.id} size={14} />
                        ))}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ActivityBody(props: BodyProps) {
  const a = props.activity;
  switch (a.kind) {
    case 'fields':
      return <FieldsBody {...props} activity={a} />;
    case 'classify':
      return <ClassifyBody {...props} activity={a} />;
    case 'circuit':
      return <CircuitBody {...props} activity={a} />;
    case 'grid':
      return <GridBody {...props} activity={a} />;
    case 'open':
      return <OpenBody {...props} activity={a} />;
    case 'planning':
      return <PlanningBody {...props} activity={a} />;
  }
}
