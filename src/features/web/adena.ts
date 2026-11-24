import { hasAdenaExtension } from '@/lib/platform';

export class WalletNotFoundError extends Error {
  constructor() {
    super('Adena extension was not found. Install it from https://adena.app or open the Mobile page.');
  }
}

export const adena = (): AdenaProvider => {
  if (!hasAdenaExtension()) {
    throw new WalletNotFoundError();
  }
  return window.adena as AdenaProvider;
};

export const adenaCosmos = (): AdenaCosmos => {
  const cosmos = adena().cosmos;
  if (!cosmos) {
    throw new Error('This Adena version does not expose window.adena.cosmos');
  }
  return cosmos;
};

// Unwraps a provider response, turning a failure status into an error.
export const unwrap = <T>(response: AdenaResponse<T>, method: string): T => {
  if (response?.status !== 'success' || !response.data) {
    throw new Error(response?.message || `${method} failed`);
  }
  return response.data;
};

export const getGnoAddress = async (): Promise<string> => unwrap(await adena().GetAccount(), 'GetAccount').address;

export const getCosmosAddress = async (chainId: string): Promise<string> =>
  unwrap(await adenaCosmos().getKey(chainId.trim()), 'cosmos.getKey').bech32Address;
