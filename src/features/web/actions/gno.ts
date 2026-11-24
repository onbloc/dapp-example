import { GNO_EXTENSION_NETWORKS, GNO_MOBILE_NETWORKS } from '@/config/networks';
import type { FieldDef, FormValues, InvokeAction } from '@/core/action';
import { chainIdField, commaList, networkDefaults, networkField, required } from '@/core/fields';
import { msgCall, msgSend, splitArgs } from '@/core/gno-messages';
import { stringify } from '@/lib/json';
import { hasAdenaExtension } from '@/lib/platform';

import { adena, getGnoAddress } from '../adena';
import { queryEval } from '../query-eval';

const getAccount: FieldDef['resolver'] = { label: 'Get Account', resolve: getGnoAddress };

const gasFields: FieldDef[] = [
  { name: 'memo', label: 'Memo', placeholder: 'Optional' },
  { name: 'gasWanted', label: 'Gas wanted', mono: true },
  { name: 'gasFee', label: 'Gas fee (ugnot)', mono: true },
];

const gasDefaults: FormValues = { memo: '', gasWanted: '3000000', gasFee: '1' };

const doContract = (values: FormValues, messages: unknown[]) => ({
  messages,
  gasFee: Number(values.gasFee),
  gasWanted: Number(values.gasWanted),
  ...(values.memo ? { memo: values.memo } : {}),
});

export const checkWallet: InvokeAction = {
  kind: 'invoke',
  id: 'web-check-wallet',
  group: 'wallet',
  title: 'Detect Wallet',
  description: 'Checks whether the extension injected window.adena into this page.',
  fields: [],
  defaults: {},
  preview: () => 'Boolean(window.adena)',
  run: async () => ({ installed: hasAdenaExtension() }),
};

export const addEstablish: InvokeAction = {
  kind: 'invoke',
  id: 'web-add-establish',
  group: 'wallet',
  title: 'Add Establish',
  description: 'Registers this site as trusted. Optional chain IDs connect several chains (Gno + AtomOne) at once.',
  fields: [
    { name: 'siteName', label: 'Site name', placeholder: 'My dApp' },
    { name: 'chainIds', label: 'Chain IDs', mono: true, placeholder: 'gnoland1, atomone-1 (blank = current chain group)' },
  ],
  defaults: { siteName: 'Adena dApp Example', chainIds: '' },
  preview: values => {
    const chainIds = commaList(values.chainIds);
    return `window.adena.AddEstablish(${JSON.stringify(values.siteName)}${chainIds.length ? `, ${JSON.stringify(chainIds)}` : ''})`;
  },
  run: values => {
    const chainIds = commaList(values.chainIds);
    return adena().AddEstablish(values.siteName, chainIds.length ? chainIds : undefined);
  },
};

export const getAccountAction: InvokeAction = {
  kind: 'invoke',
  id: 'web-get-account',
  group: 'wallet',
  title: 'Get Account',
  description: 'Reads the connected account: address, public key, chain ID and status.',
  fields: [],
  defaults: {},
  preview: () => 'window.adena.GetAccount()',
  run: () => adena().GetAccount(),
};

export const switchNetwork: InvokeAction = {
  kind: 'invoke',
  id: 'web-switch-network',
  group: 'wallet',
  title: 'Switch Network',
  description: 'Asks the wallet to switch to another Gno chain. Testnet chain IDs also switch the network mode.',
  fields: [networkField(GNO_EXTENSION_NETWORKS), chainIdField(GNO_EXTENSION_NETWORKS, 'gnoland1, staging, dev')],
  defaults: networkDefaults(GNO_EXTENSION_NETWORKS[0]),
  preview: values => `window.adena.SwitchNetwork(${JSON.stringify(values.chainId.trim())})`,
  run: values => adena().SwitchNetwork(values.chainId.trim()),
};

export const tokenTransfer: InvokeAction = {
  kind: 'invoke',
  id: 'web-token-transfer',
  group: 'transaction',
  title: 'Token Transfer',
  description: 'Requests approval of a /bank.MsgSend through DoContract.',
  requiresWallet: true,
  fields: [
    { name: 'from', label: 'From', mono: true, placeholder: 'g1...', resolver: getAccount },
    { name: 'to', label: 'To', mono: true, placeholder: 'g1...', resolver: getAccount },
    { name: 'amount', label: 'Amount', mono: true, placeholder: '1000000' },
    { name: 'denom', label: 'Denom', mono: true },
    ...gasFields,
  ],
  defaults: { from: '', to: '', amount: '', denom: 'ugnot', ...gasDefaults },
  preview: values =>
    `window.adena.DoContract(${stringify(doContract(values, [msgSend(values.from.trim(), values.to.trim(), `${values.amount.trim()}${values.denom.trim()}`)]))})`,
  run: values => {
    required(values, 'from', 'to', 'amount', 'denom');
    return adena().DoContract(doContract(values, [msgSend(values.from.trim(), values.to.trim(), `${values.amount.trim()}${values.denom.trim()}`)]));
  },
};

const callMessage = (values: FormValues) =>
  msgCall(values.caller.trim(), values.pkgPath.trim(), values.func.trim(), splitArgs(values.args), values.send.trim());

export const callRealm: InvokeAction = {
  kind: 'invoke',
  id: 'web-call-realm',
  group: 'transaction',
  title: 'Call Realm Function',
  description: 'Requests approval of a /vm.m_call through DoContract. Arguments are comma separated.',
  requiresWallet: true,
  fields: [
    { name: 'caller', label: 'Caller', mono: true, placeholder: 'g1...', resolver: getAccount },
    { name: 'pkgPath', label: 'Package path', mono: true, placeholder: 'gno.land/r/demo/counter' },
    { name: 'func', label: 'Function', mono: true, placeholder: 'Increment' },
    { name: 'args', label: 'Arguments', mono: true, placeholder: 'arg1,arg2' },
    { name: 'send', label: 'Send', mono: true, placeholder: 'Optional, e.g. 1000ugnot' },
    ...gasFields,
  ],
  defaults: { caller: '', pkgPath: '', func: '', args: '', send: '', ...gasDefaults },
  preview: values => `window.adena.DoContract(${stringify(doContract(values, [callMessage(values)]))})`,
  run: values => {
    required(values, 'caller', 'pkgPath', 'func');
    return adena().DoContract(doContract(values, [callMessage(values)]));
  },
};

export const vmQueryEval: InvokeAction = {
  kind: 'invoke',
  id: 'web-query-eval',
  group: 'query',
  title: 'VM Query Eval',
  description: 'Evaluates a read-only realm expression over RPC (vm/qeval). No wallet needed.',
  fields: [
    { name: 'rpc', label: 'RPC URL', mono: true, placeholder: 'rpc.onbloc.xyz', hint: 'No scheme = https. An http:// RPC is blocked as mixed content when this page is served over https.' },
    { name: 'pkgPath', label: 'Package path', mono: true, placeholder: 'gno.land/r/demo/counter' },
    { name: 'func', label: 'Function', mono: true, placeholder: 'Render' },
    { name: 'args', label: 'Arguments', mono: true, placeholder: '"" (Gno expression arguments)' },
  ],
  defaults: { rpc: GNO_MOBILE_NETWORKS[0].rpc ?? '', pkgPath: '', func: '', args: '' },
  preview: values => `abci_query vm/qeval  ${values.pkgPath}.${values.func}(${values.args})`,
  run: values => {
    required(values, 'rpc', 'pkgPath', 'func');
    return queryEval(values.rpc.trim(), values.pkgPath.trim(), values.func.trim(), values.args);
  },
};
