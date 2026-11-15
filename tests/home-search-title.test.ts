import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8');
const runtime = source.match(/<script is:inline define:vars=\{\{ searchItems: uniqueSearchItems \}\}>([\s\S]*?)<\/script>/)![1];
const calculators = [
  { url: 'https://hacecuentas.com/trabajo/sueldo-bruto-y-neto', h1: 'Del sueldo bruto al dinero que te queda en mano.', title: 'Calculadora de sueldo bruto a neto 2026 Argentina', locale: 'es', audience: 'AR', category: 'trabajo' },
  { url: 'https://hacecuentas.com/salud/peso-ideal-imc', h1: 'Ubicá tu peso en contexto.', title: 'Calculadora de IMC', locale: 'es', audience: 'global', category: 'salud' },
  { url: 'https://hacecuentas.com/mx/trabajo/sueldo-neto', h1: 'Sueldo México', title: 'Nómina mexicana', locale: 'es', audience: 'MX', category: 'trabajo' },
];

async function submit(query: string, rows = calculators) {
  function element() {
    const listeners: Record<string, (event: any) => any> = {};
    return { value: '', textContent: '', innerHTML: '', hidden: true, listeners, addEventListener: (name: string, fn: any) => { listeners[name] = fn; }, setAttribute: () => {}, removeAttribute: () => {}, focus: () => {}, contains: () => true, querySelectorAll: () => [] };
  }
  const form = element(), input = element(), results = element(), status = element();
  input.value = query;
  const nodes: Record<string, any> = { 'hub-search': form, 'home-query': input, 'hub-results': results, 'hub-search-status': status };
  const window = { location: { href: '' }, hcTrack: () => {} };
  runInNewContext(runtime, {
    searchItems: [], window, URL, location: { pathname: '/' },
    document: { getElementById: (id: string) => nodes[id], querySelectorAll: () => [], addEventListener: () => {}, activeElement: input },
    fetch: async () => ({ ok: true, json: async () => ({ calculators: rows }) }),
  });
  await form.listeners.submit({ preventDefault: () => {} });
  return { destination: window.location.href, html: results.innerHTML, status: status.textContent };
}

describe('home search matches calculator titles behind editorial headings', () => {
  it.each(['sueldo neto', 'SUÉLDO   NÉTO', 'bruto neto'])('finds the existing Argentine salary tool for %s', async query => {
    const result = await submit(query);
    expect(result.destination).toBe('/trabajo/sueldo-bruto-y-neto');
    expect(result.html).toContain('Del sueldo bruto al dinero que te queda en mano.');
  });
  it('retains global tools and matching against the displayed heading', async () => {
    expect((await submit('IMC')).destination).toBe('/salud/peso-ideal-imc');
    expect((await submit('queda mano')).destination).toBe('/trabajo/sueldo-bruto-y-neto');
  });
  it('retains the home country filter and catalog fallback', async () => {
    expect((await submit('nómina mexicana')).destination).toBe('/buscar?q=n%C3%B3mina%20mexicana');
    expect((await submit('consulta sin coincidencia')).destination).toBe('/buscar?q=consulta%20sin%20coincidencia');
  });
  it('escapes editorial labels in results', async () => {
    const result = await submit('sueldo neto', [{ ...calculators[0], h1: '<img src=x onerror=alert(1)>' }]);
    expect(result.html).toContain('&lt;img');
    expect(result.html).not.toContain('<img');
  });
});
