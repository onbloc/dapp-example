import type { ActionTemplate, FieldDef } from '@/core/action';
import { msgCall } from '@/core/gno-messages';
import { required } from '@/core/fields';
import { derivePkgAddress } from '@/lib/gno-address';

import type { GnoMessage } from '../protocol';

// GnoSwap deployment on dev.gnoswap (signatures checked with vm/qfuncs).
export const GNOSWAP = {
  chainId: 'dev.gnoswap',
  wugnotPkg: 'gno.land/r/gnoland/wugnot',
  routerPkg: 'gno.land/r/gnoswap/router',
  wugnotToken: 'gno.land/r/gnoland/wugnot.wugnot',
  gnsToken: 'gno.land/r/gnoswap/gns.GNS',
  feeTier: '3000',
  deadline: '9999999999',
  // No slippage protection: the swap executes at any price.
  amountOutMin: '0',
} as const;

const UGNOT_DECIMALS = 6;

export const gnotToUgnot = (value: string): string => {
  const match = /^(\d+)(?:\.(\d{1,6}))?$/.exec(value.trim());
  if (!match) {
    throw new Error(`Amount must be a GNOT value with up to ${UGNOT_DECIMALS} decimals`);
  }
  const ugnot = BigInt(match[1] + (match[2] ?? '').padEnd(UGNOT_DECIMALS, '0'));
  if (ugnot <= 0n) {
    throw new Error('Amount must be greater than 0');
  }
  return ugnot.toString();
};

// wugnot Deposit -> wugnot Approve(router) -> router ExactInSwapRoute (wugnot -> GNS, single 0.3% pool).
export const buildGnotToGnsSwap = (caller: string, amountUgnot: string, routerAddress: string): GnoMessage[] => [
  msgCall(caller, GNOSWAP.wugnotPkg, 'Deposit', [], `${amountUgnot}ugnot`),
  msgCall(caller, GNOSWAP.wugnotPkg, 'Approve', [routerAddress, amountUgnot]),
  msgCall(caller, GNOSWAP.routerPkg, 'ExactInSwapRoute', [
    GNOSWAP.wugnotToken,
    GNOSWAP.gnsToken,
    amountUgnot,
    `${GNOSWAP.wugnotToken}:${GNOSWAP.gnsToken}:${GNOSWAP.feeTier}`,
    '100',
    GNOSWAP.amountOutMin,
    GNOSWAP.deadline,
    '',
  ]),
];

export const gnotToGnsSwapTemplate = (callerResolver: FieldDef['resolver']): ActionTemplate => ({
  id: 'gnoswap-gnot-gns',
  label: 'GnoSwap: GNOT → GNS',
  description: `Deposit → Approve → ExactInSwapRoute through the wugnot:GNS ${Number(GNOSWAP.feeTier) / 10000}% pool on ${GNOSWAP.chainId}. Minimum received is ${GNOSWAP.amountOutMin}, so the swap runs at any price.`,
  fields: [
    { name: 'caller', label: 'Caller', mono: true, placeholder: 'g1...', resolver: callerResolver },
    { name: 'amount', label: 'Amount (GNOT)', mono: true, placeholder: '1' },
  ],
  defaults: { caller: '', amount: '1' },
  apply: async input => {
    required(input, 'caller', 'amount');
    const messages = buildGnotToGnsSwap(input.caller.trim(), gnotToUgnot(input.amount), await derivePkgAddress(GNOSWAP.routerPkg));

    return {
      network: GNOSWAP.chainId,
      chainId: GNOSWAP.chainId,
      signer: '',
      memo: '',
      messages: JSON.stringify(messages, null, 2),
    };
  },
});
