import { Link } from 'react-router-dom';
import { Lock, ScrollText } from 'lucide-react';
import { UNITS } from '../../content';
import { UnitTag } from '../../components/ui';
import { getChapter } from '../../content/chapters';
import { readChapter } from '../../services/chapterStore';

/** Fiches de synthèse : une par dossier, débloquée à la fin des missions. */
export function Fiches() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <p className="eyebrow">Mes fiches</p>
        <h1 className="text-[2rem] font-extrabold sm:text-[2.4rem]">Fiches de synthèse</h1>
        <p className="max-w-2xl text-ink-2">
          À la fin de chaque dossier, une fiche de révision reprend les notions essentielles, les méthodes, les formules à connaître, les erreurs
          fréquentes et les bonnes pratiques. Elle reste accessible ici.
        </p>
      </header>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {UNITS.map((u) => {
          const ch = getChapter(u.id);
          const syn = ch?.steps.find((s) => s.kind === 'synthese');
          const unlocked = !!syn && readChapter(u.id).visited.includes(syn.id);
          if (ch && syn)
            return (
              <li key={u.id}>
                <Link to={`/dossiers/${u.id}/${syn.id}`} className="card card-lift flex h-full items-start gap-3 p-4">
                  <ScrollText className="mt-0.5 size-5 shrink-0 text-p1" aria-hidden />
                  <div className="flex-1">
                    <UnitTag unit={u} />
                    <p className="mt-1.5 text-[0.93rem] leading-snug font-bold">{u.title}</p>
                    <p className="mt-1 text-[0.8rem] font-bold text-p1-dark">{unlocked ? 'Fiche consultée · à réviser' : 'Fiche disponible'}</p>
                  </div>
                </Link>
              </li>
            );
          return (
          <li key={u.id}>
            <Link to={`/dossiers/${u.id}`} className="flex h-full items-start gap-3 rounded-2xl border border-dashed border-line-2 bg-card/60 p-4 hover:border-ink">
              <ScrollText className="mt-0.5 size-5 shrink-0 text-ink-3" aria-hidden />
              <div className="flex-1">
                <UnitTag unit={u} />
                <p className="mt-1.5 text-[0.93rem] leading-snug font-bold">{u.title}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-[0.8rem] text-ink-3">
                  <Lock className="size-3.5" aria-hidden /> Débloquée à la fin du dossier
                </p>
              </div>
            </Link>
          </li>
          );
        })}
      </ul>
    </div>
  );
}
