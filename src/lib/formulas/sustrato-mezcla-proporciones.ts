/** Sustrato: mezcla de proporciones */
export interface Inputs { tipoPlanta: string; litrosTotales: number; }
export interface Outputs { receta: string; litrosSustrato: number; litrosPerlita: number; litrosCompost: number; litrosExtra: number; _insight?: any; _chart?: any; }

interface Receta { sustrato: number; perlita: number; compost: number; extra: number; nombreExtra: string; desc: string; }
const RECETAS: Record<string, Receta> = {
  hortaliza: { sustrato: 0.4, perlita: 0.2, compost: 0.3, extra: 0.1, nombreExtra: 'Vermiculita', desc: '40% sustrato + 30% compost + 20% perlita + 10% vermiculita' },
  suculenta: { sustrato: 0.3, perlita: 0.5, compost: 0, extra: 0.2, nombreExtra: 'Arena gruesa', desc: '30% sustrato + 50% perlita + 20% arena gruesa' },
  orquidea: { sustrato: 0, perlita: 0.2, compost: 0, extra: 0.8, nombreExtra: 'Corteza de pino', desc: '80% corteza de pino + 20% perlita (SIN tierra)' },
  helecho: { sustrato: 0.4, perlita: 0.1, compost: 0.2, extra: 0.3, nombreExtra: 'Vermiculita/Turba', desc: '40% sustrato + 30% turba/vermiculita + 20% compost + 10% perlita' },
  interior: { sustrato: 0.5, perlita: 0.2, compost: 0.2, extra: 0.1, nombreExtra: 'Vermiculita', desc: '50% sustrato + 20% compost + 20% perlita + 10% vermiculita' },
  aromatica: { sustrato: 0.4, perlita: 0.3, compost: 0.2, extra: 0.1, nombreExtra: 'Arena gruesa', desc: '40% sustrato + 30% perlita + 20% compost + 10% arena' },
  frutal_maceta: { sustrato: 0.35, perlita: 0.2, compost: 0.35, extra: 0.1, nombreExtra: 'Vermiculita', desc: '35% sustrato + 35% compost + 20% perlita + 10% vermiculita' },
  semillero: { sustrato: 0.4, perlita: 0.3, compost: 0.1, extra: 0.2, nombreExtra: 'Vermiculita fina', desc: '40% sustrato fino + 30% perlita + 20% vermiculita + 10% compost' },
};

export function sustratoMezclaProporciones(i: Inputs): Outputs {
  const tipo = String(i.tipoPlanta || 'hortaliza');
  const total = Number(i.litrosTotales);
  if (!total || total <= 0) throw new Error('Ingresá los litros totales');
  const r = RECETAS[tipo];
  if (!r) throw new Error('Tipo de planta no encontrado');

  const litrosSustrato = Number((total * r.sustrato).toFixed(1));
  const litrosPerlita = Number((total * r.perlita).toFixed(1));
  const litrosCompost = Number((total * r.compost).toFixed(1));
  const litrosExtra = Number((total * r.extra).toFixed(1));

  const fmtL = (n: number) => `${n % 1 === 0 ? n : n.toFixed(1)} L`;
  const slices = [
    { label: 'Sustrato base', value: litrosSustrato },
    { label: 'Compost', value: litrosCompost },
    { label: 'Perlita', value: litrosPerlita },
    { label: r.nombreExtra, value: litrosExtra },
  ].filter((s) => s.value > 0);

  // Componente dominante de la mezcla
  const dominante = slices.reduce((a, b) => (b.value > a.value ? b : a), slices[0]);
  const pctDom = Math.round((dominante.value / total) * 100);

  return {
    receta: r.desc,
    litrosSustrato,
    litrosPerlita,
    litrosCompost,
    litrosExtra,
    _insight: {
      title: 'Cómo armar la mezcla',
      text: `Para tus **${total % 1 === 0 ? total : total.toFixed(1)} L** de sustrato, el componente que más manda es **${dominante.label.toLowerCase()}** con **${fmtL(dominante.value)}** (${pctDom}% del volumen). Mezclá todo en seco antes de humedecer para que quede parejo.`,
      tone: 'neutral',
      icon: '🪴',
    },
    _chart: {
      type: 'doughnut',
      slices,
      prefix: '',
      centerValue: fmtL(total),
      centerLabel: 'Mezcla total',
      ariaLabel: `Composición de la mezcla de sustrato: ${slices.map((s) => `${s.label} ${fmtL(s.value)}`).join(', ')}.`,
    },
  };
}
