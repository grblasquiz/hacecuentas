/** Costo total de un empleado para la empresa — Argentina 2026 */

export interface Inputs {
  sueldoBruto: number;
  adicionalConvenio: number;
  tieneHijos: string;
  seguroVidaObligatorio: string;
  artAdicional: number;
}

export interface Outputs {
  sueldoBrutoTotal: number;
  contribucionesPatronales: number;
  costoAguinaldo: number;
  costoVacaciones: number;
  artCosto: number;
  costoMensualTotal: number;
  costoAnualTotal: number;
  porcentajeSobreBruto: number;
  formula: string;
  explicacion: string;
  _chart?: any;
  _insight?: any;
}

export function costoEmpleadoTotalEmpresa(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoBruto);
  const adicional = Number(i.adicionalConvenio) || 0;
  const artAd = Number(i.artAdicional) || 0;

  if (!sueldo || sueldo <= 0) throw new Error('Ingresá el sueldo bruto del empleado');

  const sueldoBrutoTotal = sueldo + adicional;

  // Contribuciones patronales (aprox. desde Ley 27.541 con reducción gradual)
  // Jubilación: 10.77% (sobre mínimo no imponible) a 16% (sobre excedente)
  // Estimamos 18% promedio para simplificar
  const jubilacionPatronal = sueldoBrutoTotal * 0.1077;
  // INSSJP: 1.5%
  const inssjp = sueldoBrutoTotal * 0.015;
  // Asignaciones familiares: 4.44% a 5.56%
  const asignaciones = sueldoBrutoTotal * 0.0444;
  // Obra social: 6%
  const obraSocial = sueldoBrutoTotal * 0.06;

  const contribucionesPatronales = jubilacionPatronal + inssjp + asignaciones + obraSocial;

  // SAC (aguinaldo): 1/12 del bruto + contribuciones
  const costoAguinaldo = (sueldoBrutoTotal + contribucionesPatronales) / 12;

  // Vacaciones provisión: ~4.5% del bruto (14 días / 365 ≈ 3.8%, más contribuciones)
  const costoVacaciones = sueldoBrutoTotal * 0.045;

  // ART: base + variable (estimado $5,000 - $15,000 según actividad)
  const artCosto = artAd > 0 ? artAd : sueldoBrutoTotal * 0.03;

  const costoMensualTotal = sueldoBrutoTotal + contribucionesPatronales + costoAguinaldo + costoVacaciones + artCosto;
  const costoAnualTotal = costoMensualTotal * 12;
  const porcentajeSobreBruto = (costoMensualTotal / sueldoBrutoTotal) * 100;

  const formula = `Costo total = $${sueldoBrutoTotal.toLocaleString()} + ${((contribucionesPatronales / sueldoBrutoTotal) * 100).toFixed(1)}% contrib. + SAC + vac + ART = $${Math.round(costoMensualTotal).toLocaleString()}/mes`;
  const explicacion = `Sueldo bruto: $${sueldoBrutoTotal.toLocaleString()}. Contribuciones patronales: $${Math.round(contribucionesPatronales).toLocaleString()} (${((contribucionesPatronales / sueldoBrutoTotal) * 100).toFixed(1)}%). Provisión SAC: $${Math.round(costoAguinaldo).toLocaleString()}. Provisión vacaciones: $${Math.round(costoVacaciones).toLocaleString()}. ART: $${Math.round(artCosto).toLocaleString()}. Costo mensual total: $${Math.round(costoMensualTotal).toLocaleString()} (${porcentajeSobreBruto.toFixed(1)}% del bruto). Costo anual: $${Math.round(costoAnualTotal).toLocaleString()}. El empleado cuesta ${((porcentajeSobreBruto / 100) - 1).toFixed(0) > '0' ? `${((porcentajeSobreBruto - 100)).toFixed(0)}% más que su sueldo bruto` : 'lo mismo que su sueldo'}.`;

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Sueldo bruto', value: Math.round(sueldoBrutoTotal) },
      { label: 'Contribuciones patronales', value: Math.round(contribucionesPatronales) },
      { label: 'Provisión SAC', value: Math.round(costoAguinaldo) },
      { label: 'Provisión vacaciones', value: Math.round(costoVacaciones) },
      { label: 'ART', value: Math.round(artCosto) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(costoMensualTotal).toLocaleString('es-AR'),
    centerLabel: 'Costo/mes',
    ariaLabel: 'Composición del costo mensual total del empleado para la empresa',
  };

  // Insight: cuánto se infla el sueldo de bolsillo hasta el costo real
  const extraPct = porcentajeSobreBruto - 100;
  const cargaPct = (contribucionesPatronales / sueldoBrutoTotal) * 100;
  const insight = {
    title: 'El costo real supera al sueldo',
    text: `Cada empleado te cuesta **${extraPct.toFixed(0)}% más** que su bruto: pagás **$${Math.round(costoMensualTotal).toLocaleString('es-AR')}/mes** por un sueldo de $${Math.round(sueldoBrutoTotal).toLocaleString('es-AR')}. Las cargas patronales (**${cargaPct.toFixed(1)}%**) son el principal sobrecosto; sumá SAC, vacaciones y ART al presupuestar una contratación.`,
    tone: 'warn' as const,
    icon: '💼',
  };

  return {
    sueldoBrutoTotal: Math.round(sueldoBrutoTotal),
    contribucionesPatronales: Math.round(contribucionesPatronales),
    costoAguinaldo: Math.round(costoAguinaldo),
    costoVacaciones: Math.round(costoVacaciones),
    artCosto: Math.round(artCosto),
    costoMensualTotal: Math.round(costoMensualTotal),
    costoAnualTotal: Math.round(costoAnualTotal),
    porcentajeSobreBruto: Number(porcentajeSobreBruto.toFixed(2)),
    formula,
    explicacion,
    _chart: chart,
    _insight: insight,
  };
}
