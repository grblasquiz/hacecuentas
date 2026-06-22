/**
 * Datos fiscales y laborales de REPÚBLICA DOMINICANA 2026 — tabla maestra única.
 * Moneda: peso dominicano (DOP, "RD$").
 * Fuentes: DGII, TSS, Ministerio de Trabajo (Código de Trabajo Ley 16-92),
 *          Comité Nacional de Salarios (CNS), Banco Central de la R. D. (BCRD).
 * Verificado 2026-06-22.
 *
 * Hechos load-bearing (no romper sin re-verificar):
 *  - DIVISOR UNIVERSAL DE NÓMINA = 23,83 días/mes (191 h/mes). Aparece en TODO
 *    cálculo laboral dominicano (cesantía, preaviso, vacaciones, regalía, horas
 *    extra). Sale del Reglamento 258-93, NO del Código de Trabajo, y es el divisor
 *    de la calculadora oficial del MT (calculo.mt.gob.do).
 *  - La escala del ISR está CONGELADA desde 2018 (Art. 327 Cód. Tributario exige
 *    ajuste anual por inflación, pero las leyes de presupuesto lo suspenden año a
 *    año). Resolución DGII DDG-AR1-2026-00001. Idéntica a la del calc ya vivo
 *    (src/lib/formulas/isr-republica-dominicana.ts) — mantener sincronizada.
 *  - TSS: los TOPES de cotización SE ACTUALIZARON en feb-2026 (salario mínimo
 *    cotizable RD$23.223 → SFS tope RD$232.230, AFP tope RD$464.460). Actualizar
 *    cuando el CNS/TSS emita una nueva resolución.
 *  - Regalía pascual (= aguinaldo / "doble sueldo"): salario anual ÷ 12, EXENTA de
 *    ISR y NO cotizable a TSS (Ley 87-01 + Res. 72-03 CNSS). No descontar TSS.
 */

/** Vigencia del dato (YYYY-MM-DD) — usada por el sello de frescura a nivel dato (src/lib/data-freshness.ts). */
export const DATA_AS_OF = '2026-06-22';

