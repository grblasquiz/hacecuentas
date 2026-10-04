import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { transformSync } from 'esbuild';
import { describe, expect, it } from 'vitest';
import { divideSteps, multiplySteps } from '../src/lib/tools/arithmetic-steps';

// Run the component's actual event handlers, including delayed clipboard responses.
const source = readFileSync(new URL('../src/components/hub/ArithmeticSteps.astro', import.meta.url), 'utf8');
const script = transformSync(source.match(/<script>([\s\S]*?)<\/script>/)![1].replace(/^\s*import .*;\s*$/m, ''), { loader: 'ts' }).code;
function mount(clipboard: { writeText: (text: string) => Promise<void> } = { writeText: async () => { throw new Error('denied'); } }) {
  const ids: Record<string, any> = {};
  const make = () => ({ value: '', textContent: '', hidden: false, disabled: false, children: [] as any[], handlers: {} as Record<string, Function>, addEventListener(type: string, handler: Function) { this.handlers[type] = handler; }, replaceChildren(...children: any[]) { this.children = children; }, focus() {}, select() {} });
  for (const id of [...source.matchAll(/\bid="([^"]+)"/g)].map(m => m[1])) ids[id] = make();
  ids.operation.value='divide'; ids['first-number'].value='1005'; ids['second-number'].value='5'; ids['division-precision'].value='6';
  const example = { ...make(), dataset: { example: '7|12|divide' } };
  const root = { querySelector: (selector: string) => ids[selector.slice(1)], querySelectorAll: () => [example] };
  let prints=0;
  runInNewContext(script, { divideSteps, multiplySteps, document: { querySelector: () => root, createElement: make }, navigator: { clipboard }, window: { print: () => prints++ } });
  return { ids, example, prints: () => prints, fire(id: string, event: string) { return ids[id].handlers[event]({ preventDefault() {} }); }, submit() { ids['arithmetic-form'].handlers.submit({ preventDefault() {} }); } };
}
const expectInvalidated = (ui: ReturnType<typeof mount>) => {
  expect(ui.ids['arithmetic-result'].hidden).toBe(true);
  expect(ui.ids['copy-arithmetic'].disabled).toBe(true);
  expect(ui.ids['print-arithmetic'].disabled).toBe(true);
  expect(ui.ids['arithmetic-copy-text'].value).toBe('');
  expect(ui.ids['copy-fallback'].hidden).toBe(true);
};
describe('arithmetic result stays tied to current inputs', () => {
  it.each(['first-number', 'second-number', 'division-precision'])('invalidates %s and recovers only after a new calculation', async id => {
    const ui=mount();
    expect(ui.ids['result-heading'].textContent).toBe('1005 ÷ 5 = 201');
    await ui.fire('copy-arithmetic','click'); expect(ui.ids['copy-fallback'].hidden).toBe(false);
    ui.ids[id].value=id==='first-number'?'10':id==='second-number'?'2':'2';
    ui.fire(id,id==='division-precision'?'change':'input'); expectInvalidated(ui);
    expect(ui.ids['arithmetic-status'].textContent).toContain('Volvé a mostrar');
    await ui.fire('copy-arithmetic','click'); ui.fire('print-arithmetic','click'); expect(ui.prints()).toBe(0);
    expectInvalidated(ui);
    ui.submit(); expect(ui.ids['arithmetic-result'].hidden).toBe(false); expect(ui.ids['copy-arithmetic'].disabled).toBe(false); expect(ui.ids['print-arithmetic'].disabled).toBe(false);
    expect(ui.ids['arithmetic-copy-text'].value).toContain(id==='first-number'?'2 × 5 + 0 = 10':id==='second-number'?'502,5 × 2 + 0 = 1005':'201 × 5 + 0 = 1005');
  });
  it('clears stale exports for invalid, empty and zero-divisor inputs; examples restore the result', () => {
    const ui=mount();
    for (const invalid of ['0','','abc']) {
      ui.ids['second-number'].value=invalid; ui.fire('second-number','input'); expectInvalidated(ui);
      ui.submit(); expectInvalidated(ui); expect(ui.ids['arithmetic-status'].textContent).not.toContain('comprobado');
    }
    ui.example.handlers.click(); expect(ui.ids['result-heading'].textContent).toBe('7 ÷ 12 = 0,583333');
    ui.ids['division-precision'].value='2'; ui.fire('division-precision','change'); expectInvalidated(ui);
    ui.submit(); expect(ui.ids['result-heading'].textContent).toBe('7 ÷ 12 = 0,58');
  });
  it.each([true, false])('ignores a late clipboard response after edits (rejected=%s)', async rejected => {
    let settle!: () => void;
    const ui=mount({ writeText: () => new Promise<void>((resolve, reject) => { settle=rejected?()=>reject(new Error('denied')):resolve; }) });
    const pending=ui.fire('copy-arithmetic','click');
    ui.ids['second-number'].value='0'; ui.fire('second-number','input');
    const status=ui.ids['arithmetic-status'].textContent;
    settle(); await pending; expectInvalidated(ui); expect(ui.ids['arithmetic-status'].textContent).toBe(status);
  });
});
