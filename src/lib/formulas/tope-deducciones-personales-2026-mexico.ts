/**
 * Tope global de deducciones personales 2026 — LISR Art. 151, último párrafo:
 * el total deducible no puede exceder lo MENOR entre 5 UMA anuales ($213,973.20 en 2026)
 * y el 15% de los ingresos totales del contribuyente.
 * Fuera del tope global: donativos (frac. III, tope propio 7%), aportaciones complementarias
 * de retiro (frac. V, tope propio 10% del ingreso hasta 5 UMA anuales) y colegiaturas (decreto).
 * Constantes desde src/lib/data/mexico-2026.ts (UMA 2026, tarifa ISR anual Anexo 8 RMF 2026).
 */
import { MEXICO_2026, isrAnual2026, fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  ingresosAnuales: number;       // ingresos totales del ejercicio
  gastosMedicos?: number;        // médicos, dentales, psicología, nutrición, hospitalarios + primas de seguros de gastos médicos
  interesesHipoteca?: number;    // intereses reales del crédito hipotecario (constancia anual del banco)
  gastosFunerarios?: number;     // tope propio: 1 UMA anual
  donativos?: number;            // fuera del tope global; tope propio 7% (LISR 151-III)
  aportacionesRetiro?: number;   // fuera del tope global; tope propio 10% del ingreso, máx. 5 UMA anuales (LISR 151-V)
  colegiaturas?: number;         // fuera del tope global; topes por nivel escolar (decreto)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** Guard de defaults: '' / null / undefined → default, sin pisar el 0 del usuario. */
function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

// Topes propios de las deducciones que van FUERA del tope global (LISR Art. 151):
const DONATIVOS_TOPE_PCT = 0.07;  // frac. III: 7% de los ingresos acumulables (del ejercicio anterior)
const RETIRO_TOPE_PCT = 0.10;     // frac. V: 10% de los ingresos del ejercicio, sin exceder 5 UMA anuales

export function compute(i: Inputs): Outputs {
  const { uma, deduccionesPersonales } = MEXICO_2026;

  const ingresos = num(i.ingresosAnuales, 0);
  if (ingresos <= 0) throw new Error('Ingresa tus ingresos anuales para calcular el tope que te aplica');

  const medicos = Math.max(0, num(i.gastosMedicos, 0));
  const hipoteca = Math.max(0, num(i.interesesHipoteca, 0));
  const funerariosCapturado = Math.max(0, num(i.gastosFunerarios, 0));
  const donativosCapturado = Math.max(0, num(i.donativos, 0));
  const retiroCapturado = Math.max(0, num(i.aportacionesRetiro, 0));
  const colegiaturas = Math.max(0, num(i.colegiaturas, 0));

  // ── Tope global: lo MENOR entre 5 UMA anuales y 15% de los ingresos ──
  const tope5Uma = deduccionesPersonales.topeUmasAnuales * uma.anual;        // $213,973.20 en 2026
  const tope15Pct = deduccionesPersonales.topePorcentajeIngresos * ingresos;
  const topeGlobal = Math.min(tope5Uma, tope15Pct);
  const mandaUma = tope5Uma <= tope15Pct;

  // ── Deducciones SUJETAS al tope global ──
  const funerarios = Math.min(funerariosCapturado, uma.anual); // tope propio: 1 UMA anual (LISR 151-II)
  const sujetasBrutas = medicos + hipoteca + funerarios;
  const sujetasDeducibles = Math.min(sujetasBrutas, topeGlobal);
  const recorteGlobal = sujetasBrutas - sujetasDeducibles;

  // ── Deducciones FUERA del tope global (cada una con su propio límite) ──
  const donativos = Math.min(donativosCapturado, DONATIVOS_TOPE_PCT * ingresos);
  const retiro = Math.min(retiroCapturado, Math.min(RETIRO_TOPE_PCT * ingresos, tope5Uma));
  const fueraDelTope = donativos + retiro + colegiaturas;
  const recortePropios = (funerariosCapturado - funerarios) + (donativosCapturado - donativos) + (retiroCapturado - retiro);

  const totalDeducible = sujetasDeducibles + fueraDelTope;
  const recorteTotal = recorteGlobal + recortePropios;

  // ── Ahorro de ISR: diferencia real de la tarifa anual (Art. 152), no una tasa plana ──
  const isrSin = isrAnual2026(ingresos);
  const isrCon = isrAnual2026(Math.max(0, ingresos - totalDeducible));
  const ahorro = Math.max(0, isrSin - isrCon);
  const tasaEfectiva = totalDeducible > 0 ? (ahorro / totalDeducible) * 100 : 0;

  const _insight = {
    title: 'Cuánto puedes deducir realmente',
    text: `Con ingresos de **${fmtMXN(ingresos)}**, tu tope global 2026 es **${fmtMXN(r2(topeGlobal))}** (${mandaUma ? `manda el límite de 5 UMA anuales, ${fmtMXN(tope5Uma)}` : `manda el 15% de tus ingresos; el límite de 5 UMA es ${fmtMXN(tope5Uma)}`}). De lo que capturaste puedes deducir **${fmtMXN(r2(totalDeducible))}**${recorteTotal > 0 ? ` — se quedan fuera ${fmtMXN(r2(recorteTotal))} por los topes` : ' (nada se recorta: estás debajo del tope)'}. Eso te ahorraría **~${fmtMXN(r2(ahorro))}** de ISR en la declaración anual (un ${tasaEfectiva.toFixed(1)}% de lo deducido, a tu tarifa real del Art. 152).`,
    tone: recorteTotal > 0 ? 'warn' : 'good',
    icon: '🧾',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Deducible (con tope global)', value: r2(sujetasDeducibles) },
      { label: 'Deducible fuera del tope', value: r2(fueraDelTope) },
      { label: 'Recortado por topes', value: r2(recorteTotal) },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmtMXN(r2(totalDeducible)),
    centerLabel: 'Deducible real',
    ariaLabel: `Deducciones personales: ${fmtMXN(r2(totalDeducible))} deducibles y ${fmtMXN(r2(recorteTotal))} recortados por los topes del Art. 151.`,
  };

  return {
    topeGlobal: `${fmtMXN(r2(topeGlobal))} (${mandaUma ? '5 UMA anuales' : '15% de tus ingresos'})`,
    deduciblesConTope: `${fmtMXN(r2(sujetasDeducibles))} de ${fmtMXN(r2(sujetasBrutas))} capturados (médicos, intereses, funerarios)`,
    fueraDelTope: fueraDelTope > 0
      ? `${fmtMXN(r2(fueraDelTope))} (donativos ${fmtMXN(r2(donativos))} + retiro ${fmtMXN(r2(retiro))} + colegiaturas ${fmtMXN(r2(colegiaturas))})`
      : 'Sin deducciones fuera del tope (donativos, retiro y colegiaturas van aparte)',
    totalDeducible: fmtMXN(r2(totalDeducible)),
    ahorroIsr: `~${fmtMXN(r2(ahorro))} (tarifa anual Art. 152)`,
    detalle: `Tope global = menor entre 5 UMA anuales (${fmtMXN(tope5Uma)}) y 15% de ingresos (${fmtMXN(r2(tope15Pct))}) = ${fmtMXN(r2(topeGlobal))}.${recorteTotal > 0 ? ` Recorte total por topes: ${fmtMXN(r2(recorteTotal))}.` : ''} Donativos topados al 7% del ingreso y aportaciones de retiro al 10% (máx. 5 UMA); colegiaturas con tope por nivel escolar.`,
    _insight,
    _chart,
  };
}
