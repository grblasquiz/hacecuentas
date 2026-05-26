/**
 * Tests unitarios — top 50 calcs por trafico (las que NO estan ya en formulas.test.ts).
 *
 * Prioridad: argentinas fiscales/laborales (monotributo, ganancias, aguinaldo, hora extra,
 * jubilacion, ripte, sellos, licencia maternidad/paternidad), finanzas (cuota UVA, TNA/TEM/TEA,
 * FCI money market), salud (frecuencia respiratoria, edad corregida prematuro, estatura adulta),
 * conversiones (kg-libras), eventos (bebidas, aniversario), construccion (cano estructural),
 * medio ambiente (arboles CO2), consumo (electrico), media (video bitrate, stop motion),
 * viajes (millas LATAM, propinas).
 *
 * Si la formula importa constantes vivas (MOPRE, MNI, escala Ganancias), los tests usan
 * propiedades estructurales (paga = boolean, retencion > 0) en vez de valores absolutos
 * para no romper cuando un fetcher actualiza los numeros.
 */

import { describe, it, expect } from 'vitest';

import { aguinaldo } from '../src/lib/formulas/aguinaldo';
import { monotributo } from '../src/lib/formulas/monotributo';
import { gananciasSueldo } from '../src/lib/formulas/ganancias-sueldo';
import { sueldoHoraExtraNocturnaFeriado } from '../src/lib/formulas/sueldo-hora-extra-nocturna-feriado';
import { licenciaMaternidadPaternidad } from '../src/lib/formulas/licencia-maternidad-paternidad';
import { jubilacionAnsesMontoMinimoMaxima2026 } from '../src/lib/formulas/jubilacion-anses-monto-minimo-maxima-2026';
import { ripteActualizacionJubilatoriaSueldo } from '../src/lib/formulas/ripte-actualizacion-jubilatoria-sueldo';
import { impuestoSellosInmuebleContrato } from '../src/lib/formulas/impuesto-sellos-inmueble-contrato';
import { creditoUvaCuotaActual } from '../src/lib/formulas/credito-uva-cuota-actual';
import { conversionTnaTem } from '../src/lib/formulas/conversion-tna-tem';
import { rendimientoFciMoneyMarket } from '../src/lib/formulas/rendimiento-fci-money-market';
import { frecuenciaRespiratoria } from '../src/lib/formulas/frecuencia-respiratoria';
import { edadCorregidaPrematuro } from '../src/lib/formulas/edad-corregida-prematuro';
import { estaturaAdultaHijo } from '../src/lib/formulas/estatura-adulta-hijo';
import { kgLibras } from '../src/lib/formulas/kg-libras';
import { canoEstructuralPesoMl } from '../src/lib/formulas/cano-estructural-peso-ml';
import { arbolesCompensarCo2Huella } from '../src/lib/formulas/arboles-compensar-co2-huella';
import { consumoElectrico } from '../src/lib/formulas/consumo-electrico';
import { bebidasEventoLitrosPorPersona } from '../src/lib/formulas/bebidas-evento-litros-por-persona';
import { aniversarioPareja } from '../src/lib/formulas/aniversario-pareja';
import { videoBitrateTamanoArchivo } from '../src/lib/formulas/video-bitrate-tamano-archivo';
import { millasLatamDestino } from '../src/lib/formulas/millas-latam-destino';
import { propinaPais } from '../src/lib/formulas/propina-pais';
import { stopMotionFpsTiempo } from '../src/lib/formulas/stop-motion-fps-tiempo';

// =====================================================
// 1. Aguinaldo (SAC argentino)
// =====================================================
describe('aguinaldo', () => {
  it('semestre completo: SAC = mejor sueldo / 2', () => {
    const r = aguinaldo({ mejorSueldo: 1_000_000, mesesTrabajados: 6 });
    expect(r.aguinaldoBruto).toBe(500_000);
    expect(r.descuentos).toBe(85_000); // 17%
    expect(r.aguinaldoNeto).toBe(415_000);
  });

  it('proporcional a 3 meses', () => {
    const r = aguinaldo({ mejorSueldo: 1_000_000, mesesTrabajados: 3 });
    expect(r.aguinaldoBruto).toBe(250_000);
  });

  it('throw si mejorSueldo <= 0', () => {
    expect(() => aguinaldo({ mejorSueldo: 0, mesesTrabajados: 6 })).toThrow();
  });
});

