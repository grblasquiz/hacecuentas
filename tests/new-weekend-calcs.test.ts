import { describe, it, expect } from 'vitest';
import { comidaParaInvitados } from '../src/lib/formulas/comida-para-invitados';
import { proyectosHogar } from '../src/lib/formulas/proyectos-hogar';

describe('comida-para-invitados', () => {
  it('pizza x12 = 5 pizzas grandes (36 porciones)', () => {
    const r = comidaParaInvitados({ adultos: 12, ninos: 0, tipo_comida: 'pizza', apetito: 'normal', incluye_postre: 'si' });
    expect(r.plato_principal).toContain('5 pizza');
    expect(r.bebida_litros).toBe(9);
    expect(r.postre_porciones).toBe(14);
  });
  it('empanadas x10 = 60 (5 docenas)', () => {
    const r = comidaParaInvitados({ adultos: 10, ninos: 0, tipo_comida: 'empanadas', apetito: 'normal' });
    expect(r.plato_principal).toContain('60 empanadas');
  });
  it('apetito abundante sube la cantidad; liviano la baja', () => {
    const norm = comidaParaInvitados({ adultos: 10, ninos: 0, tipo_comida: 'sushi', apetito: 'normal' });
    const abund = comidaParaInvitados({ adultos: 10, ninos: 0, tipo_comida: 'sushi', apetito: 'abundante' });
    expect(parseInt(abund.plato_principal)).toBeGreaterThan(parseInt(norm.plato_principal));
  });
  it('sin postre → 0 porciones de postre', () => {
    const r = comidaParaInvitados({ adultos: 8, ninos: 0, tipo_comida: 'pizza', apetito: 'normal', incluye_postre: 'no' });
    expect(r.postre_porciones).toBe(0);
  });
  it('0 invitados no rompe', () => {
    const r = comidaParaInvitados({ adultos: 0, ninos: 0, tipo_comida: 'pizza', apetito: 'normal' });
    expect(r.bebida_litros).toBe(0);
  });
  it('niños cuentan como ~65% de un adulto', () => {
    const soloAdultos = comidaParaInvitados({ adultos: 10, ninos: 0, tipo_comida: 'empanadas', apetito: 'normal' });
    const conNinos = comidaParaInvitados({ adultos: 10, ninos: 4, tipo_comida: 'empanadas', apetito: 'normal' });
    expect(parseInt(conNinos.plato_principal)).toBeGreaterThan(parseInt(soloAdultos.plato_principal));
  });
});

describe('proyectos-hogar', () => {
  it('pintar 20 m² a 2 manos = 4,4 L (2 latas), ~4,8 h', () => {
    const r = proyectosHogar({ tipo_proyecto: 'pintar', metros2: 20, manos: 2, experiencia: 'intermedio' });
    expect(r.material_principal).toContain('4.4 L');
    expect(r.material_principal).toContain('2 lata');
    expect(r.tiempo_horas).toBe(4.8);
    expect(r.desperdicio_pct).toBe(10);
  });
  it('mudanza 50 m² = 40 cajas', () => {
    const r = proyectosHogar({ tipo_proyecto: 'mudanza', metros2: 50 });
    expect(r.material_principal).toContain('40 cajas');
  });
  it('césped 100 m² = 3,5 kg de semilla', () => {
    const r = proyectosHogar({ tipo_proyecto: 'cesped', metros2: 100 });
    expect(r.material_principal).toContain('3.5 kg');
  });
  it('experiencia principiante tarda más que experto', () => {
    const prin = proyectosHogar({ tipo_proyecto: 'pintar', metros2: 20, manos: 2, experiencia: 'principiante' });
    const exp = proyectosHogar({ tipo_proyecto: 'pintar', metros2: 20, manos: 2, experiencia: 'experto' });
    expect(prin.tiempo_horas).toBeGreaterThan(exp.tiempo_horas);
  });
  it('cada proyecto trae cronograma y nota DIY', () => {
    for (const t of ['pintar', 'piso_ceramico', 'piso_flotante', 'empapelar', 'limpieza_profunda', 'mudanza', 'cesped']) {
      const r = proyectosHogar({ tipo_proyecto: t, metros2: 20 });
      expect(r.cronograma.length, `${t} sin cronograma`).toBeGreaterThan(10);
      expect(r.diy_vs_contratar.length, `${t} sin nota DIY`).toBeGreaterThan(10);
    }
  });
  it('0 m² no rompe', () => {
    const r = proyectosHogar({ tipo_proyecto: 'pintar', metros2: 0 });
    expect(r.tiempo_horas).toBe(0);
  });
});
