import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
import { PubKey } from 'cosmjs-types/cosmos/crypto/secp256k1/keys';
import { SignMode } from 'cosmjs-types/cosmos/tx/signing/v1beta1/signing';
import { AuthInfo, Fee, ModeInfo, SignerInfo, TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { Any } from 'cosmjs-types/google/protobuf/any';

export interface TransferDocInput {
  chainId: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  denom: string;
  accountNumber: number | bigint;
  sequence: number | bigint;
  gas: string;
  feeAmount: string;
  feeDenom?: string;
  memo?: string;
}

// Proto SignDoc for a MsgSend, so signDirect can be exercised without SigningStargateClient.
export const buildDirectSignDoc = (input: TransferDocInput & { pubkey: Uint8Array }) => {
  const msgSend = MsgSend.fromPartial({
    fromAddress: input.fromAddress,
    toAddress: input.toAddress,
    amount: [{ denom: input.denom, amount: input.amount }],
  });
  const txBody = TxBody.fromPartial({
    messages: [Any.fromPartial({ typeUrl: '/cosmos.bank.v1beta1.MsgSend', value: MsgSend.encode(msgSend).finish() })],
    memo: input.memo ?? '',
  });
  const publicKey = Any.fromPartial({
    typeUrl: '/cosmos.crypto.secp256k1.PubKey',
    value: PubKey.encode(PubKey.fromPartial({ key: input.pubkey })).finish(),
  });
  const authInfo = AuthInfo.fromPartial({
    signerInfos: [
      SignerInfo.fromPartial({
        publicKey,
        modeInfo: ModeInfo.fromPartial({ single: { mode: SignMode.SIGN_MODE_DIRECT } }),
        sequence: BigInt(input.sequence),
      }),
    ],
    fee: Fee.fromPartial({
      amount: [{ denom: input.feeDenom || input.denom, amount: input.feeAmount }],
      gasLimit: BigInt(input.gas),
    }),
  });

  return {
    bodyBytes: TxBody.encode(txBody).finish(),
    authInfoBytes: AuthInfo.encode(authInfo).finish(),
    chainId: input.chainId,
    accountNumber: BigInt(input.accountNumber),
  };
};

// Amino StdSignDoc (snake_case, string numerics, msgs wrapped as { type, value }).
export const buildAminoSignDoc = (input: TransferDocInput) => ({
  chain_id: input.chainId,
  account_number: String(input.accountNumber),
  sequence: String(input.sequence),
  fee: {
    amount: [{ denom: input.feeDenom || input.denom, amount: input.feeAmount }],
    gas: input.gas,
  },
  msgs: [
    {
      type: 'cosmos-sdk/MsgSend',
      value: {
        from_address: input.fromAddress,
        to_address: input.toAddress,
        amount: [{ denom: input.denom, amount: input.amount }],
      },
    },
  ],
  memo: input.memo ?? '',
});