// =====================================================
// 2. Monotributo Argentina (categoria por facturacion)
// =====================================================
describe('monotributo', () => {
  it('categoria A para facturacion baja en servicios', () => {
    const r = monotributo({ facturacionAnual: 5_000_000, tipoActividad: 'servicios' });
    expect(r.categoria).toBe('Categoría A');
    expect(r.cuotaMensual).toBeGreaterThan(0);
    expect(r.cuotaAnual).toBe(r.cuotaMensual * 12);
  });

  it('throw cuando supera limite de categoria K (bienes)', () => {
    expect(() =>
      monotributo({ facturacionAnual: 200_000_000, tipoActividad: 'bienes' })
    ).toThrow(/supera el límite/i);
  });

  it('alerta cerca del limite', () => {
    // Categoria A servicios: limite 10.277.988 → 95% = ~9.764.000
    const r = monotributo({ facturacionAnual: 9_800_000, tipoActividad: 'servicios' });
    expect(r.alerta).toMatch(/cerca del límite/i);
  });
});

// =====================================================
// 3. Ganancias 4ta categoria (sueldo en relacion de dependencia)
// =====================================================
describe('gananciasSueldo', () => {
  it('sueldo bajo no paga ganancias', () => {
    const r = gananciasSueldo({ brutoMensual: 500_000, conyuge: false, hijos: 0 });
    expect(r.paga).toBe(false);
    expect(r.retencionMensual).toBe(0);
  });

  it('sueldo muy alto paga ganancias', () => {
    const r = gananciasSueldo({ brutoMensual: 10_000_000, conyuge: false, hijos: 0 });
    expect(r.paga).toBe(true);
    expect(r.retencionMensual).toBeGreaterThan(0);
    expect(r.aportesMensuales).toBeCloseTo(10_000_000 * 0.17, 0);
  });

  it('aporta 17% sobre bruto sin importar tramos', () => {
    const r = gananciasSueldo({ brutoMensual: 2_000_000, conyuge: false, hijos: 0 });
    expect(r.aportesMensuales).toBeCloseTo(340_000, 0);
    expect(r.brutoAnual).toBe(2_000_000 * 13); // 12 + SAC
  });
});

// =====================================================
// 4. Hora extra (nocturna / feriado)
// =====================================================
describe('sueldoHoraExtraNocturnaFeriado', () => {
  it('hora normal x1.5 al 50%', () => {
    // sueldo 1.000.000 / 200 hs = 5.000/hora * 1.5 = 7.500/hora extra
    const r = sueldoHoraExtraNocturnaFeriado({
      sueldoBruto: 1_000_000,
      horasMensuales: 200,
      tipoHoraExtra: '50',
      cantidadHoras: 10,
    });
    expect(r.valorHoraNormal).toBe(5_000);
    expect(r.valorHoraExtra).toBe(7_500);
    expect(r.totalHorasExtra).toBe(75_000);
  });

  it('hora extra al 100% es doble', () => {
    const r = sueldoHoraExtraNocturnaFeriado({
      sueldoBruto: 1_000_000,
      horasMensuales: 200,
      tipoHoraExtra: '100',
      cantidadHoras: 5,
    });
    expect(r.valorHoraExtra).toBe(10_000);
    expect(r.totalHorasExtra).toBe(50_000);
  });

  it('throw si cantidad de horas es 0', () => {
    expect(() =>
      sueldoHoraExtraNocturnaFeriado({
        sueldoBruto: 1_000_000,
        horasMensuales: 200,
        tipoHoraExtra: '50',
        cantidadHoras: 0,
      })
    ).toThrow();
  });
});

