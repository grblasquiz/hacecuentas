import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, it, expect } from 'vitest';

const source = readFileSync(new URL('../src/pages/uy/validar-cedula.astro', import.meta.url), 'utf8');
const script = source.match(/<script is:inline>\s*([\s\S]*?)<\/script>/)![1];
function page() {
  const handlers: Record<string, Record<string, Function>> = {};
  const nodes: Record<string, any> = {};
  for (const id of ['idv', 'idvInput', 'idvMode', 'idvHelp', 'idvValidate', 'idvResult']) {
    handlers[id] = {};
    nodes[id] = { dataset: {}, value: id === 'idvMode' ? 'validate' : '', hidden: true,
      addEventListener(event: string, fn: Function) { handlers[id][event] = fn; } };
  }
  runInNewContext(script, { document: { readyState: 'complete', getElementById: (id: string) => nodes[id], addEventListener() {} } });
  return {
    nodes,
    submit(value: string) { nodes.idvInput.value = value; handlers.idvValidate.click(); return nodes.idvResult; },
    mode(value: string) { nodes.idvMode.value = value; handlers.idvMode.change(); },
    enter(value: string) { nodes.idvInput.value = value; handlers.idvInput.keydown({ key: 'Enter' }); return nodes.idvResult; },
  };
}
describe('cédula UY — input y elección explícita', () => {
  it.each(['1.234.567-2', '12345672', '1.234.5672', ' 12345672 '])('valida el ejemplo completo %s', value => {
    const result = page().submit(value);
    expect(result.className).toBe('idv-result ok');
    expect(result.innerHTML).toContain('Cédula válida');
  });
  it('rechaza un verificador incorrecto sin guion', () => {
    expect(page().submit('12345673').innerHTML).toContain('Cédula inválida');
  });
  it('valida cédulas de base corta sin confundirlas con el cálculo', () => {
    expect(page().submit('1234561').innerHTML).toContain('Cédula válida');
  });
  it('calcula el dígito del ejemplo solo en el modo elegido', () => {
    const p = page(); p.mode('calculate');
    expect(p.nodes.idvValidate.textContent).toBe('Calcular dígito');
    expect(p.submit('1234567').innerHTML).toContain('1.234.567-2');
    expect(p.submit('123456').innerHTML).toContain('123.456-1');
    expect(p.submit('12345672').className).toBe('idv-result bad');
    expect(p.submit('123456-1').className).toBe('idv-result bad');
  });
  it.each(['', '12345', '123456789', 'abc12345672', '1234567--2', '<img>12345672'])('rechaza entrada inválida %s', value => {
    expect(page().submit(value).className).toBe('idv-result bad');
  });
  it('limpia resultado al cambiar de modo y conserva Enter', () => {
    const p = page(); expect(p.enter('12345672').innerHTML).toContain('Cédula válida');
    p.mode('calculate'); expect(p.nodes.idvResult.hidden).toBe(true);
    expect(p.enter('1234567').innerHTML).toContain('1.234.567-2');
    p.mode('validate'); expect(p.nodes.idvValidate.textContent).toBe('Validar');
  });
});
