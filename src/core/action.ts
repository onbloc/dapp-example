import type { DappRequestBody } from '@/features/mobile/protocol';

export type Platform = 'web' | 'mobile';

export type FormValues = Record<string, string>;

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldDef {
  name: string;
  label: string;
  type?: 'text' | 'textarea' | 'select' | 'segmented';
  placeholder?: string;
  hint?: string;
  options?: FieldOption[];
  mono?: boolean;
  // Extra values to apply when this field changes, e.g. a network preset filling chain ID and RPC.
  onChange?: (value: string, values: FormValues) => FormValues;
  // Inline button that fills the field, e.g. "Get Account".
  resolver?: { label: string; resolve: (values: FormValues) => Promise<string> };
}

// Preset that fills the action's form from a few inputs, e.g. a swap transaction from a caller and an amount.
export interface ActionTemplate {
  id: string;
  label: string;
  description: string;
  fields: FieldDef[];
  defaults: FormValues;
  apply: (input: FormValues) => Promise<FormValues>;
}

interface ActionBase {
  id: string;
  group: string;
  title: string;
  description: string;
  fields: FieldDef[];
  defaults: FormValues;
  templates?: ActionTemplate[];
}

export interface InvokeAction extends ActionBase {
  kind: 'invoke';
  requiresWallet?: boolean;
  // Snippet shown under the form, describing the call that will be made.
  preview?: (values: FormValues) => string;
  run: (values: FormValues) => Promise<unknown>;
}

export interface DeepLinkAction extends ActionBase {
  kind: 'deeplink';
  build: (values: FormValues) => DappRequestBody;
}

export type ActionDef = InvokeAction | DeepLinkAction;

export interface ActionGroup {
  id: string;
  title: string;
  description?: string;
  actions: ActionDef[];
}
