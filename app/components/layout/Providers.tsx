'use client';

import { SessionProvider } from 'next-auth/react';
import { SidebarProvider } from '@/lib/sidebar-context';
import { TimezoneProvider } from '@/frontend/context/TimezoneContext';
import { ThemeProvider } from '@/app/components/layout/ThemeProvider';
import { FirebaseAnalytics } from './FirebaseAnalytics';
import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <TimezoneProvider>
          <SidebarProvider>
            <FirebaseAnalytics />
            {children}
          </SidebarProvider>
        </TimezoneProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
