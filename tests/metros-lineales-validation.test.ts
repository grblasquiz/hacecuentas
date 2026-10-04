import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { hub as madera } from '../src/lib/hubs/madera';
import { hub as ceramicos } from '../src/lib/hubs/ceramicos';

const source = readFileSync('src/components/mockups/MetrosLinealesM2Mockup.astro', 'utf8');
function tool() {
  const ids: Record<string, any> = {};
  const node = (id: string) => ids[id] ??= { value: '', textContent: '', innerHTML: '', hidden: true,
    attrs: {}, listeners: {}, setAttribute(k: string, v: string) { this.attrs[k] = v; },
    setCustomValidity(v: string) { this.validityMessage = v; },
    addEventListener(k: string, f: any) { this.listeners[k] = f; } };
  for (const [id, value] of Object.entries({ 'ml-qty': '10', 'ml-width': '1.4', 'ml-waste': '10' })) node(id).value = value;
  const button = (value: string) => ({ listeners: {} as any, classList: { remove() {}, add() {} },
    getAttribute() { return value; }, addEventListener(k: string, f: any) { this.listeners[k] = f; } });
  const dirs = ['toArea', 'toLinear'].map(button);
  const materials = ['1.4', '1', '4', '0.53', '0.9'].map(button);
  const root = { querySelector() { return node('over'); }, querySelectorAll(selector: string) {
    return selector === '.switch button' ? dirs : selector === '.material' ? materials : []; } };
  runInNewContext(source.match(/<script is:inline>([\s\S]*?)<\/script>/)![1], {
    document: { querySelector() { return root; }, getElementById: node } });
  const input = (id: string, value: string) => { node(id).value = value; node(id).listeners.input(); };
  return { node, input, dirs, materials };
}

describe('metros lineales: validación real del script y conversión conservada', () => {
  it.each(['', ' ', '0', '-1', 'Infinity', 'NaN', '1e309', 'abc', '1,2,3'])('rechaza ancho %j y elimina resultados previos', width => {
    const t = tool(); t.input('ml-width', '1.4');
    expect(t.node('ml-buy').textContent).toBe('15,4 m²');
    t.input('ml-width', width);
    expect(t.node('ml-area').textContent).toBe('—');
    expect(t.node('ml-buy').textContent).toBe('—');
    expect(t.node('ml-eq').textContent).toBe('Completá los datos para calcular.');
    expect(t.node('ml-width').attrs['aria-invalid']).toBe('true');
    expect(t.node('ml-error').hidden).toBe(false);
    t.dirs[1].listeners.click(); expect(t.node('ml-buy').textContent).toBe('—');
    t.input('ml-width', '1,4');
    expect(t.node('ml-buy').textContent).toBe('7,86 ml');
    expect(t.node('ml-error').hidden).toBe(true);
    expect(t.node('ml-width').validityMessage).toBe('');
  });

  it.each(['', '-1', 'Infinity', '1e309', 'abc'])('rechaza cantidad %j, conserva cero explícito', quantity => {
    const t = tool(); t.input('ml-qty', quantity);
    expect(t.node('ml-buy').textContent).toBe('—');
    expect(t.node('ml-qty').attrs['aria-invalid']).toBe('true');
    t.input('ml-qty', '0'); expect(t.node('ml-buy').textContent).toBe('0 m²');
  });

  it('acepta coma decimal en ambos campos y conserva inversa, margen y materiales', () => {
    const t = tool(); t.input('ml-qty', '10,5'); t.input('ml-width', '1,4');
    expect(t.node('ml-buy').textContent).toBe('16,17 m²');
    t.input('ml-qty', '14'); t.dirs[1].listeners.click();
    expect(t.node('ml-area').innerHTML).toContain('10 <small>ml');
    expect(t.node('ml-buy').textContent).toBe('11 ml');
    t.input('ml-waste', '20'); expect(t.node('ml-buy').textContent).toBe('12 ml');
    t.dirs[0].listeners.click(); t.input('ml-qty', '10'); t.input('ml-waste', '10');
    ['15,4 m²', '11 m²', '44 m²', '5,83 m²', '9,9 m²'].forEach((expected, index) => {
      t.materials[index].listeners.click(); expect(t.node('ml-buy').textContent).toBe(expected); });
  });

  it('no presenta Infinity si dos entradas finitas desbordan el resultado', () => {
    const t = tool(); t.input('ml-qty', '1e308'); t.input('ml-width', '1e308');
    expect(t.node('ml-buy').textContent).toBe('—');
    expect(t.node('ml-error').textContent).toContain('demasiado grande');
  });

  it('los enlaces de madera y pisos están en FAQ renderizadas y conservan la URL dedicada', () => {
    const href = 'href="/calculadora-conversor-metros-lineales-a-metros-cuadrados"';
    for (const hub of [madera, ceramicos]) expect(hub.faq.some(f => f.a.includes(href))).toBe(true);
    expect(source).toContain('inputmode="decimal"');
    expect(source).not.toContain('Number(width.value) || 1');
  });
});
