/** Equivalencia LED vs incandescente */
export interface Inputs { wattsOriginal: number; tipoOriginal?: string; cantidadFocos: number; horasUso: number; costoKwh?: number; }
export interface Outputs { wattsLedEquivalente: number; lumenesAprox: number; ahorroAnualKwh: number; ahorroAnualPesos: number; _insight?: any; _chart?: any; }

const FACTOR_A_LUMENS: Record<string, number> = {
  incandescente: 12, halogena: 16, cfl: 55, led: 90,
};

export function focoLedEquivalenciaWatts(i: Inputs): Outputs {
  const w = Number(i.wattsOriginal);
  const tipo = String(i.tipoOriginal || 'incandescente');
  const cant = Number(i.cantidadFocos) || 1;
  const horas = Number(i.horasUso) || 5;
  const costo = Number(i.costoKwh) || 150;
  if (!w || w <= 0) throw new Error('Ingresá los watts del foco');

  const lumPorWatt = FACTOR_A_LUMENS[tipo] || 12;
  const lumenes = w * lumPorWatt;
  const wattsLed = Math.round(lumenes / 90); // LED ~90 lm/W
  const ahorroW = (w - wattsLed) * cant;
  const ahorroKwhAnual = (ahorroW * horas * 365) / 1000;
  const ahorroPesos = ahorroKwhAnual * costo;

  const wattsLedFinal = Math.max(3, wattsLed);
  const ahorroKwhFmt = Number(ahorroKwhAnual.toFixed(0));
  const ahorroPesosFmt = Math.round(ahorroPesos);
  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const hayAhorro = ahorroKwhAnual > 0 && wattsLed < w;

  const insight = hayAhorro
    ? {
        title: 'Conviene el cambio a LED',
        text: `Reemplazar ${cant > 1 ? `${cant} focos de` : 'un foco de'} **${w}W** por LED de **${wattsLedFinal}W** (mismos ~${Math.round(lumenes)} lúmenes) te ahorra **${ahorroKwhFmt} kWh** al año, unos **$${fmt.format(ahorroPesosFmt)}** en tu factura.`,
        tone: 'good',
        icon: '💡',
      }
    : {
        title: 'Sin ahorro relevante',
        text: `El foco de **${w}W** ya rinde como un LED de **${wattsLedFinal}W**, así que el cambio no genera ahorro de energía apreciable.`,
        tone: 'neutral',
        icon: '💡',
      };

  const out: Outputs = {
    wattsLedEquivalente: wattsLedFinal,
    lumenesAprox: Math.round(lumenes),
    ahorroAnualKwh: ahorroKwhFmt,
    ahorroAnualPesos: ahorroPesosFmt,
    _insight: insight,
  };

  if (hayAhorro) {
    const ledKwhAnual = (wattsLed * cant * horas * 365) / 1000;
    const origKwhAnual = (w * cant * horas * 365) / 1000;
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Consumo del LED', value: Number(ledKwhAnual.toFixed(0)) },
        { label: 'Ahorro anual', value: ahorroKwhFmt },
      ],
      prefix: '',
      centerValue: `${fmt.format(Number(origKwhAnual.toFixed(0)))} kWh`,
      centerLabel: 'Consumo original/año',
      ariaLabel: `Del consumo original de ${fmt.format(Number(origKwhAnual.toFixed(0)))} kWh al año, el LED usa ${fmt.format(Number(ledKwhAnual.toFixed(0)))} kWh y ahorrás ${fmt.format(ahorroKwhFmt)} kWh.`,
    };
  }

  return out;
}
