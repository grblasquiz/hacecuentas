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
  _chart?: any;
  _insight?: any;
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

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Sueldo bruto', value: Math.round(bruto) },
      { label: 'Cargas patronales', value: Math.round(cargas) },
      { label: 'SAC', value: Math.round(sacMensual) },
      { label: 'Vacaciones', value: Math.round(vacaciones) },
      { label: 'ART', value: Math.round(artMonto) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(costoMensual).toLocaleString('es-AR'),
    centerLabel: 'Costo/mes',
    ariaLabel: 'Composición del costo laboral mensual: sueldo bruto, cargas patronales, SAC, vacaciones y ART.',
  };

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const extra = costoMensual - bruto;
  const pctExtra = bruto > 0 ? Math.round((extra / bruto) * 100) : 0;
  const insight = {
    title: 'El costo real va más allá del sueldo',
    text: `Por cada **$${fmt.format(Math.round(bruto))}** de sueldo bruto, la empresa termina pagando **$${fmt.format(Math.round(costoMensual))}**: un **${pctExtra}% extra** en cargas, SAC, vacaciones y ART. En el año son **$${fmt.format(Math.round(costoAnual))}**.`,
    tone: 'warn' as const,
    icon: '🧾',
  };

  return {
    sueldoBruto: Math.round(bruto),
    cargasPatronales: Math.round(cargas),
    sacProporcional: Math.round(sacMensual),
    vacacionesProporcional: Math.round(vacaciones),
    art: Math.round(artMonto),
    costoMensualTotal: Math.round(costoMensual),
    costoAnualTotal: Math.round(costoAnual),
    ratioSueldoCosto: Number(ratio.toFixed(2)),
    _chart: chart,
    _insight: insight,
  };
}
