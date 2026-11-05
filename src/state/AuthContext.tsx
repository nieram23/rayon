import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { getBackend, type Account, type CloudBackend } from '../services/cloud';
import { SyncEngine, type SyncStatus } from '../services/cloud/sync';
import { KEYS, clearWorkData, writeRaw } from '../services/storage';

type Phase = 'off' | 'loading' | 'signedOut' | 'ready' | 'error';

interface AuthState {
  /** true lorsque le site fonctionne avec des comptes (serveur configuré). */
  cloud: boolean;
  backend: CloudBackend | null;
  phase: Phase;
  account: Account | null;
  error: string | null;
  syncStatus: SyncStatus;
  isAdmin: boolean;
  signIn: (username: string, password: string) => Promise<string | null>;
  /** Renvoie false si des réponses n'ont pas encore pu être envoyées (sauf avec force). */
  signOut: (force?: boolean) => Promise<boolean>;
  retry: () => void;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const backend = useMemo(() => getBackend(), []);
  const [phase, setPhase] = useState<Phase>(backend ? 'loading' : 'off');
  const [account, setAccount] = useState<Account | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const engine = useRef<SyncEngine | null>(null);

  const open = useCallback(
    async (b: CloudBackend): Promise<Account | null> => {
      setPhase('loading');
      setError(null);
      try {
        const acc = await b.myAccount();
        if (!acc) {
          await b.signOut();
          setPhase('signedOut');
          setError('Ce compte n’est pas encore configuré. Préviens ton professeur.');
          return null;
        }
        engine.current?.stop();
        const e = new SyncEngine(b, acc.id);
        e.onStatus(setSyncStatus);
        await e.start();
        engine.current = e;
        writeRaw(KEYS.profile, { pseudo: acc.displayName, classLabel: acc.classLabel, createdAt: acc.createdAt });
        void b.touchLastSeen().catch(() => undefined);
        setAccount(acc);
        setPhase('ready');
        return acc;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Chargement impossible.');
        setPhase('error');
        return null;
      }
    },
    [],
  );

  const boot = useCallback(async () => {
    if (!backend) return;
    setPhase('loading');
    try {
      const id = await backend.currentUserId();
      if (id) await open(backend);
      else {
        clearWorkData();
        setPhase('signedOut');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Serveur injoignable.');
      setPhase('error');
    }
  }, [backend, open]);

  useEffect(() => {
    void boot();
    if (!backend) return;
    return backend.onSignedOut(() => {
      engine.current?.stop();
      engine.current = null;
      clearWorkData();
      setAccount(null);
      setPhase('signedOut');
    });
  }, [backend, boot]);

  // Avertit avant de fermer l'onglet si des réponses ne sont pas encore parties.
  useEffect(() => {
    const onBefore = (ev: BeforeUnloadEvent) => {
      if (engine.current?.hasPending()) {
        void engine.current.flush();
        ev.preventDefault();
        ev.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBefore);
    return () => window.removeEventListener('beforeunload', onBefore);
  }, []);

  const signIn = useCallback(
    async (username: string, password: string) => {
      if (!backend) return 'Serveur non configuré.';
      const r = await backend.signIn(username, password);
      if (!r.ok) return r.error;
      const acc = await open(backend);
      // Après une connexion, un élève arrive sur son accueil (et non sur une page laissée ouverte par le précédent utilisateur).
      if (acc && acc.role !== 'admin' && window.location.hash.startsWith('#/enseignant')) window.location.hash = '#/';
      return null;
    },
    [backend, open],
  );

  const signOut = useCallback(
    async (force = false) => {
      if (!backend) return true;
      const e = engine.current;
      if (e) {
        const allSent = await e.stop();
        if (!allSent && !force) {
          e.resume();
          return false;
        }
      }
      engine.current = null;
      await backend.signOut().catch(() => undefined);
      clearWorkData();
      setAccount(null);
      setSyncStatus('idle');
      setPhase('signedOut');
      return true;
    },
    [backend],
  );

  const value = useMemo<AuthState>(
    () => ({
      cloud: !!backend,
      backend,
      phase,
      account,
      error,
      syncStatus,
      isAdmin: account?.role === 'admin',
      signIn,
      signOut,
      retry: () => void boot(),
    }),
    [backend, phase, account, error, syncStatus, signIn, signOut, boot],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth doit être utilisé dans <AuthProvider>');
  return v;
}
