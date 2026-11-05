import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, Download } from 'lucide-react';
import { META_COMPETENCES, PARTS, UNITS, getUnit, outcomesOfMeta, unitsOfPart } from '../../content';
import { distribution, levelOf, progressRatio, statusOf } from '../../domain/progress';
import { Button, EmptyState, FilterGroup, MasteryStack, ProgressBar, UnitTag } from '../../components/ui';
import { buildResultsCsv, exportResults } from '../../lib/exportCsv';
import { PART_THEME, cx, formatDate, pct } from '../../lib/theme';
import { DEMO_OPEN_UNITS } from '../../services/studentData';
import type { ProductionState } from '../../services/teacherData';
import { useTeacher } from '../../state/useTeacher';
import { TeacherPageHeader } from './TeacherDashboard';

function ClassFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const t = useTeacher();
  return (
    <FilterGroup
      label="Filtrer par classe"
      value={value}
      onChange={onChange}
      options={[{ value: 'toutes', label: 'Toutes les classes' }, ...t.classes.map((c) => ({ value: c.id, label: c.label }))]}
    />
  );
}

/* ======================== Progression par dossier ======================== */

export function TeacherUnits() {
  const t = useTeacher();
  const [classe, setClasse] = useState('toutes');
  const students = t.students.filter((s) => classe === 'toutes' || s.classId === classe);

  return (
    <div className="flex flex-col gap-6">
      <TeacherPageHeader eyebrow="Progression par dossier" title="Avancement collectif">
        Progression = part des activités accomplies. Elle ne dit rien de la maîtrise : voir « Suivi des compétences ».
      </TeacherPageHeader>
      <ClassFilter value={classe} onChange={setClasse} />
      {PARTS.map((part) => (
        <section key={part.id} aria-labelledby={`tu-${part.id}`} className="card overflow-hidden">
          <h2 id={`tu-${part.id}`} className={cx('flex items-center gap-2 px-5 py-3 text-[1rem] font-bold', PART_THEME[part.id].bgSoft)}>
            <span className={cx('size-2.5 rounded-full', PART_THEME[part.id].bg)} aria-hidden /> Partie {part.number} — {part.title}
          </h2>
          <ul className="divide-y divide-line">
            {unitsOfPart(part.id).map((u) => {
              const open = DEMO_OPEN_UNITS.includes(u.id);
              const rows = students.map((s) => s.progress.find((p) => p.unitId === u.id));
              const avg = students.length ? rows.reduce((n, p) => n + progressRatio(p), 0) / students.length : 0;
              const started = rows.filter((p) => statusOf(p) !== 'non-commence').length;
              const done = rows.filter((p) => statusOf(p) === 'termine').length;
              const succ = rows.filter((p) => p?.successRate != null).map((p) => p!.successRate!);
              return (
                <li key={u.id} className={cx('grid gap-3 p-4 sm:grid-cols-[1fr_12rem_8rem_8rem] sm:items-center sm:px-5', !open && 'opacity-60')}>
                  <div className="flex items-center gap-3">
                    <UnitTag unit={u} />
                    <span className="text-[0.93rem] leading-snug font-bold">{u.title}</span>
                  </div>
                  {open ? (
                    <>
                      <div className="flex items-center gap-2">
                        <ProgressBar value={avg} partId={u.partId} label={`Progression moyenne ${u.title}`} />
                        <span className="w-10 text-right text-[0.8rem]">{pct(avg)}</span>
                      </div>
                      <p className="text-[0.82rem] text-ink-2">
                        {started}/{students.length} commencé
                        <br />
                        {done}/{students.length} terminé
                      </p>
                      <p className="text-[0.82rem] text-ink-2">
                        Réussite moy.
                        <br />
                        <strong>{succ.length ? `${Math.round(succ.reduce((a, b) => a + b, 0) / succ.length)} %` : '—'}</strong>
                      </p>
                    </>
                  ) : (
                    <p className="text-[0.85rem] text-ink-3 sm:col-span-3">Non ouvert aux élèves</p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

/* ======================== Suivi des compétences ======================== */

export function TeacherCompetences() {
  const t = useTeacher();
  const [classe, setClasse] = useState('toutes');
  const [msg, setMsg] = useState<string | null>(null);
  const students = t.students.filter((s) => classe === 'toutes' || s.classId === classe);

  return (
    <div className="flex flex-col gap-6">
      <TeacherPageHeader eyebrow="Progression par compétence" title="Résultats collectifs de maîtrise">
        Répartition des niveaux par résultat attendu (validés et indicatifs confondus). Cliquez sur un élève pour valider ses niveaux.
      </TeacherPageHeader>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ClassFilter value={classe} onChange={setClasse} />
        <Button variant="secondary" onClick={async () => setMsg(await exportResults('rayon-resultats-demo.csv', buildResultsCsv(students)))}>
          <Download className="size-4" aria-hidden /> Exporter (CSV)
        </Button>
      </div>
      {msg && (
        <p role="status" className="text-[0.88rem] font-bold">
          {msg}
        </p>
      )}
      <ul className="flex flex-wrap gap-4 text-[0.8rem] text-ink-2" aria-label="Légende">
        {[
          ['bg-m1', '1 Non maîtrisé'],
          ['bg-m2', '2 Insuffisant'],
          ['bg-m3', '3 Maîtrisé'],
          ['bg-m4', '4 Bien maîtrisé'],
          ['hatch bg-ink/5 border border-line-2', 'Non évalué'],
        ].map(([c, l]) => (
          <li key={l} className="flex items-center gap-1.5">
            <span className={cx('size-3 rounded-sm', c)} aria-hidden /> {l}
          </li>
        ))}
      </ul>
      {META_COMPETENCES.map((m, i) => (
        <section key={m.id} aria-labelledby={`tc-${m.id}`} className="card overflow-hidden">
          <h2 id={`tc-${m.id}`} className={cx('flex items-center gap-2 px-5 py-3 text-[1.05rem] font-bold', PART_THEME[PARTS[i].id].bgSoft)}>
            <span className={cx('size-2.5 rounded-full', PART_THEME[PARTS[i].id].bg)} aria-hidden /> {m.label}
          </h2>
          <ul className="divide-y divide-line">
            {outcomesOfMeta(m.id).map(({ outcome, unit }) => {
              const d = distribution(students.map((s) => levelOf(outcome.id, s.mastery)));
              return (
                <li key={`${m.id}-${outcome.id}`} className="grid gap-2 p-4 sm:grid-cols-[auto_1fr_14rem] sm:items-center sm:gap-4 sm:px-5">
                  <UnitTag unit={unit} />
                  <p className="text-[0.92rem]">{outcome.text}</p>
                  <div>
                    <MasteryStack counts={d} label={`Répartition : ${outcome.text}`} />
                    <p className="mt-1 text-[0.75rem] text-ink-3">
                      {d.total - d.ne}/{d.total} évalués · {d.l1 + d.l2} à retravailler
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

/* ======================== Résultats et productions ======================== */

export function TeacherProductions() {
  const t = useTeacher();
  const [filter, setFilter] = useState<'toutes' | ProductionState>('toutes');
  // Statut de correction modifiable pendant la session (démonstration, non persisté).
  const [corrected, setCorrected] = useState<Record<string, ProductionState>>({});
  const state = (id: string, base: ProductionState) => corrected[id] ?? base;
  const list = [...t.productions]
    .filter((p) => filter === 'toutes' || state(p.id, p.state) === filter)
    .sort((a, b) => (b.submittedAt > a.submittedAt ? 1 : -1));
  const name = (id: string) => t.students.find((s) => s.id === id);

  return (
    <div className="flex flex-col gap-6">
      <TeacherPageHeader eyebrow="Résultats et productions" title="Travaux rendus">
        Les productions ouvertes (courriels, justifications, plans) seront corrigées par l’enseignant : la plateforme ne prétendra pas les corriger
        automatiquement.
      </TeacherPageHeader>
      <FilterGroup<'toutes' | ProductionState>
        label="Filtrer par état"
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'toutes', label: 'Toutes', count: t.productions.length },
          { value: 'a-corriger', label: 'À corriger', count: t.productions.filter((p) => state(p.id, p.state) === 'a-corriger').length },
          { value: 'corrigee', label: 'Corrigées', count: t.productions.filter((p) => state(p.id, p.state) === 'corrigee').length },
        ]}
      />
      {list.length === 0 ? (
        <EmptyState icon={<ClipboardCheck className="size-6" />} title="Aucune production dans cette sélection" />
      ) : (
        <ul className="card divide-y divide-line">
          {list.map((p) => {
            const s = name(p.studentId);
            const st = state(p.id, p.state);
            return (
              <li key={p.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:px-5">
                <UnitTag unit={getUnit(p.unitId)!} />
                <div className="flex-1">
                  <p className="text-[0.93rem] font-bold">{p.label}</p>
                  <p className="text-[0.82rem] text-ink-3">
                    <Link to={`/enseignant/eleves/${p.studentId}`} className="font-bold text-ink-2 hover:underline">
                      {s?.pseudo}
                    </Link>{' '}
                    · {s?.className} · rendue le {formatDate(p.submittedAt)}
                  </p>
                </div>
                <Button
                  variant={st === 'a-corriger' ? 'primary' : 'secondary'}
                  className="min-h-10 px-4 text-[0.85rem]"
                  onClick={() => setCorrected((c) => ({ ...c, [p.id]: st === 'a-corriger' ? 'corrigee' : 'a-corriger' }))}
                >
                  {st === 'a-corriger' ? 'Marquer corrigée' : 'Corrigée ✓ — annuler'}
                </Button>
              </li>
            );
          })}
        </ul>
      )}
      <p className="text-[0.82rem] text-ink-3">
        Unités concernées : {UNITS.filter((u) => DEMO_OPEN_UNITS.includes(u.id)).map((u) => u.title).join(' · ')}. Le statut de correction n’est pas
        enregistré (démonstration).
      </p>
    </div>
  );
}
