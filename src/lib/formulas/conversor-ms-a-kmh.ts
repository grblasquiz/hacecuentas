/** Conversor: metro por segundo ↔ kilómetro por hora */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorMsAKmh(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 3.6;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'metros por segundo'; toLabel = 'kilómetros por hora';
  } else {
    r = v / factor;
    fromLabel = 'kilómetros por hora'; toLabel = 'metros por segundo';
  }
  const rTxt = r.toFixed(4).replace(/\.?0+$/, '');
  // Velocidad expresada siempre en m/s para referenciar viento (Beaufort)
  const ms = d === 'ida' ? v : r;
  let ref: string;
  if (ms < 5.5) {
    ref = `Como viento, sería una brisa suave (escala Beaufort baja).`;
  } else if (ms < 13.9) {
    ref = `Como viento, equivale a una brisa fuerte que mueve ramas grandes.`;
  } else if (ms < 24.5) {
    ref = `Como viento, sería temporal: ramas que se quiebran y dificultad para caminar.`;
  } else {
    ref = `Como viento, está en rango de huracán (≥24,5 m/s): potencial de daños severos.`;
  }
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'km/h'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + rTxt + ' ' + toLabel + '.',
    _insight: {
      title: 'En contexto',
      text: `**${v} ${fromLabel}** equivalen a **${rTxt} ${toLabel}**. Multiplicar por 3,6 pasa de m/s a km/h. ${ref}`,
      tone: ms >= 24.5 ? 'warn' : 'neutral',
      icon: '💨'
    }
  };
}
