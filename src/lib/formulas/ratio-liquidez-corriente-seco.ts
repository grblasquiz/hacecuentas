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
  _insight?: any;
  _chart?: any;
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

  const rc = Number(ratioCorriente.toFixed(2));
  const pa = Number(pruebaAcida.toFixed(2));

  const tone: 'good' | 'warn' | 'neutral' =
    ratioCorriente < 1.5 ? 'warn' : ratioCorriente <= 2.5 ? 'good' : 'neutral';
  const _insight = {
    title: 'Lectura de tu liquidez',
    text: `Por cada **$1 de deuda corriente** tenés **$${rc.toFixed(2)} de activo corriente** (prueba ácida: **${pa.toFixed(2)}**, sin contar inventario). ${
      ratioCorriente < 1
        ? 'No alcanzás a cubrir el corto plazo.'
        : ratioCorriente < 1.5
        ? 'Cubrís, pero con poco margen.'
        : ratioCorriente <= 2.5
        ? 'Liquidez saludable.'
        : 'Liquidez muy holgada: podrías tener capital ocioso.'
    }`,
    tone,
    icon: '💧',
  };

  const lastMax = Math.max(4, Math.ceil(ratioCorriente) + 1);
  const _chart = {
    type: 'scale',
    marker: rc,
    markerLabel: `${rc.toFixed(2)}`,
    min: 0,
    segments: [
      { nombre: 'Riesgo', max: 1, color: '#dc2626', colorDark: '#ef4444' },
      { nombre: 'Ajustada', max: 1.5, color: '#ea580c', colorDark: '#f97316' },
      { nombre: 'Saludable', max: 2.5, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Holgada', max: lastMax, color: '#ca8a04', colorDark: '#eab308' },
    ],
    ariaLabel: `Ratio de liquidez corriente ${rc.toFixed(2)} sobre escala de diagnóstico financiero`,
  };

  return {
    ratioCorriente: rc,
    pruebaAcida: pa,
    diagnostico,
    detalle,
    _insight,
    _chart,
  };
}
