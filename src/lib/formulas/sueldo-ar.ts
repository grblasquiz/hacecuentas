/**
 * Calculadora de sueldo líquido Argentina
 * Basada en LCT (Ley de Contrato de Trabajo) + AFIP/ARCA 2026
 *
 * Aportes personales (17%):
 *   - Jubilación (SIPA): 11%
 *   - Obra Social: 3%
 *   - PAMI (INSSJP): 3%
 *
 * Ganancias: MNI + escala compartida con `ganancias-sueldo.ts` — ambos importan
 * `_ganancias-escala.ts` para que el auto-updater patchee un solo lugar.
 *
 * Inputs nuevos (2026): conyuge (bool) + hijos (number) separados, porque ARCA
 * deduce $404k/mes por cónyuge y $204k/mes por hijo — son valores distintos.
 * Si sólo llega el campo legacy `cargas`, se asume 1 cónyuge + resto hijos.
 *
 * MEJORA B2 (2026-07): dos modos nuevos para defender la keyword #1 frente a
 * competidores que ya tienen el inverso:
 *   1. modo="neto-a-bruto": búsqueda binaria sobre bruto→neto para responder
 *      "¿cuánto bruto necesito para cobrar X en mano?" (convergencia $100).
 *   2. compararAnterior="si": compara el aumento nominal del sueldo contra la
 *      inflación INDEC acumulada desde un mes elegido → poder adquisitivo real.
 */

import {
  MNI_MENSUAL_BASE,
  INCREMENTO_CONYUGE_MENSUAL,
  INCREMENTO_HIJO_MENSUAL,
  aplicarEscalaMensual,
} from './_ganancias-escala';
import {
  inflacionAcumuladaDesde,
  INFLACION_SERIE_HASTA,
} from '../data/inflacion-serie-ar';

/**
 * Base imponible MÁXIMA para aportes personales (Ley 24.241 art. 9).
 * Arriba de este bruto, los aportes (jubilación 11% + obra social 3% + PAMI 3%)
 * se calculan sobre el tope, NO sobre el bruto total → para sueldos altos el
 * descuento deja de ser 17% del bruto y el neto real es mayor.
 *
 * Aplica a los 3 aportes personales con la MISMA base máxima.
 * Se actualiza mensualmente por IPC (Dec. 274/2024). Valor vigente:
 *   Junio 2026: $4.414.652,38 (Resolución ANSES 139/2026).
 * ⚠️ Actualizar cada mes. Fuente: ANSES — argentina.gob.ar/trabajo/seguridadsocial/imss
 */
export const BASE_IMPONIBLE_MAXIMA_APORTES = 4_414_652.38;

/**
 * Vigencia del dato (YYYY-MM-DD) — usada por el sello de frescura a nivel dato
 * (src/lib/data-freshness.ts). Refleja la base imponible máxima vigente
 * (junio 2026, Res. ANSES 139/2026). Actualizar junto con BASE_IMPONIBLE_MAXIMA_APORTES.
 */
export const DATA_AS_OF = '2026-06-01';

export interface SueldoInputs {
  bruto?: number;
  /** Cónyuge a cargo (bool). Preferido sobre `cargas`. */
  conyuge?: boolean | string;
  /** Hijos a cargo (number). Preferido sobre `cargas`. */
  hijos?: number | string;
  /** @deprecated Input legacy genérico. Se usa sólo si conyuge/hijos no vienen. */
  cargas?: number | string;
  /** Dirección del cálculo: 'bruto-a-neto' (default) o 'neto-a-bruto' (inverso). */
  modo?: string;
  /** Neto objetivo en mano — sólo se usa si modo='neto-a-bruto'. */
  netoObjetivo?: number;
  /** Activa el comparador aumento vs inflación ('si' | 'no'). */
  compararAnterior?: string;
  /** Sueldo del mes anterior (misma medida que el actual: bruto o neto). */
  sueldoAnterior?: number;
  /** Mes del sueldo anterior en formato "YYYY-MM" (selector). */
  mesAnterior?: string;
  __lang?: string;
}

