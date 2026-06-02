/** Honorarios abogado laboral México — % sobre finiquito o suma fija */
export interface Inputs {
  modalidad: string; // 'porcentaje' | 'suma-fija' | 'cuota-litis'
  montoFiniquito?: number;
  porcentaje?: number; // 20-30 típico
  montoFijo?: number;
  complejidad?: string; // 'simple' | 'media' | 'compleja'
}

export interface Outputs {
  honorariosBrutos: number;
  iva: number;
  honorariosConIva: number;
  netoParaTrabajador: number;
  modalidadMostrada: string;
  resumen: string;
  _chart?: any;
  _insight?: any;
}

export function honorariosAbogadoLaboralMexico(i: Inputs): Outputs {
  const mod = String(i.modalidad || 'porcentaje');
  const finiquito = Number(i.montoFiniquito || 0);
  let pct = Number(i.porcentaje || 0);
  const fijo = Number(i.montoFijo || 0);
  const compl = String(i.complejidad || 'media');

  let honor = 0;
  let label = '';

  if (mod === 'porcentaje' || mod === 'cuota-litis') {
    if (finiquito <= 0) throw new Error('Ingresá el monto del finiquito');
    if (!pct) {
      // default por complejidad
      pct = compl === 'simple' ? 20 : compl === 'compleja' ? 30 : 25;
    }
    if (pct < 5 || pct > 50) throw new Error('Porcentaje fuera de rango razonable (5-50%)');
    honor = finiquito * (pct / 100);
    label = `${mod === 'cuota-litis' ? 'Cuota litis' : 'Porcentaje'} ${pct}% sobre $${finiquito.toLocaleString('es-MX')}`;
  } else if (mod === 'suma-fija') {
    if (fijo <= 0) throw new Error('Ingresá el monto fijo');
    honor = fijo;
    label = `Suma fija $${fijo.toLocaleString('es-MX')} MXN`;
  } else {
    throw new Error('Modalidad inválida');
  }

  const iva = honor * 0.16;
  const conIva = honor + iva;
  const neto = finiquito > 0 ? Math.max(0, finiquito - conIva) : 0;

  // Composición del costo total del abogado: honorarios + IVA 16%
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Honorarios', value: Number(honor.toFixed(2)) },
      { label: 'IVA 16%', value: Number(iva.toFixed(2)) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(conIva).toLocaleString('es-MX'),
    centerLabel: 'Total con IVA',
    ariaLabel: 'Composición del costo del abogado: honorarios e IVA del 16%',
  };

  const fmtMX = (n: number) => '$' + Math.round(n).toLocaleString('es-MX');
  let insight;
  if (finiquito > 0) {
    const shareAbogado = (conIva / finiquito) * 100;
    insight = {
      title: 'Qué significa',
      text: `El abogado se lleva **${fmtMX(conIva)} MXN** (honorarios + IVA), el **${shareAbogado.toFixed(0)}%** de tu finiquito de ${fmtMX(finiquito)}; te quedan **${fmtMX(neto)} MXN** netos. ${shareAbogado > 35 ? 'Es una tajada alta: cotizá una suma fija o un porcentaje más bajo antes de firmar.' : 'Es una proporción razonable para un asunto laboral con resultado.'}`,
      tone: (shareAbogado > 35 ? 'warn' : 'good') as 'good' | 'warn' | 'neutral',
      icon: '⚖️',
    };
  } else {
    insight = {
      title: 'Qué significa',
      text: `Con esta modalidad, el costo del abogado es **${fmtMX(conIva)} MXN** (honorarios ${fmtMX(honor)} + IVA 16% ${fmtMX(iva)}). Cargá tu finiquito para ver cuánto te quedaría neto después de pagarle.`,
      tone: 'neutral' as 'good' | 'warn' | 'neutral',
      icon: '⚖️',
    };
  }

  return {
    honorariosBrutos: Number(honor.toFixed(2)),
    iva: Number(iva.toFixed(2)),
    honorariosConIva: Number(conIva.toFixed(2)),
    netoParaTrabajador: Number(neto.toFixed(2)),
    modalidadMostrada: label,
    resumen: `**${label}** → honorarios $${honor.toFixed(0)} + IVA 16% ($${iva.toFixed(0)}) = **$${conIva.toFixed(0)} MXN**.${finiquito > 0 ? ` Neto para el trabajador: **$${neto.toFixed(0)} MXN**.` : ''}`,
    _chart: chart,
    _insight: insight,
  };
}
