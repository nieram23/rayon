import { HashRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import { StudentLayout } from './components/layout/StudentLayout';
import { TeacherLayout } from './components/layout/TeacherLayout';
import { Catalogue } from './pages/eleve/Catalogue';
import { Competences } from './pages/eleve/Competences';
import { Dashboard } from './pages/eleve/Dashboard';
import { Fiches } from './pages/eleve/Fiches';
import { Parcours } from './pages/eleve/Parcours';
import { Profil } from './pages/eleve/Profil';
import { Travaux } from './pages/eleve/Travaux';
import { UnitPage } from './pages/eleve/UnitPage';
import { ChapterPlayer } from './pages/eleve/ChapterPlayer';
import { TeacherDashboard } from './pages/enseignant/TeacherDashboard';
import { TeacherClasses, TeacherStudentDetail, TeacherStudents } from './pages/enseignant/TeacherStudents';
import { TeacherCompetences, TeacherProductions, TeacherUnits } from './pages/enseignant/TeacherTracking';
import { NotFound } from './pages/NotFound';
import { AppProvider } from './state/AppContext';
import { AuthProvider, useAuth } from './state/AuthContext';
import { AuthGate } from './pages/auth/AuthGate';
import { TeacherAccounts } from './pages/enseignant/TeacherAccounts';

/**
 * HashRouter : fonctionne sur n'importe quel hébergement statique gratuit
 * (aucune règle de réécriture serveur nécessaire). Passer à BrowserRouter
 * lorsqu'un serveur applicatif sera mis en place.
 */
// Build « artifact » (aperçu hébergé dans un cadre sécurisé) : routage en mémoire.
const Router = import.meta.env.VITE_ARTIFACT === '1' ? MemoryRouter : HashRouter;

export function App() {
  return (
    <AuthProvider>
      <AuthGate>
        <AppForAccount />
      </AuthGate>
    </AuthProvider>
  );
}

/** Une instance par compte connecté : les données affichées sont rechargées à chaque changement de compte. */
function AppForAccount() {
  const { account } = useAuth();
  return (
    <AppProvider key={account?.id ?? 'local'}>
      <Router>
        <Routes>
          <Route element={<StudentLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="parcours" element={<Parcours />} />
            <Route path="dossiers" element={<Catalogue />} />
            <Route path="dossiers/:id" element={<UnitPage />} />
            <Route path="dossiers/:id/:stepId" element={<ChapterPlayer />} />
            <Route path="competences" element={<Competences />} />
            <Route path="travaux" element={<Travaux />} />
            <Route path="fiches" element={<Fiches />} />
            <Route path="profil" element={<Profil />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="enseignant" element={<TeacherLayout />}>
            <Route index element={<TeacherDashboard />} />
            <Route path="classes" element={<TeacherClasses />} />
            <Route path="eleves" element={<TeacherStudents />} />
            <Route path="eleves/:id" element={<TeacherStudentDetail />} />
            <Route path="dossiers" element={<TeacherUnits />} />
            <Route path="competences" element={<TeacherCompetences />} />
            <Route path="productions" element={<TeacherProductions />} />
            <Route path="comptes" element={<TeacherAccounts />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}
