import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Snackbar } from '../components/Snackbar';
import {
  SnackbarContext,
  type SnackbarMessage,
  type SnackbarSeverity,
} from './SnackbarContext';

const AUTO_DISMISS_MS = 4000;

export function SnackbarProvider({ children }: PropsWithChildren) {
  const [messages, setMessages] = useState<SnackbarMessage[]>([]);
  const nextId = useRef(0);

  const show = useCallback((message: string, severity: SnackbarSeverity) => {
    const id = nextId.current++;
    setMessages(prev => [...prev, { id, message, severity }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    const oldest = messages[0];
    const timer = setTimeout(() => dismiss(oldest.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [messages, dismiss]);

  const value = {
    showError: (message: string) => show(message, 'error'),
    showSuccess: (message: string) => show(message, 'success'),
    showInfo: (message: string) => show(message, 'info'),
  };

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar messages={messages} onDismiss={dismiss} />
    </SnackbarContext.Provider>
  );
}
