/**
 * Cuotas IMSS de personas trabajadoras del hogar — afiliación obligatoria (LSS Arts. 239-A y ss.).
 * Mismos ramos de aseguramiento que cualquier trabajador (EyM, RT, IV, guarderías, RCV);
 * sin aportación INFONAVIT obligatoria. El IMSS emite una sola línea de captura que paga el patrón.
 * Constantes desde src/lib/data/mexico-2026.ts (UMA, salario mínimo, tasas LSS, tabla CEAV 2026).
 */
import { MEXICO_2026, tasaCeavPatron2026, factorIntegracion, fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  salarioMensual: number;   // salario mensual pactado con ESTE patrón
  esquema?: string;         // 'mes' (de planta, mes completo) | '1'..'6' días por semana
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
  const { uma, salarioMinimo, imss } = MEXICO_2026;

  const salario = num(i.salarioMensual, 0);
  if (salario <= 0) throw new Error('Ingresa el salario mensual que le pagas a la persona trabajadora del hogar');
  const esquemaRaw = String(i.esquema ?? 'mes');
  const absorbePatron = String(i.cuotaObrera ?? 'patron') !== 'trabajadora';

  // Días cotizados al mes: mes completo = 30.4; por días = días/semana × (30.4/7).
  const factorMensual = salarioMinimo.factorMensual; // 30.4
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

  // Salario por día trabajado y piso legal (el SBC no puede ser menor al salario mínimo, LSS Art. 28).
  const salarioDiario = salario / diasMes;
  const bajoMinimo = salarioDiario < salarioMinimo.generalDiario;
  const salarioDiarioCotizable = Math.max(salarioDiario, salarioMinimo.generalDiario);

  // Salario diario integrado: aguinaldo (15 días) + prima vacacional (25% de 12 días) → factor 1.0493 año 1.
  const factor = factorIntegracion(1);
  const topeSbcDiario = uma.diaria * imss.topeSbcUmas; // 25 UMA
  const sdi = Math.min(salarioDiarioCotizable * factor, topeSbcDiario);
  const sbcMensual = sdi * diasMes;

  // Excedente de 3 UMA (solo ramo de enfermedades y maternidad, LSS Art. 106-II).
  const tresUma = uma.diaria * 3;
  const excedenteDiario = Math.max(0, sdi - tresUma);

  // ── Cuotas patronales ──
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
  const cuotaPatron = fijaEym + excEymPatron + prestDinero + gmp + invVida + guarderias + retiroSar + ceav + riesgoTrabajo;

  // ── Cuota obrera (2.375% del SBC + 0.40% del excedente >3 UMA) ──
  const parteObrera = imss.obrero.totalSinExcedente * sbcMensual
    + imss.obrero.eymExcedente * excedenteDiario * diasMes;

  const cuotaTotal = cuotaPatron + parteObrera;
  const costoPatron = salario + cuotaPatron + (absorbePatron ? parteObrera : 0);
  const pctSobreSalario = (cuotaTotal / salario) * 100;

  const _insight = {
    title: 'Cuánto cuesta asegurarla en el IMSS',
    text: `Con un salario de **${fmtMXN(salario)}** al mes (${esquemaLabel}), la cuota mensual del IMSS es de **${fmtMXN(r2(cuotaTotal))}**: ${fmtMXN(r2(cuotaPatron))} de cuota patronal y ${fmtMXN(r2(parteObrera))} de cuota obrera, que ${absorbePatron ? 'decidiste absorber tú (lo más común en el trabajo del hogar)' : 'le retienes de su salario'}. Eso equivale a un **${pctSobreSalario.toFixed(1)}%** extra sobre el salario y le da cobertura médica, incapacidades, guardería y ahorro para el retiro.${bajoMinimo ? ` ⚠️ Ojo: el salario por día trabajado (${fmtMXN(r2(salarioDiario))}) queda **debajo del mínimo 2026** (${fmtMXN(salarioMinimo.generalDiario)} diarios); el IMSS no admite cotizar por menos del mínimo, así que la cuota se calculó sobre ${fmtMXN(salarioMinimo.generalDiario)} por día — y además estarías pagando un salario por debajo de la ley.` : ''}`,
    tone: bajoMinimo ? 'warn' : 'good',
    icon: '🏠',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Cuota patronal', value: r2(cuotaPatron) },
      { label: 'Cuota obrera', value: r2(parteObrera) },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmtMXN(r2(cuotaTotal)),
    centerLabel: 'Cuota IMSS al mes',
    ariaLabel: `Cuota mensual del IMSS de ${fmtMXN(r2(cuotaTotal))}: ${fmtMXN(r2(cuotaPatron))} de cuota patronal y ${fmtMXN(r2(parteObrera))} de cuota obrera.`,
  };

  return {
    cuotaMensual: fmtMXN(r2(cuotaTotal)),
    cuotaPatron: fmtMXN(r2(cuotaPatron)),
    parteObrera: `${fmtMXN(r2(parteObrera))} (${absorbePatron ? 'la absorbes tú' : 'se le retiene del salario'})`,
    costoPatron: `${fmtMXN(r2(costoPatron))} al mes (salario + IMSS)`,
    detalle: `Cotiza ${diasMes === factorMensual ? '30.4 días' : `~${r2(diasMes)} días`} al mes con salario integrado de ${fmtMXN(r2(sdi))} diarios (salario ${fmtMXN(r2(salarioDiarioCotizable))} × factor ${factor} por aguinaldo y prima vacacional) → SBC mensual ${fmtMXN(r2(sbcMensual))}. La cuota equivale al ${pctSobreSalario.toFixed(1)}% del salario. Sin INFONAVIT obligatorio en este esquema.`,
    _insight,
    _chart,
  };
}
