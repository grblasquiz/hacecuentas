/** Ratios de liquidez corriente y prueba ácida (acid test) */

export interface Inputs {
  activoCorriente: number;
  inventarios: number;
  pasivoCorriente: number;
}

export interface Outputs {
  ratioCorriente: number;
  pruebaAcida: number;
  diagnostico: string;
  detalle: string;
}

export function ratioLiquidezCorrienteSeco(i: Inputs): Outputs {
  const activo = Number(i.activoCorriente);
  const inventarios = Number(i.inventarios);
  const pasivo = Number(i.pasivoCorriente);

  if (isNaN(activo) || activo < 0) throw new Error('Ingresá el activo corriente total');
  if (isNaN(inventarios) || inventarios < 0) throw new Error('Los inventarios no pueden ser negativos');
  if (inventarios > activo) throw new Error('Los inventarios no pueden superar al activo corriente');
  if (isNaN(pasivo) || pasivo <= 0) throw new Error('Ingresá el pasivo corriente total');

  const ratioCorriente = activo / pasivo;
  const pruebaAcida = (activo - inventarios) / pasivo;

  let diagnostico: string;
  if (ratioCorriente < 1) {
    diagnostico = 'Alerta: el activo corriente no cubre las deudas de corto plazo. Riesgo de liquidez.';
  } else if (ratioCorriente < 1.5) {
    diagnostico = 'Liquidez ajustada: cubrís pero sin mucho margen. Monitoreá de cerca.';
  } else if (ratioCorriente <= 2.5) {
    diagnostico = 'Liquidez saludable: buen equilibrio entre activos y pasivos corrientes.';
  } else {
    diagnostico = 'Liquidez muy alta: podrías tener capital ocioso. Evaluá invertir el excedente.';
  }

  if (pruebaAcida < 0.5) {
    diagnostico += ' La prueba ácida es baja — dependés mucho del inventario para cubrir deudas.';
  } else if (pruebaAcida >= 1) {
    diagnostico += ' La prueba ácida es sólida — cubrís deudas sin necesidad de vender stock.';
  }

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const detalle =
    `Activo corriente: $${fmt.format(activo)}. Inventarios: $${fmt.format(inventarios)}. ` +
    `Pasivo corriente: $${fmt.format(pasivo)}. ` +
    `Ratio corriente: ${ratioCorriente.toFixed(2)} | Prueba ácida: ${pruebaAcida.toFixed(2)}. ` +
    `${diagnostico}`;

  return {
    ratioCorriente: Number(ratioCorriente.toFixed(2)),
    pruebaAcida: Number(pruebaAcida.toFixed(2)),
    diagnostico,
    detalle,
  };
}
