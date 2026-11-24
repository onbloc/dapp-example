import { ATOMONE_NETWORKS } from '@/config/networks';
import type { FieldDef, FormValues, InvokeAction } from '@/core/action';
import { chainIdField, networkDefaults, networkField, required } from '@/core/fields';
import { bytesToBase64 } from '@/lib/json';

import { adenaCosmos, getCosmosAddress, unwrap } from '../adena';

// cosmjs is loaded on first use to keep it out of the initial bundle.
const loadStargate = () => import('@cosmjs/stargate');
const loadSignDocs = () => import('../cosmos');

const DEFAULT_GAS = '200000';
const DEFAULT_FEE_AMOUNT = '5000';
const TESTNET = ATOMONE_NETWORKS[1];

const getAccount: FieldDef['resolver'] = { label: 'Get Account', resolve: values => getCosmosAddress(values.chainId) };

const networkFields: FieldDef[] = [networkField(ATOMONE_NETWORKS, true), chainIdField(ATOMONE_NETWORKS)];
const rpcField: FieldDef = { name: 'rpc', label: 'RPC URL', mono: true };

const transferFields: FieldDef[] = [
  { name: 'to', label: 'To', mono: true, placeholder: 'atone1...', resolver: getAccount },
  { name: 'amount', label: 'Amount', mono: true },
  { name: 'denom', label: 'Denom', mono: true },
];

const transferDefaults: FormValues = { ...networkDefaults(TESTNET, true), to: '', amount: '1000', denom: 'uatone', memo: '' };

// Resolves the signer and its on-chain account number / sequence for an offline sign doc.
const loadSigner = async (values: FormValues) => {
  required(values, 'chainId', 'rpc', 'to', 'amount', 'denom');
  const key = unwrap(await adenaCosmos().getKey(values.chainId.trim()), 'cosmos.getKey');
  const { StargateClient } = await loadStargate();
  const client = await StargateClient.connect(values.rpc.trim());
  const account = await client.getAccount(key.bech32Address);

  if (!account) {
    throw new Error(`Account not found on chain for ${key.bech32Address}`);
  }

  return {
    key,
    doc: {
      chainId: values.chainId.trim(),
      fromAddress: key.bech32Address,
      toAddress: values.to.trim(),
      amount: values.amount.trim(),
      denom: values.denom.trim(),
      accountNumber: account.accountNumber,
      sequence: account.sequence,
      gas: DEFAULT_GAS,
      feeAmount: DEFAULT_FEE_AMOUNT,
      memo: values.memo ?? '',
    },
  };
};

export const cosmosEnable: InvokeAction = {
  kind: 'invoke',
  id: 'cosmos-enable',
  group: 'cosmos',
  title: 'Enable',
  description: 'Requests access to one or more Cosmos chains (comma separated).',
  fields: [{ name: 'chainIds', label: 'Chain IDs', mono: true, placeholder: 'atomone-testnet-1 or atomone-1,atomone-testnet-1' }],
  defaults: { chainIds: TESTNET.chainId },
  preview: values => `window.adena.cosmos.enable(${JSON.stringify(values.chainIds.includes(',') ? values.chainIds.split(',').map(id => id.trim()) : values.chainIds.trim())})`,
  run: values =>
    adenaCosmos().enable(
      values.chainIds.includes(',')
        ? values.chainIds
            .split(',')
            .map(id => id.trim())
            .filter(Boolean)
        : values.chainIds.trim(),
    ),
};

export const cosmosGetKey: InvokeAction = {
  kind: 'invoke',
  id: 'cosmos-get-key',
  group: 'cosmos',
  title: 'Get Key',
  description: 'Returns the bech32 address and public key for a chain. Byte fields are shown as base64.',
  fields: [{ name: 'chainId', label: 'Chain ID', mono: true }],
  defaults: { chainId: TESTNET.chainId },
  preview: values => `window.adena.cosmos.getKey(${JSON.stringify(values.chainId.trim())})`,
  run: values => adenaCosmos().getKey(values.chainId.trim()),
};

export const cosmosSignDirect: InvokeAction = {
  kind: 'invoke',
  id: 'cosmos-sign-direct',
  group: 'cosmos',
  title: 'Sign Direct (MsgSend)',
  description: 'Builds a proto SignDoc from the on-chain account and asks the wallet to sign it. Nothing is broadcast.',
  requiresWallet: true,
  fields: [...networkFields, rpcField, ...transferFields],
  defaults: transferDefaults,
  run: async values => {
    const { key, doc } = await loadSigner(values);
    const { buildDirectSignDoc } = await loadSignDocs();
    const response = await adenaCosmos().signDirect(doc.chainId, key.bech32Address, buildDirectSignDoc({ ...doc, pubkey: key.pubKey }));
    const { signed, signature } = unwrap(response, 'cosmos.signDirect');

    return {
      signed: {
        ...signed,
        bodyBytes: bytesToBase64(signed.bodyBytes as Uint8Array),
        authInfoBytes: bytesToBase64(signed.authInfoBytes as Uint8Array),
      },
      signature,
    };
  },
};

export const cosmosSignAmino: InvokeAction = {
  kind: 'invoke',
  id: 'cosmos-sign-amino',
  group: 'cosmos',
  title: 'Sign Amino (MsgSend)',
  description: 'Builds an amino StdSignDoc and asks the wallet to sign it. Nothing is broadcast.',
  requiresWallet: true,
  fields: [...networkFields, rpcField, ...transferFields, { name: 'memo', label: 'Memo', placeholder: 'Optional' }],
  defaults: transferDefaults,
  run: async values => {
    const { key, doc } = await loadSigner(values);
    const { buildAminoSignDoc } = await loadSignDocs();
    return adenaCosmos().signAmino(doc.chainId, key.bech32Address, buildAminoSignDoc(doc));
  },
};

export const cosmosOfflineSigner: InvokeAction = {
  kind: 'invoke',
  id: 'cosmos-offline-signer',
  group: 'cosmos',
  title: 'OfflineSigner End-to-End',
  description: 'Uses getOfflineSignerAuto with SigningStargateClient to sign and broadcast a MsgSend.',
  requiresWallet: true,
  fields: [
    ...networkFields,
    rpcField,
    { name: 'from', label: 'From', mono: true, placeholder: 'Blank = first signer account', resolver: getAccount },
    ...transferFields,
    { name: 'gasPrice', label: 'Gas price', mono: true },
    { name: 'memo', label: 'Memo', placeholder: 'Optional' },
  ],
  defaults: { ...transferDefaults, from: '', gasPrice: '0.025uphoton' },
  run: async values => {
    required(values, 'chainId', 'rpc', 'to', 'amount', 'denom', 'gasPrice');
    const { GasPrice, SigningStargateClient } = await loadStargate();
    const signer = await adenaCosmos().getOfflineSignerAuto(values.chainId.trim());
    const client = await SigningStargateClient.connectWithSigner(values.rpc.trim(), signer, {
      gasPrice: GasPrice.fromString(values.gasPrice.trim()),
    });
    const sender = values.from.trim() || (await signer.getAccounts())[0].address;

    return client.sendTokens(sender, values.to.trim(), [{ denom: values.denom.trim(), amount: values.amount.trim() }], 'auto', values.memo);
  },
};