export interface SueldoOutputs {
  neto: number;
  aportes: number;
  ganancias: number;
  descuentoTotal: number;
  porcentajeDescuento: number;
  jubilacion: number;
  obraSocial: number;
  pami: number;
  /** Sólo en modo neto→bruto: bruto necesario para cobrar el neto objetivo. */
  brutoNecesario?: number;
  /** Sólo con compararAnterior: variación real del poder adquisitivo, en %. */
  poderAdquisitivoReal?: number;
  _chart?: any;
  _insight?: any;
  _steps?: any;
}

interface Desglose {
  bruto: number;
  jubilacion: number;
  obraSocial: number;
  pami: number;
  aportes: number;
  ganancias: number;
  descuentoTotal: number;
  neto: number;
  porcentajeDescuento: number;
  topeAplicado: boolean;
}

/**
 * Núcleo bruto→neto. Puro y monótono creciente en `bruto` (cada peso extra de
 * bruto agrega neto positivo, incluso arriba del tope de aportes), lo que
 * garantiza que la búsqueda binaria del modo inverso converja.
 */
function desglose(bruto: number, conyuge: boolean, hijos: number): Desglose {
  const baseAportes = Math.min(bruto, BASE_IMPONIBLE_MAXIMA_APORTES);
  const topeAplicado = bruto > BASE_IMPONIBLE_MAXIMA_APORTES;
  const jubilacion = baseAportes * 0.11;
  const obraSocial = baseAportes * 0.03;
  const pami = baseAportes * 0.03;
  const aportes = jubilacion + obraSocial + pami;

  const brutoSinAportes = bruto - aportes;
  const deduccionFamilia =
    (conyuge ? INCREMENTO_CONYUGE_MENSUAL : 0) + hijos * INCREMENTO_HIJO_MENSUAL;
  const mni = MNI_MENSUAL_BASE + deduccionFamilia;
  const baseGanancias = Math.max(0, brutoSinAportes - mni);
  const ganancias = aplicarEscalaMensual(baseGanancias).impuesto;

  const descuentoTotal = aportes + ganancias;
  const neto = bruto - descuentoTotal;
  const porcentajeDescuento = (descuentoTotal / bruto) * 100;

  return {
    bruto,
    jubilacion,
    obraSocial,
    pami,
    aportes,
    ganancias,
    descuentoTotal,
    neto,
    porcentajeDescuento,
    topeAplicado,
  };
}

/**
 * Modo inverso: dado un neto objetivo, encuentra el bruto que lo produce por
 * búsqueda binaria (convergencia $100). Devuelve el desglose en ese bruto.
 */
function brutoDesdeNeto(netoObjetivo: number, conyuge: boolean, hijos: number): Desglose {
  let lo = netoObjetivo; // el bruto siempre es mayor que el neto
  let hi = netoObjetivo * 2;
  // Expandir el techo hasta superar el objetivo (aportes topeados hacen que el
  // neto crezca casi 1:1 arriba del tope, así que pocas duplicaciones alcanzan).
  let guard = 0;
  while (desglose(hi, conyuge, hijos).neto < netoObjetivo && guard < 40) {
    hi *= 2;
    guard++;
  }
  let mid = hi;
  for (let i = 0; i < 60; i++) {
    mid = (lo + hi) / 2;
    const n = desglose(mid, conyuge, hijos).neto;
    if (Math.abs(n - netoObjetivo) <= 100) break;
    if (n < netoObjetivo) lo = mid;
    else hi = mid;
    if (hi - lo <= 1) break;
  }
  return desglose(Math.round(mid), conyuge, hijos);
}

const MESES_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
const MESES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
function nombreMes(key: string, lang: 'es' | 'en'): string {
  const m = /^(\d{4})-(\d{2})$/.exec(key);
  if (!m) return key;
  const idx = Number(m[2]) - 1;
  const arr = lang === 'en' ? MESES_EN : MESES_ES;
  return `${arr[idx] || key} ${m[1]}`;
}

