import { type PropsWithChildren, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useProject } from '../../hooks/useProject';
import { ROUTES } from '../../routes';

export interface ProtectedRouteProps {
  requireProject?: boolean;
}

export function ProtectedRoute(props: PropsWithChildren<ProtectedRouteProps>) {
  const { isProjectLoaded } = useProject();
  const navigate = useNavigate();

  const requireProject = props.requireProject ?? true;

  useEffect(() => {
    if (requireProject && !isProjectLoaded) {
      navigate(ROUTES.HOME, { replace: true });
    } else if (!requireProject && isProjectLoaded) {
      navigate(ROUTES.PROJECT, { replace: true });
    }
  }, [requireProject, isProjectLoaded, navigate]);

  if (requireProject && !isProjectLoaded) {
    return null;
  }

  if (!requireProject && isProjectLoaded) {
    return null;
  }

  return <>{props.children}</>;
}
