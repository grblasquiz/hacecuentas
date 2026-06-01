/** Cuánto ahorrar por mes para un objetivo (sin interés) */
export interface Inputs {
  metaTotal: number;
  plazoMeses: number;
  ahorroActual?: number;
}
export interface Outputs {
  ahorroMensual: number;
  ahorroDiario: number;
  ahorroSemanal: number;
  faltante: number;
  _insight?: any;
  _chart?: any;
}

export function ahorroObjetivoMensual(i: Inputs): Outputs {
  const meta = Number(i.metaTotal);
  const meses = Number(i.plazoMeses);
  const actual = Number(i.ahorroActual) || 0;

  if (!meta || meta <= 0) throw new Error('Ingresá tu objetivo de ahorro');
  if (!meses || meses <= 0) throw new Error('Ingresá el plazo en meses');

  const faltante = Math.max(0, meta - actual);
  const ahorroMensual = faltante / meses;
  const ahorroDiario = ahorroMensual / 30;
  const ahorroSemanal = ahorroMensual / 4.33;

  const yaTenes = Math.min(actual, meta);
  const fmt = (v: number) => '$' + new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(Math.round(v));
  const yaCubierto = meta > 0 ? Math.round((yaTenes / meta) * 100) : 0;
  const _insight = faltante <= 0
    ? {
        title: '¡Objetivo cubierto!',
        text: `Con **${fmt(actual)}** ya alcanzaste tu meta de **${fmt(meta)}**. No necesitás ahorrar nada más.`,
        tone: 'good',
        icon: '🎯',
      }
    : {
        title: 'Tu cuota de ahorro',
        text: `Para juntar **${fmt(meta)}** en **${meses} meses** tenés que apartar **${fmt(Math.ceil(ahorroMensual))} por mes** (unos ${fmt(Math.ceil(ahorroSemanal))} por semana). ${yaTenes > 0 ? `Ya tenés el **${yaCubierto}%**, te falta **${fmt(faltante)}**.` : `Arrancás de cero: la meta completa son **${fmt(faltante)}**.`}`,
        tone: 'neutral',
        icon: '🎯',
      };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Ya tenés ahorrado', value: Math.round(yaTenes) },
      { label: 'Te falta juntar', value: Math.round(faltante) },
    ],
    prefix: '$',
    centerValue: fmt(meta),
    centerLabel: 'Meta total',
    ariaLabel: `De una meta de ${fmt(meta)}, ya tenés ${fmt(yaTenes)} y te falta ${fmt(faltante)}.`,
  };

  return {
    ahorroMensual: Math.ceil(ahorroMensual),
    ahorroDiario: Math.ceil(ahorroDiario),
    ahorroSemanal: Math.ceil(ahorroSemanal),
    faltante: Math.round(faltante),
    _insight,
    _chart,
  };
}
