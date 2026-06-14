import { COLOMBIA_2026, retefuenteMensualArt383 } from '../data/colombia-2026';
export interface Inputs {
  salario_mensual_bruto: number;
  num_dependientes?: number;
  aporte_afc_mensual?: number;
  cotizacion_eps_pensión?: number;
}

export interface Outputs {
  salario_anual_bruto: number;
  renta_anual_depurada: number;
  uvt_2026: number;
  renta_en_uvt: number;
  tramo_aplicable: string;
  tarifa_marginal: number;
  retefuente_mensual: number;
  retefuente_anual: number;
  salario_neto_mensual: number;
  tasa_efectiva: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 DIAN
  const UVT_2026 = COLOMBIA_2026.uvt; // UVT 2026 = $52.374 (Resolución DIAN 000238/2025)
  const COTIZACION_EPS_PENSIÓN_DEFAULT = 8; // 4% EPS + 4% pensión
  const DEDUCCIÓN_DEPENDIENTE_UVT = 2; // 2 UVT/mes por dependiente (art. 387 ET, variante simplificada)
  const RENTA_EXENTA_PCT = COLOMBIA_2026.rentaExentaLaboral.porcentaje; // 0,25 (art. 206-10 ET)
  const TOPE_EXENTA_MENSUAL_UVT = COLOMBIA_2026.rentaExentaLaboral.topeAnualUvt / 12; // 790/12 ≈ 65,83 UVT/mes
  const TOPE_GLOBAL_MENSUAL_UVT = 1340 / 12; // art. 336/388 ET: 1.340 UVT/año ≈ 111,67 UVT/mes

  // Inputs con defaults
  const salarioMensual = Math.max(0, i.salario_mensual_bruto || 0);
  const numDependientes = Math.max(0, i.num_dependientes || 0);
  const aporteAfc = Math.max(0, i.aporte_afc_mensual || 0);
  const cotizacionPorcentaje = i.cotizacion_eps_pensión ?? COTIZACION_EPS_PENSIÓN_DEFAULT;
  const cotizacionMontoMensual = (salarioMensual * cotizacionPorcentaje) / 100; // aportes obligatorios = INCRNGO

  // 1. Salario anual bruto
  const salarioAnualBruto = salarioMensual * 12;

  // 2. Ingreso del mes tras INCRNGO (aportes obligatorios a salud y pensión, art. 387 ET)
  const ingresoNetoMensual = Math.max(0, salarioMensual - cotizacionMontoMensual);

  // 3. Deducciones (art. 387 ET): dependientes a 2 UVT/mes c/u.
  //    (Intereses de vivienda y medicina prepagada no se modelan en esta versión.)
  const deduccionDependientesMensual = DEDUCCIÓN_DEPENDIENTE_UVT * UVT_2026 * numDependientes;

  // 4. Renta exenta laboral del 25% (art. 206-10 ET). Se calcula sobre el subtotal que queda
  //    tras restar INCRNGO, deducciones y las demás rentas exentas (AFC). Tope 790 UVT/año.
  const subtotalParaExenta = Math.max(0, ingresoNetoMensual - deduccionDependientesMensual - aporteAfc);
  const rentaExenta25 = Math.min(RENTA_EXENTA_PCT * subtotalParaExenta, TOPE_EXENTA_MENSUAL_UVT * UVT_2026);

  // 5. Límite global de beneficios (art. 336/388 ET): deducciones + rentas exentas
  //    ≤ 40% del ingreso tras INCRNGO y ≤ 1.340 UVT/año.
  const beneficiosBrutos = deduccionDependientesMensual + aporteAfc + rentaExenta25;
  const topeGlobal = Math.min(0.40 * ingresoNetoMensual, TOPE_GLOBAL_MENSUAL_UVT * UVT_2026);
  const beneficiosAplicados = Math.min(beneficiosBrutos, topeGlobal);

  // 6. Base gravable MENSUAL de retención y su valor en UVT.
  //    La tabla del art. 383 ET es MENSUAL: los tramos en UVT se evalúan sobre la base del mes.
  const baseMensualDepurada = Math.max(0, ingresoNetoMensual - beneficiosAplicados);
  const rentaAnualDepurada = baseMensualDepurada * 12; // base anual equivalente (para el output)
  const rentaEnUvt = baseMensualDepurada / UVT_2026;

  // 7. Tramo marginal del art. 383 ET sobre la base MENSUAL en UVT
  // Tramos: 0-95 (0%), 95-150 (19%), 150-360 (28%), 360-640 (33%), 640-945 (35%), 945-2300 (37%), >2300 (39%)
  let tarifaMarginal = 0;
  let tramoAplicable = "0-95 UVT (Exento)";

