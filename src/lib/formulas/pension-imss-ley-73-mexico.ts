/**
 * Pensión IMSS Ley 73 (cesantía en edad avanzada / vejez) — LSS 1973.
 * Cuantía básica + incrementos anuales (tabla Art. 167), asignaciones familiares (Art. 164),
 * tope 100% del salario promedio (Art. 169), factor por edad (Art. 171),
 * incremento del 11% (Decreto DOF 20-dic-2001) y pensión mínima (Art. 168).
 */
import { MEXICO_2026, fmtMXN } from '../data/mexico-2026.ts';

/** Decreto DOF 20-dic-2001: las pensiones de cesantía/vejez Ley 73 se incrementan 11% al determinarse. */
const FACTOR_DECRETO_2001 = 1.11;
/** La pensión mínima publicada por el IMSS se mensualiza con 365/12 días. */
const DIAS_MES_OFICIAL = 365 / 12;

export interface Inputs {
  salarioPromedio: number;        // salario MENSUAL promedio de las últimas 250 semanas
  semanasCotizadas: number;
  edadRetiro?: string | number;   // 60..65
  conyuge?: string;               // 'si' | 'no'
  hijos?: number | string;        // hijos <16 años (o estudiantes hasta 25)
}

export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const r2 = (n: number) => Math.round(n * 100) / 100;

