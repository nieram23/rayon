import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { DataMode, StudentProfile } from '../domain/types';
import { KEYS, isPersistent, readJSON, removeKey, writeJSON } from '../services/storage';
import { CHAPTERS } from '../content/chapters';
import { createStudentData, type StudentDataSource } from '../services/studentData';

interface AppState {
  profile: StudentProfile | null;
  saveProfile: (p: Omit<StudentProfile, 'createdAt'>) => void;
  /** Efface profil, progression et préférences locales. */
  resetAll: () => void;
  mode: DataMode;
  setMode: (m: DataMode) => void;
  student: StudentDataSource;
  persistent: boolean;
  /** Compteur incrémenté à chaque modification de données de démonstration enseignant. */
  teacherRevision: number;
  bumpTeacher: () => void;
  /** À appeler après chaque réponse enregistrée pour rafraîchir les tableaux de bord. */
  bumpData: () => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<StudentProfile | null>(() => readJSON<StudentProfile | null>(KEYS.profile, null));
  const [mode, setModeState] = useState<DataMode>(() => readJSON<DataMode>(KEYS.mode, 'local'));
  const [teacherRevision, setRev] = useState(0);
  const [dataRevision, setDataRev] = useState(0);

  const saveProfile = useCallback((p: Omit<StudentProfile, 'createdAt'>) => {
    const next: StudentProfile = {
      pseudo: p.pseudo.trim(),
      classLabel: p.classLabel.trim(),
      createdAt: profile?.createdAt ?? new Date().toISOString(),
    };
    writeJSON(KEYS.profile, next);
    setProfile(next);
  }, [profile]);

  const setMode = useCallback((m: DataMode) => {
    writeJSON(KEYS.mode, m);
    setModeState(m);
  }, []);

  const resetAll = useCallback(() => {
    Object.values(KEYS).forEach(removeKey);
    Object.keys(CHAPTERS).forEach((id) => removeKey(`answers.${id}`));
    setProfile(null);
    setModeState('local');
    setRev((r) => r + 1);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      profile,
      saveProfile,
      resetAll,
      mode,
      setMode,
      student: createStudentData(mode),
      persistent: isPersistent(),
      teacherRevision,
      bumpTeacher: () => setRev((r) => r + 1),
      bumpData: () => setDataRev((r) => r + 1),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profile, saveProfile, resetAll, mode, setMode, teacherRevision, dataRevision],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp doit être utilisé dans <AppProvider>');
  return v;
}
