'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface TimezoneContextType {
  timezone: string;
  offset: number;
  isDST: boolean;
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(undefined);

/**
 * TimezoneProvider - Provides user's browser timezone information to the app
 * This ensures all dates are displayed in the user's local timezone
 */
export function TimezoneProvider({ children }: { children: React.ReactNode }) {
  const [timezone, setTimezone] = useState<string>('UTC');
  const [offset, setOffset] = useState<number>(0);
  const [isDST, setIsDST] = useState<boolean>(false);

  useEffect(() => {
    // Get timezone name using Intl API
    const formatter = new Intl.DateTimeFormat('en-US', { timeZoneName: 'long' });
    const parts = formatter.formatToParts(new Date());
    const tzName = parts.find(part => part.type === 'timeZoneName')?.value || 'UTC';
    setTimezone(tzName);

    // Get timezone offset in hours
    const now = new Date();
    const offset = -now.getTimezoneOffset() / 60;
    setOffset(offset);

    // Check if Daylight Saving Time is active
    // Compare offset between two dates in winter and summer
    const jan = new Date(2024, 0, 1);
    const jul = new Date(2024, 6, 1);
    const janOffset = -jan.getTimezoneOffset() / 60;
    const julOffset = -jul.getTimezoneOffset() / 60;
    setIsDST(janOffset !== julOffset);
  }, []);

  return (
    <TimezoneContext.Provider value={{ timezone, offset, isDST }}>
      {children}
    </TimezoneContext.Provider>
  );
}

/**
 * Hook to access timezone information anywhere in the app
 */
export function useTimezone() {
  const context = useContext(TimezoneContext);
  if (!context) {
    throw new Error('useTimezone must be used within TimezoneProvider');
  }
  return context;
}
