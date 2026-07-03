/** Costo total de alquilar un auto según días, precio por día, seguro y combustible. */
export interface Inputs {
  dias?: number | string;
  precio_dia?: number | string;
  seguro_dia?: number | string;
  combustible_estimado?: number | string;
  personas?: number | string;
  __country?: string;
}

export interface Outputs {
  costo_total: number;
  costo_por_dia: number;
  costo_por_persona: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function alquilerAutoCostoDias(i: Inputs): Outputs {
  const dias = Math.max(0, Math.floor(Number(i.dias) || 0));
  const precio_dia = Math.max(0, Number(i.precio_dia) || 0);
  const seguro_dia = Math.max(0, Number(i.seguro_dia) || 0);
  const combustible_estimado = Math.max(0, Number(i.combustible_estimado) || 0);
  const personas = Math.max(0, Math.floor(Number(i.personas) || 0));

  const alquiler = dias * precio_dia;
  const seguro = dias * seguro_dia;
  const costo_total = alquiler + seguro + combustible_estimado;
  const costo_por_dia = dias > 0 ? Math.round(costo_total / dias) : 0;
  const costo_por_persona = personas > 0 ? Math.round(costo_total / personas) : 0;

  let resumen: string;
  if (precio_dia <= 0) {
    resumen = 'Ingresá el precio por día para calcular el costo del alquiler.';
  } else if (dias <= 0) {
    resumen = 'Cargá cuántos días alquilás el auto para calcular el costo.';
  } else {
    resumen = `${dias} día${dias === 1 ? '' : 's'} de alquiler${seguro > 0 ? ' con seguro' : ''}${combustible_estimado > 0 ? ' + nafta estimada' : ''}: costo total del auto${personas > 0 ? `, dividido entre ${personas} persona${personas === 1 ? '' : 's'}` : ''}.`;
  }

  const out: Outputs = { costo_total, costo_por_dia, costo_por_persona, resumen };

  if (costo_total > 0) {
    out._insight = {
      title: 'Cuánto sale alquilar el auto',
      text: `Por **${dias}** día${dias === 1 ? '' : 's'} el auto sale el costo total${personas > 0 ? `, o sea **${costo_por_persona.toLocaleString('es-AR')}** por persona` : ''}. Ojo con los extras: el seguro y la nafta pueden sumar tanto como el alquiler en sí, cargalos siempre para ver el número real.`,
      tone: 'neutral',
      icon: '🚗',
    };
    const slices = [
      { label: 'Alquiler', value: alquiler },
      { label: 'Seguro', value: seguro },
      { label: 'Combustible', value: combustible_estimado },
    ].filter((s) => s.value > 0);
    if (slices.length >= 2) {
      out._chart = {
        type: 'doughnut',
        slices,
        centerValue: `$${costo_total.toLocaleString('es-AR')}`,
        centerLabel: 'Costo total',
        ariaLabel: `Alquiler ${alquiler}, seguro ${seguro} y combustible ${combustible_estimado}.`,
      };
    }
  }

  return out;
}
