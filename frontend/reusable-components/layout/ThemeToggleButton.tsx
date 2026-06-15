'use client';

import { Moon, Sun } from 'lucide-react';
import { ButtonSecondary } from '@/frontend/reusable-elements/buttons/ButtonSecondary';
import { useTheme } from '@/app/components/layout/ThemeProvider';

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <ButtonSecondary
      onClick={toggleTheme}
      className="cursor-pointer flex items-center gap-2"
      aria-label={isDark ? 'Включить светлую тему' : 'Включить темную тему'}
      buttonName="Переключатель темы"
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      {isDark ? 'Светлая тема' : 'Темная тема'}
    </ButtonSecondary>
  );
}

export default ThemeToggleButton;
