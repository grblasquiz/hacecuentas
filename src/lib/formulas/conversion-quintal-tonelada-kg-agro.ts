export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function conversionQuintalToneladaKgAgro(i: Inputs): Outputs {
  const v = Number(i.valor) || 0;
  const u = String(i.unidad || 'a');
  const factor = 0.1;
  const r = u === 'a' ? v * factor : v / factor;
  const fromU = u === 'a' ? 'qq' : 'tn';
  const toU = u === 'a' ? 'tn' : 'qq';
  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
  const quintales = u === 'a' ? v : r;
  const toneladas = u === 'a' ? r : v;
  const kilos = quintales * 100;
  return {
    resultado: r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toU,
    resumen: `${v} ${fromU} = ${r.toFixed(4).replace(/\.?0+$/, '')} ${toU}.`,
    _insight: {
      title: 'En kilos, para el campo',
      text: `**${fmt.format(quintales)} qq** equivalen a **${fmt.format(toneladas)} tn** o **${fmt.format(kilos)} kg**. En el agro argentino el quintal métrico es **100 kg**, así que 10 quintales hacen 1 tonelada: útil para pasar rindes (qq/ha) a volumen total de cosecha.`,
      tone: 'neutral' as const,
      icon: '🌾',
    }
  };
}
