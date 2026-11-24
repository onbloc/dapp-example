import { createPersistedStore } from '@/lib/storage';

export type Theme = 'light' | 'dark';

// index.html applies the same key before first paint to avoid a theme flash.
export const themeStore = createPersistedStore<Theme>('theme:v1', 'light');

export const applyTheme = (theme: Theme): void => {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0f1218' : '#f4f6fb');
};

themeStore.subscribe(() => applyTheme(themeStore.get()));

applyTheme(themeStore.get());
