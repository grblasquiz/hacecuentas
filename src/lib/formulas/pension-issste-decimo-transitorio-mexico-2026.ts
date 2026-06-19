/**
 * Pensión ISSSTE — Artículo DÉCIMO TRANSITORIO (Ley del ISSSTE 2007).
 * Para trabajadores del sector público que cotizaban ANTES del 1-abr-2007 y optaron
 * por el régimen de reparto (no por las cuentas individuales de AFORE PENSIONISSSTE).
 *
 * La pensión se calcula sobre el SUELDO BÁSICO promedio del último año de cotización
 * × un porcentaje que depende del régimen aplicable:
 *
 *  1) Jubilación (Frac. II–III): 30 años de servicio (hombres) / 28 (mujeres) = 100% del SB,
 *     sujeta a la EDAD MÍNIMA que BAJA gradualmente (reforma DOF 24-jun-2025, que revirtió
 *     el escalonamiento creciente de la ley 2007 que llegaba a 60/58).
 *     Edad mínima 2026-2027: 58 hombres / 56 mujeres; baja a 57/55 (2028-2030), 56/54
 *     (2031-2033) y 55/53 (2034+).
 *  2) Retiro por edad y tiempo de servicios (Frac. IV): ≥60 años y ≥15 años de servicio →
 *     tabla 50% (15 años) … 95% (29 años); +2.5%/año hasta 24, +5%/año de 25 a 29.
 *  3) Cesantía en edad avanzada (Frac. V): ≥65 años y ≥10 años de servicio →
 *     40% (65) … 50% (70+).
 *
 * Tope del sueldo básico de cotización: 10 veces la UMA elevada al mes
 * (Art. 17 LISSSTE; jurisprudencia 2a./J. 200/2020 SCJN — son UMA, no salarios mínimos).
 * Piso: una pensión nunca puede ser menor a un salario mínimo (Frac. de garantía).
 *
 * Fuentes: Ley del ISSSTE (Art. 17 + Décimo Transitorio), reforma DOF 24-jun-2025,
 * PENSIONISSSTE, SCJN 2a./J.200/2020, INEGI (UMA 2026), CONASAMI (SM 2026).
 */
import { MEXICO_2026, fmtMXN } from '../data/mexico-2026.ts';

/** El sueldo básico de cotización se mensualiza con 30.4 días (factor IMSS/ISSSTE). */
const DIAS_MES = MEXICO_2026.salarioMinimo.factorMensual; // 30.4
/** Límite superior del sueldo básico: 10 veces la UMA (SCJN 2a./J. 200/2020, Art. 17 LISSSTE). */
const TOPE_UMA = 10;

/**
 * Tabla del Art. Décimo Transitorio, Frac. IV — pensión por edad y tiempo de servicios.
 * años de servicio → % del sueldo básico. (≥15 años, edad ≥60). 2.5%/año hasta 24, 5%/año 25-29.
 */
const TABLA_EDAD_SERVICIO: Record<number, number> = {
  15: 0.5, 16: 0.525, 17: 0.55, 18: 0.575, 19: 0.6, 20: 0.625,
  21: 0.65, 22: 0.675, 23: 0.7, 24: 0.725, 25: 0.75, 26: 0.8,
  27: 0.85, 28: 0.9, 29: 0.95,
};

/** Tabla Frac. V — cesantía en edad avanzada. edad → % del sueldo básico (≥65 años, ≥10 de servicio). */
const TABLA_CESANTIA: Record<number, number> = { 65: 0.4, 66: 0.42, 67: 0.44, 68: 0.46, 69: 0.48 };
const CESANTIA_MAX = 0.5; // 70 años o más

/**
 * Edad mínima para jubilarse con 30/28 años (régimen Décimo Transitorio).
 * Reforma DOF 24-jun-2025: 2026-2027 = 58/56 y BAJA gradualmente (57/55 en 2028, … 55/53 en 2034).
 */
const EDAD_MINIMA_JUBILACION_2026 = { hombre: 58, mujer: 56 };

export interface Inputs {
  sueldoBasico: number;         // sueldo básico MENSUAL promedio del último año de cotización
  aniosServicio: number;        // años de servicio cotizados al ISSSTE
  edad?: number | string;       // edad a la que se pensiona
  sexo?: string;                // 'hombre' | 'mujer' (determina años para 100% y edad mínima)
}

export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const r2 = (n: number) => Math.round(n * 100) / 100;

