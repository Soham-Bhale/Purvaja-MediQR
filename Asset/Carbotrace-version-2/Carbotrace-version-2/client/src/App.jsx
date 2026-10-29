import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { GithubAuthModal } from './components/github/GithubAuthModal';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { MapPage } from './pages/MapPage';
import { useGithubAuth } from './hooks/useGithubAuth';

export function App() {
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
  const githubAuth = useGithubAuth();

  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar
          onOpenGithubModal={() => setIsGithubModalOpen(true)}
          githubAuth={githubAuth}
        />

        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  onOpenGithubModal={() => setIsGithubModalOpen(true)}
                  githubAuth={githubAuth}
                />
              }
            />
            <Route
              path="/dashboard/:id"
              element={<DashboardPage githubAuth={githubAuth} />}
            />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />

        <GithubAuthModal
          isOpen={isGithubModalOpen}
          onClose={() => setIsGithubModalOpen(false)}
          githubAuth={githubAuth}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