export const REPUBLICA_DOMINICANA_2026 = {
  anio: 2026,
  moneda: 'DOP',
  simbolo: 'RD$',

  // ───────────────────────── NÓMINA: DIVISOR UNIVERSAL ─────────────────────────
  // salario diario = salario mensual ÷ 23,83  ·  hora = salario mensual ÷ 191
  // (jornada de 44 h / 5,5 días: 5,5 × 52 ÷ 12 = 23,83 días/mes). Reglamento 258-93.
  divisorDiario: 23.83,
  horasMensuales: 191,

  // ───────────────────────── CAMBIARIO (USD/DOP, EUR/DOP) ─────────────────────────
  // Tasas de referencia. CAMBIAN A DIARIO — actualizar (o reemplazar con live data,
  // p. ej. dolarapi tiene DOP, o InfoDolar.com.do que agrega bancos).
  // Fuentes: BCRD (https://www.bancentral.gov.do/a/d/2538-mercado-cambiario), InfoDolar RD.
  fx: {
    usdCompra: 58.18,          // RD$/USD — snapshot 22-jun-2026 (BCRD spot). ⚠️ ACTUALIZAR
    usdVenta: 58.70,           // RD$/USD — snapshot 22-jun-2026 (BCRD spot). ⚠️ ACTUALIZAR
    usdMid: 58.44,             // promedio compra/venta — para conversiones. ⚠️ ACTUALIZAR
    eurMid: 67.1,              // RD$/EUR — snapshot 22-jun-2026. ⚠️ ESTIMADO/VERIFICAR + ACTUALIZAR
    fecha: '2026-06-22',
    // Tendencia: el DOP se deprecia ~8% interanual de forma ordenada (sin saltos).
  },

  // ───────────────────────── SALARIO MÍNIMO 2026 (por sector) ─────────────────────────
  // R. D. NO tiene un salario mínimo único: lo fija el CNS por sector vía resolución.
  // Casi todos los aumentos 2025-2026 fueron en DOS fases. Montos MENSUALES en RD$.
  // Fuentes: CNS (Resol. CNS-01/03/04-2025), EY, Presidencia, Diario Libre, Hoy.
  salarioMinimo: {
    // Sector privado NO sectorizado (TSS) — el "salario mínimo general".
    // Resolución CNS-01-2025 (26-feb-2025). Vigente desde 1-FEB-2026 (2ª fase, +8%).
    noSectorizado: {
      grande: 29_988.00,       // empresas grandes (151+ trab. o ventas > RD$202M/año)
      mediana: 27_489.60,      // medianas (51–150 trab. o ventas 54M–202M)
      pequena: 18_421.20,      // pequeñas (11–50 trab. o ventas 8M–54M)
      micro: 16_993.20,        // micro (≤10 trab. o ventas ≤ RD$8M/año)
      vigilantesSeguridad: 24_633.00, // vigilantes/guardianes (seguridad privada)
      campoPorDia: 714.60,     // trabajadores del campo, jornada 8 h (POR DÍA)
    },
    // Umbrales de clasificación de la resolución salarial (números redondos
    // CNS-01-2025; distintos de los topes MIPYME indexados del MICM). Se sube de
    // categoría si se EXCEDE cualquiera de los dos parámetros (trab. o ventas).
    clasificacion: {
      grande:  { trabajadoresDesde: 151, ventasAnualesDesde: 202_000_000 },
      mediana: { trabajadores: [51, 150], ventasAnuales: [54_000_001, 202_000_000] },
      pequena: { trabajadores: [11, 50],  ventasAnuales: [8_000_001, 54_000_000] },
      micro:   { trabajadoresHasta: 10,   ventasAnualesHasta: 8_000_000 },
    },
    // Zonas francas (Resol. CNS-03-2025). Uniforme (no varía por tamaño).
    zonasFrancas: 20_875.00,   // desde 1-jun-2026 (2ª fase). Jun-2025→may-2026: 18.781.
    // Hotelería / turismo / gastronomía (Resol. CNS-04-2025), desde 1-jun-2026.
    hoteleria: {
      hotelesCasinosGrande: 21_840.00,    // hoteles y casinos, 151+ empleados
      hotelesCasinosPequeno: 18_409.30,   // hoteles y casinos, hasta 150 empleados
      restaurantesGrande: 21_000.00,      // restaurantes/gastronomía, 151+ empleados
      restaurantesPequeno: 17_701.25,     // restaurantes/gastronomía, hasta 150 ⚠️ VERIFICAR (Alegra: 17.921,78)
      // El 10% por servicio (propina legal) NO es salario ni computa para prestaciones.
    },
    // Construcción: se fija por ocupación (a destajo o mensual), no un monto único.
    construccion: {
      operadoresMaquinaPesada: 27_000.00, // Resol. CNS-02-2026 (abr-2026, +15,5%)
      ayudantesOperadores: 13_500.00,     // Resol. CNS-02-2026
      // Oficios a destajo (albañil, varillero, plomero, carpintero, electricista,
      // pintor, peón): tarifas por día/tarea NO incluidas. ⚠️ VERIFICAR en PDFs CNS-2022/CODIA.
    },
    // Sector público: sin mínimo legal vinculante/actualizado. Cifra de referencia
    // RD$10.000/mes (la fija el Poder Ejecutivo, estática). ⚠️ VERIFICAR fecha (2016 vs 2019).
    publicoReferencia: 10_000.00,
  },

  // ───────────────────────── TSS (SEGURIDAD SOCIAL) ─────────────────────────
  // Descuentos del TRABAJADOR (se restan de la boleta). Total empleado = 5,91%.
  // Aportes patronales (no se descuentan): SFS 7,09% + AFP 7,10% + SRL 1,1–1,3%
  // + Fondo de Solidaridad 0,40% (dentro de pensiones). (Aparte, no-TSS: INFOTEP
  // 1% nómina a cargo del empleador + 0,5% sobre bonificaciones a cargo del empleado.)
  // Base: salario mínimo cotizable nacional RD$23.223/mes (Resol. TSS 01-2025, feb-2026).
  // Fuentes: TSS (tss.gob.do), SISALRIL, SIPEN, Presidencia.
  tss: {
    afpEmpleado: 0.0287,       // AFP (pensiones), descuento del trabajador — 2,87%
    sfsEmpleado: 0.0304,       // SFS (salud, SeNaSa/ARS), descuento del trabajador — 3,04%
    totalEmpleado: 0.0591,     // suma de descuentos del trabajador — 5,91%
    afpPatronal: 0.0710,       // aporte patronal a pensiones (referencia)
    sfsPatronal: 0.0709,       // aporte patronal a salud (referencia)
    srlPatronal: 0.0120,       // Seguro de Riesgos Laborales — 100% empleador (1,1%–1,3%)
    solidaridadPatronal: 0.0040, // Fondo de Solidaridad Social (dentro del aporte de pensiones)
    // Salario cotizable máximo (topes), feb-2026. Sobre el exceso NO se cotiza.
    salarioMinimoCotizable: 23_223.00, // base que multiplica los topes
    topeSfs: 232_230.00,       // 10 salarios mínimos cotizables (salud)
    topeAfp: 464_460.00,       // 20 salarios mínimos cotizables (pensiones)
    topeSrl: 92_892.00,        // 4 salarios mínimos cotizables (riesgos laborales)
  },

  // ───────────────────────── ISR — PERSONAS FÍSICAS ─────────────────────────
  // Escala ANUAL (Art. 296 Cód. Tributario). CONGELADA desde 2018. DGII.
  // Para retención mensual: anualizar base (×12), aplicar escala, dividir ÷12.
  // Base del ISR = salario − AFP − SFS (ambos descuentos son deducibles).
  // Exención anual RD$416.220 (= RD$34.685/mes). Idéntica al calc ISR ya vivo.
  isr: {
    exencionAnual: 416_220,
    // Límite superior del tramo (RD$), cuota fija acumulada y tasa marginal.
    // Impuesto = cuotaFija + (baseAnual − desde) × tasa.
    tramos: [
      { desde: 0,        hasta: 416_220,   cuotaFija: 0,      tasa: 0.00 },
      { desde: 416_220,  hasta: 624_329,   cuotaFija: 0,      tasa: 0.15 },
      { desde: 624_329,  hasta: 867_123,   cuotaFija: 31_216, tasa: 0.20 },
      { desde: 867_123,  hasta: Infinity,  cuotaFija: 79_776, tasa: 0.25 },
    ],
  },

  // ───────────────────────── ITBIS (IVA dominicano) ─────────────────────────
  // Ley 253-12. General 18%; reducida 16% (yogurt/mantequilla, café, grasas y
  // aceites comestibles, azúcares, cacao/chocolate); exentos 0% (canasta básica,
  // medicinas, salud, educación, transporte, alquiler de vivienda, exportaciones).
  // Fuente: DGII (dgii.gov.do).
  itbis: 0.18,
  itbisReducido: 0.16,

  // ───────────────────────── LABORAL (Código de Trabajo, Ley 16-92) ─────────────────────────
  laboral: {
    // AUXILIO DE CESANTÍA (Art. 80) — días de salario ordinario.
    // Los dos primeros tramos son SUMAS FIJAS (no "por año"). El "por cada año"
    // aplica solo a 21 y 23 días. Fracción de año > 3 meses se paga proporcional.
    cesantia: [
      { desdeMeses: 3,  hastaMeses: 6,        dias: 6,  porAnio: false }, // 3–6 meses: 6 días (fijo)
      { desdeMeses: 6,  hastaMeses: 12,       dias: 13, porAnio: false }, // 6m–1 año: 13 días (fijo)
      { desdeMeses: 12, hastaMeses: 60,       dias: 21, porAnio: true },  // 1–5 años: 21 días/año
      { desdeMeses: 60, hastaMeses: Infinity, dias: 23, porAnio: true },  // +5 años: 23 días/año
    ],
    // PREAVISO (Art. 76) — días de salario por antigüedad. <3 meses: sin derecho.
    preaviso: [
      { desdeMeses: 3,  hastaMeses: 6,        dias: 7 },  // 3–6 meses: 7 días
      { desdeMeses: 6,  hastaMeses: 12,       dias: 14 }, // 6m–1 año: 14 días
      { desdeMeses: 12, hastaMeses: Infinity, dias: 28 }, // +1 año: 28 días
    ],
    // VACACIONES (Art. 177) — días LABORABLES de salario ordinario, desde 1 año.
    vacaciones: {
      menos5anios: 14,         // ≥1 año y <5 años: 14 días
      desde5anios: 18,         // ≥5 años: 18 días
      // Proporcionales (Art. 180) si no completa el año, contrato indefinido:
      proporcional: { 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 11, 11: 12 }, // meses → días
    },
    // BONIFICACIÓN / participación en beneficios (Art. 223): 10% de las utilidades
    // netas anuales, con TOPE por trabajador. Pago entre 90 y 120 días tras el cierre.
    // Exentas: zonas francas; agrícolas/industriales/forestales/mineras en sus
    // primeros 3 años; agrícolas con capital ≤ RD$1.000.000.
    bonificacion: {
      porcentajeUtilidades: 0.10,
      topeDiasMenos3anios: 45, // trabajador con < 3 años: tope 45 días de salario
      topeDias3anios: 60,      // trabajador con ≥ 3 años: tope 60 días de salario
    },
    // REGALÍA PASCUAL / salario de Navidad / "doble sueldo" (Art. 219, Ley 16-92).
    // = salario ordinario devengado ene–dic ÷ 12 (proporcional si año parcial).
    // Pago antes del 20-dic. EXENTA de ISR y NO cotizable a TSS. Tope: 5 salarios
    // mínimos. NO incluye horas extra, nocturnidad, participación ni propinas.
    regaliaPascual: {
      divisor: 12,
      topeSalariosMinimos: 5,
      exentaIsr: true,
      cotizaTss: false,
    },
    // HORAS EXTRA Y RECARGOS (Art. 203 y conexos). Tarifa hora = mensual ÷ 191.
    recargos: {
      extra44a68: 0.35,        // +35% para horas 44–68 por semana
      extraMas68: 1.00,        // +100% sobre las 68 h/semana
      diaFeriado: 1.00,        // +100% por trabajo en día feriado/festivo
      nocturno: 0.15,          // +15% por trabajo nocturno (9pm–7am); se aplica antes del recargo extra
      maxExtraTrimestre: 80,   // tope de 80 horas extra por trimestre
    },
  },
} as const;