  if (rentaEnUvt > 2300) {
    tarifaMarginal = 39;
    tramoAplicable = ">2.300 UVT (39%)";
  } else if (rentaEnUvt > 945) {
    tarifaMarginal = 37;
    tramoAplicable = "945-2.300 UVT (37%)";
  } else if (rentaEnUvt > 640) {
    tarifaMarginal = 35;
    tramoAplicable = "640-945 UVT (35%)";
  } else if (rentaEnUvt > 360) {
    tarifaMarginal = 33;
    tramoAplicable = "360-640 UVT (33%)";
  } else if (rentaEnUvt > 150) {
    tarifaMarginal = 28;
    tramoAplicable = "150-360 UVT (28%)";
  } else if (rentaEnUvt > 95) {
    tarifaMarginal = 19;
    tramoAplicable = "95-150 UVT (19%)";
  } else {
    tarifaMarginal = 0;
    tramoAplicable = "0-95 UVT (0%)";
  }

  // 8. Retención MENSUAL: tabla progresiva del art. 383 ET
  // (cuota fija en UVT + tarifa marginal sobre el excedente del tramo), NO tasa plana.
  const retefuenteMensual = retefuenteMensualArt383(baseMensualDepurada);

  // 9. Retefuente anual
  const retefuenteAnual = retefuenteMensual * 12;

  // 8. Salario neto mensual
  const salarioNetoMensual = Math.max(
    0,
    salarioMensual - retefuenteMensual - cotizacionMontoMensual - aporteAfc
  );

  // 9. Tasa efectiva
  const tasaEfectiva =
    salarioAnualBruto > 0 ? (retefuenteAnual / salarioAnualBruto) * 100 : 0;

  const fmtCop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');
  const hayRetencion = retefuenteMensual > 0;
  const insight = {
    title: hayRetencion ? `Te retienen ${tasaEfectiva.toFixed(1)}% del sueldo` : 'Salario exento de retención',
    text: hayRetencion
      ? `Tu renta cae en el tramo **${tramoAplicable}**, así que la retención en la fuente es de **${fmtCop(retefuenteMensual)}/mes** (tasa efectiva **${tasaEfectiva.toFixed(1)}%**). En la mano te quedan **${fmtCop(salarioNetoMensual)}** tras retención y aportes a salud y pensión.`
      : `Con tu salario depurado de **${rentaEnUvt.toFixed(0)} UVT** quedás en el tramo exento (**0-95 UVT**): **no te retienen** en la fuente. Recibís **${fmtCop(salarioNetoMensual)}/mes** tras los aportes obligatorios a salud y pensión.`,
    tone: hayRetencion ? 'warn' : 'good',
    icon: hayRetencion ? '🇨🇴' : '✅',
  };
  // Donut: salario bruto mensual = neto + retefuente + aportes salud/pensión + AFC
  const slices: { label: string; value: number }[] = [
    { label: 'Neto en mano', value: Math.round(salarioNetoMensual) },
  ];
  if (retefuenteMensual > 0) slices.push({ label: 'Retención en la fuente', value: Math.round(retefuenteMensual) });
  if (cotizacionMontoMensual > 0) slices.push({ label: 'Salud y pensión', value: Math.round(cotizacionMontoMensual) });
  if (aporteAfc > 0) slices.push({ label: 'Aporte AFC', value: Math.round(aporteAfc) });
  const out: Outputs = {
    salario_anual_bruto: Math.round(salarioAnualBruto),
    renta_anual_depurada: Math.round(rentaAnualDepurada),
    uvt_2026: UVT_2026,
    renta_en_uvt: Math.round(rentaEnUvt * 100) / 100,
    tramo_aplicable: tramoAplicable,
    tarifa_marginal: tarifaMarginal,
    retefuente_mensual: Math.round(retefuenteMensual),
    retefuente_anual: Math.round(retefuenteAnual),
    salario_neto_mensual: Math.round(salarioNetoMensual),
    tasa_efectiva: Math.round(tasaEfectiva * 100) / 100,
    _insight: insight,
  };
  if (salarioMensual > 0 && slices.length > 1) {
    out._chart = {
      type: 'doughnut',
      slices,
      prefix: '$',
      centerValue: fmtCop(salarioMensual),
      centerLabel: 'Salario bruto/mes',
      ariaLabel: `Reparto del salario bruto mensual de ${fmtCop(salarioMensual)} entre neto, retención y aportes`,
    };
  }
  return out;
}
