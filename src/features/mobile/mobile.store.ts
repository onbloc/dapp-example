import { createPersistedStore } from '@/lib/storage';

export interface MobileSession {
  address: string;
  publicKey?: unknown;
  chainId?: string;
  connectedAt: number;
}

export interface MobileSettings {
  callback: string;
  dappName: string;
  expiresInMinutes: string;
}

export const defaultCallback = (): string => `${window.location.origin}${import.meta.env.BASE_URL}mobile`;

export const mobileSessionStore = createPersistedStore<MobileSession | null>('mobile:session:v1', null);

export const mobileSettingsStore = createPersistedStore<MobileSettings>('mobile:settings:v1', {
  callback: defaultCallback(),
  dappName: 'Adena dApp Example',
  expiresInMinutes: '10',
});
