/**
 * Modalidad 40 del IMSS — Continuación Voluntaria en el Seguro de Invalidez, Vejez y Muerte.
 * Estima la cuota mensual (tasa 2026 progresiva por nivel salarial), la aportación total,
 * y proyecta la pensión por Ley 73 con la MISMA metodología que pension-imss-ley-73-mexico.ts
 * (tabla del Art. 167, factor por edad Art. 171, +11% del decreto 2001, piso de pensión mínima).
 *
 * Toda la data 2026 sale de src/lib/data/mexico-2026.ts (UMA, salario mínimo, cuotas IMSS,
 * tabla Ley 73). NO hardcodear valores: hay un gate en prebuild.
 *
 * Tasa Modalidad 40 2026 = ramos que paga el afiliado (parte obrera + patronal):
 *   Retiro 2.000% + Invalidez y Vida 2.375% + Gastos médicos pensionados 1.425%
 *   + Cesantía y Vejez obrero 1.125% + Cesantía y Vejez patronal (tabla progresiva reforma 2020).
 * Esto reproduce al decimal las tasas publicadas: 10.075% (1 SM) → 12.951% → 13.286%
 * → 13.538% → 14.438% (4+ UMA). Sube cada año hasta 18.8% en 2030.
 */
import { MEXICO_2026, tasaCeavPatron2026, fmtMXN } from '../data/mexico-2026.ts';

/** Decreto DOF 20-dic-2001: las pensiones de cesantía/vejez Ley 73 se incrementan 11%. */
const FACTOR_DECRETO_2001 = 1.11;
/** La pensión mínima Ley 73 se mensualiza con 365/12 días (igual que pension-imss-ley-73-mexico.ts). */
const DIAS_MES_OFICIAL = 365 / 12;

export interface Inputs {
  salario_base_cotizacion_uma: number;
  anos_aportacion_previos: number;
  semanas_previas: number;
  anos_modalidad_40: number;
  edad_actual: number;
  incremento_anual_salario: number;
}

