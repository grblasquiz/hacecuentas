/** Conversor: arroba ↔ kilogramo */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorArrobasAKilogramos(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 11.502;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'arrobas'; toLabel = 'kilogramos';
  } else {
    r = v / factor;
    fromLabel = 'kilogramos'; toLabel = 'arrobas';
  }
  // Anchor: peso en kg y equivalente en bolsas de 25 kg
  const kg = d === 'ida' ? r : v;
  const bolsas = kg / 25;
  const kgFmt = kg.toLocaleString('es-AR', { maximumFractionDigits: 3 });
  const bolsasFmt = bolsas.toLocaleString('es-AR', { maximumFractionDigits: bolsas < 10 ? 1 : 0 });
  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'kg'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight: {
      title: 'Cuánto pesa',
      text: 'Son **' + kgFmt + ' kg**, equivalentes a unas **' + bolsasFmt + ' bolsas** de 25 kg. La arroba castellana pesa 11,502 kg.',
      tone: 'neutral',
      icon: '⚖️'
    }
  };
}
