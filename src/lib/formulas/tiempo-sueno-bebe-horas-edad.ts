export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function tiempoSuenoBebeHorasEdad(i: Inputs): Outputs {
  const m=Number(i.edadMeses)||0;
  let tot=14, n=10, s='2-3 siestas';
  if (m<3) { tot=16; n=9; s='4-5 siestas cortas'; }
  else if (m<12) { tot=14; n=11; s='2-3 siestas'; }
  else if (m<24) { tot=13; n=11; s='1-2 siestas'; }
  else if (m<60) { tot=11; n=10; s='1 siesta o sin'; }
  else { tot=10; n=10; s='Sin siesta'; }
  const siestaHoras = Math.max(0, tot - n);
  const _insight = {
    title: 'Sueño recomendado',
    text: `A los **${m} meses** lo ideal son **${tot}h** de sueño al día: **${n}h** de noche y unas **${siestaHoras}h** de siestas (${s}). Dormir mucho menos a esta edad afecta el desarrollo y el humor.`,
    tone: 'good',
    icon: '😴',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Sueño nocturno', value: n },
      { label: 'Siestas', value: siestaHoras },
    ],
    centerValue: tot + 'h',
    centerLabel: 'Total/día',
    ariaLabel: `Sueño diario recomendado: ${tot} horas, de las cuales ${n} de noche y ${siestaHoras} en siestas`,
  };
  const out: any = { horasTotales:tot+'h', noche:n+'h', siestas:s, resumen:`${m} meses: ${tot}h total, ${n}h noche, ${s}.`, _insight, _chart };
  return out;
}
