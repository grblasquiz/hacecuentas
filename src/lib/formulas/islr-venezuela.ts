/** ISLR Venezuela personas naturales
 *  Ley de ISLR: tabla en Unidades Tributarias (UT)
 *  UT 2026 estimada: Bs 9.00 (sujeto a ajustes del SENIAT)
 */

export interface Inputs {
  ingresoAnualBs: number;
  deduccionesPersonales: number;
  rebajaPersonal: string;
  cargasFamiliares: number;
  unidadTributaria: number;
}

export interface Outputs {
  enriquecimientoNeto: number;
  enriquecimientoUt: number;
  impuestoBruto: number;
  rebajaTotal: number;
  impuestoNeto: number;
  tasaEfectiva: number;
  formula: string;
  explicacion: string;
}

// Tabla ISLR personas naturales residentes (en UT)
const TABLA_ISLR: Array<{
  desde: number; hasta: number; sustraendo: number; alicuota: number;
}> = [
  { desde: 0, hasta: 1000, sustraendo: 0, alicuota: 6 },
  { desde: 1000, hasta: 1500, sustraendo: 50, alicuota: 9 },
  { desde: 1500, hasta: 2000, sustraendo: 100, alicuota: 12 },
  { desde: 2000, hasta: 2500, sustraendo: 175, alicuota: 16 },
  { desde: 2500, hasta: 3000, sustraendo: 300, alicuota: 20 },
  { desde: 3000, hasta: 4000, sustraendo: 475, alicuota: 24 },
  { desde: 4000, hasta: 6000, sustraendo: 775, alicuota: 29 },
  { desde: 6000, hasta: Infinity, sustraendo: 1175, alicuota: 34 },
];

export function islrVenezuela(i: Inputs): Outputs {
  const ingreso = Number(i.ingresoAnualBs);
  const deducciones = Number(i.deduccionesPersonales) || 0;
  const tieneRebaja = i.rebajaPersonal !== 'no';
  const cargas = Math.max(0, Number(i.cargasFamiliares) || 0);
  const ut = Number(i.unidadTributaria) || 9.00;

  if (!ingreso || ingreso <= 0) throw new Error('Ingresá tu ingreso anual en Bs');

  const enriquecimientoNeto = Math.max(0, ingreso - deducciones);
  const enriquecimientoUt = enriquecimientoNeto / ut;

  // Calcular impuesto según tabla
  let impuestoBrutoUt = 0;
  for (const t of TABLA_ISLR) {
    if (enriquecimientoUt > t.desde && enriquecimientoUt <= t.hasta) {
      impuestoBrutoUt = enriquecimientoUt * (t.alicuota / 100) - t.sustraendo;
      break;
    }
    if (enriquecimientoUt > t.hasta && t.hasta === Infinity) {
      impuestoBrutoUt = enriquecimientoUt * (t.alicuota / 100) - t.sustraendo;
    }
  }
  if (impuestoBrutoUt === 0 && enriquecimientoUt > 6000) {
    const last = TABLA_ISLR[TABLA_ISLR.length - 1];
    impuestoBrutoUt = enriquecimientoUt * (last.alicuota / 100) - last.sustraendo;
  }

  const impuestoBruto = Math.max(0, impuestoBrutoUt * ut);

  // Rebajas: 10 UT personal + 10 UT por carga familiar
  const rebajaPersonalUt = tieneRebaja ? 10 : 0;
  const rebajaCargasUt = cargas * 10;
  const rebajaTotalUt = rebajaPersonalUt + rebajaCargasUt;
  const rebajaTotal = rebajaTotalUt * ut;

  const impuestoNeto = Math.max(0, impuestoBruto - rebajaTotal);
  const tasaEfectiva = ingreso > 0 ? (impuestoNeto / ingreso) * 100 : 0;

  const formula = `ISLR = ${enriquecimientoUt.toFixed(0)} UT × alícuota - sustraendo - rebajas = Bs ${impuestoNeto.toFixed(2)}`;
  const explicacion = `Enriquecimiento neto: Bs ${enriquecimientoNeto.toLocaleString()} (${enriquecimientoUt.toFixed(0)} UT). Impuesto bruto: Bs ${impuestoBruto.toFixed(2)}. Rebajas: ${rebajaPersonalUt} UT personal + ${rebajaCargasUt} UT cargas = Bs ${rebajaTotal.toFixed(2)}. ISLR neto: Bs ${impuestoNeto.toFixed(2)} (tasa efectiva ${tasaEfectiva.toFixed(2)}%). Nota: valores calculados con UT = Bs ${ut}.`;

  return {
    enriquecimientoNeto: Math.round(enriquecimientoNeto),
    enriquecimientoUt: Number(enriquecimientoUt.toFixed(2)),
    impuestoBruto: Number(impuestoBruto.toFixed(2)),
    rebajaTotal: Number(rebajaTotal.toFixed(2)),
    impuestoNeto: Number(impuestoNeto.toFixed(2)),
    tasaEfectiva: Number(tasaEfectiva.toFixed(2)),
    formula,
    explicacion,
  };
}
