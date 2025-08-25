'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="p-2 h-auto">
        <Monitor className="h-4 w-4" />
      </Button>
    );
  }

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4 text-amber-500" />;
      case 'dark':
        return <Moon className="h-4 w-4 text-blue-400" />;
      default:
        return <Monitor className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTooltip = () => {
    switch (theme) {
      case 'light':
        return 'Mode Terang - Klik untuk Dark Mode';
      case 'dark':
        return 'Mode Gelap - Klik untuk System Mode';
      default:
        return 'Mode Sistem - Klik untuk Light Mode';
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className="p-2 h-auto hover:bg-primary-100 dark:hover:bg-primary-900/20 transition-all duration-200"
      title={getTooltip()}
    >
      {getIcon()}
    </Button>
  );
}