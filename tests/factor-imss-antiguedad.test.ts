import { describe,it,expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { compute } from '../src/lib/formulas/calculadora-factor-integracion-salarial-imss-mexico';
import { diasVacacionesLFT, factorIntegracion } from '../src/lib/data/mexico-2026';
import { initialHiddenFieldIds } from '../src/lib/calculator-view-model';
const config=JSON.parse(readFileSync('src/content/calcs-mx/calculadora-factor-integracion-salarial-imss-mexico.json','utf8'));
const expected=[[1,12],[2,14],[3,16],[4,18],[5,20],[6,22],[10,22],[11,24],[15,24],[16,26],[20,26],[21,28],[25,28],[26,30],[30,30],[31,32],[50,38]];
describe('factor IMSS by seniority and contract benefits',()=>{
 it.each(expected)('uses the legal vacation bracket at %i years (%i days)',(years,days)=>{
  expect(diasVacacionesLFT(years)).toBe(days);
  const result=compute({modoVacaciones:'antiguedad',aniosServicio:years,vacacionesDias:60,salarioDiario:500});
  expect(result.vacacionesAplicadas).toContain(`${days} días`);
  expect(result.factor).toBe(factorIntegracion(years).toFixed(4));
 });
 it('reproduces the 6-year example and still accepts superior fixed benefits',()=>{
  expect(compute({modoVacaciones:'antiguedad',aniosServicio:6,salarioDiario:500}).factor).toBe('1.0562');
  expect(compute({modoVacaciones:'antiguedad',aniosServicio:6,salarioDiario:500}).sbc).toContain('528.1');
  expect(compute({modoVacaciones:'antiguedad',aniosServicio:6,aguinaldoDias:30,primaVacacionalPct:50}).factor).toBe('1.1123');
 });
 it('preserves old calls without a mode and manual contractual vacations',()=>{
  expect(compute({}).factor).toBe('1.0493');
  expect(compute({vacacionesDias:30,aguinaldoDias:30,primaVacacionalPct:50}).factor).toBe('1.1233');
  expect(compute({modoVacaciones:'manual',vacacionesDias:30,aniosServicio:6,aguinaldoDias:30,primaVacacionalPct:50}).factor).toBe('1.1233');
 });
 it.each([0,-1,1.5,Infinity,NaN])('rejects unusable completed years in automatic mode: %s',years=>{
  expect(()=>compute({modoVacaciones:'antiguedad',aniosServicio:years})).toThrow();
 });
 it('starts in the compatible manual mode and hides only the unused year field',()=>{
  const hidden=initialHiddenFieldIds(config.fields);expect(hidden.has('aniosServicio')).toBe(true);expect(hidden.has('vacacionesDias')).toBe(false);
 });
 it('publishes all 50 download rows with legal assumptions and consistent four-decimal factors',()=>{
  const data=JSON.parse(readFileSync('public/datasets/factor-integracion-imss-2026.json','utf8'));
  const csv=readFileSync('public/datasets/factor-integracion-imss-2026.csv','utf8').trim().split('\n');
  expect(data.rowCount).toBe(50);expect(csv.length).toBe(51);
  expect(csv[1]).toBe('1,12,15,25,1.0493');expect(csv[11]).toBe('11,24,15,25,1.0575');
  expect(data.sourceUrl).toContain('diputados.gob.mx');
  for(const row of data.data){expect(row.factor).toBe(compute({modoVacaciones:'antiguedad',aniosServicio:row.anios_servicio}).factor)}
 });
});
