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

  return {
    presentismoTotal: Math.round(presentismoTotal),
    presentismoCompleto: Math.round(presentismoCompleto),
    descuento: Math.round(descuento),
    porcentajeDescuento: `${porcDescuento}%`,
  };
}