// =====================================================
// 5. Licencia maternidad / paternidad
// =====================================================
describe('licenciaMaternidadPaternidad', () => {
  it('maternidad 90 dias (45+45)', () => {
    const r = licenciaMaternidadPaternidad({
      tipo: 'maternidad',
      fechaParto: '2026-06-15',
      opcionMaternidad: '45-45',
    });
    expect(r.diasLicencia).toBe(90);
    expect(r.quienPaga).toMatch(/ANSES/i);
  });

  it('paternidad 2 dias y paga el empleador', () => {
    const r = licenciaMaternidadPaternidad({
      tipo: 'paternidad',
      fechaParto: '2026-06-15',
      opcionMaternidad: '',
    });
    expect(r.diasLicencia).toBe(2);
    expect(r.quienPaga).toMatch(/empleador/i);
  });

  it('throw si fecha invalida', () => {
    expect(() =>
      licenciaMaternidadPaternidad({
        tipo: 'maternidad',
        fechaParto: 'no-fecha',
        opcionMaternidad: '45-45',
      })
    ).toThrow();
  });
});

// =====================================================
// 6. Jubilacion ANSES (haber + bono)
// =====================================================
describe('jubilacionAnsesMontoMinimoMaxima2026', () => {
  it('haber minimo incluye bono', () => {
    const r = jubilacionAnsesMontoMinimoMaxima2026({ tipo: 'minima' });
    expect(r.haberMensual).toContain('290.000');
    expect(r.bono).toContain('70.000');
    expect(r.total).toContain('360.000');
  });

  it('haber maximo no tiene bono', () => {
    const r = jubilacionAnsesMontoMinimoMaxima2026({ tipo: 'maxima' });
    expect(r.bono).toContain('$0');
  });
});

// =====================================================
// 7. RIPTE — actualizacion de sueldo historico
// =====================================================
describe('ripteActualizacionJubilatoriaSueldo', () => {
  it('multiplica sueldo por factor ripteActual/ripteViejo', () => {
    const r = ripteActualizacionJubilatoriaSueldo({
      sueldoViejo: 100_000,
      ripteViejo: 100,
      ripteActual: 1500,
    });
    // factor = 1500/100 = 15
    expect(r.factorMultiplicador).toBe('15.00x');
    expect(r.sueldoActualizado).toContain('1.500.000');
  });

  it('factor 1x cuando ripte igual', () => {
    const r = ripteActualizacionJubilatoriaSueldo({
      sueldoViejo: 500_000,
      ripteViejo: 200,
      ripteActual: 200,
    });
    expect(r.factorMultiplicador).toBe('1.00x');
    expect(r.sueldoActualizado).toContain('500.000');
  });
});

// =====================================================
// 8. Impuesto de sellos inmueble/contrato
// =====================================================
describe('impuestoSellosInmuebleContrato', () => {
  it('CABA compraventa 3.5%', () => {
    const r = impuestoSellosInmuebleContrato({
      montoContrato: 100_000_000,
      provincia: 'caba',
      tipoOperacion: 'compraventa',
      partesQuePagan: 'mitades',
    });
    expect(r.alicuotaAplicada).toBe(3.5);
    expect(r.impuestoTotal).toBe(3_500_000);
    expect(r.montoPorParte).toBe(1_750_000);
  });

  it('alquiler usa alicuota mas baja', () => {
    const r = impuestoSellosInmuebleContrato({
      montoContrato: 10_000_000,
      provincia: 'caba',
      tipoOperacion: 'alquiler',
      partesQuePagan: 'una',
    });
    expect(r.alicuotaAplicada).toBe(0.5);
    expect(r.impuestoTotal).toBe(50_000);
  });

  it('alicuota manual prevalece sobre la default', () => {
    const r = impuestoSellosInmuebleContrato({
      montoContrato: 1_000_000,
      provincia: 'caba',
      tipoOperacion: 'compraventa',
      alicuota: 2,
    });
    expect(r.alicuotaAplicada).toBe(2);
    expect(r.impuestoTotal).toBe(20_000);
  });
});

