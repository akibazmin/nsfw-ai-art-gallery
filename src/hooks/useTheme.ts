import { useState, useEffect } from 'react';
import { Theme } from '../types';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('stepmom-archive-theme');
    return (saved as Theme) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('stepmom-archive-theme', theme);
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
};