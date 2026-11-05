import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { RealTeacherData } from '../services/teacherReal';
import { useAuth } from './AuthContext';

interface TeacherSourceState {
  source: RealTeacherData | null;
  loading: boolean;
  error: string | null;
  version: number;
  reload: () => void;
  touch: () => void;
}

const Ctx = createContext<TeacherSourceState | null>(null);

/** Charge les vrais élèves et leurs réponses pour l'espace enseignant (site en ligne). */
export function TeacherSourceProvider({ children }: { children: ReactNode }) {
  const { backend, cloud, isAdmin } = useAuth();
  const [source, setSource] = useState<RealTeacherData | null>(null);
  const [loading, setLoading] = useState(cloud);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const reload = useCallback(async () => {
    if (!backend || !isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const [accounts, rows] = await Promise.all([backend.listAccounts(), backend.pullAll()]);
      setSource(new RealTeacherData(accounts, rows, backend));
      setVersion((v) => v + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chargement impossible.');
    } finally {
      setLoading(false);
    }
  }, [backend, isAdmin]);

  useEffect(() => {
    void reload();
  }, [reload]);

  if (!cloud) return <>{children}</>;
  return (
    <Ctx.Provider value={{ source, loading, error, version, reload: () => void reload(), touch: () => setVersion((v) => v + 1) }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTeacherSource() {
  return useContext(Ctx);
}
