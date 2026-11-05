import { useEffect, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowLeft, ClipboardCheck, Loader2, FlaskConical, FolderKanban, KeyRound, LayoutDashboard, Lock, LogOut, School, Target, Users } from 'lucide-react';
import { useAuth } from '../../state/AuthContext';
import { TeacherSourceProvider, useTeacherSource } from '../../state/TeacherSource';
import { Logo } from '../illustrations';
import { cx } from '../../lib/theme';

const NAV = [
  { to: '/enseignant', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/enseignant/comptes', label: 'Comptes élèves', icon: KeyRound },
  { to: '/enseignant/classes', label: 'Classes', icon: School },
  { to: '/enseignant/eleves', label: 'Élèves', icon: Users },
  { to: '/enseignant/dossiers', label: 'Progression par dossier', icon: FolderKanban },
  { to: '/enseignant/competences', label: 'Suivi des compétences', icon: Target },
  { to: '/enseignant/productions', label: 'Résultats et productions', icon: ClipboardCheck },
];

export function TeacherLayout() {
  const { pathname } = useLocation();
  const { cloud, isAdmin, account, signOut } = useAuth();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  if (cloud && !isAdmin) {
    return (
      <div className="grid min-h-dvh place-items-center px-5">
        <div className="card flex max-w-md flex-col items-start gap-4 p-6">
          <Lock className="size-7" aria-hidden />
          <h1 className="text-[1.5rem] font-extrabold">Espace réservé au professeur</h1>
          <p className="text-ink-2">Ton compte élève ne donne pas accès à cette partie du site.</p>
          <Link to="/" className="font-bold underline underline-offset-4">
            Revenir à mon espace
          </Link>
        </div>
      </div>
    );
  }
  const accountsPage = pathname.startsWith('/enseignant/comptes');

  return (
    <div className="min-h-dvh bg-[#eeeae0]">
      <header className="sticky top-0 z-30 bg-ink text-paper">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link to="/enseignant" aria-label="Espace enseignant — accueil">
            <Logo invert />
          </Link>
          <span className="ml-1 hidden rounded-full border border-paper/25 px-3 py-1 text-[0.78rem] font-bold sm:inline">Espace enseignant</span>
          {cloud && account && (
            <button
              type="button"
              onClick={() => void signOut(true)}
              className="order-last inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-[0.88rem] font-bold text-paper/80 hover:bg-paper/10 hover:text-paper"
            >
              <LogOut className="size-4" aria-hidden /> <span className="hidden sm:inline">Se déconnecter</span>
            </button>
          )}
          <Link to="/" className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-[0.88rem] font-bold text-paper/80 hover:bg-paper/10 hover:text-paper">
            <ArrowLeft className="size-4" aria-hidden /> Espace élève
          </Link>
        </div>
        {!cloud && (
          <div className="flex items-start gap-2 bg-tag px-4 py-2 text-[0.82rem] text-ink sm:items-center sm:justify-center">
            <FlaskConical className="mt-0.5 size-4 shrink-0 sm:mt-0" aria-hidden />
            <p>
              <strong>Démonstration.</strong> Classes, élèves et résultats sont fictifs. Sur le site en ligne, cet espace affiche tes vrais élèves.
            </p>
          </div>
        )}
        <nav aria-label="Navigation enseignant" className="border-t border-paper/10 lg:hidden">
          <ul className="flex gap-1 overflow-x-auto px-3 py-2 [scrollbar-width:none]">
            {NAV.map(({ to, label, end }) => (
              <li key={to} className="shrink-0">
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) => cx('inline-flex min-h-10 items-center rounded-full px-3.5 text-[0.85rem] font-bold', isActive ? 'bg-paper text-ink' : 'text-paper/75')}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-6 sm:px-6 sm:py-8">
        <nav aria-label="Navigation enseignant" className="sticky top-32 hidden h-fit w-60 shrink-0 lg:block">
          <ul className="flex flex-col gap-1">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cx('flex min-h-11 items-center gap-3 rounded-xl px-3 text-[0.92rem] font-bold', isActive ? 'bg-ink text-paper' : 'text-ink-2 hover:bg-ink/6')
                  }
                >
                  <Icon className="size-[1.1rem]" aria-hidden /> {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <main className="min-w-0 flex-1">
          <TeacherSourceProvider>
            <LoadGate skip={accountsPage}>
              <Outlet />
            </LoadGate>
          </TeacherSourceProvider>
        </main>
      </div>
    </div>
  );
}

/** Attend le chargement des vrais élèves avant d'afficher les pages de suivi. */
function LoadGate({ children, skip }: { children: ReactNode; skip: boolean }) {
  const real = useTeacherSource();
  if (skip || !real) return <>{children}</>;
  if (real.loading && !real.source)
    return (
      <p className="inline-flex items-center gap-2 text-ink-3" role="status">
        <Loader2 className="size-4 animate-spin" aria-hidden /> Chargement des élèves et de leurs résultats…
      </p>
    );
  if (real.error && !real.source)
    return (
      <div className="card flex flex-col items-start gap-3 p-5" role="alert">
        <p className="font-bold">Impossible de charger les résultats : {real.error}</p>
        <button type="button" onClick={real.reload} className="font-bold underline underline-offset-4">
          Réessayer
        </button>
      </div>
    );
  if (real.source && real.source.listStudents().length === 0)
    return (
      <div className="card flex max-w-2xl flex-col items-start gap-3 p-6">
        <Users className="size-7" aria-hidden />
        <h1 className="text-[1.5rem] font-extrabold">Aucun élève pour l’instant</h1>
        <p className="text-ink-2">Crée les comptes de tes élèves : le tableau de bord, les classes et les résultats se rempliront au fur et à mesure qu’ils travaillent.</p>
        <Link to="/enseignant/comptes" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 font-bold text-paper">
          <KeyRound className="size-4" aria-hidden /> Créer les comptes élèves
        </Link>
      </div>
    );
  return <>{children}</>;
}
