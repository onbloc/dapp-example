import { BrowserRouter, Navigate, Route, Routes } from 'react-router';

import { MobilePage } from '@/features/mobile/MobilePage';
import { WebPage } from '@/features/web/WebPage';

import { AppShell } from './AppShell';

export const App = () => (
  <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<WebPage />} />
        <Route path="mobile" element={<MobilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
