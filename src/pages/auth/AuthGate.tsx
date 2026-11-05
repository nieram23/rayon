import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react';
import { Eye, EyeOff, Loader2, LogIn, RefreshCw, ShieldCheck, WifiOff } from 'lucide-react';
import { AisleIllustration, Logo } from '../../components/illustrations';
import { Button } from '../../components/ui';
import { useAuth } from '../../state/AuthContext';

export const FIELD =
  'mt-1.5 block w-full min-h-12 rounded-xl border border-line-2 bg-white px-4 text-[1rem] outline-none focus:border-ink focus:ring-2 focus:ring-tag';

/** Affiche la connexion tant que personne n'est connecté. Sans serveur configuré, laisse passer (mode local). */
export function AuthGate({ children }: { children: ReactNode }) {
  const { phase, error, retry } = useAuth();
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const on = () => setHash(window.location.hash);
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  if (phase === 'off') return <>{children}</>;
  if (hash.startsWith('#/installation') && phase !== 'ready') return <SetupPage />;
  if (phase === 'loading') return <Splash />;
  if (phase === 'error')
    return (
      <Shell>
        <div className="card flex flex-col gap-4 p-6" role="alert">
          <WifiOff className="size-7" aria-hidden />
          <h1 className="text-[1.5rem] font-extrabold">Impossible de joindre le serveur</h1>
          <p className="text-ink-2">{error}</p>
          <Button onClick={retry} className="self-start">
            <RefreshCw className="size-4" aria-hidden /> Réessayer
          </Button>
        </div>
      </Shell>
    );
  if (phase === 'signedOut') return <LoginPage />;
  return <>{children}</>;
}

function Splash() {
  return (
    <div className="grid min-h-dvh place-items-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        <Logo />
        <p className="inline-flex items-center gap-2 text-ink-3">
          <Loader2 className="size-4 animate-spin" aria-hidden /> Chargement de ton travail…
        </p>
      </div>
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden overflow-hidden bg-[#ebe5d6] lg:block">
        <div className="absolute top-8 left-8">
          <Logo />
        </div>
        <AisleIllustration className="absolute inset-x-0 bottom-0 w-full" />
        <div className="absolute top-28 left-8 max-w-md">
          <p className="font-display text-[2.6rem] leading-[1.05] font-extrabold">
            Le magasin-école
            <br />
            du Bac Pro MCV.
          </p>
        </div>
      </div>
      <div className="flex flex-col justify-center px-5 py-10 sm:px-12">
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>
        <div className="animate-rise w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

export function PasswordInput({ id, value, onChange, autoComplete }: { id: string; value: string; onChange: (v: string) => void; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        className={FIELD + ' pr-14'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        autoCapitalize="none"
        spellCheck={false}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute top-1.5 right-1.5 grid size-11 place-items-center rounded-lg text-ink-3 hover:bg-ink/5 hover:text-ink"
        aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        aria-pressed={show}
      >
        {show ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
      </button>
    </div>
  );
}

export function LoginPage() {
  const { signIn, error: authError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(authError);
  const [busy, setBusy] = useState(false);
  const id = useId();

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Saisis ton identifiant et ton mot de passe.');
      return;
    }
    setBusy(true);
    setError(null);
    const err = await signIn(username.trim().toLowerCase(), password);
    setBusy(false);
    if (err) setError(err);
  }

  return (
    <Shell>
      <p className="eyebrow">Bac Pro MCV · option A</p>
      <h1 className="mt-2 text-[2rem] font-extrabold sm:text-[2.4rem]">Connexion à Rayon</h1>
      <p className="mt-3 text-ink-2">Utilise l’identifiant et le mot de passe donnés par ton professeur. Ton travail est enregistré sur ton compte : tu le retrouves sur n’importe quel ordinateur.</p>
      <form onSubmit={submit} noValidate className="card mt-6 flex flex-col gap-4 p-5 sm:p-6">
        <div>
          <label htmlFor={`${id}-u`} className="font-bold">
            Identifiant
          </label>
          <input
            id={`${id}-u`}
            className={FIELD}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="Ex. : lea.martin"
          />
        </div>
        <div>
          <label htmlFor={`${id}-p`} className="font-bold">
            Mot de passe
          </label>
          <PasswordInput id={`${id}-p`} value={password} onChange={setPassword} autoComplete="current-password" />
        </div>
        {error && (
          <p className="rounded-xl bg-m1/8 px-4 py-3 text-[0.92rem] font-bold text-m1" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" disabled={busy} className="min-h-12">
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <LogIn className="size-4" aria-hidden />}
          {busy ? 'Connexion…' : 'Se connecter'}
        </Button>
      </form>
      <p className="mt-4 flex items-start gap-2 text-[0.85rem] text-ink-3">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
        Mot de passe oublié ? Demande à ton professeur de t’en donner un nouveau. Sur un ordinateur partagé, pense à te déconnecter à la fin de la séance.
      </p>
    </Shell>
  );
}

/** Première mise en service : crée le compte administrateur défini dans Vercel. */
function SetupPage() {
  const { backend } = useAuth();
  const [state, setState] = useState<{ busy: boolean; msg?: string; ok?: boolean }>({ busy: false });
  async function run() {
    if (!backend) return;
    setState({ busy: true });
    try {
      const r = await backend.bootstrap();
      setState({ busy: false, ok: true, msg: r.message });
    } catch (e) {
      setState({ busy: false, ok: false, msg: e instanceof Error ? e.message : 'Erreur.' });
    }
  }
  return (
    <Shell>
      <p className="eyebrow">Installation</p>
      <h1 className="mt-2 text-[2rem] font-extrabold">Créer le compte administrateur</h1>
      <p className="mt-3 text-ink-2">
        Cette étape se fait une seule fois. Elle crée le compte administrateur avec l’identifiant et le mot de passe enregistrés dans les réglages de
        Vercel (ADMIN_USERNAME et ADMIN_PASSWORD).
      </p>
      <div className="card mt-6 flex flex-col gap-4 p-5 sm:p-6">
        <Button onClick={run} disabled={state.busy} className="self-start">
          {state.busy && <Loader2 className="size-4 animate-spin" aria-hidden />} Créer le compte administrateur
        </Button>
        {state.msg && (
          <p className={state.ok ? 'font-bold text-p1-dark' : 'font-bold text-m1'} role="status">
            {state.msg}
          </p>
        )}
        {state.ok && (
          <a href="#/" className="font-bold underline underline-offset-4">
            Aller à la page de connexion
          </a>
        )}
      </div>
    </Shell>
  );
}
