export interface NetworkPreset {
  label: string;
  chainId: string;
  rpc?: string;
}

// Chain IDs registered by default in the Adena extension (packages/adena-extension/src/resources/chains/chains.json).
export const GNO_EXTENSION_NETWORKS: NetworkPreset[] = [
  { label: 'Mainnet', chainId: 'gnoland-1' },
  { label: 'Testnet', chainId: 'onyx-1' },
];

// Chain ID filled when "Custom" is selected for the extension networks.
export const GNO_EXTENSION_CUSTOM_CHAIN_ID = 'dev';

// Networks bundled with Adena Mobile (packages/adena-mobile/src/resources/chains/gno-networks.json).
export const GNO_MOBILE_NETWORKS: NetworkPreset[] = [
  { label: 'Mainnet', chainId: 'gnoland-1', rpc: 'https://rpc.onbloc.xyz:443' },
  { label: 'Onyx', chainId: 'onyx-1', rpc: 'https://rpc.onyx.testnets.gno.land:443' },
  { label: 'GnoSwap Dev', chainId: 'dev.gnoswap', rpc: 'https://dev.rpc.gnoswap.io' },
];

export const ATOMONE_NETWORKS: NetworkPreset[] = [
  { label: 'Mainnet', chainId: 'atomone-1', rpc: 'https://atomone-rpc.allinbits.com' },
  { label: 'Testnet', chainId: 'atomone-testnet-1', rpc: 'https://atomone-testnet-1-rpc.allinbits.services' },
];