/**
 * ISR anual de persona física a partir de la base gravable anual (ya en RD$,
 * tras descontar AFP+SFS si corresponde). Aplica la escala progresiva del Art. 296.
 * Devuelve el impuesto anual en RD$. Para retención mensual: dividir ÷12.
 */
export function isrAnual(baseGravableAnual: number): number {
  const base = Math.max(0, baseGravableAnual);
  if (base <= REPUBLICA_DOMINICANA_2026.isr.exencionAnual) return 0;
  for (const t of REPUBLICA_DOMINICANA_2026.isr.tramos) {
    if (base > t.desde && base <= t.hasta) {
      return t.cuotaFija + (base - t.desde) * t.tasa;
    }
  }
  return 0;
}

/**
 * Salario neto mensual de un empleado dominicano:
 *   neto = bruto − AFP(2,87%) − SFS(3,04%) − retención ISR mensual.
 * El ISR se calcula sobre la base anualizada (bruto − AFP − SFS) × 12, aplicando
 * la escala anual y dividiendo ÷12. AFP/SFS se topean al salario cotizable máximo.
 * Devuelve el desglose completo. (Reusar en calcs de salario neto / nómina.)
 */
export function salarioNetoDominicana(salarioBrutoMensual: number): {
  bruto: number; afp: number; sfs: number; tss: number;
  baseIsrMensual: number; isrMensual: number; neto: number;
} {
  const d = REPUBLICA_DOMINICANA_2026;
  const baseAfp = Math.min(salarioBrutoMensual, d.tss.topeAfp);
  const baseSfs = Math.min(salarioBrutoMensual, d.tss.topeSfs);
  const afp = baseAfp * d.tss.afpEmpleado;
  const sfs = baseSfs * d.tss.sfsEmpleado;
  const tss = afp + sfs;
  const baseIsrMensual = salarioBrutoMensual - tss; // AFP+SFS son deducibles del ISR
  const isrMensual = isrAnual(baseIsrMensual * 12) / 12;
  const neto = salarioBrutoMensual - tss - isrMensual;
  return { bruto: salarioBrutoMensual, afp, sfs, tss, baseIsrMensual, isrMensual, neto };
}

