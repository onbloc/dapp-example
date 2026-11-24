import { toBech32 } from '@cosmjs/encoding';

// Realm address: bech32("g", sha256("pkgPath:" + path)[:20]), as tm2 DerivePkgAddr.
export const derivePkgAddress = async (pkgPath: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`pkgPath:${pkgPath}`));
  return toBech32('g', new Uint8Array(digest).slice(0, 20));
};
