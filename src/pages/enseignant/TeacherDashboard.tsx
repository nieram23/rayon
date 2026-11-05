import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, ClipboardCheck, Download, School, Users } from 'lucide-react';
import { UNITS, getUnit } from '../../content';
import { progressRatio, statusOf } from '../../domain/progress';
import { Button, DataModeTag, ProgressBar, SectionHeader, Stat, UnitTag } from '../../components/ui';
import { buildResultsCsv, exportResults } from '../../lib/exportCsv';
import { formatDate } from '../../lib/theme';
import { DEMO_OPEN_UNITS } from '../../services/studentData';
import { useTeacher } from '../../state/useTeacher';
import { getBackend } from '../../services/cloud';

const CLOUD_ON = !!getBackend();

export function TeacherPageHeader({ eyebrow, title, children, real }: { eyebrow: string; title: string; children?: ReactNode; real?: boolean }) {
  return (
    <header className="mb-6 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <p className="eyebrow">{eyebrow}</p>
        {!real && !CLOUD_ON && <DataModeTag mode="demo-enseignant" />}
      </div>
      <h1 className="text-[1.8rem] font-extrabold sm:text-[2.2rem]">{title}</h1>
      {children && <div className="max-w-3xl text-ink-2">{children}</div>}
    </header>
  );
}

export function TeacherDashboard() {
  const t = useTeacher();
  const [msg, setMsg] = useState<string | null>(null);
  const toCorrect = t.productions.filter((p) => p.state === 'a-corriger');
  const studentsWithDiff = new Set(t.difficulties.map((d) => d.studentId));
  const name = (id: string) => t.students.find((s) => s.id === id)?.pseudo ?? id;

  return (
    <div className="flex flex-col gap-10">
      <TeacherPageHeader eyebrow="Tableau de bord professeur" title="Vue d’ensemble">
        {t.real
          ? 'Suivi collectif et individuel de tes élèves, à partir de leurs réponses enregistrées.'
          : 'Suivi collectif et individuel. Les chiffres ci-dessous proviennent d’un jeu de données fictif : aucun élève réel n’est représenté.'}
      </TeacherPageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Classes" value={t.classes.length} />
        <Stat label="Élèves" value={t.students.length} />
        <Stat label="Productions à corriger" value={toCorrect.length} accent={toCorrect.length ? 'text-p2-dark' : undefined} />
        <Stat label="Élèves signalés en difficulté" value={studentsWithDiff.size} accent={studentsWithDiff.size ? 'text-m1' : undefined} />
      </div>

      <section aria-labelledby="t-prog">
        <SectionHeader
          id="t-prog"
          eyebrow="Progression générale"
          title="Avancement par dossier"
          action={
            <Link to="/enseignant/dossiers" className="inline-flex items-center gap-1 text-[0.9rem] font-bold hover:underline">
              Détail <ArrowRight className="size-4" aria-hidden />
            </Link>
          }
        />
        <div className="card divide-y divide-line">
          {UNITS.filter((u) => DEMO_OPEN_UNITS.includes(u.id)).map((u) => {
            const rows = t.students.map((s) => s.progress.find((p) => p.unitId === u.id));
            const avg = t.students.length ? rows.reduce((n, p) => n + progressRatio(p), 0) / t.students.length : 0;
            const started = rows.filter((p) => statusOf(p) !== 'non-commence').length;
            const done = rows.filter((p) => statusOf(p) === 'termine').length;
            return (
              <div key={u.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_14rem_10rem] sm:items-center sm:px-5">
                <div className="flex items-center gap-3">
                  <UnitTag unit={u} />
                  <span className="text-[0.95rem] leading-snug font-bold">{u.title}</span>
                </div>
                <ProgressBar value={avg} partId={u.partId} label={`Progression moyenne ${u.title}`} />
                <p className="text-[0.85rem] text-ink-3">
                  {started} commencé · {done} terminé
                </p>
              </div>
            );
          })}
          {UNITS.length > DEMO_OPEN_UNITS.length && (
            <p className="p-4 text-[0.85rem] text-ink-3 sm:px-5">
              {UNITS.length - DEMO_OPEN_UNITS.length === 1 ? 'Une unité n’est' : `${UNITS.length - DEMO_OPEN_UNITS.length} unités ne sont`} pas encore ouverte
              {UNITS.length - DEMO_OPEN_UNITS.length > 1 ? 's' : ''}.
            </p>
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="t-diff">
          <SectionHeader id="t-diff" eyebrow="Difficultés rencontrées" title="À accompagner" />
          <ul className="card divide-y divide-line">
            {t.difficulties.length === 0 && <li className="p-4 text-[0.9rem] text-ink-3">Aucune difficulté repérée pour l’instant.</li>}
            {t.difficulties.slice(0, 6).map((d, i) => (
              <li key={i}>
                <Link to={`/enseignant/eleves/${d.studentId}`} className="flex items-start gap-3 p-4 hover:bg-ink/3">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-m2" aria-hidden />
                  <span className="flex-1 text-[0.92rem]">
                    <strong>{name(d.studentId)}</strong> · {d.label}
                  </span>
                  <UnitTag unit={getUnit(d.unitId)!} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="t-prod">
          <SectionHeader
            id="t-prod"
            eyebrow="Travaux rendus"
            title="Dernières productions"
            action={
              <Link to="/enseignant/productions" className="inline-flex items-center gap-1 text-[0.9rem] font-bold hover:underline">
                Tout voir <ArrowRight className="size-4" aria-hidden />
              </Link>
            }
          />
          <ul className="card divide-y divide-line">
            {t.productions.length === 0 && <li className="p-4 text-[0.9rem] text-ink-3">Aucune production rendue pour l’instant.</li>}
            {[...t.productions]
              .sort((a, b) => (b.submittedAt > a.submittedAt ? 1 : -1))
              .slice(0, 6)
              .map((p) => (
                <li key={p.id} className="flex items-center gap-3 p-4">
                  <ClipboardCheck className="size-4 shrink-0 text-ink-3" aria-hidden />
                  <span className="flex-1 text-[0.92rem]">
                    <strong>{name(p.studentId)}</strong> · {p.kind}
                    <span className="block text-[0.8rem] text-ink-3">{formatDate(p.submittedAt)}</span>
                  </span>
                  <UnitTag unit={getUnit(p.unitId)!} />
                </li>
              ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby="t-acces" className="grid gap-4 sm:grid-cols-3">
        <h2 id="t-acces" className="sr-only">
          Accès rapides
        </h2>
        <Link to="/enseignant/classes" className="card card-lift flex items-center gap-3 p-5 font-bold">
          <School className="size-5" aria-hidden /> Mes classes
        </Link>
        <Link to="/enseignant/eleves" className="card card-lift flex items-center gap-3 p-5 font-bold">
          <Users className="size-5" aria-hidden /> Liste des élèves
        </Link>
        <Button variant="secondary" className="h-full min-h-16 justify-start rounded-[var(--radius-card)] px-5" onClick={async () => setMsg(await exportResults(t.real ? 'rayon-resultats.csv' : 'rayon-resultats-demo.csv', buildResultsCsv(t.students)))}>
          <Download className="size-5" aria-hidden /> Exporter les résultats (CSV)
        </Button>
        {msg && (
          <p role="status" className="text-[0.88rem] font-bold sm:col-span-3">
            {msg}
          </p>
        )}
      </section>
    </div>
  );
}
