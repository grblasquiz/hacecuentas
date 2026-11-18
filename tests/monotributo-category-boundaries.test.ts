import {describe,it,expect} from 'vitest';
import {selectMonotributoCategory} from '../src/lib/monotributo-category';
import {CATEGORIAS,TOPES} from '../src/lib/data/monotributo-2026';
describe('categorías con parámetros oficiales',()=>{
 it('respeta límites con centavos y alcanza K para servicios o bienes',()=>{for(const cat of CATEGORIAS)expect(selectMonotributoCategory(TOPES[cat])).toBe(cat);expect(selectMonotributoCategory(TOPES.K+.01)).toBeNull();expect(selectMonotributoCategory(90000000)).toBe('I');});
 it('no recorta parámetros fuera de escala a categoría K',()=>{expect(selectMonotributoCategory(22000000,201)).toBeNull();expect(selectMonotributoCategory(22000000,0,20001)).toBeNull();});
 it('elige categoría que cubre simultáneamente los parámetros ingresados',()=>{expect(selectMonotributoCategory(22000000,200,20000)).toBe('G');expect(selectMonotributoCategory(90000000,200,20000)).toBe('I');});
 it('rechaza ceros, negativos, faltantes y valores no finitos',()=>{for(const value of [0,-1,NaN,Infinity])expect(()=>selectMonotributoCategory(value)).toThrow();expect(()=>selectMonotributoCategory(10,-1)).toThrow();});
});
