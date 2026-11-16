import { describe, expect, it } from 'vitest';
import { SHARE_RESOURCES, resourceShare, copyResourceText } from '../src/lib/resource-share';
import { isHcEvent, sanitizeAnalyticsParams } from '../src/lib/analytics';

describe('public resource acquisition', () => {
  it.each(Object.keys(SHARE_RESOURCES) as (keyof typeof SHARE_RESOURCES)[])('uses only a public canonical and measurable referral for %s', (key) => {
    const share = resourceShare(key, 'whatsapp');
    const url = new URL(share.url);
    expect(url.origin).toBe('https://hacecuentas.com');
    expect(url.pathname).toBe(SHARE_RESOURCES[key].path);
    expect([...url.searchParams.keys()].sort()).toEqual(['utm_campaign', 'utm_content', 'utm_medium', 'utm_source']);
    expect(url.searchParams.get('utm_medium')).toBe('referral');
    expect(url.hash).toBe('');
    expect(new URL(share.whatsapp).searchParams.get('text')).toBe(share.text);
  });
  it('retains the eligibility qualification on the public salary total', () => {
    expect(resourceShare('salario-colombia-2026', 'copy').text).toMatch(/\$249.095 si corresponde; total antes de descuentos \$2.000.000/);
  });
  it('distinguishes copied resources from WhatsApp referral sessions', () => {
    expect(new URL(resourceShare('ganancias-2026', 'copy').url).searchParams.get('utm_source')).toBe('shared_resource');
    expect(new URL(resourceShare('ganancias-2026', 'whatsapp').url).searchParams.get('utm_source')).toBe('whatsapp');
  });
  it('only reports success after the clipboard promise resolves', async () => {
    let copied = '';
    expect(await copyResourceText('public text', { writeText: async (text) => { copied = text; } })).toBe(true);
    expect(copied).toBe('public text');
    expect(await copyResourceText('public text', { writeText: async () => { throw new Error('denied'); } })).toBe(false);
    expect(await copyResourceText('public text')).toBe(false);
  });
  it('keeps share events in the safe catalog without leaking financial inputs', () => {
    expect(isHcEvent('hc_resource_share_open')).toBe(true);
    expect(isHcEvent('hc_resource_copy')).toBe(true);
    expect(sanitizeAnalyticsParams({ source_page: '/co/test', interaction_type: 'copy_success', salary: 12345, text: 'private' })).toEqual({ source_page: '/co/test', interaction_type: 'copy_success' });
  });
});
