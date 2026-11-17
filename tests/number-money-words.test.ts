import {describe,it,expect} from 'vitest';
import {words,moneyInput,moneyWords} from '../src/lib/number-money-words';
describe('importes para números a letras',()=>{
 it('omite cero detrás de centenas exactas y apocopa ante moneda',()=>{
 expect(words(200)).toBe('doscientos');expect(words(1200000,true)).toBe('un millón doscientos mil');
 expect(moneyWords(21,50)).toBe('VEINTIÚN PESOS CON 50/100');expect(moneyWords(1,0)).toBe('UN PESO CON 00/100');
 expect(moneyWords(1000000,0)).toBe('UN MILLÓN DE PESOS CON 00/100');
 });
 it('interpreta separadores documentados sin redondear entradas inválidas',()=>{
 expect(moneyInput('1.250')).toEqual({i:1250,c:0});expect(moneyInput('1.250,50')).toEqual({i:1250,c:50});expect(moneyInput('1250.50')).toEqual({i:1250,c:50});
 for(const raw of ['-5','abc','12abc','1,234','1,2,3','1.2.3','1000000000'])expect(()=>moneyInput(raw)).toThrow();
 expect(moneyInput('999999999,99')).toEqual({i:999999999,c:99});
 });
});
