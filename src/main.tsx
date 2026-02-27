import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from './components/ProtectedRoute';
import { ProjectProvider } from './hooks/ProjectProvider';
import { SnackbarProvider } from './hooks/SnackbarProvider';
import { ComponentEditorPage } from './pages/ComponentEditorPage';
import { HomePage } from './pages/HomePage';
import { ProjectPage } from './pages/ProjectPage';
import { ROUTES } from './routes';

const basename = import.meta.env.BASE_URL;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router basename={basename}>
      <SnackbarProvider>
        <ProjectProvider>
          <Routes>
            <Route
              path={ROUTES.HOME}
              element={
                <ProtectedRoute requireProject={false}>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.PROJECT}
              element={
                <ProtectedRoute requireProject={true}>
                  <ProjectPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.COMPONENT_EDITOR_NEW}
              element={
                <ProtectedRoute requireProject={true}>
                  <ComponentEditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.COMPONENT_EDITOR_EDIT}
              element={
                <ProtectedRoute requireProject={true}>
                  <ComponentEditorPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </ProjectProvider>
      </SnackbarProvider>
    </Router>
  </StrictMode>
);
