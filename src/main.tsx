import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from './components/ProtectedRoute';
import { ProjectProvider } from './hooks/ProjectProvider';
import { SnackbarProvider } from './hooks/SnackbarProvider';
import { HomePage } from './pages/HomePage';
import { ProjectPage } from './pages/ProjectPage';

const basename = import.meta.env.BASE_URL;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router basename={basename}>
      <SnackbarProvider>
        <ProjectProvider>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute requireProject={false}>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/project"
              element={
                <ProtectedRoute requireProject={true}>
                  <ProjectPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </ProjectProvider>
      </SnackbarProvider>
    </Router>
  </StrictMode>
);
