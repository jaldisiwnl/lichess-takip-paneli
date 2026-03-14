'use client';

import { useEffect } from 'react';
import { startPolling, stopPolling, setStatusChangeCallback } from '@/lib/polling';
import { useApp } from '@/context/AppContext';

export default function PollingProvider({ children }: { children: React.ReactNode }) {
  const { refreshPlayers } = useApp();

  useEffect(() => {
    setStatusChangeCallback(refreshPlayers);
    startPolling();
    return () => {
      stopPolling();
    };
  }, [refreshPlayers]);

  return <>{children}</>;
}
