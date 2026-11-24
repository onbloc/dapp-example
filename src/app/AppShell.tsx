import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router';

import type { Platform } from '@/core/action';
import { HistoryPanel } from '@/features/history/HistoryPanel';
import { historyStore } from '@/features/history/history.store';
import { useStore } from '@/lib/use-store';
import { Button } from '@/ui/Button';
import { HistoryIcon, MonitorIcon, MoonIcon, PhoneIcon, SunIcon } from '@/ui/icons';

import { themeStore } from './theme';

const logo = `${import.meta.env.BASE_URL}favicon.svg`;

export const AppShell = () => {
  const platform: Platform = useLocation().pathname.startsWith('/mobile') ? 'mobile' : 'web';
  const [historyOpen, setHistoryOpen] = useState(false);
  const theme = useStore(themeStore);
  const count = useStore(historyStore).filter(entry => entry.platform === platform).length;

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href={import.meta.env.BASE_URL}>
          <img src={logo} alt="" width={28} height={28} />
          <span>
            Adena <em>dApp Examples</em>
          </span>
        </a>

        <nav className="platform-switch" aria-label="Platform">
          <NavLink to="/" end>
            <MonitorIcon />
            <span>Web</span>
          </NavLink>
          <NavLink to="/mobile">
            <PhoneIcon />
            <span>Mobile</span>
          </NavLink>
        </nav>

        <Button
          variant="ghost"
          size="sm"
          icon={theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          onClick={() => themeStore.set(theme === 'dark' ? 'light' : 'dark')}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        />

        <Button variant="secondary" size="sm" icon={<HistoryIcon />} onClick={() => setHistoryOpen(true)} aria-label="Open history">
          <span className="hide-sm">History</span>
          {count > 0 && <span className="count">{count}</span>}
        </Button>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="footer">
        <a href="https://github.com/onbloc/dapp-example" target="_blank" rel="noreferrer">
          GitHub
        </a>
        <span>·</span>
        <a href="https://adena.app" target="_blank" rel="noreferrer">
          adena.app
        </a>
      </footer>

      <HistoryPanel platform={platform} open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </div>
  );
};
