import type { ActionGroup } from '@/core/action';

import { cosmosEnable, cosmosGetKey, cosmosOfflineSigner, cosmosSignAmino, cosmosSignDirect } from './cosmos';
import { addEstablish, callRealm, checkWallet, getAccountAction, switchNetwork, tokenTransfer, vmQueryEval } from './gno';

export const WEB_ACTION_GROUPS: ActionGroup[] = [
  { id: 'wallet', title: 'Wallet', description: 'Detect the extension, connect this site and read the account.', actions: [checkWallet, addEstablish, getAccountAction, switchNetwork] },
  { id: 'transaction', title: 'Gno Transactions', description: 'DoContract requests that open the approval popup.', actions: [tokenTransfer, callRealm] },
  { id: 'query', title: 'Query', actions: [vmQueryEval] },
  { id: 'cosmos', title: 'Cosmos / AtomOne', description: 'The window.adena.cosmos namespace (Keplr-compatible).', actions: [cosmosEnable, cosmosGetKey, cosmosSignDirect, cosmosSignAmino, cosmosOfflineSigner] },
];