// =====================================================
// 9. Credito UVA — cuota actual
// =====================================================
describe('creditoUvaCuotaActual', () => {
  it('cuota frances tipica 20 anios', () => {
    const r = creditoUvaCuotaActual({
      montoPrestamoUVAs: 100_000, // 100k UVAs
      tasaAnual: 6, // 6% TNA
      plazoAnios: 20,
      valorUVAHoy: 1000, // $1000 por UVA
    });
    // cuota mensual ~ 716 UVAs → $716.000 aprox
    expect(r.cuotaUVAs).toBeGreaterThan(700);
    expect(r.cuotaUVAs).toBeLessThan(750);
    expect(r.cuotaPesos).toBeGreaterThan(700_000);
    expect(r.interesesTotales).toBeGreaterThan(0);
  });

  it('tasa 0 reparte el monto entre cuotas', () => {
    const r = creditoUvaCuotaActual({
      montoPrestamoUVAs: 120_000,
      tasaAnual: 0,
      plazoAnios: 10,
      valorUVAHoy: 1000,
    });
    // 120k UVAs / 120 meses = 1000 UVAs/mes
    expect(r.cuotaUVAs).toBe(1000);
    expect(r.interesesTotales).toBe(0);
  });

  it('throw si UVA <= 0', () => {
    expect(() =>
      creditoUvaCuotaActual({
        montoPrestamoUVAs: 100_000,
        tasaAnual: 6,
        plazoAnios: 20,
        valorUVAHoy: 0,
      })
    ).toThrow();
  });
});

// =====================================================
// 10. Conversion TNA / TEM / TEA
// =====================================================
describe('conversionTnaTem', () => {
  it('TNA 60% -> TEM 5% y TEA ~79.59%', () => {
    const r = conversionTnaTem({ tasa: 60, tipoOrigen: 'TNA' });
    expect(r.tna).toBe(60);
    expect(r.tem).toBe(5);
    expect(r.tea).toBeCloseTo(79.59, 1);
  });

  it('TEM 5% -> TNA 60% y TEA ~79.59%', () => {
    const r = conversionTnaTem({ tasa: 5, tipoOrigen: 'TEM' });
    expect(r.tem).toBe(5);
    expect(r.tna).toBe(60);
    expect(r.tea).toBeCloseTo(79.59, 1);
  });

  it('TEA 100% -> TEM ~5.95%', () => {
    const r = conversionTnaTem({ tasa: 100, tipoOrigen: 'TEA' });
    expect(r.tea).toBe(100);
    expect(r.tem).toBeCloseTo(5.95, 1);
  });

  it('throw si tasa negativa', () => {
    expect(() => conversionTnaTem({ tasa: -5, tipoOrigen: 'TNA' })).toThrow();
  });
});

// =====================================================
// 11. Rendimiento FCI Money Market
// =====================================================
describe('rendimientoFciMoneyMarket', () => {
  it('capitaliza diariamente a TNA dada', () => {
    // 1M$ a 60% TNA = 60/365 = 0.164%/dia → 30 dias ~ 5.06% acumulado
    const r = rendimientoFciMoneyMarket({ monto: 1_000_000, tna: 60, plazoDias: 30 });
    expect(r.valorFinal).toBeGreaterThan(1_049_000);
    expect(r.valorFinal).toBeLessThan(1_053_000);
    expect(r.gananciaPorDia).toBeGreaterThan(0);
    expect(r.teaEquivalente).toMatch(/TEA$/);
  });

  it('throw si dias <= 0', () => {
    expect(() =>
      rendimientoFciMoneyMarket({ monto: 100_000, tna: 50, plazoDias: 0 })
    ).toThrow();
  });

  it('throw si TNA = 0', () => {
    expect(() =>
      rendimientoFciMoneyMarket({ monto: 100_000, tna: 0, plazoDias: 30 })
    ).toThrow();
  });
});

// =====================================================
// 12. Frecuencia respiratoria normal
// =====================================================
describe('frecuenciaRespiratoria', () => {
  it('adulto: rango 12-20', () => {
    const r = frecuenciaRespiratoria({ edad: 30, fr: 16 });
    expect(r.bradipneaUmbral).toBe(12);
    expect(r.taquipneaUmbral).toBe(20);
    expect(r.evaluacion).toMatch(/Normal/);
  });

  it('FR baja en adulto = bradipnea', () => {
    const r = frecuenciaRespiratoria({ edad: 30, fr: 8 });
    expect(r.evaluacion).toMatch(/Bradipnea/);
  });

  it('lactante tiene rango mucho mas alto', () => {
    const r = frecuenciaRespiratoria({ edad: 0.5, fr: 40 });
    expect(r.bradipneaUmbral).toBe(30);
    expect(r.taquipneaUmbral).toBe(53);
    expect(r.evaluacion).toMatch(/Normal/);
  });
});

