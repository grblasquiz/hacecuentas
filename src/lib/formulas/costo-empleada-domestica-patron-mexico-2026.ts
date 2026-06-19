/**
 * Costo REAL para el patrón de una trabajadora/empleada del hogar — México 2026.
 *
 * Régimen obligatorio del Programa de Personas Trabajadoras del Hogar (PTHH) del IMSS
 * (LSS Arts. 239-A y ss.; afiliación obligatoria tras el amparo SCJN 9/2018 y la reforma DOF nov-2022):
 *   Costo total = Sueldo + IMSS patronal (PTHH) + INFONAVIT 5% + Aguinaldo (15 días) +
 *                 Prima vacacional (25%) + Prima dominical (25% si trabaja domingos) (+ cuota obrera si la absorbe el patrón).
 *
 * Las vacaciones NO son costo extra: son salario de días no trabajados (sí elevan el SBC vía su prima).
 *
 * Diferencias verificadas 2026 frente a la calc de "solo la cuota IMSS":
 *  - INFONAVIT 5% del SBC ES obligatorio: el registro PTHH genera la aportación de vivienda de forma
 *    simultánea al IMSS (IMSS, calculadora oficial PTHH; Infobae 05-jun-2026). Por eso aquí SÍ se incluye.
 *  - Piso salarial = salario mínimo PROFESIONAL de trabajador(a) del hogar 2026, no el general:
 *    $342.47/día zona general, $440.87/día ZLFN (CONASAMI, DOF 09-dic-2025; +13%).
 *
 * Cuotas IMSS/INFONAVIT, UMA, tabla CEAV 2026 y factor de integración: src/lib/data/mexico-2026.ts.
 */
import { MEXICO_2026, tasaCeavPatron2026, factorIntegracion, fmtMXN } from '../data/mexico-2026.ts';

// ── Salario mínimo PROFESIONAL 2026 de trabajador(a) del hogar (CONASAMI, DOF 09-dic-2025) ──
// Es un mínimo de profesión, superior al general ($315.04): aplica a este oficio por día trabajado.
const SM_PROFESIONAL_HOGAR_2026 = {
  generalDiario: 342.47, // zona general
  zlfnDiario: 440.87,    // Zona Libre de la Frontera Norte (coincide con el general de la ZLFN)
};

export interface Inputs {
  modoSueldo?: string;       // 'mensual' (default) | 'porDia' (sueldo por día × días/semana)
  salarioMensual?: number | string;  // si modoSueldo = 'mensual'
  salarioPorDia?: number | string;   // si modoSueldo = 'porDia'
  diasSemana?: number | string;      // días que trabaja por semana (1..7); 7 = de planta
  trabajaDomingos?: string;  // 'no' (default) | 'si' — dispara la prima dominical
  zona?: string;             // 'general' (default) | 'frontera' (ZLFN)
  cuotaObrera?: string;      // 'patron' (la absorbe el patrón, default) | 'trabajadora' (se le retiene)
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
  const factorMensual = salarioMinimo.factorMensual; // 30.4

  const zona = String(i.zona ?? 'general') === 'frontera' ? 'frontera' : 'general';
  const smProfesionalDia = zona === 'frontera'
    ? SM_PROFESIONAL_HOGAR_2026.zlfnDiario
    : SM_PROFESIONAL_HOGAR_2026.generalDiario;

  // Días cotizados al mes: de planta (7 días/semana) = 30.4; por días = días/semana × (30.4/7).
  const diasSemana = Math.min(7, Math.max(1, Math.floor(num(i.diasSemana, 7))));
  const dePlanta = diasSemana >= 7;
  const diasMes = dePlanta ? factorMensual : diasSemana * (factorMensual / 7);

  // Sueldo mensual: directo, o reconstruido desde el sueldo por día.
  const modo = String(i.modoSueldo ?? 'mensual') === 'porDia' ? 'porDia' : 'mensual';
  let salarioMensualPactado: number;
  if (modo === 'porDia') {
    const porDia = num(i.salarioPorDia, 0);
    if (porDia <= 0) throw new Error('Ingresa el sueldo por día que le pagas');
    salarioMensualPactado = porDia * diasMes;
  } else {
    salarioMensualPactado = num(i.salarioMensual, 0);
    if (salarioMensualPactado <= 0) throw new Error('Ingresa el sueldo mensual que le pagas');
  }

  // Salario por día trabajado y piso legal (SBC nunca menor al mínimo profesional, LSS Art. 28).
  const salarioDiario = salarioMensualPactado / diasMes;
  const bajoMinimo = salarioDiario < smProfesionalDia;
  const salarioDiarioCotizable = Math.max(salarioDiario, smProfesionalDia);