export function compute(i: Inputs): Outputs {
  const { ley73, uma, salarioMinimo } = MEXICO_2026;

  const salario = Number(i.salarioPromedio) || 0;
  if (salario <= 0) throw new Error('Ingresa tu salario mensual promedio de las últimas 250 semanas');
  const semanas = Math.floor(Number(i.semanasCotizadas) || 0);
  if (semanas <= 0) throw new Error('Ingresa tus semanas cotizadas en el IMSS');

  const edadNum = Math.floor(Number(i.edadRetiro) || 0);
  const edad = ley73.factorEdad[edadNum] !== undefined ? edadNum : 60;
  const factorEdad = ley73.factorEdad[edad];
  const conConyuge = String(i.conyuge ?? 'no') === 'si';
  const hijosRaw = i.hijos as any;
  const hijos = hijosRaw === '' || hijosRaw === null || hijosRaw === undefined
    ? 0
    : Math.max(0, Math.floor(Number(hijosRaw) || 0));

  // Pensión mínima garantizada Ley 73 (Art. 168 LSS-73): 1 salario mínimo mensual, +11% del decreto.
  const pensionMinima = salarioMinimo.generalDiario * DIAS_MES_OFICIAL * FACTOR_DECRETO_2001;

  // Requisito: 500 semanas cotizadas (Art. 138 LSS-73).
  if (semanas < ley73.semanasMinimas) {
    const faltan = ley73.semanasMinimas - semanas;
    return {
      pensionMensual: fmtMXN(0),
      cuantiaBasica: fmtMXN(0),
      incrementos: fmtMXN(0),
      asignaciones: fmtMXN(0),
      detalle: `Con ${semanas} semanas cotizadas todavía no cumples el requisito mínimo de ${ley73.semanasMinimas} semanas de la Ley 73: te faltan ${faltan} semanas (~${Math.ceil(faltan / 52 * 12)} meses de cotización). Sin ese mínimo no hay pensión por cesantía o vejez, aunque puedes seguir cotizando (o inscribirte en Modalidad 40) para completarlas.`,
      _insight: {
        title: 'Aún no alcanzas las 500 semanas',
        text: `Te faltan **${faltan} semanas** para llegar a las **${ley73.semanasMinimas}** que exige la Ley 73. Cada semana extra después de las 500 además aumenta tu pensión, así que conviene seguir cotizando más allá del mínimo.`,
        tone: 'warn',
        icon: '⚠️',
      },
    };
  }

  // Salario promedio diario, topado a 25 UMA (Art. 33 LSS-73 / criterio vigente en UMA).
  const salarioDiario = salario / salarioMinimo.factorMensual;
  const topeDiario = uma.diaria * ley73.topeSalarioUmas;
  const diarioTopado = Math.min(salarioDiario, topeDiario);
  const mensualTopado = diarioTopado * salarioMinimo.factorMensual;
  const topado = salarioDiario > topeDiario;

  // Renglón de la tabla del Art. 167 según el salario en veces la UMA.
  const veces = diarioTopado / uma.diaria;
  let fila = ley73.tablaArt167[ley73.tablaArt167.length - 1];
  for (const f of ley73.tablaArt167) {
    if (veces <= f[0]) { fila = f; break; }
  }
  const [, cuantiaPct, incrementoPct] = fila;

  // Cuantía básica anual prorrateada a mes + incrementos por cada 52 semanas arriba de 500.
  const cuantiaBasica = cuantiaPct * mensualTopado;
  const aniosExcedentes = Math.floor((semanas - ley73.semanasMinimas) / 52);
  const incrementos = aniosExcedentes * incrementoPct * mensualTopado;
  const base = cuantiaBasica + incrementos;

  // Asignaciones familiares (Art. 164): esposa(o) 15%, cada hijo 10%; sin dependientes, ayuda asistencial 15%.
  const asigConyuge = conConyuge ? base * ley73.asignaciones.esposa : 0;
  const asigHijos = hijos * base * ley73.asignaciones.hijo;
  const sinDependientes = !conConyuge && hijos === 0;
  const ayudaAsistencial = sinDependientes ? base * ley73.asignaciones.ayudaAsistencial : 0;
  const asignaciones = asigConyuge + asigHijos + ayudaAsistencial;

  // Tope del Art. 169: la pensión con asignaciones no puede exceder el 100% del salario promedio.
  const totalCapped = Math.min(base + asignaciones, mensualTopado);

  // Factor por edad de retiro (cesantía, Art. 171; vejez a los 65 = 100%) y +11% del decreto de 2001.
  const conEdad = totalCapped * factorEdad;
  const conDecreto = conEdad * FACTOR_DECRETO_2001;

  // Piso del Art. 168: nunca menos que la pensión mínima.
  const minimaAplica = conDecreto < pensionMinima;
  const pension = Math.max(conDecreto, pensionMinima);

  const tasaReemplazo = (pension / Math.min(salario, mensualTopado)) * 100;

  const _insight = {
    title: minimaAplica ? 'Te corresponde la pensión mínima garantizada' : 'Tu pensión estimada por Ley 73',
    text: minimaAplica
      ? `El cálculo de la tabla del Art. 167 da **${fmtMXN(conDecreto)}**, pero la Ley 73 garantiza un piso de **${fmtMXN(pensionMinima)}** al mes en 2026 (un salario mínimo + 11%, Art. 168 LSS-73). Cobrarías la mínima, que además sube cada año con el salario mínimo.`
      : `Con **${semanas.toLocaleString('es-MX')} semanas** y un salario promedio de **${fmtMXN(salario)}**, tu pensión estimada es **${fmtMXN(pension)}** al mes a los ${edad} años (factor ${Math.round(factorEdad * 100)}%${topado ? ', salario topado a 25 UMA' : ''}). Equivale a un ${tasaReemplazo.toFixed(0)}% de tu salario promedio${edad < 65 ? `; si esperas a los 65 cobras el 100% del cálculo` : ''}.`,
    tone: minimaAplica ? 'warn' : 'good',
    icon: '👴',
  };

  // Composición de la pensión: componentes escalados al monto final para que el donut sume.
  const escala = totalCapped > 0 ? (conEdad / (base + asignaciones)) * FACTOR_DECRETO_2001 : 0;
  const slices = [
    { label: 'Cuantía básica', value: r2(cuantiaBasica * escala) },
    { label: 'Incrementos por semanas', value: r2(incrementos * escala) },
    { label: 'Asignaciones familiares', value: r2(asignaciones * escala) },
  ].filter((s) => s.value > 0);
  if (minimaAplica) slices.push({ label: 'Ajuste a pensión mínima', value: r2(pension - conDecreto) });

  const _chart = {
    type: 'doughnut',
    slices,
    prefix: '$',
    centerValue: fmtMXN(pension),
    centerLabel: 'Pensión mensual',
    ariaLabel: `Pensión mensual estimada de ${fmtMXN(pension)} compuesta por cuantía básica, incrementos por semanas cotizadas y asignaciones familiares.`,
  };

  return {
    pensionMensual: fmtMXN(pension),
    cuantiaBasica: fmtMXN(cuantiaBasica),
    incrementos: `${fmtMXN(incrementos)} (${aniosExcedentes} años extra de cotización)`,
    asignaciones: fmtMXN(asignaciones),
    detalle: `Salario promedio ${topado ? `topado a 25 UMA: ${fmtMXN(mensualTopado)}` : fmtMXN(salario)} (${veces.toFixed(2)} UMA) → cuantía básica ${(cuantiaPct * 100).toFixed(2)}% = ${fmtMXN(cuantiaBasica)} + ${aniosExcedentes} incrementos de ${(incrementoPct * 100).toFixed(3)}% = ${fmtMXN(incrementos)} + asignaciones ${fmtMXN(asignaciones)} → × ${Math.round(factorEdad * 100)}% (retiro a los ${edad}) × 1.11 (decreto 2001) = ${fmtMXN(conDecreto)}${minimaAplica ? ` → se eleva a la pensión mínima de ${fmtMXN(pensionMinima)}` : ''}.`,
    _insight,
    _chart,
  };
}
