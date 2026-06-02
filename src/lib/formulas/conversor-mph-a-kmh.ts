/** Conversor: milla por hora ↔ kilómetro por hora */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorMphAKmh(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 1.609344;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'millas por hora'; toLabel = 'kilómetros por hora';
  } else {
    r = v / factor;
    fromLabel = 'kilómetros por hora'; toLabel = 'millas por hora';
  }
  const rTxt = r.toFixed(4).replace(/\.?0+$/, '');
  // Velocidad expresada siempre en km/h para dar contexto vial
  const kmh = d === 'ida' ? r : v;
  let ref: string;
  if (kmh <= 40) {
    ref = `Es una velocidad de zona urbana / calle residencial.`;
  } else if (kmh <= 80) {
    ref = `Es la velocidad típica de avenida o ruta secundaria.`;
  } else if (kmh <= 130) {
    ref = `Está dentro del rango de autopista (límites de 110–130 km/h en la mayoría de países).`;
  } else {
    ref = `Supera el límite habitual de autopista: a esta velocidad la distancia de frenado se dispara.`;
  }
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'km/h'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + rTxt + ' ' + toLabel + '.',
    _insight: {
      title: 'En contexto',
      text: `**${v} ${fromLabel}** son **${rTxt} ${toLabel}**. ${ref}`,
      tone: kmh > 130 ? 'warn' : 'neutral',
      icon: '🚗'
    }
  };
}