// =====================================================
// 13. Edad corregida (prematuro)
// =====================================================
describe('edadCorregidaPrematuro', () => {
  it('prematuro de 32 sem -> 8 semanas de prematurez', () => {
    // Usamos fecha pasada conocida
    const r = edadCorregidaPrematuro({
      fechaNacPrem: '2025-01-01',
      semanasGestPrem: 32,
    });
    expect(r.semanasPrematurez).toMatch(/8 semanas/);
  });

  it('throw si semanas fuera de rango (22-36)', () => {
    expect(() =>
      edadCorregidaPrematuro({ fechaNacPrem: '2025-01-01', semanasGestPrem: 40 })
    ).toThrow();
  });

  it('throw si fecha futura', () => {
    expect(() =>
      edadCorregidaPrematuro({ fechaNacPrem: '2099-01-01', semanasGestPrem: 32 })
    ).toThrow();
  });
});

// =====================================================
// 14. Estatura adulta (formula Tanner)
// =====================================================
describe('estaturaAdultaHijo', () => {
  it('hijo varon: (padre + madre + 13) / 2', () => {
    const r = estaturaAdultaHijo({ alturaPadre: 180, alturaMadre: 165, sexoHijo: 'm' });
    // (180+165+13)/2 = 179
    expect(r.tallaDiana).toBe('179.0 cm');
  });

  it('hija mujer: (padre + madre - 13) / 2', () => {
    const r = estaturaAdultaHijo({ alturaPadre: 180, alturaMadre: 165, sexoHijo: 'f' });
    // (180+165-13)/2 = 166
    expect(r.tallaDiana).toBe('166.0 cm');
  });

  it('throw si altura padre fuera de rango', () => {
    expect(() =>
      estaturaAdultaHijo({ alturaPadre: 100, alturaMadre: 165, sexoHijo: 'm' })
    ).toThrow();
  });
});

// =====================================================
// 15. Kg a libras / onzas (conversor)
// =====================================================
describe('kgLibras', () => {
  it('1 kg = 2.20462 lb', () => {
    const r = kgLibras({ modo: 'kg-a-lb', peso: 1 });
    expect(r.resultado).toContain('2,2046');
  });

  it('100 lb a kg', () => {
    const r = kgLibras({ modo: 'lb-a-kg', peso: 100 });
    // 100 / 2.20462 ≈ 45.359
    expect(r.resultado).toContain('45,35');
  });

  it('1 kg = 35.274 oz', () => {
    const r = kgLibras({ modo: 'kg-a-oz', peso: 1 });
    expect(r.resultado).toContain('35,274');
  });

  it('throw si peso negativo', () => {
    expect(() => kgLibras({ modo: 'kg-a-lb', peso: -5 })).toThrow();
  });
});

// =====================================================
// 16. Cano estructural (peso por metro lineal)
// =====================================================
describe('canoEstructuralPesoMl', () => {
  it('cano redondo 50mm x 2mm acero', () => {
    // π × 50 × 2 × 7850 / 1e6 = 2.466 kg/m
    const r = canoEstructuralPesoMl({
      tipoCano: 'redondo',
      medidaExteriorMm: 50,
      espesorMm: 2,
      largoMl: 6,
      cantidad: 1,
    });
    expect(r.pesoMl).toBeCloseTo(2.47, 1);
    expect(r.pesoBarra).toBeCloseTo(14.8, 0);
  });

  it('cano cuadrado 40x40 mm x 2mm', () => {
    // (2×(40+40) - 4×2) × 2 × 7850 / 1e6 = 152 × 2 × 7850 / 1e6 = 2.386 kg/m
    const r = canoEstructuralPesoMl({
      tipoCano: 'cuadrado',
      medidaExteriorMm: 40,
      espesorMm: 2,
      largoMl: 6,
      cantidad: 2,
    });
    expect(r.pesoMl).toBeCloseTo(2.39, 1);
    expect(r.pesoTotal).toBeCloseTo(r.pesoBarra * 2, 1);
  });

  it('throw si espesor >= medida/2', () => {
    expect(() =>
      canoEstructuralPesoMl({
        tipoCano: 'redondo',
        medidaExteriorMm: 10,
        espesorMm: 5,
      })
    ).toThrow();
  });
});

