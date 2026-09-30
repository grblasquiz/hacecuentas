import { describe, it, expect } from 'vitest';
import { comparePurchase, rentalCosts, salaryRecovery, recoveryCsv } from '../src/lib/hubs/decision-math';
const purchase={price:500000,discount:10,surcharge:0,months:6,rate:0,first:1,available:500000,monthlyBudget:90000};
const rental={rent:650000,expenses:121000,deposit:650000,commission:0,insurance:0,other:0,services:0,income:2200000,ratio:.3};
describe('cuotas versus contado',()=>{
 it('sin rendimiento gana el descuento al contado y conserva total nominal',()=>{const r=comparePurchase(purchase);expect(r.cash).toBe(450000);expect(r.present).toBeCloseTo(500000);expect(r.saving).toBeCloseTo(-50000);expect(r.installment).toBeCloseTo(83333.333333);});
 it('valor presente manual de dos cuotas de 100 al 10%',()=>{const r=comparePurchase({...purchase,price:200,discount:0,months:2,rate:10});expect(r.present).toBeCloseTo(100/1.1+100/1.21);expect(comparePurchase({...purchase,price:200,discount:0,months:2,rate:10,first:0}).present).toBeCloseTo(100+100/1.1);});
 it('no recomienda capacidad inexistente aunque el valor presente sea menor',()=>{const r=comparePurchase({...purchase,rate:10,available:0,monthlyBudget:0});expect(r.saving).toBeGreaterThan(0);expect(r.cashAffordable).toBe(false);expect(r.installmentsAffordable).toBe(false);});
 it('recargo, descuento total, cero y valores inválidos no generan NaN',()=>{expect(comparePurchase({...purchase,surcharge:20}).financed).toBe(600000);expect(comparePurchase({...purchase,discount:100}).cash).toBe(0);for(const price of [0,-100,NaN,Infinity])expect(Number.isFinite(comparePurchase({...purchase,price,months:0}).present)).toBe(true);});
});
describe('entrada a alquiler',()=>{
 it('ejemplo coherente de 1.421.000 y mensual 771.000',()=>{const r=rentalCosts(rental);expect(r.initial).toBe(1421000);expect(r.monthly).toBe(771000);expect(r.initial/r.rent).toBeCloseTo(2.1861538);expect(r.recommended).toBe(2570000);});
 it('caución no borra depósito, otros y servicios afectan cada total correcto',()=>{const r=rentalCosts({...rental,insurance:200000,other:100000,services:50000});expect(r.initial).toBe(1721000);expect(r.monthly).toBe(821000);expect(r.deposit).toBe(650000);});
 it('cero ingreso no crea porcentajes infinitos y presupuesto no negativo',()=>{const r=rentalCosts({...rental,income:0,ratio:0});expect(r.burden).toBeNull();expect(r.maxRent).toBe(0);expect(Number.isFinite(r.recommended)).toBe(true);});
});
describe('recuperación salarial mensual',()=>{
 it('dos meses de 10% componen 21%; caída real y recuperación no son iguales',()=>{const r=salaryRecovery(100,[{key:'2026-01',valor:10},{key:'2026-02',valor:10}],{'2026-02':110});expect(r[1].needed).toBeCloseTo(121);expect(r[1].real).toBeCloseTo(-9.090909);expect(r[1].recovery).toBeCloseTo(10);expect(r[0].real).toBeNull();});
 it('sueldo cero y tasas negativas no inventan salario o divisiones por cero',()=>{const r=salaryRecovery(100,[{key:'2026-01',valor:-10}],{'2026-01':0})[0];expect(r.needed).toBe(90);expect(r.real).toBe(-100);expect(r.recovery).toBeNull();expect(()=>salaryRecovery(100,[{key:'x',valor:NaN}])).toThrow();});
 it('CSV conserva valores reproducibles, meses ausentes y fuente',()=>{const csv=recoveryCsv(100,salaryRecovery(100,[{key:'2026-01',valor:10}]),'https://indec.gob.ar/');expect(csv).toContain('factor_acumulado');expect(csv).toContain('"2026-01";10;1,1;100;');expect(csv).toContain('"";"";"";"https://indec.gob.ar/"');});
});