export function sueldoAR(inputs: SueldoInputs): SueldoOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorBruto: 'Ingresá un sueldo bruto válido',
      errorNeto: 'Ingresá el neto en mano que querés cobrar',
      netoEnMano: 'Neto en mano',
      jubilacion: 'Jubilación',
      obraSocial: 'Obra social',
      ganancias: 'Ganancias',
      centerLabel: 'Bruto',
      ariaLabel: 'Composición del sueldo bruto: neto en mano, jubilación, obra social, PAMI e impuesto a las Ganancias',
      insTitle: 'Cuánto te queda en mano y cuánto se descuenta',
      insGan: (neto: string, pct: string, ap: string, gan: string) =>
        `De tu bruto te queda **${neto}** en mano, un **${pct}%** se va en descuentos: **${ap}** de aportes (jubilación + obra social + PAMI) y **${gan}** de Ganancias.`,
      insNoGan: (neto: string, pct: string, ap: string) =>
        `De tu bruto te queda **${neto}** en mano: sólo se descuenta el **${pct}%** de aportes (**${ap}**) y no pagás Ganancias con tu situación familiar.`,
      invTitle: 'El bruto que necesitás',
      invText: (neto: string, bruto: string, pct: string) =>
        `Para cobrar **${neto}** en mano necesitás un sueldo **bruto de ${bruto}**: te descuentan el **${pct}%** entre aportes y Ganancias.`,
      stBruto: 'Sueldo bruto necesario',
      stAportes: 'Aportes (17%)',
      stGan: 'Impuesto a las Ganancias',
      stNeto: 'Neto en mano',
      cmpTitle: 'Tu aumento vs. la inflación',
      cmpGanaste: (subio: string, infl: string, mes: string, real: string) =>
        `Tu sueldo subió **${subio}%** y la inflación acumulada desde ${mes} fue **${infl}%**: le ganaste, ganaste **${real}%** de poder adquisitivo real.`,
      cmpPerdiste: (subio: string, infl: string, mes: string, real: string) =>
        `Tu sueldo subió **${subio}%** pero la inflación acumulada desde ${mes} fue **${infl}%**: perdiste **${real}%** de poder adquisitivo real.`,
      cmpEmpate: (subio: string, infl: string, mes: string) =>
        `Tu sueldo subió **${subio}%** y la inflación acumulada desde ${mes} fue **${infl}%**: empataste, mantenés tu poder adquisitivo.`,
      cmpEstim: ' (la serie mensual del INDEC cubre ~12 meses; para meses más viejos el tramo faltante es una estimación al promedio mensual).',
      cmpErr: 'Completá tu sueldo anterior y el mes para comparar con la inflación.',
    },
    en: {
      errorBruto: 'Enter a valid gross salary',
      errorNeto: 'Enter the take-home pay you want to earn',
      netoEnMano: 'Take-home pay',
      jubilacion: 'Retirement',
      obraSocial: 'Health insurance',
      ganancias: 'Income tax',
      centerLabel: 'Gross',
      ariaLabel: 'Gross salary breakdown: take-home pay, retirement, health insurance, PAMI and income tax',
      insTitle: 'How much you keep and how much is deducted',
      insGan: (neto: string, pct: string, ap: string, gan: string) =>
        `You take home **${neto}** from your gross pay; **${pct}%** goes to deductions: **${ap}** in contributions (retirement + health insurance + PAMI) and **${gan}** in income tax.`,
      insNoGan: (neto: string, pct: string, ap: string) =>
        `You take home **${neto}** from your gross pay: only **${pct}%** in contributions (**${ap}**) is deducted and you pay no income tax with your family situation.`,
      invTitle: 'The gross salary you need',
      invText: (neto: string, bruto: string, pct: string) =>
        `To take home **${neto}** you need a **gross salary of ${bruto}**: **${pct}%** is deducted between contributions and income tax.`,
      stBruto: 'Gross salary needed',
      stAportes: 'Contributions (17%)',
      stGan: 'Income tax',
      stNeto: 'Take-home pay',
      cmpTitle: 'Your raise vs. inflation',
      cmpGanaste: (subio: string, infl: string, mes: string, real: string) =>
        `Your salary rose **${subio}%** and inflation since ${mes} was **${infl}%**: you beat it, gaining **${real}%** in real purchasing power.`,
      cmpPerdiste: (subio: string, infl: string, mes: string, real: string) =>
        `Your salary rose **${subio}%** but inflation since ${mes} was **${infl}%**: you lost **${real}%** of real purchasing power.`,
      cmpEmpate: (subio: string, infl: string, mes: string) =>
        `Your salary rose **${subio}%** and inflation since ${mes} was **${infl}%**: you broke even, keeping your purchasing power.`,
      cmpEstim: ' (INDEC monthly series covers ~12 months; for older months the missing stretch is estimated at the average monthly rate).',
      cmpErr: 'Fill in your previous salary and month to compare against inflation.',
    },
  } as const)[__lang];

  // Resolver familia: si vienen los campos nuevos, usarlos. Si no, degradar desde
  // `cargas` asumiendo 1 cónyuge + (n-1) hijos.
  let conyuge: boolean;
  let hijos: number;
  if (inputs.conyuge !== undefined || inputs.hijos !== undefined) {
    conyuge =
      inputs.conyuge === true ||
      inputs.conyuge === 'true' ||
      inputs.conyuge === 'si' ||
      inputs.conyuge === 1 ||
      inputs.conyuge === '1';
    hijos = Math.max(0, Math.min(10, Number(inputs.hijos) || 0));
  } else {
    const cargas = Math.max(0, Math.min(10, Number(inputs.cargas) || 0));
    conyuge = cargas >= 1;
    hijos = Math.max(0, cargas - 1);
  }

  const modoInverso = String(inputs.modo || '') === 'neto-a-bruto';

  // ── Resolver el desglose principal según el modo ────────────────────────
  let d: Desglose;
  if (modoInverso) {
    const netoObjetivo = Number(inputs.netoObjetivo);
    if (!netoObjetivo || netoObjetivo <= 0) {
      throw new Error(T.errorNeto);
    }
    d = brutoDesdeNeto(netoObjetivo, conyuge, hijos);
  } else {
    const bruto = Number(inputs.bruto);
    if (!bruto || bruto <= 0) {
      throw new Error(T.errorBruto);
    }
    d = desglose(bruto, conyuge, hijos);
  }

  const f = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const pctTxt = d.porcentajeDescuento.toFixed(1);

  const topeNota = d.topeAplicado
    ? __lang === 'en'
      ? ` Your contributions are capped: they're calculated on the maximum base of **${f(BASE_IMPONIBLE_MAXIMA_APORTES)}**, not your full gross (Law 24.241).`
      : ` Tus aportes están topeados: se calculan sobre la base máxima de **${f(BASE_IMPONIBLE_MAXIMA_APORTES)}**, no sobre todo tu bruto (Ley 24.241), por eso el descuento no es el 17% pleno.`
    : '';

  // Insight principal (breakdown o bruto-necesario según el modo).
  let insight: any;
  let steps: any;
  if (modoInverso) {
    insight = {
      title: T.invTitle,
      text: T.invText(f(d.neto), f(d.bruto), pctTxt) + topeNota,
      tone: d.porcentajeDescuento >= 25 ? 'warn' : 'neutral',
      icon: '🎯',
    };
    steps = [
      { label: T.stBruto, value: f(d.bruto) },
      { label: T.stAportes, value: '− ' + f(d.aportes) },
      { label: T.stGan, value: '− ' + f(d.ganancias) },
      { label: T.stNeto, value: f(d.neto) },
    ];
  } else {
    insight = {
      title: T.insTitle,
      text:
        (d.ganancias > 0
          ? T.insGan(f(d.neto), pctTxt, f(d.aportes), f(d.ganancias))
          : T.insNoGan(f(d.neto), pctTxt, f(d.aportes))) + topeNota,
      tone: d.porcentajeDescuento >= 25 ? 'warn' : 'neutral',
      icon: '💸',
    };
  }

  // ── Comparador aumento vs inflación (opcional) ──────────────────────────
  let poderAdquisitivoReal: number | undefined;
  const comparar = String(inputs.compararAnterior || '') === 'si';
  if (comparar) {
    const sueldoAnterior = Number(inputs.sueldoAnterior);
    const mesAnterior = String(inputs.mesAnterior || '');
    const sueldoActual = modoInverso ? d.neto : d.bruto;
    if (sueldoAnterior > 0 && /^\d{4}-\d{2}$/.test(mesAnterior)) {
      const aumentoPct = (sueldoActual / sueldoAnterior - 1) * 100;
      const infl = inflacionAcumuladaDesde(mesAnterior);
      const factorReal = (1 + aumentoPct / 100) / (1 + infl.pct / 100);
      const realPct = (factorReal - 1) * 100;
      poderAdquisitivoReal = Number(realPct.toFixed(1));

      const mesTxt = nombreMes(mesAnterior, __lang);
      const subioTxt = aumentoPct.toFixed(1);
      const inflTxt = infl.pct.toFixed(1);
      const realAbs = Math.abs(realPct).toFixed(1);
      const estimNota = infl.exacto ? '' : T.cmpEstim;
      let cmpText: string;
      let cmpTone: string;
      if (realPct > 0.5) {
        cmpText = T.cmpGanaste(subioTxt, inflTxt, mesTxt, realAbs);
        cmpTone = 'good';
      } else if (realPct < -0.5) {
        cmpText = T.cmpPerdiste(subioTxt, inflTxt, mesTxt, realAbs);
        cmpTone = 'warn';
      } else {
        cmpText = T.cmpEmpate(subioTxt, inflTxt, mesTxt);
        cmpTone = 'neutral';
      }
      // El comparador es el modo que el usuario activó explícitamente → lidera el
      // insight; el desglose principal queda como segunda frase.
      insight = {
        title: T.cmpTitle,
        text: cmpText + estimNota + ' ' + insight.text,
        tone: cmpTone,
        icon: realPct >= 0 ? '📈' : '📉',
      };
    } else {
      // Activó el comparador pero faltan datos: no rompemos el cálculo principal,
      // sólo avisamos en el insight.
      insight = {
        ...insight,
        text: insight.text + ' — ' + T.cmpErr,
      };
    }
  }

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: T.netoEnMano, value: Math.round(d.neto) },
      { label: T.jubilacion, value: Math.round(d.jubilacion) },
      { label: T.obraSocial, value: Math.round(d.obraSocial) },
      { label: 'PAMI', value: Math.round(d.pami) },
      { label: T.ganancias, value: Math.round(d.ganancias) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(d.bruto).toLocaleString('es-AR'),
    centerLabel: T.centerLabel,
    ariaLabel: T.ariaLabel,
  };

  return {
    neto: Math.round(d.neto),
    aportes: Math.round(d.aportes),
    ganancias: Math.round(d.ganancias),
    descuentoTotal: Math.round(d.descuentoTotal),
    porcentajeDescuento: Number(d.porcentajeDescuento.toFixed(2)),
    jubilacion: Math.round(d.jubilacion),
    obraSocial: Math.round(d.obraSocial),
    pami: Math.round(d.pami),
    brutoNecesario: modoInverso ? Math.round(d.bruto) : undefined,
    poderAdquisitivoReal,
    _chart: chart,
    _insight: insight,
    _steps: steps,
  };
}

// Referencia usada por el sello de frescura del comparador de inflación (no
// altera el cálculo; documenta a qué mes llega la serie INDEC empaquetada).
export const INFLACION_SERIE_HASTA_MES = INFLACION_SERIE_HASTA;
