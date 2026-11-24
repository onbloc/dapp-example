import { describe, expect, it } from 'vitest';

import { derivePkgAddress } from '@/lib/gno-address';

import { buildGnotToGnsSwap, GNOSWAP, gnotToGnsSwapTemplate, gnotToUgnot } from './gnoswap-swap';

const CALLER = 'g1jg8mtutu9khhfwc4nxmuhcpftf0pajdhfvsqf5';

describe('gnotToUgnot', () => {
  it.each([
    ['1', '1000000'],
    ['0.5', '500000'],
    ['12.000001', '12000001'],
  ])('%s GNOT = %s ugnot', (gnot, ugnot) => expect(gnotToUgnot(gnot)).toBe(ugnot));

  it.each(['0', '-1', '1.0000001', 'abc', ''])('rejects %s', value => expect(() => gnotToUgnot(value)).toThrow());
});

describe('GnoSwap GNOT -> GNS template', () => {
  it('derives the router realm address', async () => {
    expect(await derivePkgAddress(GNOSWAP.routerPkg)).toBe('g1vc883gshu5z7ytk5cdynhc8c2dh67pdp4cszkp');
  });

  it('builds Deposit, Approve and ExactInSwapRoute', () => {
    const [deposit, approve, swap] = buildGnotToGnsSwap(CALLER, '1000000', 'g1router');

    expect(deposit.value).toEqual({ caller: CALLER, send: '1000000ugnot', pkg_path: 'gno.land/r/gnoland/wugnot', func: 'Deposit', args: [] });
    expect(approve.value).toMatchObject({ pkg_path: 'gno.land/r/gnoland/wugnot', func: 'Approve', args: ['g1router', '1000000'], send: '' });
    expect(swap.value).toMatchObject({
      pkg_path: 'gno.land/r/gnoswap/router',
      func: 'ExactInSwapRoute',
      args: [
        'gno.land/r/gnoland/wugnot.wugnot',
        'gno.land/r/gnoswap/gns.GNS',
        '1000000',
        'gno.land/r/gnoland/wugnot.wugnot:gno.land/r/gnoswap/gns.GNS:3000',
        '100',
        '0',
        '9999999999',
        '',
      ],
    });
  });

  it('fills the multi-message form for dev.gnoswap', async () => {
    const patch = await gnotToGnsSwapTemplate(undefined).apply({ caller: ` ${CALLER} `, amount: '1' });

    expect(patch).toMatchObject({ network: 'dev.gnoswap', chainId: 'dev.gnoswap', signer: '' });
    expect(JSON.parse(patch.messages)).toHaveLength(3);
  });
});
