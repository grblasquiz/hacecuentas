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

  return {
    honorariosBrutos: Number(honor.toFixed(2)),
    iva: Number(iva.toFixed(2)),
    honorariosConIva: Number(conIva.toFixed(2)),
    netoParaTrabajador: Number(neto.toFixed(2)),
    modalidadMostrada: label,
    resumen: `**${label}** → honorarios $${honor.toFixed(0)} + IVA 16% ($${iva.toFixed(0)}) = **$${conIva.toFixed(0)} MXN**.${finiquito > 0 ? ` Neto para el trabajador: **$${neto.toFixed(0)} MXN**.` : ''}`,
  };
}
