import type { NetworkPreset } from '@/config/networks';

import type { FieldDef, FormValues } from './action';

export const CUSTOM = 'custom';

// `customChainId` is filled when "Custom" is selected; otherwise the current chain ID is kept.
export const networkField = (presets: NetworkPreset[], withRpc = false, customChainId?: string): FieldDef => ({
  name: 'network',
  label: 'Network',
  type: 'segmented',
  options: [...presets.map(preset => ({ label: preset.label, value: preset.chainId })), { label: 'Custom', value: CUSTOM }],
  onChange: (value): FormValues => {
    const preset = presets.find(item => item.chainId === value);
    if (!preset) {
      return customChainId ? { chainId: customChainId } : {};
    }
    return withRpc ? { chainId: preset.chainId, rpc: preset.rpc ?? '' } : { chainId: preset.chainId };
  },
});

// Switching back to "Custom" once the chain ID no longer matches a preset keeps the segmented control honest.
export const chainIdField = (presets: NetworkPreset[], placeholder?: string): FieldDef => ({
  name: 'chainId',
  label: 'Chain ID',
  mono: true,
  placeholder,
  onChange: value => ({ network: presets.some(preset => preset.chainId === value) ? value : CUSTOM }),
});

export const networkDefaults = (preset: NetworkPreset, withRpc = false): FormValues => ({
  network: preset.chainId,
  chainId: preset.chainId,
  ...(withRpc ? { rpc: preset.rpc ?? '' } : {}),
});

export const required = (values: FormValues, ...names: string[]): void => {
  const missing = names.filter(name => !values[name]?.trim());
  if (missing.length > 0) {
    throw new Error(`Required: ${missing.join(', ')}`);
  }
};

export const commaList = (value: string): string[] =>
  value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
