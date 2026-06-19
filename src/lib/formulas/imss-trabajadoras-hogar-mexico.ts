/**
 * Cuota mensual del IMSS + INFONAVIT de personas trabajadoras del hogar — Programa PTHH (línea de captura).
 * Afiliación obligatoria (LSS Arts. 239-A y ss., tras el amparo SCJN 9/2018 y la reforma DOF nov-2022).
 * Mismos ramos de aseguramiento que cualquier trabajador (EyM, RT, IV, guarderías, RCV) MÁS la aportación
 * patronal del 5% al INFONAVIT, que desde 2026 es OBLIGATORIA y se genera de forma simultánea al alta del
 * IMSS (calculadora oficial PTHH https://adodigital.imss.gob.mx/pth_calculadora/ ; Infobae 05-jun-2026).
 * El IMSS emite una sola línea de captura que paga el patrón.
 *
 * Piso del SBC = salario mínimo PROFESIONAL de trabajador(a) del hogar 2026, NO el general:
 * $342.47/día zona general, $440.87/día ZLFN (CONASAMI, DOF 09-dic-2025).
 *
 * Esta calc da SOLO la línea de captura (IMSS + INFONAVIT). Para el COSTO TOTAL del patrón
 * (sueldo + esta cuota + aguinaldo + prima vacacional + prima dominical), ver
 * calculadora-costo-empleada-domestica-patron-mexico-2026.
 *
 * Constantes desde src/lib/data/mexico-2026.ts (UMA, tasas LSS, tabla CEAV 2026, INFONAVIT).
 */
import { MEXICO_2026, tasaCeavPatron2026, factorIntegracion, fmtMXN } from '../data/mexico-2026.ts';

// ── Salario mínimo PROFESIONAL 2026 de trabajador(a) del hogar (CONASAMI, DOF 09-dic-2025) ──
// Mínimo de profesión, superior al general ($315.04): aplica a este oficio por día trabajado.
const SM_PROFESIONAL_HOGAR_2026 = {
  generalDiario: 342.47, // zona general
  zlfnDiario: 440.87,    // Zona Libre de la Frontera Norte
};

