/** Tiempo de descongelado según peso y método */
export interface Inputs { pesoKg: number; metodo?: string; }
export interface Outputs { tiempoHoras: number; tiempoFormateado: string; instrucciones: string; detalle: string; }

export function tiempoDescongelar(i: Inputs): Outputs {
  const peso = Number(i.pesoKg);
  const metodo = String(i.metodo || 'heladera');

  if (!peso || peso <= 0) throw new Error('Ingresá el peso del alimento');

  let tiempoHs: number;
  let instrucciones: string;

  switch (metodo) {
    case 'agua-fria':
      tiempoHs = peso * 2;
      instrucciones = 'Sumergir en bolsa hermética en agua fría. Cambiar el agua cada 30 minutos. Cocinar inmediatamente después.';
      break;
    case 'microondas':
      tiempoHs = (peso * 12) / 60; // 12 min por kg, convertido a horas
      instrucciones = 'Usar función defrost o potencia baja (30%). Rotar cada 2-3 minutos. Cocinar inmediatamente después.';
      break;
    default: // heladera
      tiempoHs = peso * 10;
      instrucciones = 'Colocar en la parte baja de la heladera (4-5°C) sobre un plato para recoger líquidos. Una vez descongelado, se puede guardar 1-2 días en heladera.';
  }

  // Formatear tiempo
  let tiempoStr: string;
  if (tiempoHs < 1) {
    tiempoStr = `${Math.round(tiempoHs * 60)} minutos`;
  } else {
    const hs = Math.floor(tiempoHs);
    const mins = Math.round((tiempoHs - hs) * 60);
    tiempoStr = mins > 0 ? `${hs} h ${mins} min` : `${hs} horas`;
  }

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });
  const metodoLabel: Record<string, string> = { heladera: 'heladera', 'agua-fria': 'agua fría', microondas: 'microondas' };

  return {
    tiempoHoras: Number(tiempoHs.toFixed(1)),
    tiempoFormateado: tiempoStr,
    instrucciones,
    detalle: `${fmt.format(peso)} kg en ${metodoLabel[metodo] || metodo}: ${tiempoStr}. ${instrucciones}`,
  };
}
