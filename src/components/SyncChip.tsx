import { useState } from 'react';
import { CloudCheck, CloudOff, Loader2, LogOut } from 'lucide-react';
import { useAuth } from '../state/AuthContext';
import { Button } from './ui';
import { cx } from '../lib/theme';

/** Indique si le travail est bien enregistré sur le serveur. */
export function SyncChip({ className }: { className?: string }) {
  const { syncStatus } = useAuth();
  const map = {
    idle: null,
    saved: { icon: CloudCheck, text: 'Enregistré', cls: 'text-p1-dark' },
    saving: { icon: Loader2, text: 'Enregistrement…', cls: 'text-ink-3' },
    error: { icon: CloudOff, text: 'Hors ligne : envoi dès que possible', cls: 'text-m1' },
  } as const;
  const s = map[syncStatus];
  if (!s) return null;
  const Icon = s.icon;
  return (
    <span className={cx('inline-flex items-center gap-1.5 text-[0.8rem] font-bold', s.cls, className)} role="status" aria-live="polite" title={s.text}>
      <Icon className={cx('size-4', syncStatus === 'saving' && 'animate-spin')} aria-hidden />
      <span className={syncStatus === 'error' ? 'hidden md:inline' : 'hidden sm:inline'}>{s.text}</span>
    </span>
  );
}

/** Déconnexion. Si des réponses ne sont pas encore parties, demande confirmation. */
export function LogoutButton({ className, label = 'Se déconnecter' }: { className?: string; label?: string }) {
  const { signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const [warn, setWarn] = useState(false);

  async function go(force: boolean) {
    setBusy(true);
    const ok = await signOut(force);
    setBusy(false);
    if (!ok) setWarn(true);
  }

  if (warn)
    return (
      <div className="flex flex-col gap-3 rounded-xl border-2 border-m1/40 bg-m1/5 p-4" role="alertdialog" aria-labelledby="logout-warn">
        <p id="logout-warn" className="font-bold">
          Tes dernières réponses n’ont pas encore pu être envoyées (connexion internet ?).
        </p>
        <p className="text-[0.9rem] text-ink-2">Elles restent gardées sur cet ordinateur et partiront à ta prochaine connexion ici.</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setWarn(false)}>
            Rester connecté
          </Button>
          <Button variant="danger" onClick={() => void go(true)} disabled={busy}>
            Me déconnecter quand même
          </Button>
        </div>
      </div>
    );

  return (
    <button type="button" className={className} onClick={() => void go(false)} disabled={busy}>
      {busy ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <LogOut className="size-5" aria-hidden />} {label}
    </button>
  );
}
