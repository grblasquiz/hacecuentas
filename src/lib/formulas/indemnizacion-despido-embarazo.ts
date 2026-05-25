/**
 * Calculadora de Indemnización por despido durante embarazo / maternidad (Argentina)
 *
 * Marco legal:
 *   - Art. 177 LCT (Ley 20.744): protección maternidad — licencia 90 días
 *     (45 días antes + 45 días después del parto, o 30+60 a opción).
 *   - Art. 178 LCT: PRESUNCIÓN legal de despido por causa de maternidad o
 *     embarazo si se produce dentro de los 7½ MESES ANTERIORES o POSTERIORES
 *     al parto, siempre que la trabajadora haya notificado y acreditado el
 *     embarazo o nacimiento.
 *   - Art. 182 LCT: INDEMNIZACIÓN ESPECIAL ESTABILIDAD POR MATERNIDAD =
 *     UN (1) AÑO DE REMUNERACIONES (13 sueldos brutos: 12 mensuales + 1 SAC).
 *     Se acumula a la indemnización del Art. 245 + preaviso + integración +
 *     SAC + vacaciones.
 *
 * Fórmula:
 *   total = art_245 + art_182 + preaviso + sac_preaviso +
 *           integracion + sac_integracion + sac_proporcional +
 *           vacaciones_no_gozadas + sac_vacaciones
 *
 *   donde art_182 = sueldo_bruto × 13
 *
 * Nota: el cómputo de art_245 sigue igual que en despido sin causa común
 * (Vizzoti aplica si tope < 67% de base). Esta calc aplica también a
 * Art. 181 (despido por matrimonio, plazo 3 meses antes / 6 después).
 */

export interface IndemnizacionDespidoEmbarazoInputs {
  sueldoBruto: number; // mejor remuneración mensual normal y habitual del último año
  antiguedadAnios: number;
  antiguedadMeses: number; // 0-11, meses extra
  topeConvenio: number; // 3 × promedio convencional; 0 = sin tope
  diaDespido: number; // 1-31, día del mes del despido
}

export interface IndemnizacionDespidoEmbarazoOutputs {
  antiguedad: number; // Art. 245
  estabilidadMaternidad: number; // Art. 182 — 13 salarios
  preaviso: number;
  sacPreaviso: number;
  integracionMes: number;
  sacIntegracion: number;
  sacProporcional: number;
  vacacionesProporcionales: number;
  sacVacaciones: number;
  total: number;
  aniosComputables: string;
  baseArt245: number;
  vizzotiAplicado: boolean;
  mensaje: string;
}

export function indemnizacionDespidoEmbarazo(
  inputs: IndemnizacionDespidoEmbarazoInputs,
): IndemnizacionDespidoEmbarazoOutputs {
  const sueldo = Number(inputs.sueldoBruto);
  const anios = Math.max(0, Number(inputs.antiguedadAnios) || 0);
  const meses = Math.max(0, Math.min(11, Number(inputs.antiguedadMeses) || 0));
  const tope = Math.max(0, Number(inputs.topeConvenio) || 0);
  const diaDespido = Math.max(1, Math.min(31, Number(inputs.diaDespido) || 15));

  if (!sueldo || sueldo <= 0) {
    throw new Error('Ingresá el sueldo bruto mensual');
  }
  if (anios === 0 && meses === 0) {
    throw new Error('Ingresá la antigüedad laboral');
  }

  const antiguedadTotalMeses = anios * 12 + meses;
  const aniosComputables = meses > 3 ? anios + 1 : anios;

  // Art. 245: base con tope + Vizzoti
  let baseArt245 = sueldo;
  let vizzotiAplicado = false;
  if (tope > 0) {
    const minConVizzoti = sueldo * 0.67;
    if (tope < minConVizzoti) {
      baseArt245 = minConVizzoti;
      vizzotiAplicado = true;
    } else {
      baseArt245 = tope;
    }
  }
  const antiguedad = baseArt245 * aniosComputables;

  // Art. 182: estabilidad por maternidad = 13 salarios brutos (1 año remuneraciones)
  // Esto se SUMA a la indemnización Art. 245 y demás rubros.
  const estabilidadMaternidad = sueldo * 13;

  // Preaviso: 15 días (<3 meses) / 1 mes (3m-5a) / 2 meses (>5a)
  let mesesPreaviso = 0;
  if (antiguedadTotalMeses < 3) mesesPreaviso = 0.5;
  else if (antiguedadTotalMeses <= 12 * 5) mesesPreaviso = 1;
  else mesesPreaviso = 2;
  const preaviso = sueldo * mesesPreaviso;
  const sacPreaviso = preaviso / 12;

  // Integración mes
  const diasMes = 30;
  const diasFaltantes = Math.max(0, diasMes - diaDespido);
  const integracionMes = (sueldo / diasMes) * diasFaltantes;
  const sacIntegracion = integracionMes / 12;

  // SAC proporcional (promedio 3 meses del semestre)
  const sacProporcional = (sueldo / 2) * (3 / 6);

  // Vacaciones proporcionales
  let diasVacAnual: number;
  if (anios < 5) diasVacAnual = 14;
  else if (anios < 10) diasVacAnual = 21;
  else if (anios < 20) diasVacAnual = 28;
  else diasVacAnual = 35;
  const diasVacProp = (diasVacAnual * 6) / 12;
  const valorDia = sueldo / 25;
  const vacacionesProporcionales = valorDia * diasVacProp;
  const sacVacaciones = vacacionesProporcionales / 12;

  const total =
    antiguedad +
    estabilidadMaternidad +
    preaviso +
    sacPreaviso +
    integracionMes +
    sacIntegracion +
    sacProporcional +
    vacacionesProporcionales +
    sacVacaciones;

  const mensaje = `Si el despido se produjo dentro de los 7,5 meses anteriores o posteriores al parto y notificaste el embarazo al empleador, se presume causa de maternidad (Art. 178 LCT) y corresponde la indemnización agravada del Art. 182: 13 sueldos brutos adicionales al Art. 245.`;

  return {
    antiguedad: Math.round(antiguedad),
    estabilidadMaternidad: Math.round(estabilidadMaternidad),
    preaviso: Math.round(preaviso),
    sacPreaviso: Math.round(sacPreaviso),
    integracionMes: Math.round(integracionMes),
    sacIntegracion: Math.round(sacIntegracion),
    sacProporcional: Math.round(sacProporcional),
    vacacionesProporcionales: Math.round(vacacionesProporcionales),
    sacVacaciones: Math.round(sacVacaciones),
    total: Math.round(total),
    aniosComputables: `${aniosComputables} ${aniosComputables === 1 ? 'año' : 'años'} computables`,
    baseArt245: Math.round(baseArt245),
    vizzotiAplicado,
    mensaje,
  };
}
