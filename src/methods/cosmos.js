/* global BigInt */
import { TxBody, AuthInfo, Fee, SignerInfo, ModeInfo } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { SignMode } from 'cosmjs-types/cosmos/tx/signing/v1beta1/signing';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
import { PubKey } from 'cosmjs-types/cosmos/crypto/secp256k1/keys';
import { Any } from 'cosmjs-types/google/protobuf/any';

// Default chain IDs and RPC endpoints for the sample. Swap via the Mainnet /
// Testnet radio on each card; the input fields remain editable afterwards.
const ATOMONE_NETWORKS = {
    mainnet: {
        chainId: 'atomone-1',
        rpc: 'https://atomone-rpc.allinbits.com',
    },
    testnet: {
        chainId: 'atomone-testnet-1',
        rpc: 'https://atomone-testnet-1-rpc.allinbits.services',
    },
};

// Chain IDs registered by default in the Adena extension (see
// packages/adena-extension/src/resources/chains/chains.json).
const GNO_NETWORKS = {
    mainnet: { chainId: 'gnoland1' },
    testnet: { chainId: 'staging' },
};

// Browser-safe Uint8Array -> base64 (Buffer is not polyfilled by CRA 5).
const bytesToBase64 = (bytes) => {
    let binary = '';
    for (let i = 0; i < bytes.length; i += 1) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

// Cosmos sub-namespace exposed by window.adena.cosmos.
// Each wrapper guards access and returns a Promise.

const enableCosmos = (chainIds) => {
    return window?.adena?.cosmos?.enable(chainIds);
};

const getCosmosKey = (chainId) => {
    return window?.adena?.cosmos?.getKey(chainId);
};

const signCosmosDirect = (chainId, signer, signDoc) => {
    return window?.adena?.cosmos?.signDirect(chainId, signer, signDoc);
};

const signCosmosAmino = (chainId, signer, signDoc) => {
    return window?.adena?.cosmos?.signAmino(chainId, signer, signDoc);
};

const sendCosmosTx = (chainId, txBytes, mode) => {
    return window?.adena?.cosmos?.sendTx(chainId, txBytes, mode);
};

const getCosmosOfflineSigner = (chainId) => {
    return window?.adena?.cosmos?.getOfflineSignerAuto(chainId);
};

// Stage 8: AddEstablish with optional chainIds array.
const addEstablishMulti = (siteName, chainIds) => {
    return window?.adena?.AddEstablish(siteName, chainIds);
};

// Stage 7 verification helper — network mode should auto-sync on testnet chainId.
const switchNetwork = (chainId) => {
    return window?.adena?.SwitchNetwork(chainId);
};

// Build a proto SignDoc for a MsgSend transfer so signDirect can be exercised
// without pulling in SigningStargateClient. pubkey must be the signer's
// compressed secp256k1 key (fetched from cosmos.getKey).
const buildDirectSignDoc = ({
    chainId,
    fromAddress,
    toAddress,
    amount,
    denom,
    pubkey,
    accountNumber,
    sequence,
    gas,
    feeAmount,
    feeDenom,
    memo = '',
}) => {
    const msgSend = MsgSend.fromPartial({
        fromAddress,
        toAddress,
        amount: [{ denom, amount: String(amount) }],
    });
    const txBody = TxBody.fromPartial({
        messages: [
            Any.fromPartial({
                typeUrl: '/cosmos.bank.v1beta1.MsgSend',
                value: MsgSend.encode(msgSend).finish(),
            }),
        ],
        memo,
    });
    const pubkeyAny = Any.fromPartial({
        typeUrl: '/cosmos.crypto.secp256k1.PubKey',
        value: PubKey.encode(PubKey.fromPartial({ key: pubkey })).finish(),
    });
    const authInfo = AuthInfo.fromPartial({
        signerInfos: [
            SignerInfo.fromPartial({
                publicKey: pubkeyAny,
                modeInfo: ModeInfo.fromPartial({ single: { mode: SignMode.SIGN_MODE_DIRECT } }),
                sequence: BigInt(sequence),
            }),
        ],
        fee: Fee.fromPartial({
            amount: [{ denom: feeDenom || denom, amount: String(feeAmount) }],
            gasLimit: BigInt(gas),
        }),
    });

    return {
        bodyBytes: TxBody.encode(txBody).finish(),
        authInfoBytes: AuthInfo.encode(authInfo).finish(),
        chainId,
        accountNumber: BigInt(accountNumber),
    };
};

// Build an amino StdSignDoc for signAmino. Fields follow Cosmos SDK amino
// conventions (snake_case, string numerics, msgs wrapped as { type, value }).
const buildAminoSignDoc = ({
    chainId,
    fromAddress,
    toAddress,
    amount,
    denom,
    accountNumber,
    sequence,
    gas,
    feeAmount,
    feeDenom,
    memo = '',
}) => {
    return {
        chain_id: chainId,
        account_number: String(accountNumber),
        sequence: String(sequence),
        fee: {
            amount: [{ denom: feeDenom || denom, amount: String(feeAmount) }],
            gas: String(gas),
        },
        msgs: [
            {
                type: 'cosmos-sdk/MsgSend',
                value: {
                    from_address: fromAddress,
                    to_address: toAddress,
                    amount: [{ denom, amount: String(amount) }],
                },
            },
        ],
        memo,
    };
};

export {
    enableCosmos,
    getCosmosKey,
    signCosmosDirect,
    signCosmosAmino,
    sendCosmosTx,
    getCosmosOfflineSigner,
    addEstablishMulti,
    switchNetwork,
    buildDirectSignDoc,
    buildAminoSignDoc,
    bytesToBase64,
    ATOMONE_NETWORKS,
    GNO_NETWORKS,
};
