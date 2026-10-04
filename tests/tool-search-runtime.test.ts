import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import tools from '../src/lib/current-tools-index.json';

const header=readFileSync(new URL('../src/components/Header.astro',import.meta.url),'utf8');
const primitives=header.slice(header.indexOf('  function levenshtein('),header.indexOf('  // XSS protection:'));
const scorer=header.match(/const buildScored = function \(useFuzzy\) \{[\s\S]*?\n        \};/)![0];
const country=header.match(/const isOtherCountry = function\(a\) \{[\s\S]*?\n        \};/)![0];
const targets=['matematica/operaciones-paso-a-paso','tecnologia/comparar-textos-y-listas'];
const entries=tools.map(tool=>({s:tool.slug,h:tool.h1,d:tool.description,a:tool.audience,k:'searchTerms' in tool?(tool.searchTerms as string[]).join(' '):''}));
function search(input:string,calcs=entries,preferredAudience='AR'){
  return runInNewContext(`${primitives}\nconst query=norm(input);const tokens=query.split(/\\s+/).filter(Boolean);${country}\n${scorer}\nlet scored=buildScored(false);if(scored.length<4)scored=buildScored(true);scored.slice(0,8).map(x=>x.c.s)`,{input,calcs,preferredAudience}) as string[];
}
describe('natural queries return a single existing canonical tool',()=>{
  it.each([
    ['DIVISIÓN LARGA',targets[0]],['multiplicación en columnas',targets[0]],['dividir paso a paso',targets[0]],
    ['comparar textos',targets[1]],['comparador de textos',targets[1]],['comparar listas',targets[1]],['quitar duplicados',targets[1]],['eliminar duplicados',targets[1]],
  ])('finds %s without duplicating the URL', (query,target)=>{
    expect(search(query).filter(s=>s===target)).toHaveLength(1);
    expect(entries.filter(e=>e.s===target)).toHaveLength(1);
  });
  it('retains matching and country ranking for entries without aliases',()=>{
    const rows=[{s:'ar-test',h:'Sueldo neto',d:'',a:'AR',k:''},{s:'es-test',h:'Sueldo neto',d:'',a:'ES',k:''},{s:'plain',h:'Fracciones',d:'Sumar fracciones',a:'global',k:''}];
    expect(search('sueldo neto',rows,'ES').slice(0,2)).toEqual(['es-test','ar-test']);
    expect(search('fracciones',rows)).toEqual(['plain']);
    expect(search('<img src=x onerror=alert(1)>',rows)).toEqual([]);
  });
});
