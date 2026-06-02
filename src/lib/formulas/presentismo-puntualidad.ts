/**
 * Calculadora de Presentismo y Puntualidad
 * Adicional remunerativo por asistencia perfecta según CCT
 */

export interface PresentismoInputs {
  sueldoBasico: number;
  porcentajePresentismo: number;
  diasAusencia: number;
  llegadasTarde: number;
}

export interface PresentismoOutputs {
  presentismoTotal: number;
  presentismoCompleto: number;
  descuento: number;
  porcentajeDescuento: string;
  _insight?: any;
  _chart?: any;
}

export function presentismoPuntualidad(inputs: PresentismoInputs): PresentismoOutputs {
  const sueldoBasico = Number(inputs.sueldoBasico);
  const porcentaje = Number(inputs.porcentajePresentismo) || 8.33;
  const diasAusencia = Math.max(0, Number(inputs.diasAusencia) || 0);
  const llegadasTarde = Math.max(0, Number(inputs.llegadasTarde) || 0);

  if (!sueldoBasico || sueldoBasico <= 0) {
    throw new Error('Ingresá tu sueldo básico de convenio');
  }

  const presentismoCompleto = sueldoBasico * (porcentaje / 100);

  // Descuento escalonado típico por ausencias
  let descuentoAusencias = 0;
  if (diasAusencia >= 3) descuentoAusencias = 100;
  else if (diasAusencia === 2) descuentoAusencias = 67;
  else if (diasAusencia === 1) descuentoAusencias = 33;

  // Descuento por llegadas tarde
  let descuentoTardanzas = 0;
  if (llegadasTarde >= 3) descuentoTardanzas = 67;
  else if (llegadasTarde >= 1) descuentoTardanzas = 33;

  // Se toma el mayor descuento (no se suman, se aplica el mayor)
  const porcDescuento = Math.min(100, Math.max(descuentoAusencias, descuentoTardanzas));
  const descuento = presentismoCompleto * (porcDescuento / 100);
  const presentismoTotal = presentismoCompleto - descuento;

  const totalR = Math.round(presentismoTotal);
  const completoR = Math.round(presentismoCompleto);
  const descuentoR = Math.round(descuento);
  const fmt = (n: number) => '$' + n.toLocaleString('es-AR');

  let _insight: any;
  if (descuentoR <= 0) {
    _insight = {
      title: 'Presentismo completo',
      text: `Sin ausencias ni tardanzas, cobrás el adicional íntegro: **${fmt(completoR)}** (el **${porcentaje}%** del básico). No perdés un peso.`,
      tone: 'good' as const,
      icon: '✅',
    };
  } else {
    _insight = {
      title: 'Perdés parte del presentismo',
      text: `Por ${diasAusencia > 0 ? `**${diasAusencia}** ${diasAusencia === 1 ? 'falta' : 'faltas'}` : ''}${diasAusencia > 0 && llegadasTarde > 0 ? ' y ' : ''}${llegadasTarde > 0 ? `**${llegadasTarde}** ${llegadasTarde === 1 ? 'llegada tarde' : 'llegadas tarde'}` : ''} se te descuenta el **${porcDescuento}%** del adicional: perdés **${fmt(descuentoR)}** y cobrás **${fmt(totalR)}** en vez de ${fmt(completoR)}.`,
      tone: 'warn' as const,
      icon: '⏰',
    };
  }

  let _chart: any;
  if (descuentoR > 0) {
    _chart = {
      type: 'doughnut' as const,
      slices: [
        { label: 'Cobrás', value: totalR },
        { label: 'Descuento', value: descuentoR },
      ],
      prefix: '$',
      centerValue: fmt(completoR),
      centerLabel: 'Presentismo pleno',
      ariaLabel: `Presentismo completo ${fmt(completoR)}: cobrás ${fmt(totalR)}, se descuenta ${fmt(descuentoR)}.`,
    };
  }

  return {
    presentismoTotal: totalR,
    presentismoCompleto: completoR,
    descuento: descuentoR,
    porcentajeDescuento: `${porcDescuento}%`,
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
