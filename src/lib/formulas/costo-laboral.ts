/** Costo laboral total del empleador — sueldo + cargas sociales + SAC + vacaciones */
export interface Inputs {
  sueldoBruto: number;
  tipoEmpresa?: 'pyme' | 'grande' | string;
  seguroART?: number;
}
export interface Outputs {
  sueldoBruto: number;
  cargasPatronales: number;
  sacProporcional: number;
  vacacionesProporcional: number;
  art: number;
  costoMensualTotal: number;
  costoAnualTotal: number;
  ratioSueldoCosto: number;
}

// Alícuotas patronales 2026 (aproximadas)
// Empresa grande (comercio/servicios > $35M facturación): 20.4 % (jubilación 16 % + AT 6 % + FNE 1.5 % + INSSJP 1.5 % − algunas reducciones)
// Pyme: 18 % aprox
const CARGA_GRANDE = 0.2040;
const CARGA_PYME = 0.1800;
const ART_DEFAULT = 0.03; // 3 % promedio, varía mucho por actividad

export function costoLaboral(i: Inputs): Outputs {
  const bruto = Number(i.sueldoBruto);
  const tipo = String(i.tipoEmpresa || 'grande');
  const art = Number(i.seguroART) !== undefined && i.seguroART !== null && !isNaN(Number(i.seguroART))
    ? Number(i.seguroART) / 100
    : ART_DEFAULT;
  if (!bruto || bruto <= 0) throw new Error('Ingresá el sueldo bruto');

  const cargaTasa = tipo === 'pyme' ? CARGA_PYME : CARGA_GRANDE;
  const cargas = bruto * cargaTasa;
  const sacMensual = bruto / 12; // 1 mes extra al año = 1/12 mensual
  const vacaciones = bruto * 14 / 365; // aprox 14 días por año para empleado < 5 años
  const artMonto = bruto * art;

  const costoMensual = bruto + cargas + sacMensual + vacaciones + artMonto;
  const costoAnual = costoMensual * 12;
  const ratio = costoMensual / bruto;

  return {
    sueldoBruto: Math.round(bruto),
    cargasPatronales: Math.round(cargas),
    sacProporcional: Math.round(sacMensual),
    vacacionesProporcional: Math.round(vacaciones),
    art: Math.round(artMonto),
    costoMensualTotal: Math.round(costoMensual),
    costoAnualTotal: Math.round(costoAnual),
    ratioSueldoCosto: Number(ratio.toFixed(2)),
  };
}
