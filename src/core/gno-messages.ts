import type { GnoMessage } from '@/features/mobile/protocol';

export const msgSend = (from: string, to: string, amount: string): GnoMessage => ({
  type: '/bank.MsgSend',
  value: { from_address: from, to_address: to, amount },
});

export const msgCall = (caller: string, pkgPath: string, func: string, args: string[], send = ''): GnoMessage => ({
  type: '/vm.m_call',
  value: { caller, send, pkg_path: pkgPath, func, args },
});

// Kept verbatim (no trimming) because realm arguments may legitimately contain spaces.
export const splitArgs = (value: string): string[] => (value === '' ? [] : value.split(','));
