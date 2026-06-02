/** Conversor: nudo ↔ kilómetro por hora */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorNudosAKmh(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 1.852;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'nudos'; toLabel = 'kilómetros por hora';
  } else {
    r = v / factor;
    fromLabel = 'kilómetros por hora'; toLabel = 'nudos';
  }
  const rTxt = r.toFixed(4).replace(/\.?0+$/, '');
  // Velocidad expresada siempre en nudos para dar contexto náutico/aéreo
  const kn = d === 'ida' ? v : r;
  let ref: string;
  if (kn < 15) {
    ref = `Es la velocidad de un velero de paseo o una brisa náutica liviana.`;
  } else if (kn < 35) {
    ref = `Es velocidad de crucero de una lancha rápida o viento marino moderado.`;
  } else if (kn < 250) {
    ref = `Es velocidad típica de despegue/aproximación de un avión comercial.`;
  } else {
    ref = `Es velocidad de crucero de un avión de pasajeros en altura.`;
  }
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'km/h'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + rTxt + ' ' + toLabel + '.',
    _insight: {
      title: 'En contexto',
      text: `**${v} ${fromLabel}** equivalen a **${rTxt} ${toLabel}**. Un nudo es una milla náutica por hora (1,852 km/h). ${ref}`,
      tone: 'neutral',
      icon: '⛵'
    }
  };
}
