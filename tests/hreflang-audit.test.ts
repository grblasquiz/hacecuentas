import { describe, expect, it } from 'vitest';
import {
  auditHreflangDocuments,
  parseExactRedirectLines,
  type HreflangDocument,
} from '../scripts/audit-hreflang.ts';

function page(
  path: string,
  alternates: Array<[lang: string, href: string]>,
  options: { canonical?: string; noindex?: boolean } = {},
): HreflangDocument {
  const canonical = options.canonical || path;
  const robots = options.noindex
    ? '<meta name="robots" content="noindex, follow">'
    : '<meta name="robots" content="index, follow">';
  const links = alternates
    .map(
      ([lang, href]) =>
        `<link rel="alternate" hreflang="${lang}" href="https://hacecuentas.com${href}">`,
    )
    .join('');
  return {
    path,
    html:
      `<html><head>${robots}` +
      `<link rel="canonical" href="https://hacecuentas.com${canonical}">` +
      `${links}</head></html>`,
  };
}

describe('gate post-build de hreflang', () => {
  it('acepta un cluster recíproco, indexable y autocanónico', () => {
    const links: Array<[string, string]> = [
      ['es-AR', '/calculadora-imc'],
      ['en', '/en/bmi-calculator'],
      ['x-default', '/calculadora-imc'],
    ];
    const errors = auditHreflangDocuments([
      page('/calculadora-imc', links),
      page('/en/bmi-calculator', links),
    ]);
    expect(errors).toEqual([]);
  });

  it('detecta destinos redirect, 410, noindex, 404 y alias canónico', () => {
    const sourceLinks: Array<[string, string]> = [
      ['es-AR', '/source'],
      ['en', '/redirected'],
      ['pt-BR', '/gone'],
      ['es-MX', '/missing'],
      ['es-CO', '/noindex'],
      ['es-CL', '/alias'],
      ['x-default', '/source'],
    ];
    const reciprocalSource: Array<[string, string]> = [
      ['es-AR', '/source'],
      ['x-default', '/source'],
    ];
    const blocked = new Map<string, 'redirect' | 'gone_410'>([
      ['/redirected', 'redirect'],
      ['/gone', 'gone_410'],
    ]);
    const errors = auditHreflangDocuments(
      [
        page('/source', sourceLinks),
        page('/noindex', reciprocalSource, { noindex: true }),
        page('/alias', reciprocalSource, { canonical: '/canonical-target' }),
        page('/canonical-target', [
          ['es-CL', '/canonical-target'],
          ['x-default', '/canonical-target'],
        ]),
      ],
      blocked,
    );
    const codes = new Set(errors.map((error) => error.code));

    expect(codes.has('redirect')).toBe(true);
    expect(codes.has('gone_410')).toBe(true);
    expect(codes.has('not_found')).toBe(true);
    expect(codes.has('target_noindex')).toBe(true);
    expect(codes.has('target_canonical_alias')).toBe(true);
  });

  it('detecta clusters no recíprocos', () => {
    const errors = auditHreflangDocuments([
      page('/source', [
        ['es-AR', '/source'],
        ['en', '/target'],
        ['x-default', '/source'],
      ]),
      page('/target', [
        ['en', '/target'],
        ['x-default', '/target'],
      ]),
    ]);

    expect(errors.some((error) => error.code === 'not_reciprocal')).toBe(true);
  });

  it('no confunde canonicalización de trailing slash con un destino redirect', () => {
    expect(
      parseExactRedirectLines(`
        /mx/ /mx 301
        /en/ /en 308
        /alias /destino 301
      `),
    ).toEqual(['/alias']);
  });
});
