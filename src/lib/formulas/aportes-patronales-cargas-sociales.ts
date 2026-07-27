/**
 * Calculadora de Aportes Patronales y Cargas Sociales del Empleador (Argentina)
 *
 * Marco legal:
 *   - Decreto 814/2001: alícuotas patronales unificadas (inc. a y b)
 *   - Ley 27.430 (reforma tributaria 2017): consolidación al 20,4% / 18%
 *   - Ley 23.660: obras sociales (6% empleador)
 *   - Ley 24.557: ART (variable según CIIU)
 *   - Ley 24.241: SIPA (jubilación)
 *   - Ley 19.032: INSSJP / PAMI
 *
 * Composición de la alícuota unificada del Dec. 814:
 *   Inciso a (comercio/servicios grandes, 20,4% total):
 *     - SIPA       12,71%
 *     - INSSJP      1,62%
 *     - FNE         1,07%
 *     - AAFF        5,40%
 *
 *   Inciso b (PyME, industria, agro, servicios chicos, 18% total):
 *     - SIPA       10,77%
 *     - INSSJP      1,50%
 *     - FNE         0,89%
 *     - AAFF        4,44%
 *
 *   Adicional fuera del 814:
 *     - Obra social empleador (Ley 23.660): 6%
 *     - ART (Ley 24.557): 1% / 2,5% / 5% según riesgo (estimación)
 *
 *   Aportes empleado (descontados del recibo, no son costo empresa):
 *     - SIPA       11%
 *     - INSSJP      3%
 *     - OS          3%
 *     Total        17%
 */

type ActividadEmpleadora = 'comercio' | 'industria' | 'servicios' | 'agro';
type RiesgoART = 'bajo' | 'medio' | 'alto';

export interface AportesPatronalesInputs {
  sueldoBruto: number;
  actividadEmpleadora: ActividadEmpleadora;
  riesgoART: RiesgoART;
  obraSocialEmpleador: boolean;
}

export interface AportesPatronalesOutputs {
  costoTotalEmpresa: number;
  aporteSIPA: number;
  aporteINSSJP: number;
  aporteFNE: number;
  aporteAAFF: number;
  art: number;
  obraSocial: number;
  totalCargasPatronales: number;
  aportesEmpleado: number;
  sueldoNetoEmpleado: number;
  porcentajeCargaTotal: string;
  _chart?: any;
  _insight?: any;
}

export const ALICUOTAS_DEC_814 = {
  // Inciso a: comercio y servicios grandes - 20,4% total
  a: {
    sipa: 0.1271,
    inssjp: 0.0162,
    fne: 0.0107,
    aaff: 0.054,
  },
  // Inciso b: PyME, industria, agro, servicios chicos - 18% total
  b: {
    sipa: 0.1077,
    inssjp: 0.015,
    fne: 0.0089,
    aaff: 0.0444,
  },
} as const;

export const ART_POR_RIESGO: Record<RiesgoART, number> = {
  bajo: 0.01,
  medio: 0.025,
  alto: 0.05,
};

export const APORTE_OBRA_SOCIAL_EMPLEADOR = 0.06;
export const APORTES_EMPLEADO_TOTAL = 0.17; // 11% SIPA + 3% PAMI + 3% OS

export function aportesPatronalesCargasSociales(
  inputs: AportesPatronalesInputs
): AportesPatronalesOutputs {
  const sueldo = Number(inputs.sueldoBruto);

  if (!sueldo || sueldo <= 0) {
    throw new Error('Ingresá el sueldo bruto mensual');
  }

  const actividad: ActividadEmpleadora = inputs.actividadEmpleadora || 'comercio';
  const riesgo: RiesgoART = inputs.riesgoART || 'medio';
  const pagaObraSocial = inputs.obraSocialEmpleador !== false;

  // Inciso a sólo aplica a comercio y servicios grandes; resto va inciso b
  const inciso = actividad === 'comercio' ? 'a' : 'b';
  const alic = ALICUOTAS_DEC_814[inciso];

  const aporteSIPA = sueldo * alic.sipa;
  const aporteINSSJP = sueldo * alic.inssjp;
  const aporteFNE = sueldo * alic.fne;
  const aporteAAFF = sueldo * alic.aaff;

  const artAlicuota = ART_POR_RIESGO[riesgo];
  const art = sueldo * artAlicuota;

  const obraSocial = pagaObraSocial ? sueldo * APORTE_OBRA_SOCIAL_EMPLEADOR : 0;

  const totalCargasPatronales =
    aporteSIPA + aporteINSSJP + aporteFNE + aporteAAFF + art + obraSocial;

  const costoTotalEmpresa = sueldo + totalCargasPatronales;

  // Aportes del empleado: 17% del bruto (descontado del recibo)
  const aportesEmpleado = sueldo * APORTES_EMPLEADO_TOTAL;
  const sueldoNetoEmpleado = sueldo - aportesEmpleado;

  const porcentajeSobreBruto = (totalCargasPatronales / sueldo) * 100;
  const porcentajeCargaTotal = `${porcentajeSobreBruto.toFixed(1)}% del sueldo bruto`;

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Sueldo bruto', value: Math.round(sueldo) },
      { label: 'SIPA', value: Math.round(aporteSIPA) },
      { label: 'INSSJP / PAMI', value: Math.round(aporteINSSJP) },
      { label: 'Fondo Nacional Empleo', value: Math.round(aporteFNE) },
      { label: 'Asignaciones familiares', value: Math.round(aporteAAFF) },
      { label: 'ART', value: Math.round(art) },
      { label: 'Obra social empleador', value: Math.round(obraSocial) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(costoTotalEmpresa).toLocaleString('es-AR'),
    centerLabel: 'Costo total empresa',
    ariaLabel: 'Composición del costo laboral total: sueldo bruto más cargas patronales',
  };

  // Insight: cuánto suma la mochila patronal sobre el bruto y qué pesa más.
  const fmt = (x: number) => Math.round(x).toLocaleString('es-AR');
  const insight = {
    title: 'La mochila patronal',
    text: `Por cada $${fmt(sueldo)} de sueldo bruto, la empresa desembolsa $${fmt(costoTotalEmpresa)}: las cargas suman **${porcentajeSobreBruto.toFixed(1)}% extra** sobre el bruto. El SIPA (jubilación) es el componente más pesado con **$${fmt(aporteSIPA)}**.`,
    tone: 'warn' as const,
    icon: '🏭',
  };

  return {
    costoTotalEmpresa: Math.round(costoTotalEmpresa),
    aporteSIPA: Math.round(aporteSIPA),
    aporteINSSJP: Math.round(aporteINSSJP),
    aporteFNE: Math.round(aporteFNE),
    aporteAAFF: Math.round(aporteAAFF),
    art: Math.round(art),
    obraSocial: Math.round(obraSocial),
    totalCargasPatronales: Math.round(totalCargasPatronales),
    aportesEmpleado: Math.round(aportesEmpleado),
    sueldoNetoEmpleado: Math.round(sueldoNetoEmpleado),
    porcentajeCargaTotal,
    _chart: chart,
    _insight: insight,
  };
}
