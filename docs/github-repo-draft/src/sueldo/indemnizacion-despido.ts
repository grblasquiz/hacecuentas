/**
 * Indemnización por despido sin causa — Argentina
 *
 * Cálculo según Ley de Contrato de Trabajo (LCT) art. 245 + componentes.
 *
 * Fuentes legales:
 *   LCT art. 245: https://servicios.infoleg.gob.ar/infolegInternet/anexos/25000-29999/25552/texact.htm
 *   Doctrina "Vizzoti": tope = 67% del mejor sueldo
 *
 * Componentes que paga el empleador en despido sin causa:
 *   1. Indemnización por antigüedad (art. 245)
 *   2. Preaviso (art. 232 — 1 mes si <5 años, 2 meses si ≥5 años)
 *   3. Integración del mes de despido (art. 233)
 *   4. SAC proporcional sobre indemnizaciones
 *   5. Vacaciones no gozadas + SAC sobre vacaciones
 *
 * Live calculator: https://hacecuentas.com/calculadora-indemnizacion-despido
 */

export interface IndemnizacionDespidoInput {
  /** Mejor sueldo bruto de los últimos 12 meses, en pesos. */
  mejorSueldoUltimos12Meses: number;
  /** Antigüedad en años (puede ser fraccional, ej: 3.5). */
  antiguedadAnos: number;
  /** Día del mes en que se notificó el despido (1-31). Default: 15. */
  diaDespido?: number;
  /** Días de vacaciones no gozadas. Default: 0. */
  vacacionesNoGozadas?: number;
  /** Tope salarial Vizzoti (67% del MEJOR sueldo según CCT). Si lo dejás undefined, no se aplica. */
  topeVizzoti?: number;
}

export interface IndemnizacionDespidoResult {
  /** 1. Indemnización por antigüedad (art. 245). */
  indemnizacionAntiguedad: number;
  /** 2. Preaviso (1 o 2 meses según antigüedad). */
  preaviso: number;
  /** Meses de preaviso aplicados (1 o 2). */
  mesesPreaviso: 1 | 2;
  /** 3. Integración mes de despido. */
  integracionMesDespido: number;
  /** 4. SAC proporcional sobre indemnizaciones (preaviso + integración). */
  sacProporcional: number;
  /** 5. Vacaciones no gozadas. */
  vacacionesNoGozadasMonto: number;
  /** Total bruto a pagar (suma de todos los componentes). */
  total: number;
  /** ¿Aplicó tope Vizzoti? */
  toperaplicado: boolean;
  /** Fórmulas aplicadas (audit trail). */
  detalle: Record<string, string>;
  fuente: string;
}

/**
 * Calcula la indemnización por despido sin causa.
 *
 * @example
 * ```ts
 * indemnizacionDespido({
 *   mejorSueldoUltimos12Meses: 850000,
 *   antiguedadAnos: 3.5,
 *   diaDespido: 15,
 *   vacacionesNoGozadas: 5,
 * });
 * ```
 */
export function indemnizacionDespido(input: IndemnizacionDespidoInput): IndemnizacionDespidoResult {
  const {
    mejorSueldoUltimos12Meses,
    antiguedadAnos,
    diaDespido = 15,
    vacacionesNoGozadas = 0,
    topeVizzoti,
  } = input;

  if (mejorSueldoUltimos12Meses < 0) throw new Error('mejorSueldo debe ser >= 0');
  if (antiguedadAnos < 0) throw new Error('antiguedad debe ser >= 0');

  const detalle: Record<string, string> = {};

  // Aplicar tope Vizzoti si corresponde
  let baseCalculo = mejorSueldoUltimos12Meses;
  let toperaplicado = false;
  if (topeVizzoti !== undefined && topeVizzoti < mejorSueldoUltimos12Meses) {
    baseCalculo = topeVizzoti;
    toperaplicado = true;
    detalle.tope = `Aplicado tope Vizzoti: ${topeVizzoti}`;
  }

  // 1. Indemnización por antigüedad (art. 245)
  // = base × ceil(años) — cada fracción >3 meses cuenta como año entero
  const aniosComputables = Math.ceil(antiguedadAnos);
  const indemnizacionAntiguedad = baseCalculo * Math.max(1, aniosComputables);
  detalle.indemAntiguedad = `${baseCalculo} × ${aniosComputables} año(s) = ${indemnizacionAntiguedad}`;

  // 2. Preaviso (art. 232)
  // 1 mes si antigüedad <5 años, 2 meses si ≥5
  const mesesPreaviso: 1 | 2 = antiguedadAnos >= 5 ? 2 : 1;
  const preaviso = mejorSueldoUltimos12Meses * mesesPreaviso;
  detalle.preaviso = `${mejorSueldoUltimos12Meses} × ${mesesPreaviso} mes(es) = ${preaviso}`;

  // 3. Integración mes de despido (art. 233)
  // = sueldo × (días restantes / días del mes)
  const diasMes = 30; // simplification (LCT usa 30 fijos)
  const diasRestantes = Math.max(0, diasMes - diaDespido);
  const integracionMesDespido = (mejorSueldoUltimos12Meses / diasMes) * diasRestantes;
  detalle.integracion = `(${mejorSueldoUltimos12Meses} / ${diasMes}) × ${diasRestantes} días = ${integracionMesDespido.toFixed(2)}`;

  // 4. SAC proporcional sobre preaviso + integración
  // = (preaviso + integración) / 12
  const sacProporcional = (preaviso + integracionMesDespido) / 12;
  detalle.sac = `(${preaviso} + ${integracionMesDespido.toFixed(2)}) / 12 = ${sacProporcional.toFixed(2)}`;

  // 5. Vacaciones no gozadas
  // = (sueldo / 25) × días no gozados
  const vacacionesNoGozadasMonto = (mejorSueldoUltimos12Meses / 25) * vacacionesNoGozadas;
  detalle.vacaciones = `(${mejorSueldoUltimos12Meses} / 25) × ${vacacionesNoGozadas} días = ${vacacionesNoGozadasMonto.toFixed(2)}`;

  const total =
    indemnizacionAntiguedad +
    preaviso +
    integracionMesDespido +
    sacProporcional +
    vacacionesNoGozadasMonto;

  // Round todos a 2 decimales
  const round = (n: number) => Math.round(n * 100) / 100;

  return {
    indemnizacionAntiguedad: round(indemnizacionAntiguedad),
    preaviso: round(preaviso),
    mesesPreaviso,
    integracionMesDespido: round(integracionMesDespido),
    sacProporcional: round(sacProporcional),
    vacacionesNoGozadasMonto: round(vacacionesNoGozadasMonto),
    total: round(total),
    toperaplicado,
    detalle,
    fuente: 'LCT art. 232, 233, 245 — texto vigente 2026 (CSJN Vizzoti 14/09/2004)',
  };
}