export interface Outputs {
  tasa_aportacion: number;
  salario_base_mensual: number;
  cuota_mensual_inicial: number;
  cuota_mensual_promedio: number;
  aportacion_total: number;
  semanas_totales_al_cierre: number;
  edad_pension: number;
  pension_mensual_ley73: number;
  pension_garantizada_minima: number;
  meses_recuperar_aportacion: number;
  mensaje_recomendacion: string;
  _insight?: any;
  _chart?: any;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Pensión mensual Ley 73 a partir de un salario MENSUAL promedio y semanas cotizadas.
 * Réplica de pension-imss-ley-73-mexico.ts (mantener en sync): tabla Art. 167 + ayuda
 * asistencial 15% (caso sin dependientes) + factor por edad + decreto 2001 + piso mínimo.
 */
function pensionLey73Mensual(salarioMensual: number, semanas: number, edad: number) {
  const { ley73, uma, salarioMinimo } = MEXICO_2026;
  const pensionMinima = salarioMinimo.generalDiario * DIAS_MES_OFICIAL * FACTOR_DECRETO_2001;

  if (semanas < ley73.semanasMinimas) {
    return { pension: 0, pensionMinima, cuantiaBasica: 0, incrementos: 0, ayudaAsistencial: 0, minimaAplica: false, escala: 0 };
  }

  const salarioDiario = salarioMensual / salarioMinimo.factorMensual;
  const topeDiario = uma.diaria * ley73.topeSalarioUmas;
  const diarioTopado = Math.min(salarioDiario, topeDiario);
  const mensualTopado = diarioTopado * salarioMinimo.factorMensual;

  const veces = diarioTopado / uma.diaria;
  let fila = ley73.tablaArt167[ley73.tablaArt167.length - 1];
  for (const f of ley73.tablaArt167) {
    if (veces <= f[0]) { fila = f; break; }
  }
  const [, cuantiaPct, incrementoPct] = fila;

  const cuantiaBasica = cuantiaPct * mensualTopado;
  const aniosExcedentes = Math.floor((semanas - ley73.semanasMinimas) / 52);
  const incrementos = aniosExcedentes * incrementoPct * mensualTopado;
  const base = cuantiaBasica + incrementos;

  // Caso sin dependientes (la calc no pide cónyuge/hijos): ayuda asistencial 15% (Art. 164/166).
  const ayudaAsistencial = base * ley73.asignaciones.ayudaAsistencial;
  const totalCapped = Math.min(base + ayudaAsistencial, mensualTopado);

  const factorEdad = ley73.factorEdad[edad] ?? ley73.factorEdad[60];
  const conEdad = totalCapped * factorEdad;
  const conDecreto = conEdad * FACTOR_DECRETO_2001;

  const minimaAplica = conDecreto < pensionMinima;
  const pension = Math.max(conDecreto, pensionMinima);
  const escala = base + ayudaAsistencial > 0 ? (conEdad / (base + ayudaAsistencial)) * FACTOR_DECRETO_2001 : 0;

  return { pension, pensionMinima, cuantiaBasica, incrementos, ayudaAsistencial, minimaAplica, escala };
}

export function compute(i: Inputs): Outputs {
  const { uma, imss } = MEXICO_2026;
  const pensionMinima = MEXICO_2026.salarioMinimo.generalDiario * DIAS_MES_OFICIAL * FACTOR_DECRETO_2001;

  const nUMA = Number(i.salario_base_cotizacion_uma);
  const errBase: Outputs = {
    tasa_aportacion: 0,
    salario_base_mensual: 0,
    cuota_mensual_inicial: 0,
    cuota_mensual_promedio: 0,
    aportacion_total: 0,
    semanas_totales_al_cierre: 0,
    edad_pension: 0,
    pension_mensual_ley73: 0,
    pension_garantizada_minima: r2(pensionMinima),
    meses_recuperar_aportacion: 0,
    mensaje_recomendacion: 'Elegí un salario base entre 1 y 25 UMA para ver tu proyección.',
    _insight: {
      title: 'Salario base fuera de rango',
      text: 'En Modalidad 40 podés cotizar entre **1 y 25 UMA**. Ajustá el valor para estimar tu cuota y tu pensión.',
      tone: 'warn',
      icon: '⚠️',
    },
  };
  if (!Number.isFinite(nUMA) || nUMA < 1 || nUMA > 25) return errBase;

  const anosModalidad = Math.max(1, Math.floor(Number(i.anos_modalidad_40) || 1));
  const incrementoPct = Math.max(0, Number(i.incremento_anual_salario) || 0);
  const edadActual = Math.floor(Number(i.edad_actual) || 0);
  const anosPrevios = Math.max(0, Number(i.anos_aportacion_previos) || 0);
  const semanasExtra = Math.max(0, Number(i.semanas_previas) || 0);

  // 1. Salario base de cotización (diario y mensual). El SBC mensual usa la UMA mensual (factor 30,4).
  const sbcDiario = nUMA * uma.diaria;
  const sbcMensual = nUMA * uma.mensual;

  // 2. Tasa Modalidad 40 2026 — suma de los ramos que paga el afiliado (obrero + patrón).
  //    La cesantía y vejez patronal es progresiva por nivel salarial (tabla reforma 2020).
  const tasaFija =
    imss.patron.retiro +                     // 2.000%
    imss.patron.invalidezVida +              // 1.750%
    imss.obrero.invalidezVida +              // 0.625%
    imss.patron.gastosMedicosPensionados +   // 1.050%
    imss.obrero.gastosMedicosPensionados +   // 0.375%
    imss.obrero.cesantiaVejez;               // 1.125%  → 6.925% fijo
  const tasaModalidad40 = tasaFija + tasaCeavPatron2026(sbcDiario);

  // 3. Cuota mensual inicial.
  const cuotaMensualInicial = sbcMensual * tasaModalidad40;

  // 4. Aportación total a lo largo de los años de Modalidad 40 (la UMA, y por ende la cuota,
  //    sube cada año ~inflación; el input lo modela). Cuota mensual promedio del período.
  let aportacionTotal = 0;
  for (let a = 0; a < anosModalidad; a++) {
    aportacionTotal += cuotaMensualInicial * Math.pow(1 + incrementoPct / 100, a) * 12;
  }
  const cuotaMensualPromedio = aportacionTotal / (anosModalidad * 12);

  // 5. Semanas cotizadas totales al cierre.
  const semanasPreviasTotal = anosPrevios * 52 + semanasExtra;
  const semanasNuevas = anosModalidad * 52;
  const semanasTotales = semanasPreviasTotal + semanasNuevas;

  // 6. Edad de pensión (Ley 73: cesantía desde 60 con factor reducido, vejez a 65 = 100%).
  const edadProyectada = edadActual + anosModalidad;
  const edadPension = Math.max(60, edadProyectada);
  const edadFactor = Math.min(Math.max(edadPension, 60), 65); // factor sólo definido 60..65

  // 7. Pensión Ley 73 proyectada con el salario base elegido y las semanas totales.
  const p = pensionLey73Mensual(sbcMensual, semanasTotales, edadFactor);
  const pensionMensual = p.pension;

  // 8. Meses de pensión para recuperar todo lo aportado en Modalidad 40 (recupero "puro").
  const mesesRecuperar = pensionMensual > 0 ? aportacionTotal / pensionMensual : 0;

  // 9. Mensaje + insight.
  let mensaje: string;
  let insight: any;
  if (semanasTotales < MEXICO_2026.ley73.semanasMinimas) {
    const faltan = MEXICO_2026.ley73.semanasMinimas - semanasTotales;
    mensaje = `Con ${Math.round(semanasTotales)} semanas todavía no llegás al mínimo de 500. Te faltan ${Math.round(faltan)} semanas para tener derecho a pensión por Ley 73.`;
    insight = {
      title: 'Aún no calificás para pensión',
      text: `Con **${Math.round(semanasTotales)} semanas** no llegás a las **500** que exige la Ley 73 (te faltan ${Math.round(faltan)}). Cotizá más años en Modalidad 40 antes de que la inversión te rinda.`,
      tone: 'warn',
      icon: '⚠️',
    };
  } else {
    mensaje = `Cuota ${fmtMXN(cuotaMensualInicial)}/mes (${(tasaModalidad40 * 100).toFixed(3)}% de ${fmtMXN(sbcMensual)}). Pensión proyectada ${fmtMXN(pensionMensual)}/mes a los ${edadPension} años: recuperás lo aportado en ~${Math.round(mesesRecuperar)} meses de pensión.`;
    const tone = mesesRecuperar > 0 && mesesRecuperar <= 60 ? 'good' : 'warn';
    insight = {
      title: p.minimaAplica ? 'Te corresponde la pensión mínima garantizada' : 'Modalidad 40 te conviene',
      text: p.minimaAplica
        ? `El cálculo da una pensión que cae bajo el piso, así que cobrarías la **pensión mínima garantizada Ley 73 de ${fmtMXN(pensionMinima)}/mes** (un salario mínimo + 11%, 2026). Para superar el mínimo conviene elegir más UMA o sumar más semanas.`
        : `Aportás **${fmtMXN(aportacionTotal)}** en ${anosModalidad} ${anosModalidad === 1 ? 'año' : 'años'} y proyectás una pensión de **${fmtMXN(pensionMensual)}/mes** a los ${edadPension} años (factor ${Math.round((MEXICO_2026.ley73.factorEdad[edadFactor] ?? 0.75) * 100)}%). Recuperás todo lo aportado en ~**${Math.round(mesesRecuperar)} meses** de pensión y desde ahí es ganancia.`,
      tone,
      icon: p.minimaAplica ? '👴' : '📈',
    };
  }

  // 10. Gráfico: composición de la pensión mensual (escalada al monto final, igual que la calc Ley 73).
  let chart: any;
  if (pensionMensual > 0 && !p.minimaAplica) {
    const slices = [
      { label: 'Cuantía básica', value: r2(p.cuantiaBasica * p.escala) },
      { label: 'Incrementos por semanas', value: r2(p.incrementos * p.escala) },
      { label: 'Ayuda asistencial', value: r2(p.ayudaAsistencial * p.escala) },
    ].filter((s) => s.value > 0);
    chart = {
      type: 'doughnut',
      slices,
      prefix: '$',
      centerValue: fmtMXN(pensionMensual),
      centerLabel: 'Pensión mensual',
      ariaLabel: `Pensión mensual proyectada de ${fmtMXN(pensionMensual)} por Modalidad 40, compuesta por cuantía básica, incrementos por semanas y ayuda asistencial.`,
    };
  } else if (pensionMensual > 0) {
    chart = {
      type: 'gauge',
      value: r2(pensionMensual),
      min: 0,
      max: r2(Math.max(pensionMensual * 1.5, pensionMinima * 2)),
      prefix: '$',
      label: 'Pensión mínima garantizada',
      ariaLabel: `Pensión mínima garantizada Ley 73 de ${fmtMXN(pensionMensual)} al mes.`,
    };
  }

  return {
    tasa_aportacion: r2(tasaModalidad40 * 100),
    salario_base_mensual: r2(sbcMensual),
    cuota_mensual_inicial: r2(cuotaMensualInicial),
    cuota_mensual_promedio: r2(cuotaMensualPromedio),
    aportacion_total: r2(aportacionTotal),
    semanas_totales_al_cierre: Math.round(semanasTotales),
    edad_pension: edadPension,
    pension_mensual_ley73: r2(pensionMensual),
    pension_garantizada_minima: r2(pensionMinima),
    meses_recuperar_aportacion: Math.round(mesesRecuperar * 10) / 10,
    mensaje_recomendacion: mensaje,
    _insight: insight,
    _chart: chart,
  };
}