export interface Inputs {
  salarioMensual: number;   // salario mensual pactado con ESTE patrón
  esquema?: string;         // 'mes' (de planta, mes completo) | '1'..'6' días por semana
  zona?: string;            // 'general' (default) | 'frontera' (ZLFN)
  cuotaObrera?: string;     // 'patron' (la absorbe el patrón) | 'trabajadora' (se le retiene del salario)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** Guard de defaults: '' / null / undefined → default, sin pisar el 0 del usuario. */
function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export function compute(i: Inputs): Outputs {
  const { uma, imss } = MEXICO_2026;

  const salario = num(i.salarioMensual, 0);
  if (salario <= 0) throw new Error('Ingresa el salario mensual que le pagas a la persona trabajadora del hogar');
  const esquemaRaw = String(i.esquema ?? 'mes');
  const absorbePatron = String(i.cuotaObrera ?? 'patron') !== 'trabajadora';

  // Piso legal del SBC: salario mínimo PROFESIONAL del hogar (general o ZLFN), no el general.
  const zona = String(i.zona ?? 'general') === 'frontera' ? 'frontera' : 'general';
  const smProfesionalDia = zona === 'frontera'
    ? SM_PROFESIONAL_HOGAR_2026.zlfnDiario
    : SM_PROFESIONAL_HOGAR_2026.generalDiario;

  // Días cotizados al mes: mes completo = 30.4; por días = días/semana × (30.4/7).
  const factorMensual = MEXICO_2026.salarioMinimo.factorMensual; // 30.4
  let diasMes: number;
  let esquemaLabel: string;
  if (esquemaRaw === 'mes') {
    diasMes = factorMensual;
    esquemaLabel = 'mes completo (de planta)';
  } else {
    const d = Math.min(6, Math.max(1, Math.floor(num(esquemaRaw, 5))));
    diasMes = d * (factorMensual / 7);
    esquemaLabel = `${d} día${d > 1 ? 's' : ''} por semana`;
  }

  // Salario por día trabajado y piso legal (el SBC no puede ser menor al mínimo profesional, LSS Art. 28).
  const salarioDiario = salario / diasMes;
  const bajoMinimo = salarioDiario < smProfesionalDia;
  const salarioDiarioCotizable = Math.max(salarioDiario, smProfesionalDia);

  // Salario diario integrado: aguinaldo (15 días) + prima vacacional (25% de 12 días) → factor 1.0493 año 1.
  const factor = factorIntegracion(1);
  const topeSbcDiario = uma.diaria * imss.topeSbcUmas; // 25 UMA
  const sdi = Math.min(salarioDiarioCotizable * factor, topeSbcDiario);
  const sbcMensual = sdi * diasMes;

  // Excedente de 3 UMA (solo ramo de enfermedades y maternidad, LSS Art. 106-II).
  const tresUma = uma.diaria * 3;
  const excedenteDiario = Math.max(0, sdi - tresUma);

  // ── Cuotas patronales IMSS ──
  const p = imss.patron;
  const fijaEym = p.eymCuotaFijaUma * uma.diaria * diasMes;       // 20.40% de la UMA por día cotizado
  const excEymPatron = p.eymExcedente * excedenteDiario * diasMes; // 1.10% del excedente >3 UMA
  const prestDinero = p.eymPrestacionesDinero * sbcMensual;        // 0.70%
  const gmp = p.gastosMedicosPensionados * sbcMensual;             // 1.05%
  const invVida = p.invalidezVida * sbcMensual;                    // 1.75%
  const guarderias = p.guarderias * sbcMensual;                    // 1.00%
  const retiroSar = p.retiro * sbcMensual;                         // 2.00%
  const ceav = tasaCeavPatron2026(sdi) * sbcMensual;               // tabla CEAV 2026 (3.150%–7.513%)
  const riesgoTrabajo = p.riesgoTrabajoClaseI * sbcMensual;        // prima media clase I (trabajo del hogar)
  const cuotaPatronImss = fijaEym + excEymPatron + prestDinero + gmp + invVida + guarderias + retiroSar + ceav + riesgoTrabajo;

  // ── INFONAVIT 5% del SBC — obligatorio en el PTHH desde 2026 (alta de vivienda simultánea al IMSS) ──
  const infonavit = imss.infonavitPatron * sbcMensual;

  // ── Cuota obrera (2.375% del SBC + 0.40% del excedente >3 UMA) ──
  const parteObrera = imss.obrero.totalSinExcedente * sbcMensual
    + imss.obrero.eymExcedente * excedenteDiario * diasMes;

  // Línea de captura mensual = cuotas patronales IMSS + INFONAVIT 5% + cuota obrera (todo lo paga el patrón).
  const cuotaTotal = cuotaPatronImss + infonavit + parteObrera;
  const costoPatron = salario + cuotaPatronImss + infonavit + (absorbePatron ? parteObrera : 0);
  const pctSobreSalario = (cuotaTotal / salario) * 100;

  const _insight = {
    title: 'Cuánto cuesta asegurarla en el IMSS + INFONAVIT',
    text: `Con un salario de **${fmtMXN(salario)}** al mes (${esquemaLabel}), la línea de captura mensual es de **${fmtMXN(r2(cuotaTotal))}**: ${fmtMXN(r2(cuotaPatronImss))} de cuota patronal del IMSS, ${fmtMXN(r2(infonavit))} de INFONAVIT 5% (obligatorio desde 2026) y ${fmtMXN(r2(parteObrera))} de cuota obrera, que ${absorbePatron ? 'decidiste absorber tú (lo más común en el trabajo del hogar)' : 'le retienes de su salario'}. Eso equivale a un **${pctSobreSalario.toFixed(1)}%** extra sobre el salario y le da cobertura médica, incapacidades, guardería, ahorro para el retiro y, ahora, aportaciones de vivienda al INFONAVIT.${bajoMinimo ? ` ⚠️ Ojo: el salario por día trabajado (${fmtMXN(r2(salarioDiario))}) queda **debajo del mínimo profesional 2026** de trabajador(a) del hogar (${fmtMXN(smProfesionalDia)} diarios); el IMSS no admite cotizar por menos, así que la cuota se calculó sobre ${fmtMXN(smProfesionalDia)} por día — y además estarías pagando un salario por debajo de la ley.` : ''}`,
    tone: bajoMinimo ? 'warn' : 'good',
    icon: '🏠',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Cuota patronal IMSS', value: r2(cuotaPatronImss) },
      { label: 'INFONAVIT 5%', value: r2(infonavit) },
      { label: 'Cuota obrera', value: r2(parteObrera) },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmtMXN(r2(cuotaTotal)),
    centerLabel: 'Línea de captura al mes',
    ariaLabel: `Línea de captura mensual de ${fmtMXN(r2(cuotaTotal))}: ${fmtMXN(r2(cuotaPatronImss))} de cuota patronal del IMSS, ${fmtMXN(r2(infonavit))} de INFONAVIT y ${fmtMXN(r2(parteObrera))} de cuota obrera.`,
  };

  return {
    cuotaMensual: fmtMXN(r2(cuotaTotal)),
    cuotaPatron: fmtMXN(r2(cuotaPatronImss)),
    infonavit: `${fmtMXN(r2(infonavit))} (5% del SBC, obligatorio desde 2026)`,
    parteObrera: `${fmtMXN(r2(parteObrera))} (${absorbePatron ? 'la absorbes tú' : 'se le retiene del salario'})`,
    costoPatron: `${fmtMXN(r2(costoPatron))} al mes (salario + IMSS + INFONAVIT)`,
    detalle: `Cotiza ${diasMes === factorMensual ? '30.4 días' : `~${r2(diasMes)} días`} al mes con salario integrado de ${fmtMXN(r2(sdi))} diarios (salario ${fmtMXN(r2(salarioDiarioCotizable))} × factor ${factor} por aguinaldo y prima vacacional) → SBC mensual ${fmtMXN(r2(sbcMensual))}. La línea de captura (IMSS ${fmtMXN(r2(cuotaPatronImss))} + INFONAVIT ${fmtMXN(r2(infonavit))} + cuota obrera ${fmtMXN(r2(parteObrera))}) equivale al ${pctSobreSalario.toFixed(1)}% del salario. No incluye aguinaldo ni prima vacacional, que se pagan aparte.`,
    _insight,
    _chart,
  };
}