/**
 * Días de auxilio de cesantía (Art. 80) según la antigüedad en MESES.
 * Devuelve el total de días de salario ordinario (no el monto). Para los tramos
 * "por año" multiplica los días por los años cumplidos; los tramos fijos (6/13 días)
 * devuelven el monto fijo. Fracción > 3 meses se contempla en el último tramo.
 */
export function cesantiaDias(antiguedadMeses: number): number {
  const escala = REPUBLICA_DOMINICANA_2026.laboral.cesantia;
  const tramo = escala.find((t) => antiguedadMeses > t.desdeMeses && antiguedadMeses <= t.hastaMeses)
    ?? (antiguedadMeses > 60 ? escala[escala.length - 1] : undefined);
  if (!tramo) return 0; // < 3 meses: sin cesantía
  if (!tramo.porAnio) return tramo.dias; // suma fija
  const anios = Math.floor(antiguedadMeses / 12);
  return tramo.dias * anios;
}

/** Días de preaviso (Art. 76) según antigüedad en MESES. <3 meses: 0. */
export function preavisoDias(antiguedadMeses: number): number {
  const escala = REPUBLICA_DOMINICANA_2026.laboral.preaviso;
  const tramo = escala.find((t) => antiguedadMeses > t.desdeMeses && antiguedadMeses <= t.hastaMeses)
    ?? (antiguedadMeses > 12 ? escala[escala.length - 1] : undefined);
  return tramo ? tramo.dias : 0;
}

