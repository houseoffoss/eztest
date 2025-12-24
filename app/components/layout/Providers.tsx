'use client';

import { SessionProvider } from 'next-auth/react';
import { SidebarProvider } from '@/lib/sidebar-context';
import { TimezoneProvider } from '@/frontend/context/TimezoneContext';
import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <TimezoneProvider>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </TimezoneProvider>
    </SessionProvider>
  );
}
