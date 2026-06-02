/** Conversor: legua ↔ kilómetro */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorLeguasAKilometros(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 5.572;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'leguas'; toLabel = 'kilómetros';
  } else {
    r = v / factor;
    fromLabel = 'kilómetros'; toLabel = 'leguas';
  }
  const rTxt = r.toFixed(4).replace(/\.?0+$/, '');
  const _insight = {
    title: 'Sobre la legua',
    text: d === 'ida'
      ? '**' + v + ' leguas** equivalen a **' + rTxt + ' km**. Acá se usa la legua española de ≈ 5,572 km; ojo que existen otras (la legua marina son ~5,556 km y otras versiones rondan los 4 a 6 km).'
      : '**' + v + ' km** son aprox. **' + rTxt + ' leguas** (legua española de ≈ 5,572 km). El valor cambia si la fuente usa otra definición de legua.',
    tone: 'neutral',
    icon: '🐎'
  };
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'km'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + rTxt + ' ' + toLabel + '.',
    _insight
  };
}
