import {describe,it,expect} from 'vitest';
import {analyzeList,compareLines,compareLists} from '../src/lib/tools/text-comparison';
describe('comparación local y determinista',()=>{
  it('maneja entradas vacías y líneas nuevas',()=>{expect(compareLines('','').rows).toEqual([]);expect(compareLines('','a').counts).toMatchObject({added:1,removed:0});expect(compareLines('\n','').counts.removed).toBe(2);expect(compareLists('','').union).toEqual([])});
  it('normaliza CRLF/LF sin ignorar líneas vacías',()=>{expect(compareLines('a\r\n\r\nb','a\n\nb').counts).toMatchObject({same:3,added:0,removed:0})});
  it('conserva orden y trata un movimiento como eliminar y agregar',()=>{const r=compareLines('a\nb','b\na');expect(r.rows.map(x=>x.kind)).toEqual(['removed','same','added']);expect(r.rows.map(x=>[x.aLine,x.bLine])).toEqual([[1,null],[2,1],[null,2]])});
  it('reconstruye las versiones originales incluso con repeticiones',()=>{for(const [a,b] of [['a\na\nb','a\nb\nb'],['ñ\ná\nñ','á\nñ'],['x\n\nz','z\nx']]){const r=compareLines(a,b);expect(r.rows.filter(x=>x.kind!=='added').map(x=>x.text).join('\n')).toBe(a);expect(r.rows.filter(x=>x.kind!=='removed').map(x=>x.text).join('\n')).toBe(b)}});
  it('espacios y mayúsculas solo se ignoran cuando se elige',()=>{expect(compareLines(' Hola ','hola').counts.same).toBe(0);expect(compareLines(' Hola ','hola',{trim:true,ignoreCase:true}).counts.same).toBe(1)});
  it('mantiene tildes/ñ y equivalencia Unicode canónica',()=>{expect(compareLists('año\nano\nsí\nsi','AÑO','lines',{trim:false,ignoreCase:true}).common).toEqual(['año']);expect(compareLines('é','e\u0301').counts.same).toBe(1)});
  it('trata HTML como texto literal',()=>{const value='<img src=x onerror=alert(1)>';expect(compareLines('',value).rows[0].text).toBe(value);expect(analyzeList(value).values).toEqual([value])});
  it('distingue conjuntos y apariciones sin perder el primer orden',()=>{const r=compareLists('a\na\nb','b\nc\nb');expect(r.a.occurrences).toBe(3);expect(r.a.duplicates).toBe(1);expect(r.b.duplicates).toBe(1);expect(r.onlyA).toEqual(['a']);expect(r.onlyB).toEqual(['c']);expect(r.common).toEqual(['b']);expect(r.union).toEqual(['a','b','c'])});
  it('delimitador es literal, no parser CSV',()=>{expect(analyzeList('a,b,a','comma').values).toEqual(['a','b']);expect(analyzeList('a;b;a','semicolon').duplicates).toBe(1);expect(analyzeList(' a ;A; ', 'semicolon',{trim:true,ignoreCase:true}).values).toEqual(['a'])});
  it('preserva espacios por defecto y elimina solo entradas vacías',()=>{expect(analyzeList(' \n\na').values).toEqual([' ','a']);expect(analyzeList(' \n\na','lines',{trim:true,ignoreCase:false}).values).toEqual(['a'])});
  it('rechaza límites antes del trabajo costoso',()=>{expect(()=>compareLines('x'.repeat(30001),'')).toThrow('30.000');expect(()=>compareLines('a\n'.repeat(250),'')).toThrow('250');expect(()=>analyzeList('a,'.repeat(2000),'comma')).toThrow('2.000')});
  it('acepta exactamente los límites y conjuntos grandes',()=>{expect(compareLines('x'.repeat(30000),'').counts.removed).toBe(1);const s=Array.from({length:2000},(_,i)=>String(i)).join(',');expect(compareLists(s,s,'comma').common.length).toBe(2000)});
});