  // Salario diario integrado: aguinaldo (15 días) + prima vacacional (25% de 12 días) → factor 1.0493 (año 1),
  // topado a 25 UMA (LSS Art. 28).
  const factor = factorIntegracion(1);
  const topeSbcDiario = uma.diaria * imss.topeSbcUmas; // 25 UMA
  const sdi = Math.min(salarioDiarioCotizable * factor, topeSbcDiario);
  const sbcMensual = sdi * diasMes;

  // Excedente de 3 UMA (solo enfermedades y maternidad, LSS Art. 106-II).
  const tresUma = uma.diaria * 3;
  const excedenteDiario = Math.max(0, sdi - tresUma);

  // ── Cuotas patronales IMSS (mismos ramos que cualquier trabajador) ──
  const p = imss.patron;
  const fijaEym = p.eymCuotaFijaUma * uma.diaria * diasMes;        // 20.40% de la UMA por día cotizado
  const excEymPatron = p.eymExcedente * excedenteDiario * diasMes;  // 1.10% del excedente >3 UMA
  const prestDinero = p.eymPrestacionesDinero * sbcMensual;         // 0.70%
  const gmp = p.gastosMedicosPensionados * sbcMensual;              // 1.05%
  const invVida = p.invalidezVida * sbcMensual;                     // 1.75%
  const guarderias = p.guarderias * sbcMensual;                     // 1.00%
  const retiroSar = p.retiro * sbcMensual;                          // 2.00% (SAR)
  const ceav = tasaCeavPatron2026(sdi) * sbcMensual;                // tabla CEAV 2026 (3.150%–7.513%)
  const riesgoTrabajo = p.riesgoTrabajoClaseI * sbcMensual;         // prima media clase I (trabajo del hogar)
  const imssPatronal = fijaEym + excEymPatron + prestDinero + gmp + invVida + guarderias + retiroSar + ceav + riesgoTrabajo;

  // ── INFONAVIT 5% del SBC — obligatorio en el PTHH desde 2026 (registro simultáneo al IMSS) ──
  const infonavit = imss.infonavitPatron * sbcMensual;

  // ── Cuota obrera (2.375% del SBC + 0.40% del excedente >3 UMA) — el patrón puede absorberla o retenerla ──
  const absorbePatron = String(i.cuotaObrera ?? 'patron') !== 'trabajadora';
  const parteObrera = imss.obrero.totalSinExcedente * sbcMensual
    + imss.obrero.eymExcedente * excedenteDiario * diasMes;

  // ── Prestaciones LFT prorrateadas a mes (sobre el sueldo real pagado, no el integrado) ──
  // Aguinaldo: mínimo 15 días/año → (15 × salario diario) / 12.
  // Prima vacacional: 25% sobre 12 días de vacaciones (año 1) → (12 × salario diario × 25%) / 12.
  const { lft } = MEXICO_2026;
  const diasVac = lft.vacacionesPorAnio[0]; // 12 días (primer año)
  const provAguinaldo = (lft.aguinaldoDiasMinimo * salarioDiario) / 12;
  const provPrimaVacacional = (diasVac * salarioDiario * lft.primaVacacional) / 12;
  const provisiones = provAguinaldo + provPrimaVacacional;

  // ── Prima dominical (25% extra por cada domingo trabajado, LFT Art. 71) ──
  // Si trabaja domingos: ~4.345 domingos/mes (30.4/7) × 25% del salario diario.
  const trabajaDomingos = String(i.trabajaDomingos ?? 'no') === 'si';
  const domingosMes = factorMensual / 7; // ≈ 4.345
  const primaDominical = trabajaDomingos ? domingosMes * salarioDiario * lft.primaDominical : 0;

  // ── Costo total para el patrón ──
  const cuotasPatronales = imssPatronal + infonavit + (absorbePatron ? parteObrera : 0);
  const costoMensual = salarioMensualPactado + cuotasPatronales + provisiones + primaDominical;
  const costoAnual = costoMensual * 12;
  const cargaExtra = costoMensual - salarioMensualPactado;
  const pctSobreSueldo = (cargaExtra / salarioMensualPactado) * 100;

  const esquemaLabel = dePlanta ? 'de planta (mes completo)' : `${diasSemana} día${diasSemana > 1 ? 's' : ''} por semana`;