/** Salario diario dominicano: salario mensual ÷ 23,83 (divisor universal de nómina). */
export function salarioDiario(salarioMensual: number): number {
  return salarioMensual / REPUBLICA_DOMINICANA_2026.divisorDiario;
}

/** Valor de la hora ordinaria: salario mensual ÷ 191. */
export function valorHora(salarioMensual: number): number {
  return salarioMensual / REPUBLICA_DOMINICANA_2026.horasMensuales;
}

/**
 * Regalía pascual (salario de Navidad / "doble sueldo"): suma del salario ordinario
 * devengado en el año ÷ 12. Para un sueldo fijo y año completo equivale a un mes.
 * EXENTA de ISR y sin descuentos de TSS.
 */
export function regaliaPascual(salarioOrdinarioAnualDevengado: number): number {
  return salarioOrdinarioAnualDevengado / REPUBLICA_DOMINICANA_2026.laboral.regaliaPascual.divisor;
}

/**
 * Formatea un monto en pesos dominicanos con formato legal: punto para miles, coma
 * para decimales → "RD$ 29.988,00". Se usa 'de-DE' a propósito (mismo motivo que en
 * peru-2026.ts: el locale es-DO en Node emite formato estilo US "RD$ 29,988.00").
 */
export function fmtDOP(n: number): string {
  return 'RD$ ' + new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);
}

/** Convierte USD → DOP a la tasa media (mid) de referencia. */
export function usdToDop(usd: number): number {
  return usd * REPUBLICA_DOMINICANA_2026.fx.usdMid;
}

/** Convierte DOP → USD a la tasa media (mid) de referencia. */
export function dopToUsd(dop: number): number {
  return dop / REPUBLICA_DOMINICANA_2026.fx.usdMid;
}