// =====================================================
// 17. Arboles para compensar CO2
// =====================================================
describe('arbolesCompensarCo2Huella', () => {
  it('mixto-nativo absorbe 22 kg/anio', () => {
    // 1 ton = 1000 kg / 22 = 46 arboles
    const r = arbolesCompensarCo2Huella({ toneladasCO2: 1, especie: 'mixto-nativo' });
    expect(r.arbolesNecesarios).toBe(46);
    expect(r.absorcionAplicada).toBe(22);
  });

  it('paulownia absorbe mas (40 kg)', () => {
    // 1 ton / 40 = 25 arboles
    const r = arbolesCompensarCo2Huella({ toneladasCO2: 1, especie: 'paulownia' });
    expect(r.arbolesNecesarios).toBe(25);
  });

  it('absorcion manual prevalece', () => {
    const r = arbolesCompensarCo2Huella({
      toneladasCO2: 1,
      especie: 'paulownia',
      absorcionArbol: 10,
    });
    expect(r.absorcionAplicada).toBe(10);
    expect(r.arbolesNecesarios).toBe(100);
  });

  it('throw si toneladas <= 0', () => {
    expect(() => arbolesCompensarCo2Huella({ toneladasCO2: 0 })).toThrow();
  });
});

// =====================================================
// 18. Consumo electrico (kWh/mes)
// =====================================================
describe('consumoElectrico', () => {
  it('1000W * 8h * 30 dias = 240 kWh/mes', () => {
    const r = consumoElectrico({ potenciaWatts: 1000, horasPorDia: 8, diasPorMes: 30 });
    expect(r.consumoKwhDia).toBe(8);
    expect(r.consumoKwhMes).toBe(240);
    expect(r.consumoAnualKwh).toBe(2880);
  });

  it('costo usa precio default si no se pasa', () => {
    const r = consumoElectrico({ potenciaWatts: 100, horasPorDia: 24 });
    // 100W * 24h = 2.4 kWh/dia * 30 = 72 kWh/mes * 55 = 3960
    expect(r.costoMensual).toBe(3960);
  });

  it('throw si horas fuera de 0-24', () => {
    expect(() => consumoElectrico({ potenciaWatts: 100, horasPorDia: 25 })).toThrow();
  });
});

// =====================================================
// 19. Bebidas para evento (litros por persona)
// =====================================================
describe('bebidasEventoLitrosPorPersona', () => {
  it('20 personas, 4 hs, mixto, intermedia', () => {
    const r = bebidasEventoLitrosPorPersona({
      personas: 20,
      duracionHoras: 4,
      tipoBebida: 'mixto',
      temporada: 'intermedia',
    });
    expect(r.litrosTotales).toBeGreaterThan(0);
    expect(r.botellasVino).toBeGreaterThan(0);
    expect(r.litrosCerveza).toBeGreaterThan(0);
  });

  it('verano consume mas que invierno', () => {
    const verano = bebidasEventoLitrosPorPersona({
      personas: 10,
      duracionHoras: 3,
      tipoBebida: 'mixto',
      temporada: 'verano',
    });
    const invierno = bebidasEventoLitrosPorPersona({
      personas: 10,
      duracionHoras: 3,
      tipoBebida: 'mixto',
      temporada: 'invierno',
    });
    expect(verano.litrosTotales).toBeGreaterThan(invierno.litrosTotales);
  });

  it('throw si 0 personas', () => {
    expect(() =>
      bebidasEventoLitrosPorPersona({ personas: 0, duracionHoras: 3 })
    ).toThrow();
  });
});

