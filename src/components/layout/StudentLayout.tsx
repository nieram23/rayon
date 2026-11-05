import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { BookOpenCheck, FolderKanban, GraduationCap, Home, Menu, Route, ScrollText, Target, UserRound, X } from 'lucide-react';
import { Logo } from '../illustrations';
import { DataModeTag } from '../ui';
import { useApp } from '../../state/AppContext';
import { cx } from '../../lib/theme';
import { Welcome } from '../../pages/eleve/Welcome';
import { useAuth } from '../../state/AuthContext';
import { LogoutButton, SyncChip } from '../SyncChip';

export const STUDENT_NAV = [
  { to: '/', label: 'Accueil', icon: Home, end: true },
  { to: '/parcours', label: 'Mon parcours', icon: Route },
  { to: '/dossiers', label: 'Dossiers', icon: FolderKanban },
  { to: '/competences', label: 'Compétences', icon: Target },
  { to: '/travaux', label: 'Mes travaux', icon: BookOpenCheck },
  { to: '/fiches', label: 'Fiches', icon: ScrollText },
];

const MOBILE_TABS = [STUDENT_NAV[0], STUDENT_NAV[2], STUDENT_NAV[3], STUDENT_NAV[1]];

export function StudentLayout() {
  const { profile, mode } = useApp();
  const { cloud, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  }, [pathname]);

  if (!profile) return <Welcome />;

  return (
    <div className="min-h-dvh pb-24 lg:pb-10">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-ink focus:p-3 focus:text-paper">
        Aller au contenu
      </a>
      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link to="/" aria-label="Rayon — accueil">
            <Logo />
          </Link>
          <nav aria-label="Navigation principale" className="ml-4 hidden items-center gap-1 lg:flex">
            {STUDENT_NAV.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cx(
                    'rounded-full px-3.5 py-2 text-[0.92rem] font-bold transition-colors',
                    isActive ? 'bg-ink text-paper' : 'text-ink-2 hover:bg-ink/6',
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {mode === 'demo' && (
              <span className="hidden sm:block">
                <DataModeTag mode="demo" />
              </span>
            )}
            {cloud && <SyncChip />}
            {(!cloud || isAdmin) && <Link
              to="/enseignant"
              className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-[0.85rem] font-bold text-ink-3 hover:bg-ink/6 hover:text-ink md:inline-flex"
            >
              <GraduationCap className="size-4" aria-hidden /> Espace enseignant
            </Link>}
            <Link
              to="/profil"
              className="flex items-center gap-2 rounded-full border border-line-2 bg-card py-1 pr-3 pl-1 hover:border-ink"
              aria-label={`Profil de ${profile.pseudo}`}
            >
              <span className="grid size-8 place-items-center rounded-full bg-tag font-display text-sm font-bold">
                {profile.pseudo.slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden flex-col leading-tight sm:flex">
                <span className="text-[0.85rem] font-bold">{profile.pseudo}</span>
                <span className="text-[0.72rem] text-ink-3">{profile.classLabel || 'Classe non renseignée'}</span>
              </span>
            </Link>
            <button
              type="button"
              className="grid size-11 place-items-center rounded-full hover:bg-ink/6 lg:hidden"
              aria-label="Ouvrir le menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
        {mode === 'demo' && (
          <div className="bg-tag px-4 py-1.5 text-center text-[0.8rem] font-bold sm:hidden">Démonstration · données simulées</div>
        )}
      </header>

      <main id="contenu" className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8">
        <Outlet />
      </main>

      {/* Barre d'onglets mobile */}
      <nav aria-label="Navigation rapide" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 backdrop-blur lg:hidden">
        <ul className="mx-auto grid max-w-lg grid-cols-4 pb-[env(safe-area-inset-bottom)]">
          {MOBILE_TABS.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cx('flex min-h-16 flex-col items-center justify-center gap-1 text-[0.72rem] font-bold', isActive ? 'text-ink' : 'text-ink-3')
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={cx('grid h-7 w-12 place-items-center rounded-full transition-colors', isActive && 'bg-tag')}>
                      <Icon className="size-5" aria-hidden />
                    </span>
                    {label === 'Mon parcours' ? 'Parcours' : label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Tiroir de menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Fermer le menu" onClick={() => setMenuOpen(false)} />
          <div className="animate-rise absolute top-0 right-0 flex h-full w-[min(22rem,88vw)] flex-col gap-1 bg-paper p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <Logo />
              <button type="button" className="grid size-11 place-items-center rounded-full hover:bg-ink/6" aria-label="Fermer le menu" onClick={() => setMenuOpen(false)}>
                <X className="size-5" />
              </button>
            </div>
            {[...STUDENT_NAV, { to: '/profil', label: 'Mon profil', icon: UserRound, end: false }].map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => cx('flex min-h-12 items-center gap-3 rounded-xl px-3 font-bold', isActive ? 'bg-ink text-paper' : 'hover:bg-ink/6')}
              >
                <Icon className="size-5" aria-hidden /> {label}
              </NavLink>
            ))}
            <div className="mt-auto border-t border-line pt-3">
              {(!cloud || isAdmin) && (
                <Link to="/enseignant" className="flex min-h-12 items-center gap-3 rounded-xl px-3 font-bold text-ink-2 hover:bg-ink/6">
                  <GraduationCap className="size-5" aria-hidden /> Espace enseignant
                </Link>
              )}
              {cloud && <LogoutButton className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 font-bold text-ink-2 hover:bg-ink/6" />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
