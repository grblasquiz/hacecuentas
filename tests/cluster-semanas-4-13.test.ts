import { describe, expect, it } from 'vitest';
import { cuotaMaximaSegunIngreso } from '../src/lib/formulas/cuota-maxima-segun-ingreso';
import { capacidadEndeudamiento } from '../src/lib/formulas/capacidad-endeudamiento';
import { comparadorPrestamos } from '../src/lib/formulas/comparador-prestamos';
import { comparadorPrecios } from '../src/lib/formulas/comparador-precios';
import { precioPorUnidad } from '../src/lib/formulas/precio-por-unidad';
import { sacProporcional } from '../src/lib/formulas/sac-proporcional';
import { horasNocturnas } from '../src/lib/formulas/horas-nocturnas';
import { capitalTrabajo } from '../src/lib/formulas/capital-trabajo';
import { rentabilidadMensual } from '../src/lib/formulas/rentabilidad-mensual';
import { costosFijosVariables } from '../src/lib/formulas/costos-fijos-variables';
import { probabilidadEvento } from '../src/lib/formulas/probabilidad-evento';

describe('clusters corregidos semanas 4 a 13', () => {
  it('calcula cuota disponible y ratio deuda/ingreso', () => {
    expect(cuotaMaximaSegunIngreso({ ingresoMensual:1_500_000, cuotasActuales:180_000, porcentajeMaximo:30 }).cuotaMaxima).toBe(270_000);
    expect(capacidadEndeudamiento({ ingresoMensual:2_000_000, pagosDeudaMensuales:500_000, nuevaCuota:200_000 }).ratioConNueva).toBe(35);
  });
  it('compara préstamos por costo completo', () => {
    const r = comparadorPrestamos({ monto:5_000_000, tnaA:60, mesesA:24, gastosA:100_000, tnaB:55, mesesB:36, gastosB:100_000 });
    expect(r.cuotaA).toBeGreaterThan(r.cuotaB);
    expect(r.costoTotalA).toBeLessThan(r.costoTotalB);
    expect(r.conviene).toBe('Oferta A');
  });
  it('normaliza precios y packs', () => {
    expect(comparadorPrecios({ precioA:3000, cantidadA:750, precioB:3800, cantidadB:1000 }).mejorOpcion).toBe('Opción B');
    expect(precioPorUnidad({ precioPaquete:18000, unidades:12, contenidoPorUnidad:354 }).precioPorUnidad).toBe(1500);
  });
  it('calcula SAC proporcional y cómputo nocturno', () => {
    expect(sacProporcional({ mejorRemuneracion:1_200_000, diasTrabajados:90, diasSemestre:181 }).sacProporcional).toBe(298343);
    const r = horasNocturnas({ horasNocturnas:6, valorHora:8000, recargoConvenio:20 });
    expect(r.minutosCompensacion).toBe(48);
    expect(r.pagoEstimado).toBe(57600);
  });
  it('calcula capital, rentabilidad y estructura de costos', () => {
    expect(capitalTrabajo({ activosCorrientes:12_000_000, pasivosCorrientes:8_000_000, inventario:2_000_000 }).capitalTrabajo).toBe(4_000_000);
    expect(rentabilidadMensual({ ingresos:10_000_000, costosVariables:5_000_000, costosFijos:2_000_000, capitalInvertido:15_000_000 }).rentabilidadMensual).toBe(20);
    expect(costosFijosVariables({ unidades:500, costosFijos:2_000_000, costoVariableUnitario:3000, precioVentaUnitario:8000 }).puntoEquilibrio).toBe(400);
  });
  it('calcula probabilidad simple y repetida', () => {
    const r = probabilidadEvento({ casosFavorables:1, casosPosibles:6, intentos:4 });
    expect(r.probabilidad).toBe(16.67);
    expect(r.probabilidadAlguna).toBe(51.77);
  });
  it('rechaza entradas imposibles', () => {
    expect(() => comparadorPrecios({ precioA:0, cantidadA:1, precioB:1, cantidadB:1 })).toThrow();
    expect(() => sacProporcional({ mejorRemuneracion:100, diasTrabajados:200, diasSemestre:181 })).toThrow();
    expect(() => probabilidadEvento({ casosFavorables:7, casosPosibles:6 })).toThrow();
  });
});
