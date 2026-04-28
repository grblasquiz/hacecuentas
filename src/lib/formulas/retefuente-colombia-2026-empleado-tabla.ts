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
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 DIAN
  const UVT_2026 = 49799; // Resolución DIAN 2026
  const COTIZACION_EPS_PENSIÓN_DEFAULT = 8; // 4% EPS + 4% pensión
  const DEDUCCIÓN_DEPENDIENTE_UVT = 2; // 2 UVT por dependiente

  // Inputs con defaults
  const salarioMensual = Math.max(0, i.salario_mensual_bruto || 0);
  const numDependientes = Math.max(0, i.num_dependientes || 0);
  const aporteAfc = Math.max(0, i.aporte_afc_mensual || 0);
  const cotizacionPorcentaje = i.cotizacion_eps_pensión ?? COTIZACION_EPS_PENSIÓN_DEFAULT;
  const cotizacionMontoMensual = (salarioMensual * cotizacionPorcentaje) / 100;

  // 1. Salario anual bruto
  const salarioAnualBruto = salarioMensual * 12;

  // 2. Deducciones autorizadas
  const cotizacionAnual = cotizacionMontoMensual * 12;
  const aporteAfcAnual = aporteAfc * 12;
  const deduccionDependientes = DEDUCCIÓN_DEPENDIENTE_UVT * UVT_2026 * numDependientes;
  const totalDeducciones = cotizacionAnual + aporteAfcAnual + deduccionDependientes;

  // 3. Renta anual depurada (base imponible)
  const rentaAnualDepurada = Math.max(0, salarioAnualBruto - totalDeducciones);

  // 4. Convertir a UVT
  const rentaEnUvt = rentaAnualDepurada / UVT_2026;

  // 5. Aplicar tabla DIAN 2026 (Artículo 383 ET)
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

  // 6. Retefuente anual
  const retefuenteAnual = (rentaAnualDepurada * tarifaMarginal) / 100;

  // 7. Retefuente mensual
  const retefuenteMensual = retefuenteAnual / 12;

  // 8. Salario neto mensual
  const salarioNetoMensual = Math.max(
    0,
    salarioMensual - retefuenteMensual - cotizacionMontoMensual - aporteAfc
  );

  // 9. Tasa efectiva
  const tasaEfectiva =
    salarioAnualBruto > 0 ? (retefuenteAnual / salarioAnualBruto) * 100 : 0;

  return {
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
  };
}