// =====================================================
// 20. Aniversario de pareja (dias juntos)
// =====================================================
describe('aniversarioPareja', () => {
  it('calcula dias para fecha pasada conocida', () => {
    // 100 dias antes de hoy → totalDias = 100
    const hace100 = new Date();
    hace100.setHours(0, 0, 0, 0);
    hace100.setDate(hace100.getDate() - 100);
    const iso = `${hace100.getFullYear()}-${String(hace100.getMonth() + 1).padStart(2, '0')}-${String(
      hace100.getDate()
    ).padStart(2, '0')}`;

    const r = aniversarioPareja({ fechaInicio: iso });
    expect(r.totalDias).toBe(100);
    expect(r.totalSemanas).toBe(14);
    expect(r.totalHoras).toBe(2400);
  });

  it('throw si fecha futura', () => {
    expect(() => aniversarioPareja({ fechaInicio: '2099-01-01' })).toThrow();
  });

  it('throw si fecha invalida', () => {
    expect(() => aniversarioPareja({ fechaInicio: 'abc' })).toThrow();
  });
});

// =====================================================
// 21. Video bitrate -> tamano archivo (bonus)
// =====================================================
describe('videoBitrateTamanoArchivo', () => {
  it('10 min de video 8 Mbps + audio 192 kbps', () => {
    // video: 8 * 600 / 8 = 600 MB. audio: 0.192 * 600 / 8 = 14.4 MB. total 614.4
    const r = videoBitrateTamanoArchivo({
      duracionMinutos: 10,
      bitrateVideoMbps: 8,
      bitrateAudioKbps: 192,
    });
    expect(r.tamanoVideoMb).toBeCloseTo(600, 0);
    expect(r.tamanoAudioMb).toBeCloseTo(14.4, 1);
    expect(r.tamanoMb).toBeCloseTo(614.4, 1);
  });

  it('throw si bitrate video 0', () => {
    expect(() =>
      videoBitrateTamanoArchivo({ duracionMinutos: 5, bitrateVideoMbps: 0 })
    ).toThrow();
  });
});

// =====================================================
// 22. Millas LATAM por destino
// =====================================================
describe('millasLatamDestino', () => {
  it('Miami ida-vuelta economy: 50.000 millas', () => {
    const r = millasLatamDestino({
      destino: 'miami',
      cabina: 'economy',
      tipoViaje: 'ida-vuelta',
    });
    expect(r.millasRequeridas).toBe(50_000);
  });

  it('business pisa el slot mas alto', () => {
    const r = millasLatamDestino({
      destino: 'madrid',
      cabina: 'business',
      tipoViaje: 'ida-vuelta',
    });
    expect(r.millasRequeridas).toBe(150_000);
  });

  it('throw destino invalido', () => {
    expect(() =>
      millasLatamDestino({ destino: 'marte', cabina: 'economy', tipoViaje: 'ida' })
    ).toThrow();
  });
});

// =====================================================
// 23. Propina por pais (cultural)
// =====================================================
describe('propinaPais', () => {
  it('Argentina: 10% sobre la cuenta', () => {
    const r = propinaPais({ pais: 'argentina', montoCuenta: 10_000 });
    expect(r.porcentaje).toBe(10);
    expect(r.propinaRecomendada).toBe(1_000);
  });

  it('Japon: 0% (no se deja propina)', () => {
    const r = propinaPais({ pais: 'japon', montoCuenta: 5_000 });
    expect(r.porcentaje).toBe(0);
    expect(r.propinaRecomendada).toBe(0);
  });

  it('USA: 18% (mas alto que el resto)', () => {
    const r = propinaPais({ pais: 'usa', montoCuenta: 100 });
    expect(r.porcentaje).toBe(18);
    expect(r.propinaRecomendada).toBe(18);
  });

  it('throw pais invalido', () => {
    expect(() => propinaPais({ pais: 'xx', montoCuenta: 100 })).toThrow();
  });
});

// =====================================================
// 24. Stop motion FPS / tiempo
// =====================================================
describe('stopMotionFpsTiempo', () => {
  it('60 seg a 12 fps = 720 fotos', () => {
    const r = stopMotionFpsTiempo({ duracion: 60, fps: 12, minPorFoto: 0.5, mbPorFoto: 5 });
    expect(r.totalFotos).toBe('720 fotos');
    expect(r.fluidez).toMatch(/12 fps/);
    expect(r.espacioDisco).toMatch(/GB$/);
  });

  it('throw si algun campo es 0', () => {
    expect(() =>
      stopMotionFpsTiempo({ duracion: 0, fps: 12, minPorFoto: 0.5, mbPorFoto: 5 })
    ).toThrow();
  });
});
