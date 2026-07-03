/** Costo total de hospedaje según noches, precio por noche, habitaciones y personas. */
export interface Inputs {
  noches?: number | string;
  precio_noche?: number | string;
  habitaciones?: number | string;
  personas?: number | string;
  __country?: string;
}

export interface Outputs {
  costo_total: number;
  costo_por_persona: number;
  costo_por_noche: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function nochesHospedajeCosto(i: Inputs): Outputs {
  const noches = Math.max(0, Math.floor(Number(i.noches) || 0));
  const precio_noche = Math.max(0, Number(i.precio_noche) || 0);
  const habitaciones = Math.max(1, Math.floor(Number(i.habitaciones) || 1));
  const personas = Math.max(0, Math.floor(Number(i.personas) || 0));

  const costo_total = noches * precio_noche * habitaciones;
  const costo_por_persona = personas > 0 ? Math.round(costo_total / personas) : 0;
  const costo_por_noche = noches > 0 ? Math.round(costo_total / noches) : 0;

  let resumen: string;
  if (precio_noche <= 0) {
    resumen = 'Ingresá el precio por noche para calcular el costo.';
  } else if (noches <= 0) {
    resumen = 'Cargá cuántas noches te vas a quedar para calcular el costo.';
  } else {
    resumen = `${noches} noche${noches === 1 ? '' : 's'} en ${habitaciones} habitación${habitaciones === 1 ? '' : 'es'} = costo total del alojamiento${personas > 0 ? `, dividido entre ${personas} persona${personas === 1 ? '' : 's'}` : ''}.`;
  }

  const out: Outputs = { costo_total, costo_por_persona, costo_por_noche, resumen };

  if (costo_total > 0) {
    out._insight = {
      title: 'Cuánto vas a gastar en alojamiento',
      text: `Por **${noches}** noche${noches === 1 ? '' : 's'} en **${habitaciones}** habitación${habitaciones === 1 ? '' : 'es'} el alojamiento suma el costo total${personas > 0 ? `, o sea **${costo_por_persona.toLocaleString('es-AR')}** por persona` : ''}. El precio por noche es el que más mueve la aguja: compará dos o tres opciones antes de reservar.`,
      tone: 'neutral',
      icon: '🏨',
    };
  }

  return out;
}
