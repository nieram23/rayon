import { BookOpenCheck, Calculator, ClipboardList, FileSpreadsheet, LayoutGrid, Mail, Map, PenLine } from 'lucide-react';
import { DataModeTag, EmptyState } from '../../components/ui';
import { useStudentView } from '../../state/useStudentView';

const FORMS = [
  { icon: ClipboardList, label: 'Bons de commande' },
  { icon: FileSpreadsheet, label: 'Tableaux à compléter' },
  { icon: Map, label: 'Plans annotés' },
  { icon: Calculator, label: 'Calculs commerciaux' },
  { icon: Mail, label: 'Courriels professionnels' },
  { icon: LayoutGrid, label: 'Présentoirs organisés' },
  { icon: PenLine, label: 'Justifications écrites' },
];

export function Travaux() {
  const v = useStudentView();
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <p className="eyebrow">Mes travaux</p>
        <h1 className="text-[2rem] font-extrabold sm:text-[2.4rem]">Mes productions</h1>
        <div className="flex flex-wrap items-center gap-3">
          <p className="max-w-2xl text-ink-2">Tout ce que tu réalises dans les annexes des dossiers sera rangé ici, avec la correction ou le retour de ton professeur.</p>
          <DataModeTag mode={v.mode} />
        </div>
      </header>
      <EmptyState icon={<BookOpenCheck className="size-6" />} title="Aucune production pour l’instant">
        Les productions apparaîtront dès l’ouverture du premier dossier.
        {v.mode === 'demo' && ' La démonstration ne simule pas de productions côté élève.'}
      </EmptyState>
      <section aria-labelledby="formes">
        <h2 id="formes" className="mb-3 text-[1.2rem] font-bold">
          Les formes de travail prévues
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {FORMS.map((f) => (
            <li key={f.label} className="flex flex-col items-start gap-2 rounded-2xl border border-line bg-card p-4">
              <f.icon className="size-5 text-ink-2" aria-hidden />
              <span className="text-[0.88rem] font-bold leading-snug">{f.label}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
