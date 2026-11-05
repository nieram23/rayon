import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ArrowRight, ClipboardCheck, RotateCcw, Search, UserRound } from 'lucide-react';
import { MASTERY_LEVELS, UNITS, getUnit, unitLabel } from '../../content';
import { masteryFor, progressRatio } from '../../domain/progress';
import type { MasteryValue } from '../../domain/types';
import { Button, EmptyState, MasteryChip, ProgressBar, SectionHeader, Stat, UnitTag } from '../../components/ui';
import { MASTERY_THEME, cx, formatDate, masteryCode, pct } from '../../lib/theme';
import { DEMO_OPEN_UNITS } from '../../services/studentData';
import { useTeacher } from '../../state/useTeacher';
import { TeacherPageHeader } from './TeacherDashboard';

/* ======================== Classes ======================== */

export function TeacherClasses() {
  const t = useTeacher();
  return (
    <div>
      <TeacherPageHeader eyebrow="Vue des classes" title="Mes classes">
        {t.real
          ? 'Les classes sont celles indiquées sur les comptes élèves. Pour en créer une ou déplacer un élève, va dans « Comptes élèves ».'
          : 'Classes fictives créées pour la démonstration.'}
      </TeacherPageHeader>
      <div className="grid gap-4 md:grid-cols-2">
        {t.classes.map((c) => {
          const st = t.students.filter((s) => s.classId === c.id);
          const avg = st.length ? st.reduce((n, s) => n + s.summary.overall, 0) / st.length : 0;
          const rework = st.filter((s) => s.toRework > 0).length;
          return (
            <article key={c.id} className="card flex flex-col gap-4 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="eyebrow">{c.level}</p>
                  <h2 className="text-[1.4rem] font-bold">{c.label}</h2>
                </div>
                <span className="rounded-full bg-ink/6 px-3 py-1 text-[0.85rem] font-bold">{st.length} élèves</span>
              </div>
              <div>
                <p className="mb-1 text-[0.85rem] font-bold text-ink-3">Progression moyenne sur le parcours : {pct(avg)}</p>
                <ProgressBar value={avg} label={`Progression moyenne ${c.label}`} />
              </div>
              <p className="text-[0.9rem] text-ink-2">
                {rework} élève{rework > 1 ? 's' : ''} avec au moins un résultat à retravailler.
              </p>
              <Link to={`/enseignant/eleves?classe=${c.id}`} className="inline-flex items-center gap-1 self-start font-bold hover:underline">
                Voir les élèves <ArrowRight className="size-4" aria-hidden />
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}

/* ======================== Liste des élèves ======================== */

export function TeacherStudents() {
  const t = useTeacher();
  const [params, setParams] = useSearchParams();
  const classe = params.get('classe') ?? 'toutes';
  const [q, setQ] = useState('');
  const list = t.students.filter(
    (s) => (classe === 'toutes' || s.classId === classe) && s.pseudo.toLowerCase().includes(q.trim().toLowerCase()),
  );

  return (
    <div>
      <TeacherPageHeader eyebrow="Vue des élèves" title="Élèves">
        {t.real ? 'Résultats individuels de tes élèves.' : 'Résultats individuels. Les pseudonymes sont fictifs.'}
      </TeacherPageHeader>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="t-classe">
          Classe
        </label>
        <select
          id="t-classe"
          value={classe}
          onChange={(e) => {
            const n = new URLSearchParams(params);
            if (e.target.value === 'toutes') n.delete('classe');
            else n.set('classe', e.target.value);
            setParams(n, { replace: true });
          }}
          className="min-h-11 rounded-full border border-line-2 bg-white px-4 font-bold"
        >
          <option value="toutes">Toutes les classes</option>
          {t.classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
          <label htmlFor="t-q" className="sr-only">
            Rechercher un élève
          </label>
          <input
            id="t-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un élève"
            className="min-h-11 w-full rounded-full border border-line-2 bg-white pr-4 pl-10"
          />
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={<UserRound className="size-6" />} title="Aucun élève trouvé" />
      ) : (
        <>
          {/* Tableau (tablette / ordinateur) */}
          <div className="card hidden overflow-hidden md:block">
            <table className="w-full text-left text-[0.92rem]">
              <thead className="bg-ink/4 text-[0.8rem] text-ink-3">
                <tr>
                  <th className="px-4 py-3 font-bold">Élève</th>
                  <th className="px-4 py-3 font-bold">Classe</th>
                  <th className="px-4 py-3 font-bold">Progression</th>
                  <th className="px-4 py-3 font-bold">Commencés</th>
                  <th className="px-4 py-3 font-bold">Évalués</th>
                  <th className="px-4 py-3 font-bold">À retravailler</th>
                  <th className="px-4 py-3">
                    <span className="sr-only">Ouvrir</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {list.map((s) => (
                  <tr key={s.id} className="hover:bg-ink/3">
                    <td className="px-4 py-3 font-bold">
                      <Link to={`/enseignant/eleves/${s.id}`} className="hover:underline">
                        {s.pseudo}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-2">{s.className}</td>
                    <td className="w-48 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={s.summary.overall} label={`Progression de ${s.pseudo}`} />
                        <span className="w-10 text-right text-[0.8rem] text-ink-3">{pct(s.summary.overall)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{s.summary.started}</td>
                    <td className="px-4 py-3">{s.evaluated}</td>
                    <td className={cx('px-4 py-3 font-bold', s.toRework ? 'text-m1' : 'text-ink-3')}>{s.toRework}</td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/enseignant/eleves/${s.id}`} aria-label={`Ouvrir la fiche de ${s.pseudo}`} className="inline-grid size-9 place-items-center rounded-full hover:bg-ink/8">
                        <ArrowRight className="size-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Cartes (smartphone) */}
          <ul className="flex flex-col gap-3 md:hidden">
            {list.map((s) => (
              <li key={s.id}>
                <Link to={`/enseignant/eleves/${s.id}`} className="card flex flex-col gap-2 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{s.pseudo}</span>
                    <span className="text-[0.8rem] text-ink-3">{s.className}</span>
                  </div>
                  <ProgressBar value={s.summary.overall} label={`Progression de ${s.pseudo}`} />
                  <p className="text-[0.82rem] text-ink-2">
                    {pct(s.summary.overall)} · {s.evaluated} évalués · <span className={s.toRework ? 'font-bold text-m1' : ''}>{s.toRework} à retravailler</span>
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/* ======================== Fiche élève ======================== */

const LEVEL_CHOICES: MasteryValue[] = [null, 1, 2, 3, 4];

function LevelPicker({ value, onChange, label }: { value: MasteryValue; onChange: (v: MasteryValue) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full border border-line-2 bg-white p-1">
      {LEVEL_CHOICES.map((l) => {
        const code = masteryCode(l);
        const active = value === l;
        const def = MASTERY_LEVELS.find((d) => d.code === code)!;
        return (
          <button
            key={code}
            type="button"
            role="radio"
            aria-checked={active}
            title={def.label}
            aria-label={def.label}
            onClick={() => onChange(l)}
            className={cx(
              'grid h-9 min-w-9 place-items-center rounded-full px-2 text-[0.8rem] font-bold transition-colors',
              active ? (code === 'NE' ? 'bg-ink text-paper' : cx(MASTERY_THEME[code].bg, 'text-white')) : 'text-ink-3 hover:bg-ink/6',
            )}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}

export function TeacherStudentDetail() {
  const { id = '' } = useParams();
  const t = useTeacher();
  const s = t.students.find((x) => x.id === id);
  if (!s) return <EmptyState icon={<UserRound className="size-6" />} title="Élève introuvable" />;

  const prods = t.productions.filter((p) => p.studentId === s.id);
  const diffs = t.difficulties.filter((d) => d.studentId === s.id);
  const units = UNITS.filter((u) => DEMO_OPEN_UNITS.includes(u.id));

  return (
    <div className="flex flex-col gap-8">
      <Link to="/enseignant/eleves" className="inline-flex w-fit items-center gap-2 text-[0.9rem] font-bold text-ink-2 hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Tous les élèves
      </Link>
      <TeacherPageHeader eyebrow={`Résultats individuels · ${s.className}`} title={s.pseudo} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Progression totale" value={pct(s.summary.overall)} />
        <Stat label="Dossiers commencés" value={`${s.summary.started}/15`} />
        <Stat label="Résultats évalués" value={s.evaluated} />
        <Stat label="À retravailler" value={s.toRework} accent={s.toRework ? 'text-m1' : undefined} />
      </div>

      {diffs.length > 0 && (
        <div className="flex flex-col gap-2 rounded-2xl border border-m2/40 bg-m2/10 p-4">
          {diffs.map((d, i) => (
            <p key={i} className="flex items-start gap-2 text-[0.92rem]">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-m2" aria-hidden /> {unitLabel(getUnit(d.unitId)!)} · {d.label}
            </p>
          ))}
        </div>
      )}

      <section aria-labelledby="eval">
        <SectionHeader
          id="eval"
          eyebrow="Grille d’évaluation à quatre niveaux"
          title="Valider les niveaux de maîtrise"
          action={
            t.real ? undefined : (
              <Button variant="ghost" className="text-[0.85rem]" onClick={t.resetOverrides}>
                <RotateCcw className="size-4" aria-hidden /> Annuler mes saisies (démo)
              </Button>
            )
          }
        />
        <p className="mb-4 max-w-3xl text-[0.9rem] text-ink-2">
          Votre saisie remplace tout niveau indicatif. « NE » remet le résultat en « Non évalué ».{' '}
          {t.real ? 'Les niveaux sont enregistrés aussitôt et l’élève les voit dans son espace.' : 'Les saisies sont conservées dans ce navigateur uniquement.'}
        </p>
        <div className="flex flex-col gap-4">
          {units.map((u) => {
            const p = s.progress.find((x) => x.unitId === u.id);
            return (
              <article key={u.id} className="card overflow-hidden">
                <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:px-5">
                  <div className="flex flex-1 items-center gap-3">
                    <UnitTag unit={u} />
                    <h3 className="text-[1rem] font-bold">{u.title}</h3>
                  </div>
                  <div className="flex gap-5 text-[0.82rem]">
                    <span>
                      <span className="text-ink-3">Progression </span>
                      <strong>{p ? `${p.activitiesDone}/${p.activitiesTotal}` : '0'}</strong>
                    </span>
                    <span>
                      <span className="text-ink-3">Réussite </span>
                      <strong>{p?.successRate != null ? `${p.successRate} %` : '—'}</strong>
                    </span>
                  </div>
                </div>
                <ProgressBar value={progressRatio(p)} partId={u.partId} label={`Progression ${u.title}`} className="rounded-none" />
                <ul className="divide-y divide-line">
                  {u.outcomes.map((o) => {
                    const a = masteryFor(o.id, s.mastery);
                    return (
                      <li key={o.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:px-5">
                        <div className="flex-1">
                          <p className="text-[0.93rem]">{o.text}</p>
                          <div className="mt-1.5">
                            <MasteryChip value={a?.level ?? null} origin={a?.origin} compact />
                          </div>
                        </div>
                        <LevelPicker
                          label={`Niveau pour : ${o.text}`}
                          value={a?.level ?? null}
                          onChange={(l) => t.setLevel(s.id, o.id, l as 1 | 2 | 3 | 4 | null)}
                        />
                      </li>
                    );
                  })}
                </ul>
              </article>
            );
          })}
          <p className="text-[0.85rem] text-ink-3">Les 12 autres unités ne sont pas encore ouvertes : aucun résultat ne peut y être évalué.</p>
        </div>
      </section>

      <section aria-labelledby="prods">
        <SectionHeader id="prods" eyebrow="Travaux rendus" title="Productions" />
        {prods.length === 0 ? (
          <EmptyState icon={<ClipboardCheck className="size-6" />} title="Aucune production rendue" />
        ) : (
          <ul className="card divide-y divide-line">
            {prods.map((p) => (
              <li key={p.id} className="flex items-center gap-3 p-4">
                <UnitTag unit={getUnit(p.unitId)!} />
                <span className="flex-1 text-[0.92rem]">
                  {p.label}
                  <span className="block text-[0.8rem] text-ink-3">Rendue le {formatDate(p.submittedAt)}</span>
                </span>
                <span className={cx('rounded-full px-2.5 py-1 text-[0.78rem] font-bold', p.state === 'a-corriger' ? 'bg-p2-soft text-p2-dark' : 'bg-p1-soft text-p1-dark')}>
                  {p.state === 'a-corriger' ? 'À corriger' : 'Corrigée'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
