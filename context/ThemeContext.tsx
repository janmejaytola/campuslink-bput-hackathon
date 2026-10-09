'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type ThemeMode = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';
export type LayoutDensity = 'comfortable' | 'compact';

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  density: LayoutDensity;
  reducedMotion: boolean;
  highContrast: boolean;
  setTheme: (mode: ThemeMode) => void;
  setDensity: (density: LayoutDensity) => void;
  setReducedMotion: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY_THEME = 'campuslink_theme';
const STORAGE_KEY_DENSITY = 'campuslink_density';
const STORAGE_KEY_MOTION = 'campuslink_reduced_motion';
const STORAGE_KEY_CONTRAST = 'campuslink_high_contrast';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark');
  const [density, setDensityState] = useState<LayoutDensity>('comfortable');
  const [reducedMotion, setReducedMotionState] = useState<boolean>(false);
  const [highContrast, setHighContrastState] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  // Helper to determine system preference
  const getSystemTheme = useCallback((): ResolvedTheme => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  // Apply theme class to <html> element
  const applyThemeToDOM = useCallback((targetTheme: ResolvedTheme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (targetTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  }, []);

  // Initialize from localStorage and matchMedia
  useEffect(() => {
    setMounted(true);
    try {
      // 1. Theme
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) as ThemeMode | null;
      const initialTheme: ThemeMode = savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system'
        ? savedTheme
        : 'dark'; // default dark for futuristic cyberpunk palette

      setThemeState(initialTheme);
      const computedResolved = initialTheme === 'system' ? getSystemTheme() : initialTheme;
      setResolvedTheme(computedResolved);
      applyThemeToDOM(computedResolved);

      // 2. Density
      const savedDensity = localStorage.getItem(STORAGE_KEY_DENSITY) as LayoutDensity | null;
      if (savedDensity === 'compact' || savedDensity === 'comfortable') {
        setDensityState(savedDensity);
        if (savedDensity === 'compact') {
          document.documentElement.classList.add('density-compact');
        } else {
          document.documentElement.classList.remove('density-compact');
        }
      }

      // 3. Reduced Motion
      const savedMotion = localStorage.getItem(STORAGE_KEY_MOTION);
      const systemReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isMotionReduced = savedMotion !== null ? savedMotion === 'true' : systemReducedMotion;
      setReducedMotionState(isMotionReduced);
      if (isMotionReduced) {
        document.documentElement.classList.add('reduced-motion');
      } else {
        document.documentElement.classList.remove('reduced-motion');
      }

      // 4. High Contrast
      const savedContrast = localStorage.getItem(STORAGE_KEY_CONTRAST) === 'true';
      setHighContrastState(savedContrast);
      if (savedContrast) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
    } catch (e) {
      console.warn('Failed to read theme from localStorage', e);
    }
  }, [getSystemTheme, applyThemeToDOM]);

  // Listen to system color scheme changes when theme is 'system'
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const nextResolved: ResolvedTheme = e.matches ? 'dark' : 'light';
        setResolvedTheme(nextResolved);
        applyThemeToDOM(nextResolved);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyThemeToDOM]);

  // Set Theme Handler
  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY_THEME, mode);
    } catch (e) {
      console.warn('Could not save theme preference to localStorage', e);
    }

    const nextResolved = mode === 'system' ? getSystemTheme() : mode;
    setResolvedTheme(nextResolved);
    applyThemeToDOM(nextResolved);
  }, [getSystemTheme, applyThemeToDOM]);

  // Toggle Theme Quick Action
  const toggleTheme = useCallback(() => {
    const next: ThemeMode = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }, [resolvedTheme, setTheme]);

  // Density Handler
  const setDensity = useCallback((nextDensity: LayoutDensity) => {
    setDensityState(nextDensity);
    try {
      localStorage.setItem(STORAGE_KEY_DENSITY, nextDensity);
    } catch (e) {
      console.warn('Could not save density preference to localStorage', e);
    }
    if (typeof document !== 'undefined') {
      if (nextDensity === 'compact') {
        document.documentElement.classList.add('density-compact');
      } else {
        document.documentElement.classList.remove('density-compact');
      }
    }
  }, []);

  // Reduced Motion Handler
  const setReducedMotion = useCallback((enabled: boolean) => {
    setReducedMotionState(enabled);
    try {
      localStorage.setItem(STORAGE_KEY_MOTION, String(enabled));
    } catch (e) {
      console.warn('Could not save motion preference to localStorage', e);
    }
    if (typeof document !== 'undefined') {
      if (enabled) {
        document.documentElement.classList.add('reduced-motion');
      } else {
        document.documentElement.classList.remove('reduced-motion');
      }
    }
  }, []);

  // High Contrast Handler
  const setHighContrast = useCallback((enabled: boolean) => {
    setHighContrastState(enabled);
    try {
      localStorage.setItem(STORAGE_KEY_CONTRAST, String(enabled));
    } catch (e) {
      console.warn('Could not save contrast preference to localStorage', e);
    }
    if (typeof document !== 'undefined') {
      if (enabled) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        density,
        reducedMotion,
        highContrast,
        setTheme,
        setDensity,
        setReducedMotion,
        setHighContrast,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