  const _insight = {
    title: 'El sueldo no es lo que te cuesta',
    text: `Una empleada del hogar con sueldo de **${fmtMXN(salarioMensualPactado)}** al mes (${esquemaLabel}) te cuesta en realidad **${fmtMXN(r2(costoMensual))}** al mes (**${fmtMXN(r2(costoAnual))}** al año): un **${pctSobreSueldo.toFixed(1)}%** extra sobre el sueldo. Ese extra son ${fmtMXN(r2(imssPatronal))} de IMSS patronal (incluye CEAV y retiro 2%), ${fmtMXN(r2(infonavit))} de INFONAVIT 5%${absorbePatron ? `, ${fmtMXN(r2(parteObrera))} de cuota obrera que absorbes tú` : ''}, ${fmtMXN(r2(provisiones))} de aguinaldo y prima vacacional prorrateados${trabajaDomingos ? ` y ${fmtMXN(r2(primaDominical))} de prima dominical` : ''}. La cuota IMSS+INFONAVIT le da cobertura médica, incapacidades, guardería, vivienda y ahorro para el retiro.${bajoMinimo ? ` ⚠️ Ojo: el sueldo por día (${fmtMXN(r2(salarioDiario))}) queda **debajo del mínimo profesional 2026** de trabajador(a) del hogar (${fmtMXN(smProfesionalDia)} diarios); las cuotas se calcularon sobre ese mínimo y, además, estarías pagando un salario por debajo de la ley.` : ''}`,
    tone: bajoMinimo ? 'warn' : 'neutral',
    icon: '🏠',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Sueldo neto pagado', value: r2(salarioMensualPactado) },
      { label: 'IMSS patronal', value: r2(imssPatronal) },
      { label: 'INFONAVIT 5%', value: r2(infonavit) },
      { label: 'Cuota obrera', value: absorbePatron ? r2(parteObrera) : 0 },
      { label: 'Aguinaldo y prima vacacional', value: r2(provisiones) },
      { label: 'Prima dominical', value: r2(primaDominical) },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmtMXN(r2(costoMensual)),
    centerLabel: 'Costo total al mes',
    ariaLabel: `Costo total mensual de ${fmtMXN(r2(costoMensual))}: sueldo ${fmtMXN(salarioMensualPactado)} más ${fmtMXN(r2(imssPatronal))} de IMSS, ${fmtMXN(r2(infonavit))} de INFONAVIT, ${fmtMXN(r2(provisiones))} de aguinaldo y prima vacacional${trabajaDomingos ? ` y ${fmtMXN(r2(primaDominical))} de prima dominical` : ''}.`,
  };

  return {
    costoMensual: `${fmtMXN(r2(costoMensual))} al mes`,
    costoAnual: `${fmtMXN(r2(costoAnual))} al año`,
    sueldo: `${fmtMXN(r2(salarioMensualPactado))} (${esquemaLabel})`,
    imssInfonavit: `${fmtMXN(r2(imssPatronal + infonavit))} (IMSS ${fmtMXN(r2(imssPatronal))} + INFONAVIT ${fmtMXN(r2(infonavit))})`,
    provisiones: `${fmtMXN(r2(provisiones))} (aguinaldo ${fmtMXN(r2(provAguinaldo))} + prima vacacional ${fmtMXN(r2(provPrimaVacacional))})`,
    primaDominical: trabajaDomingos
      ? `${fmtMXN(r2(primaDominical))} (${r2(domingosMes)} domingos/mes × 25%)`
      : 'No aplica (no trabaja domingos)',
    cuotaObrera: `${fmtMXN(r2(parteObrera))} (${absorbePatron ? 'la absorbes tú' : 'se la retienes del salario'})`,
    cargaPorcentaje: `${pctSobreSueldo.toFixed(1)}% extra sobre el sueldo`,
    detalle: `Cotiza ${dePlanta ? '30.4 días' : `~${r2(diasMes)} días`} al mes con salario integrado de ${fmtMXN(r2(sdi))} diarios (salario ${fmtMXN(r2(salarioDiarioCotizable))} × factor ${factor} por aguinaldo y prima vacacional) → SBC mensual ${fmtMXN(r2(sbcMensual))}. Costo = sueldo ${fmtMXN(r2(salarioMensualPactado))} + IMSS ${fmtMXN(r2(imssPatronal))} + INFONAVIT ${fmtMXN(r2(infonavit))}${absorbePatron ? ` + cuota obrera ${fmtMXN(r2(parteObrera))}` : ''} + prestaciones ${fmtMXN(r2(provisiones))}${trabajaDomingos ? ` + prima dominical ${fmtMXN(r2(primaDominical))}` : ''} = ${fmtMXN(r2(costoMensual))}/mes.`,
    _insight,
    _chart,
  };
}
