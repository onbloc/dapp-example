import { GNO_MOBILE_NETWORKS } from '@/config/networks';
import type { ActionGroup, DeepLinkAction, FieldDef, FormValues } from '@/core/action';
import { chainIdField, networkDefaults, networkField, required } from '@/core/fields';
import { msgCall, msgSend, splitArgs } from '@/core/gno-messages';
import { parseJson } from '@/lib/json';

import { mobileSessionStore } from '../mobile.store';
import { gnotToGnsSwapTemplate } from '../templates/gnoswap-swap';
import { assertMessages, type DappMethod, type GnoMessage, type TransactionParams } from '../protocol';

const DEFAULT_NETWORK = GNO_MOBILE_NETWORKS[0];

const useConnected: FieldDef['resolver'] = {
  label: 'Use connected',
  resolve: async () => {
    const session = mobileSessionStore.get();
    if (!session) {
      throw new Error('Connect a wallet first');
    }
    return session.address;
  },
};

const networkFields: FieldDef[] = [networkField(GNO_MOBILE_NETWORKS), chainIdField(GNO_MOBILE_NETWORKS, 'gnoland-1')];

const modeField: FieldDef = {
  name: 'mode',
  label: 'Mode',
  type: 'segmented',
  options: [
    { label: 'Sign & broadcast', value: 'sign-and-broadcast' },
    { label: 'Sign only', value: 'sign-transaction' },
  ],
};

const feeFields: FieldDef[] = [
  { name: 'memo', label: 'Memo', placeholder: 'Optional' },
  { name: 'gasWanted', label: 'Gas wanted', mono: true, placeholder: 'Blank = estimated by the wallet' },
  { name: 'gasFee', label: 'Gas fee', mono: true, placeholder: 'e.g. 100000ugnot (blank = estimated)' },
];

const txDefaults: FormValues = { ...networkDefaults(DEFAULT_NETWORK), mode: 'sign-and-broadcast', memo: '', gasWanted: '', gasFee: '' };

const transaction = (values: FormValues, messages: GnoMessage[]) => {
  required(values, 'chainId');
  // The wallet keeps a dApp fee only when both values are given.
  const fee = values.gasWanted.trim() && values.gasFee.trim() ? { gasWanted: values.gasWanted.trim(), gasFee: values.gasFee.trim() } : {};
  const params: TransactionParams = { messages: assertMessages(messages), memo: values.memo, ...fee };

  return { method: values.mode as DappMethod, chainId: values.chainId.trim(), params };
};

const connect: DeepLinkAction = {
  kind: 'deeplink',
  id: 'mobile-connect',
  group: 'account',
  title: 'Connect',
  description: 'Ask the wallet to connect this site. The response returns the address, public key and chain ID.',
  fields: networkFields,
  defaults: networkDefaults(DEFAULT_NETWORK),
  build: values => ({ method: 'connect', chainId: values.chainId.trim() || undefined }),
};

const sendToken: DeepLinkAction = {
  kind: 'deeplink',
  id: 'mobile-send',
  group: 'transaction',
  title: 'Token Transfer',
  description: 'A single /bank.MsgSend. The site must be connected first.',
  fields: [
    ...networkFields,
    modeField,
    { name: 'from', label: 'From', mono: true, placeholder: 'g1...', resolver: useConnected },
    { name: 'to', label: 'To', mono: true, placeholder: 'g1...' },
    { name: 'amount', label: 'Amount', mono: true, placeholder: '1000000' },
    { name: 'denom', label: 'Denom', mono: true },
    ...feeFields,
  ],
  defaults: { ...txDefaults, from: '', to: '', amount: '', denom: 'ugnot' },
  build: values => {
    required(values, 'from', 'to', 'amount', 'denom');
    return transaction(values, [msgSend(values.from.trim(), values.to.trim(), `${values.amount.trim()}${values.denom.trim()}`)]);
  },
};

