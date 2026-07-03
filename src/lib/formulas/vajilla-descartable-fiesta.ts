/** Vajilla descartable (vasos, platos, cubiertos, servilletas) para una fiesta según personas, tipo de evento y duración. */
export interface Inputs {
  personas?: number | string;
  tipo_evento?: string;
  duracion?: string;
  __country?: string;
}

export interface Outputs {
  vasos: number;
  platos: number;
  cubiertos: number;
  servilletas: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function vajillaDescartableFiesta(i: Inputs): Outputs {
  const personas = Math.max(0, Math.floor(Number(i.personas) || 0));
  const tipo = String(i.tipo_evento || 'cumple');
  const dur = String(i.duracion || 'media');

  const vasosPP: Record<string, number> = { cumple: 3, after: 4, cena: 2 };
  const durF: Record<string, number> = { corta: 0.8, media: 1, larga: 1.3 };

  const vpp = vasosPP[tipo] ?? 3;
  const df = durF[dur] ?? 1;

  const vasos = personas > 0 ? Math.ceil(personas * vpp * df) : 0;
  const platos = personas > 0 ? Math.ceil(personas * 2) : 0;
  const cubiertos = personas > 0 ? Math.ceil(personas * 1.2) : 0;
  const servilletas = personas > 0 ? Math.ceil(personas * 4) : 0;

  const resumen = personas > 0
    ? `Para ${personas} personas: ${vasos} vasos, ${platos} platos, ${cubiertos} sets de cubiertos y ${servilletas} servilletas.`
    : 'Cargá la cantidad de personas para calcular la vajilla.';

  const out: Outputs = { vasos, platos, cubiertos, servilletas, resumen };

  if (personas > 0) {
    out._insight = {
      title: 'Cuánta vajilla descartable comprar',
      text: `Para **${personas}** personas calculá **${vasos} vasos**, **${platos} platos** y **${cubiertos} sets de cubiertos**. El número que más varía es el de vasos: en un cumple se pierden y se cambian, por eso van 3 por persona (4 en un after, 2 en una cena).`,
      tone: 'neutral',
      icon: '🍽️',
    };
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Vasos', value: vasos },
        { label: 'Platos', value: platos },
        { label: 'Cubiertos', value: cubiertos },
        { label: 'Servilletas', value: servilletas },
      ],
      centerValue: `${personas} p`,
      centerLabel: 'Invitados',
      ariaLabel: `${vasos} vasos, ${platos} platos, ${cubiertos} sets de cubiertos y ${servilletas} servilletas para ${personas} personas.`,
    };
  }

  return out;
}
