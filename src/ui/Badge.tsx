import type { ReactNode } from 'react';

export const Badge = ({ tone = 'neutral', children }: { tone?: 'neutral' | 'success' | 'failure' | 'pending' | 'accent'; children: ReactNode }) => (
  <span className={`badge badge-${tone}`}>{children}</span>
);
