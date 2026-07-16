/**
 * Indemnización sustitutiva de preaviso — LCT (Ley 20.744) arts. 231 y 232.
 *
 * Si el empleador despide sin dar el preaviso, debe pagar los salarios del plazo
 * omitido (indemnización sustitutiva del art. 232) más el SAC proporcional.
 *
 *   Plazos de preaviso (art. 231):
 *     - Durante el período de prueba (primeros 3 meses):  15 días
 *     - Antigüedad de 3 meses a 5 años:                    1 mes
 *     - Antigüedad mayor a 5 años:                         2 meses
 *
 *   Indemnización sustitutiva = mejor remuneración mensual × meses de preaviso
 *   SAC sobre preaviso = indemnización sustitutiva ÷ 12
 *   (opcional) Integración del mes de despido (art. 233) = días que faltan hasta
 *     fin de mes ÷ 30 × sueldo + su SAC, cuando el despido no cae a fin de mes.
 *
 * Es un componente de la liquidación por despido, no la indemnización por
 * antigüedad (art. 245). Estimación orientativa: la liquidación real la define
 * el CCT, la jurisprudencia y el caso concreto.
 */

export interface Inputs {
  sueldoBruto: number;      // mejor remuneración mensual, normal y habitual
  antiguedadAnios: number;
  antiguedadMeses?: number; // 0-11 meses extra
  periodoPrueba?: string;   // 'si' | 'no'
  incluirIntegracion?: string; // 'si' | 'no'
  diaDespido?: number;      // 1-31, para la integración del mes
}

export interface Outputs {
  indemnizacionSustitutiva: string;
  sacPreaviso: string;
  integracionMes: string;
  sacIntegracion: string;
  total: string;
  plazoPreaviso: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

const fmt = (n: number): string => '$' + Math.round(n).toLocaleString('es-AR');

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoBruto) || 0;
  const anios = Math.max(0, Number(i.antiguedadAnios) || 0);
  const meses = Math.max(0, Math.min(11, Number(i.antiguedadMeses) || 0));
  const enPrueba = String(i.periodoPrueba || 'no') === 'si';
  const conIntegracion = String(i.incluirIntegracion || 'no') === 'si';
  const diaDespido = Math.max(1, Math.min(31, Number(i.diaDespido) || 15));

  if (sueldo <= 0) throw new Error('Ingresá el sueldo bruto (mejor remuneración mensual).');

  const antiguedadTotal = anios + meses / 12;

  // Plazo de preaviso (art. 231) expresado en MESES de sueldo.
  let mesesPreaviso: number;
  let plazoPreaviso: string;
  if (enPrueba || antiguedadTotal < 0.25) {
    mesesPreaviso = 0.5; // 15 días
    plazoPreaviso = '15 días (período de prueba)';
  } else if (antiguedadTotal <= 5) {
    mesesPreaviso = 1;
    plazoPreaviso = '1 mes (antigüedad de 3 meses a 5 años)';
  } else {
    mesesPreaviso = 2;
    plazoPreaviso = '2 meses (antigüedad mayor a 5 años)';
  }

  const indemnizacionSustitutiva = sueldo * mesesPreaviso;
  const sacPreaviso = indemnizacionSustitutiva / 12;

  // Integración del mes de despido (art. 233): días que faltan hasta fin de mes.
  let integracionMes = 0;
  let sacIntegracion = 0;
  if (conIntegracion) {
    const diasRestantes = Math.max(0, 30 - diaDespido);
    integracionMes = (sueldo / 30) * diasRestantes;
    sacIntegracion = integracionMes / 12;
  }

  const total = indemnizacionSustitutiva + sacPreaviso + integracionMes + sacIntegracion;

  const _insight = {
    title: `Preaviso: ${fmt(indemnizacionSustitutiva + sacPreaviso)}`,
    text: `Con **${anios} año(s)${meses ? ` y ${meses} meses` : ''}** de antigüedad te corresponde un preaviso de **${plazoPreaviso}**. La indemnización sustitutiva es **${fmt(indemnizacionSustitutiva)}** más **${fmt(sacPreaviso)}** de SAC sobre el preaviso${conIntegracion ? `, y la integración del mes suma **${fmt(integracionMes + sacIntegracion)}**` : ''}. Total estimado del preaviso: **${fmt(total)}**. Es solo una parte de la liquidación por despido: se suma a la indemnización por antigüedad del art. 245.`,
    tone: 'neutral',
    icon: '📄',
  };

  const slices = [
    { label: 'Indemnización sustitutiva', value: Math.round(indemnizacionSustitutiva) },
    { label: 'SAC sobre preaviso', value: Math.round(sacPreaviso) },
  ];
  if (conIntegracion) {
    slices.push({ label: 'Integración del mes', value: Math.round(integracionMes) });
    slices.push({ label: 'SAC integración', value: Math.round(sacIntegracion) });
  }
  const _chart = {
    type: 'doughnut' as const,
    slices,
    prefix: '$',
    centerValue: fmt(total),
    centerLabel: 'Total preaviso',
    ariaLabel: `Total del preaviso ${fmt(total)}: indemnización sustitutiva ${fmt(indemnizacionSustitutiva)} y SAC ${fmt(sacPreaviso)}${conIntegracion ? `, más integración del mes ${fmt(integracionMes)} y su SAC` : ''}.`,
  };

  return {
    indemnizacionSustitutiva: fmt(indemnizacionSustitutiva),
    sacPreaviso: fmt(sacPreaviso),
    integracionMes: fmt(integracionMes),
    sacIntegracion: fmt(sacIntegracion),
    total: fmt(total),
    plazoPreaviso,
    detalle: `Preaviso ${plazoPreaviso}: ${fmt(indemnizacionSustitutiva)} + SAC ${fmt(sacPreaviso)}${conIntegracion ? ` + integración ${fmt(integracionMes)} + SAC ${fmt(sacIntegracion)}` : ''} = ${fmt(total)}.`,
    _insight,
    _chart,
  };
}
