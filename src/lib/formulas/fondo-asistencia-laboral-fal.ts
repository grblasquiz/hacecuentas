/**
 * Fondo de Asistencia Laboral (FAL) — Ley 27.802 de Modernización Laboral (art. 55-62)
 * Reglamentado por Decreto 408/2026. Vigencia: 1° de noviembre de 2026.
 *
 * Mecanismo (fuentes: Ley 27.802, Decreto 408/2026, El Cronista, iProfesional):
 *  - Contribución patronal mensual sobre la masa salarial (base SIPA):
 *      · MiPyME (con certificado MiPyME, Res. SEPyME 220/2019): 2,5 % (elevable hasta 3 %)
 *      · Gran empresa: 1 % (elevable hasta 1,5 %)
 *  - La contribución se DETRAE de las contribuciones patronales de seguridad
 *    social (Decreto 408/2026, art. 24) → no es costo de caja adicional: es una
 *    redirección hacia una cuenta individual del empleador (FCI o fideicomiso
 *    supervisado por CNV), patrimonio separado e inembargable.
 *  - El fondo solo puede usarse a partir del 7° aporte mensual y únicamente para
 *    pagar indemnizaciones por extinción (preaviso art. 232, integración art. 233,
 *    antigüedad art. 245 LCT, mutuo acuerdo, fallecimiento). No sustituye el
 *    régimen indemnizatorio (art. 58): si el saldo no alcanza, la diferencia la
 *    paga el empleador.
 *
 * Cálculo anual: 13 masas salariales (12 sueldos + 1 SAC, la base SIPA incluye
 * el aguinaldo cuando se liquida).
 */
export interface Inputs {
  sueldoBruto: number | string;      // bruto mensual promedio por empleado
  cantidadEmpleados?: number | string;
  tipoEmpresa?: 'pyme' | 'grande' | string;
}
export interface Outputs {
  aporteFalMensual: number;
  aporteFalAnual: number;
  masaSalarialMensual: number;
  alicuotaFal: number;
  reduccionSeguridadSocial: number;
  costoAdicionalNeto: number;
  fondoAcumuladoPrimerAnio: number;
  costoLaboralMensualAntes: number;
  costoLaboralMensualDespues: number;
  _chart?: any;
  _insight?: any;
}

// Alícuotas FAL — Ley 27.802 (el PEN puede elevarlas hasta 3 % / 1,5 %)
const FAL_PYME = 0.025;
const FAL_GRANDE = 0.01;
// Cargas patronales de referencia (Decreto 814/2001) para el antes/después
const CARGA_PYME = 0.18;
const CARGA_GRANDE = 0.204;
// Aportes anuales: 12 sueldos + 1 SAC (la base imponible incluye el aguinaldo)
const MESES_CON_SAC = 13;

const num = (v: unknown, def = 0): number => {
  if (v === '' || v === null || v === undefined) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

export function compute(i: Inputs): Outputs {
  const bruto = num(i.sueldoBruto);
  const empleados = Math.max(1, Math.round(num(i.cantidadEmpleados, 1)));
  const esPyme = String(i.tipoEmpresa || 'pyme') === 'pyme';
  if (!bruto || bruto <= 0) throw new Error('Ingresá el sueldo bruto promedio');

  const alicuota = esPyme ? FAL_PYME : FAL_GRANDE;
  const carga = esPyme ? CARGA_PYME : CARGA_GRANDE;

  const masa = bruto * empleados;
  const aporteMensual = masa * alicuota;
  const aporteAnual = aporteMensual * MESES_CON_SAC;

  // Decreto 408/2026 art. 24: la alícuota FAL se detrae de las contribuciones
  // patronales de seguridad social → reducción equivalente, costo de caja neto 0.
  const reduccion = aporteMensual;
  const costoAdicionalNeto = 0;

  const contribucionesAntes = masa * carga;
  const contribucionesSegSocialDespues = contribucionesAntes - aporteMensual;
  const costoLaboralAntes = masa + contribucionesAntes;
  const costoLaboralDespues = masa + contribucionesSegSocialDespues + aporteMensual; // = antes

  // Referencia: una indemnización por antigüedad (art. 245) de un empleado con
  // 1 año es ~1 sueldo bruto. ¿Qué % cubre el fondo acumulado en el 1er año?
  const fondoPorEmpleadoAnio = bruto * alicuota * MESES_CON_SAC;
  const coberturaPct = Math.round((fondoPorEmpleadoAnio / bruto) * 100);

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Seguridad social (ANSES y otros)', value: Math.round(contribucionesSegSocialDespues) },
      { label: 'Cuenta FAL propia', value: Math.round(aporteMensual) },
    ],
    prefix: '$',
    centerValue: '$' + fmt.format(Math.round(aporteMensual)),
    centerLabel: 'FAL/mes',
    ariaLabel: 'Cómo se reparten las contribuciones patronales desde el 1 de noviembre de 2026: seguridad social vs. cuenta individual FAL.',
  };

  const insight = {
    title: 'Mismo costo de caja, pero ahora una parte queda en tu cuenta',
    text: `Desde el 1-nov-2026 vas a depositar **$${fmt.format(Math.round(aporteMensual))}/mes** (${(alicuota * 100).toLocaleString('es-AR')}% de la nómina) en tu cuenta FAL, que se **detrae de las contribuciones patronales** que ya pagás: tu costo laboral total sigue siendo **$${fmt.format(Math.round(costoLaboralAntes))}/mes**. En el primer año acumulás **$${fmt.format(Math.round(aporteAnual))}** — el equivalente al **${coberturaPct}%** de una indemnización de 1 año de antigüedad por empleado. Si despedís antes de juntar fondos, la diferencia sale de tu caja igual que hoy.`,
    tone: 'info' as const,
    icon: '🏦',
  };

  return {
    aporteFalMensual: Math.round(aporteMensual),
    aporteFalAnual: Math.round(aporteAnual),
    masaSalarialMensual: Math.round(masa),
    alicuotaFal: Number((alicuota * 100).toFixed(1)),
    reduccionSeguridadSocial: Math.round(reduccion),
    costoAdicionalNeto,
    fondoAcumuladoPrimerAnio: Math.round(aporteAnual),
    costoLaboralMensualAntes: Math.round(costoLaboralAntes),
    costoLaboralMensualDespues: Math.round(costoLaboralDespues),
    _chart: chart,
    _insight: insight,
  };
}
