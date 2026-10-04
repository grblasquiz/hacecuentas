import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { transformSync } from 'esbuild';
import { describe, expect, it } from 'vitest';
import { analyzeList, compareLines, compareLists } from '../src/lib/tools/text-comparison';
const source=readFileSync(new URL('../src/components/hub/TextComparison.astro',import.meta.url),'utf8');
const script=transformSync(source.match(/<script>([\s\S]*?)<\/script>/)![1].replace(/^\s*import .*;\s*$/m,''),{loader:'ts'}).code;
function mount(clipboard: { writeText: (text:string)=>Promise<void> }={writeText:async()=>{throw new Error('denied')}}){
  const ids:Record<string,any>={}; const blobs:Blob[]=[];let downloads=0;
  const make=()=>({value:'',textContent:'',hidden:false,disabled:false,checked:false,handlers:{} as Record<string,Function>,children:[] as any[],addEventListener(type:string,handler:Function){this.handlers[type]=handler},replaceChildren(...nodes:any[]){this.children=nodes},append(node:any){this.children.push(node)},focus(){},select(){},click(){downloads++}});
  for(const id of [...source.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]))ids[id]=make();
  ids['comparison-mode'].value='text';ids['comparison-a'].value='a\nb';ids['comparison-b'].value='a\nc';ids['list-delimiter'].value='lines';ids['list-result-kind'].value='onlyA';
  const root={querySelector:(selector:string)=>selector.startsWith('#')?ids[selector.slice(1)]:make()};
  runInNewContext(script,{analyzeList,compareLines,compareLists,document:{querySelector:()=>root,createElement:make},navigator:{clipboard},Blob,URL:{createObjectURL:(blob:Blob)=>{blobs.push(blob);return 'blob:qa'},revokeObjectURL(){}},window:{setTimeout:(fn:Function)=>fn()}});
  return {ids,blobs,downloads:()=>downloads,fire(id:string,event:string){return ids[id].handlers[event]({preventDefault(){}})},submit(){ids['comparison-form'].handlers.submit({preventDefault(){}})}};
}
function expectInvalid(ui:ReturnType<typeof mount>){expect(ui.ids['comparison-result'].hidden).toBe(true);expect(ui.ids['comparison-copy-fallback'].hidden).toBe(true);expect(ui.ids['comparison-copy-text'].value).toBe('');expect(ui.ids['list-result-text'].value).toBe('');expect(ui.ids['copy-comparison'].disabled).toBe(true);expect(ui.ids['download-comparison'].disabled).toBe(true)}
describe('comparison exports belong to the current result',()=>{
  it.each(['comparison-a','comparison-b','trim-edges','ignore-case','list-delimiter'])('clears old output/fallback on %s and blocks both exports until recalculated',async id=>{
    const ui=mount();await ui.fire('copy-comparison','click');expect(ui.ids['comparison-copy-fallback'].hidden).toBe(false);
    if(id.startsWith('comparison-'))ui.ids[id].value='new';else if(id==='list-delimiter')ui.ids[id].value='comma';else ui.ids[id].checked=true;
    ui.fire(id,id.startsWith('comparison-')?'input':'change');expectInvalid(ui);
    await ui.fire('copy-comparison','click');ui.fire('download-comparison','click');expect(ui.downloads()).toBe(0);expectInvalid(ui);
    ui.submit();expect(ui.ids['comparison-result'].hidden).toBe(false);expect(ui.ids['copy-comparison'].disabled).toBe(false);
  });
  it.each([true,false])('discards late clipboard responses after a mode change (reject=%s)',async rejected=>{
    let settle!:()=>void;const ui=mount({writeText:()=>new Promise<void>((resolve,reject)=>{settle=rejected?()=>reject(new Error('late')):resolve})});
    const pending=ui.fire('copy-comparison','click');ui.ids['comparison-mode'].value='lists';ui.fire('comparison-mode','change');const status=ui.ids['comparison-status'].textContent;
    settle();await pending;expect(ui.ids['comparison-status'].textContent).toBe(status);expect(ui.ids['comparison-copy-fallback'].hidden).toBe(true);
  });
  it('preserves valid empty exports and clearing; invalid limits cannot expose the previous copy',async()=>{
    const ui=mount();ui.fire('clear-comparison','click');expect(ui.ids['comparison-summary'].textContent).toContain('0 líneas');
    expect(ui.ids['copy-comparison'].disabled).toBe(false);ui.fire('download-comparison','click');expect(await ui.blobs[0].text()).toBe('');
    ui.ids['comparison-a'].value='x'.repeat(30001);ui.fire('comparison-a','input');ui.submit();expectInvalid(ui);
    ui.fire('example-lists','click');expect(ui.ids['list-result-text'].value).toBe('pera');ui.fire('download-comparison','click');expect(await ui.blobs[1].text()).toBe('pera');
    ui.ids['list-result-kind'].value='union';ui.fire('list-result-kind','change');expect(ui.ids['list-result-text'].value).toBe('pera\nuva\nkiwi');
  });
});
