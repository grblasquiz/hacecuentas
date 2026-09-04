import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
function compute(page:string){
 const source=readFileSync(`src/pages/${page}.astro`,'utf8');
 const script=source.match(/<script is:inline>([\s\S]*?)<\/script>/)?.[1];
 let calculate:any;
 runInNewContext(script!,{window:{HC_HUB:{onCompute:(fn:any)=>{calculate=fn}}}});
 expect(calculate).toBeTypeOf('function');
 return (values:any, id:string)=>calculate(values,{id});
}
describe('restored calculation contracts',()=>{
 const algebra=compute('en/math/algebra');
 const geometry=compute('en/math/geometry-trigonometry');
 it('solves quadratic roots instead of the unrelated linear preview',()=>{
  expect(algebra({a:1,b:-5,c:6},'quadratic').total).toContain('3');
  expect(algebra({a:1,b:-5,c:6},'quadratic').total).toContain('2');
 });
 it('reports a singular matrix',()=>{
  expect(algebra({a:1,b:2,c:2,d:4},'matrix').total).toMatch(/singular/i);
 });
 it('computes Heron area and rejects an impossible triangle',()=>{
  expect(geometry({a:3,b:4,c:5},'triangle').total).toContain('6');
  expect(geometry({a:1,b:2,c:8},'triangle').total).toMatch(/no|invalid|not/i);
 });
 it('exposes the original Spanish polynomial callback',()=>{
  expect(compute('matematica/ecuaciones-y-polinomios')).toBeTypeOf('function');
 });
});