const callRealm: DeepLinkAction = {
  kind: 'deeplink',
  id: 'mobile-call',
  group: 'transaction',
  title: 'Call Realm Function',
  description: 'A single /vm.m_call. Arguments are comma separated and passed as-is.',
  fields: [
    ...networkFields,
    modeField,
    { name: 'caller', label: 'Caller', mono: true, placeholder: 'g1...', resolver: useConnected },
    { name: 'pkgPath', label: 'Package path', mono: true, placeholder: 'gno.land/r/demo/counter' },
    { name: 'func', label: 'Function', mono: true, placeholder: 'Increment' },
    { name: 'args', label: 'Arguments', mono: true, placeholder: 'arg1,arg2' },
    { name: 'send', label: 'Send', mono: true, placeholder: 'Optional, e.g. 1000ugnot' },
    ...feeFields,
  ],
  defaults: { ...txDefaults, caller: '', pkgPath: '', func: '', args: '', send: '' },
  build: values => {
    required(values, 'caller', 'pkgPath', 'func');
    return transaction(values, [msgCall(values.caller.trim(), values.pkgPath.trim(), values.func.trim(), splitArgs(values.args), values.send.trim())]);
  },
};

const SAMPLE_MESSAGES = JSON.stringify(
  [msgSend('<from>', '<to>', '1ugnot'), msgCall('<from>', 'gno.land/r/demo/counter', 'Increment', [])],
  null,
  2,
);

const SIGNER_FIELDS = ['caller', 'from_address', 'creator'];

// Replaces every signer field so the transaction is signed by the connected account.
const withSigner = (messages: GnoMessage[], signer: string): GnoMessage[] =>
  messages.map(message => ({
    ...message,
    value: Object.fromEntries(Object.entries(message.value ?? {}).map(([key, value]) => [key, SIGNER_FIELDS.includes(key) ? signer : value])),
  }));

const multiMessage: DeepLinkAction = {
  kind: 'deeplink',
  id: 'mobile-messages',
  group: 'transaction',
  title: 'Multi-message Transaction',
  description: `Up to 16 raw messages (/bank.MsgSend, /vm.m_call, /vm.m_run, /vm.m_addpkg) in one transaction, in order.`,
  fields: [
    ...networkFields,
    modeField,
    { name: 'signer', label: 'Signer override', mono: true, placeholder: 'Optional: replaces caller / from_address / creator', resolver: useConnected },
    { name: 'messages', label: 'Messages (JSON)', type: 'textarea', mono: true },
    ...feeFields,
  ],
  defaults: { ...txDefaults, signer: '', messages: SAMPLE_MESSAGES },
  templates: [gnotToGnsSwapTemplate(useConnected)],
  build: values => {
    const messages = assertMessages(parseJson(values.messages, 'Messages'));
    return transaction(values, values.signer.trim() ? withSigner(messages, values.signer.trim()) : messages);
  },
};

interface TxDocument {
  msgs?: GnoMessage[];
  fee?: { gas?: string | number; amount?: { amount: string; denom: string }[] };
  chain_id?: string;
  memo?: string;
}

const SAMPLE_DOCUMENT = JSON.stringify(
  { msgs: [msgSend('<from>', '<to>', '1ugnot')], fee: { gas: '100000', amount: [{ amount: '100000', denom: 'ugnot' }] }, chain_id: DEFAULT_NETWORK.chainId, memo: '' },
  null,
  2,
);

const rawDocument: DeepLinkAction = {
  kind: 'deeplink',
  id: 'mobile-document',
  group: 'transaction',
  title: 'Sign Document',
  description: 'Converts an extension / adena-module Document ({ msgs, fee, chain_id, memo }). account_number and sequence are read by the wallet.',
  fields: [
    modeField,
    { name: 'signer', label: 'Signer override', mono: true, placeholder: 'Optional', resolver: useConnected },
    { name: 'document', label: 'Document (JSON)', type: 'textarea', mono: true },
  ],
  defaults: { mode: 'sign-and-broadcast', signer: '', document: SAMPLE_DOCUMENT },
  build: values => {
    const document = parseJson<TxDocument>(values.document, 'Document');
    const messages = assertMessages(document.msgs);
    const coin = document.fee?.amount?.[0];

    return transaction(
      {
        mode: values.mode,
        chainId: document.chain_id ?? '',
        memo: document.memo ?? '',
        gasWanted: coin && document.fee?.gas ? String(document.fee.gas) : '',
        gasFee: coin && document.fee?.gas ? `${coin.amount}${coin.denom}` : '',
      },
      values.signer.trim() ? withSigner(messages, values.signer.trim()) : messages,
    );
  },
};

export const MOBILE_ACTION_GROUPS: ActionGroup[] = [
  { id: 'account', title: 'Account', description: 'Connect first: transaction requests from an unconnected site are rejected.', actions: [connect] },
  { id: 'transaction', title: 'Transactions', actions: [sendToken, callRealm, multiMessage, rawDocument] },
];
