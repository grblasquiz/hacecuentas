export interface Inputs {
  salario_bruto_mensual: number;
  porcentaje_reduccion: number;
  tramo_irpf: number;
  meses_reduccion: number;
  tenencia_otro_hijo: string;
}

export interface Outputs {
  salario_bruto_reducido: number;
  reduccion_bruto_euro: number;
  cotizacion_ss_trabajador: number;
  irpf_retenido: number;
  salario_neto: number;
  diferencia_neto: number;
  base_cotizacion_reducida: number;
  base_reguladora_jubilacion: number;
  impacto_pension_futura: number;
  ahorro_anual_bruto_reduccion: number;
  explicacion_base_reguladora: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 España
  const COTIZACION_SS_TRABAJADOR = 0.0635; // 6,35% Seguridad Social trabajador (RD 1388/1985)
  const DURACION_PROTECCION_BASE_REGULADORA = 24; // meses (Ley 27/2011)
  const FACTOR_IMPACTO_PENSION = 0.027; // 2,7% anual simplificado sobre diferencia cotizable
  const MESES_AÑO = 12;

  // Inputs
  const salarioBrutoMensual = i.salario_bruto_mensual;
  const porcentajeReduccion = i.porcentaje_reduccion;
  const tramIrpf = i.tramo_irpf;
  const mesesReduccion = i.meses_reduccion;

  // 1. Salario bruto reducido
  const salarioBrutoReducido = salarioBrutoMensual * (1 - porcentajeReduccion / 100);
  const reduccionBrutoEuro = salarioBrutoMensual - salarioBrutoReducido;

  // 2. Cotización SS trabajador (6,35% sobre bruto reducido)
  const cotizacionSsTrabajador = salarioBrutoReducido * COTIZACION_SS_TRABAJADOR;

  // 3. Base imponible IRPF y retención
  const baseIrpf = salarioBrutoReducido - cotizacionSsTrabajador;
  const irpfRetenido = baseIrpf * (tramIrpf / 100);

  // 4. Salario neto
  const salarioNeto = salarioBrutoReducido - cotizacionSsTrabajador - irpfRetenido;
  const diferenciaNeto = salarioNeto - (salarioBrutoMensual - (salarioBrutoMensual * COTIZACION_SS_TRABAJADOR) - (salarioBrutoMensual - (salarioBrutoMensual * COTIZACION_SS_TRABAJADOR)) * (tramIrpf / 100));

  // Base cotización reducida
  const baseCotizacionReducida = salarioBrutoReducido;

  // 5. Base reguladora jubilación (Ley 27/2011 art. 6)
  let explicacionBaseReguladora = "";
  let baseReguladoraJubilacion = 0;

  if (mesesReduccion <= DURACION_PROTECCION_BASE_REGULADORA) {
    // Todos los meses están dentro protección: base completa
    baseReguladoraJubilacion = salarioBrutoMensual;
    explicacionBaseReguladora = `Dentro protección 24 meses: base reguladora = salario completo (€${salarioBrutoMensual.toFixed(2)}/mes). Ley 27/2011 art. 6.`;
  } else {
    // Meses protegidos + meses sin protección
    const mesessProtegidos = DURACION_PROTECCION_BASE_REGULADORA;
    const mesesSinProteccion = mesesReduccion - mesessProtegidos;
    baseReguladoraJubilacion = ((salarioBrutoMensual * mesessProtegidos) + (salarioBrutoReducido * mesesSinProteccion)) / mesesReduccion;
    explicacionBaseReguladora = `Primeros ${mesessProtegidos} meses: base completa. Meses ${mesessProtegidos + 1}–${mesesReduccion}: base reducida. Media: €${baseReguladoraJubilacion.toFixed(2)}/mes.`;
  }

  // 6. Impacto pensión futura anual (estimado)
  // Diferencia cotizable anual × factor simplificado 2,7%
  const diferenciaCotizableAnual = (salarioBrutoMensual - salarioBrutoReducido) * MESES_AÑO;
  const impactoPensionFuturaAnual = diferenciaCotizableAnual * FACTOR_IMPACTO_PENSION;

  // 7. Ahorro anual bruto reducción (empresa + trabajador)
  const ahorroAnualBrutoReduccion = reduccionBrutoEuro * MESES_AÑO;

  // Insight: interpreta la pérdida de neto mensual y el impacto en la pensión
  const perdidaNetoMes = Math.abs(diferenciaNeto);
  const _insight = {
    title: "Cuánto te cuesta reducir jornada",
    text: `Con un **${porcentajeReduccion}%** menos de jornada cobrás **€${salarioNeto.toFixed(2)}** netos al mes, **€${perdidaNetoMes.toFixed(2)} menos** que a jornada completa. ${mesesReduccion <= DURACION_PROTECCION_BASE_REGULADORA ? `Buena noticia: los ${mesesReduccion} meses quedan dentro de la protección de 24 meses, así que tu base de jubilación se mantiene completa.` : `Ojo: superás los 24 meses protegidos, por lo que la pensión futura baja unos **€${impactoPensionFuturaAnual.toFixed(0)}/año** estimados de cotización perdida.`}`,
    tone: mesesReduccion <= DURACION_PROTECCION_BASE_REGULADORA ? "neutral" : "warn",
    icon: "👶",
  };

  // Donut: composición del salario bruto reducido (neto + SS + IRPF suman el bruto reducido)
  const _chart = {
    type: "doughnut" as const,
    slices: [
      { label: "Salario neto", value: Math.round(salarioNeto * 100) / 100 },
      { label: "Cotización SS (6,35%)", value: Math.round(cotizacionSsTrabajador * 100) / 100 },
      { label: "Retención IRPF", value: Math.round(irpfRetenido * 100) / 100 },
    ].filter((s) => s.value > 0),
    prefix: "€",
    centerValue: "€" + (Math.round(salarioBrutoReducido * 100) / 100).toLocaleString("es-ES"),
    centerLabel: "Bruto reducido",
    ariaLabel: "Reparto del salario bruto con jornada reducida: neto en mano, cotización a la Seguridad Social y retención de IRPF.",
  };

  return {
    salario_bruto_reducido: Math.round(salarioBrutoReducido * 100) / 100,
    reduccion_bruto_euro: Math.round(reduccionBrutoEuro * 100) / 100,
    cotizacion_ss_trabajador: Math.round(cotizacionSsTrabajador * 100) / 100,
    irpf_retenido: Math.round(irpfRetenido * 100) / 100,
    salario_neto: Math.round(salarioNeto * 100) / 100,
    diferencia_neto: Math.round(diferenciaNeto * 100) / 100,
    base_cotizacion_reducida: Math.round(baseCotizacionReducida * 100) / 100,
    base_reguladora_jubilacion: Math.round(baseReguladoraJubilacion * 100) / 100,
    impacto_pension_futura: Math.round(impactoPensionFuturaAnual * 100) / 100,
    ahorro_anual_bruto_reduccion: Math.round(ahorroAnualBrutoReduccion * 100) / 100,
    explicacion_base_reguladora: explicacionBaseReguladora,
    _insight,
    _chart
  };
}