function pctEdadServicio(anios: number): number {
  if (anios >= 30) return 1;
  if (anios >= 29) return 0.95;
  if (anios < 15) return 0;
  const cap = Math.min(29, Math.floor(anios));
  return TABLA_EDAD_SERVICIO[cap] ?? 0;
}

function pctCesantia(edad: number): number {
  if (edad >= 70) return CESANTIA_MAX;
  return TABLA_CESANTIA[Math.floor(edad)] ?? 0.4;
}

export function compute(i: Inputs): Outputs {
  const { uma, salarioMinimo } = MEXICO_2026;

  const sueldo = Number(i.sueldoBasico) || 0;
  if (sueldo <= 0) throw new Error('Ingresa tu sueldo básico mensual promedio del último año');
  const anios = Math.floor(Number(i.aniosServicio) || 0);
  if (anios <= 0) throw new Error('Ingresa tus años de servicio cotizados al ISSSTE');

  const edad = Math.floor(Number(i.edad) || 0);
  const esMujer = String(i.sexo ?? 'hombre') === 'mujer';
  const aniosPara100 = esMujer ? 28 : 30;
  const edadMinJub = esMujer ? EDAD_MINIMA_JUBILACION_2026.mujer : EDAD_MINIMA_JUBILACION_2026.hombre;

  // Sueldo básico topado a 10 UMA elevadas al mes (UMA mensual oficial INEGI: $3,566.22 → tope $35,662.20).
  const topeMensual = uma.mensual * TOPE_UMA;
  const sueldoTopado = Math.min(sueldo, topeMensual);
  const topado = sueldo > topeMensual;

  // Piso: una pensión del ISSSTE no puede ser menor a un salario mínimo mensual.
  const salarioMinimoMensual = salarioMinimo.generalDiario * DIAS_MES;

  // ── Determinar régimen y porcentaje ──
  let regimen: string;
  let porcentaje: number;
  let cumple = true;
  let motivoNoCumple = '';

  if (anios >= aniosPara100) {
    // Jubilación: 100% del sueldo básico, sujeta a edad mínima gradual.
    regimen = 'Jubilación';
    porcentaje = 1;
    if (edad > 0 && edad < edadMinJub) {
      cumple = false;
      motivoNoCumple = `Ya tienes los ${aniosPara100} años de servicio para la jubilación al 100%, pero en 2026 la edad mínima para ${esMujer ? 'mujeres' : 'hombres'} es ${edadMinJub} años (la reforma de 2025 la bajó y la seguirá bajando los próximos años). Con ${edad} años todavía no la alcanzas: te falta(n) ${edadMinJub - edad} año(s).`;
    }
  } else if (anios >= 15 && edad >= 60) {
    // Pensión por edad y tiempo de servicios.
    regimen = 'Retiro por edad y tiempo de servicios';
    porcentaje = pctEdadServicio(anios);
  } else if (anios >= 10 && edad >= 65) {
    // Cesantía en edad avanzada.
    regimen = 'Cesantía en edad avanzada';
    porcentaje = pctCesantia(edad);
  } else {
    // No cumple ningún régimen.
    cumple = false;
    regimen = 'Sin derecho aún';
    porcentaje = 0;
    if (anios < 10) {
      motivoNoCumple = `Con ${anios} años de servicio aún no llegas al mínimo de 10 años que exige la modalidad de cesantía en edad avanzada (la de menor requisito). Necesitas al menos 15 años (con 60 de edad) para la pensión por edad y tiempo de servicios, o 10 años con 65 de edad para cesantía.`;
    } else if (anios < 15) {
      motivoNoCumple = `Con ${anios} años de servicio sólo calificas a cesantía en edad avanzada, que requiere 65 años de edad${edad > 0 ? ` (ingresaste ${edad})` : ''}. Para la pensión por edad y tiempo de servicios (desde 15 años) necesitas 15 años de servicio y 60 de edad.`;
    } else {
      motivoNoCumple = `Tienes ${anios} años de servicio pero la edad${edad > 0 ? ` (${edad})` : ''} no alcanza: la pensión por edad y tiempo de servicios pide 60 años; la cesantía, 65. Sigue cotizando o espera a cumplir la edad.`;
    }
  }

  if (!cumple) {
    return {
      pensionMensual: fmtMXN(0),
      regimenAplicable: regimen,
      porcentajeSb: '0%',
      sueldoBasicoCalculo: fmtMXN(topado ? sueldoTopado : sueldo),
      detalle: motivoNoCumple,
      _insight: {
        title: regimen === 'Jubilación' ? 'Te falta la edad mínima' : 'Aún no calificas',
        text: motivoNoCumple,
        tone: 'warn',
        icon: '🏛️',
      },
    };
  }

  // Pensión = sueldo básico topado × porcentaje, con piso de 1 salario mínimo.
  const pensionCalculada = sueldoTopado * porcentaje;
  const aplicaPiso = pensionCalculada < salarioMinimoMensual && pensionCalculada > 0;
  const pension = Math.max(pensionCalculada, salarioMinimoMensual);

  const tasaReemplazo = (pension / Math.min(sueldo, sueldoTopado)) * 100;

  // Texto del régimen para el insight.
  let textoRegimen: string;
  if (regimen === 'Jubilación') {
    textoRegimen = `Con **${anios} años de servicio** (≥${aniosPara100} para ${esMujer ? 'mujeres' : 'hombres'}) y ${edad >= edadMinJub || edad === 0 ? `cumpliendo la edad mínima de ${edadMinJub} años` : ''}, te corresponde el **100% de tu sueldo básico**: la pensión más alta del Décimo Transitorio.`;
  } else if (regimen === 'Retiro por edad y tiempo de servicios') {
    textoRegimen = `Con **${anios} años de servicio** y **${edad} años** de edad caes en *retiro por edad y tiempo de servicios*: el **${(porcentaje * 100).toFixed(1)}%** de tu sueldo básico. Cada año extra de servicio sube el porcentaje (2.5% por año hasta los 24, 5% de 25 a 29) hasta llegar al 100% con 30 años (28 mujeres).`;
  } else {
    textoRegimen = `Con **${anios} años de servicio** y **${edad} años** te pensionas por *cesantía en edad avanzada*: el **${(porcentaje * 100).toFixed(0)}%** de tu sueldo básico. Esta modalidad parte del 40% a los 65 y sube 2 puntos por año hasta el 50% a los 70.`;
  }

  const _insight = {
    title: aplicaPiso ? 'Te corresponde la pensión mínima' : `Pensión ISSSTE: ${fmtMXN(pension)} al mes`,
    text: aplicaPiso
      ? `El cálculo (${(porcentaje * 100).toFixed(1)}% de tu sueldo básico) da **${fmtMXN(pensionCalculada)}**, por debajo del salario mínimo mensual. La pensión del ISSSTE no puede ser menor a un salario mínimo, así que cobrarías **${fmtMXN(salarioMinimoMensual)}**.`
      : `${textoRegimen} Estimado: **${fmtMXN(pension)}** al mes${topado ? ', con tu sueldo básico topado a 10 UMA' : ''} (≈${tasaReemplazo.toFixed(0)}% de tu sueldo).`,
    tone: regimen === 'Jubilación' && !aplicaPiso ? 'good' : aplicaPiso ? 'warn' : 'good',
    icon: '🏛️',
  };

  // Donut: parte de la pensión vs el sueldo no cubierto por la tasa de reemplazo.
  const baseSueldo = topado ? sueldoTopado : sueldo;
  const noCubierto = Math.max(0, baseSueldo - pension);
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Pensión mensual', value: r2(pension) },
      ...(noCubierto > 0 ? [{ label: 'No cubierto por la pensión', value: r2(noCubierto) }] : []),
    ],
    prefix: '$',
    centerValue: `${tasaReemplazo.toFixed(0)}%`,
    centerLabel: 'Tasa de reemplazo',
    ariaLabel: `Tu pensión ISSSTE de ${fmtMXN(pension)} equivale al ${tasaReemplazo.toFixed(0)}% de tu sueldo básico.`,
  };

  return {
    pensionMensual: fmtMXN(pension),
    regimenAplicable: regimen,
    porcentajeSb: `${(porcentaje * 100).toFixed(porcentaje * 100 % 1 === 0 ? 0 : 1)}% del sueldo básico`,
    sueldoBasicoCalculo: `${fmtMXN(topado ? sueldoTopado : sueldo)}${topado ? ' (topado a 10 UMA)' : ''}`,
    detalle: `Régimen: ${regimen}. Sueldo básico ${topado ? `topado a 10 UMA (${fmtMXN(sueldoTopado)})` : fmtMXN(sueldo)} × ${(porcentaje * 100).toFixed(porcentaje * 100 % 1 === 0 ? 0 : 1)}% = ${fmtMXN(pensionCalculada)}${aplicaPiso ? ` → se eleva al salario mínimo mensual ${fmtMXN(salarioMinimoMensual)}` : ''}. Tasa de reemplazo ≈ ${tasaReemplazo.toFixed(0)}% de tu sueldo básico.`,
    _insight,
    _chart,
  };
}
