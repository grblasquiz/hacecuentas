export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function combustibleAutoViajeEmisiones(i: Inputs): Outputs {
  const L = Number(i.litros) || 0;
  const f = i.tipo === 'gasoil' ? 2.68 : i.tipo === 'gnc' ? 1.88 : 2.31;
  const co2 = L * f;
  // Árboles para compensar: un árbol absorbe ~21 kg CO₂/año (promedio).
  const arboles = Math.max(1, Math.round(co2 / 21));
  const _insight = {
    title: 'Tu huella en este viaje',
    text: `Quemar **${L} L** de ${i.tipo} libera **${co2.toFixed(0)} kg de CO₂** a la atmósfera. Compensar esa emisión equivale a lo que absorbe${arboles === 1 ? '' : 'n'} **${arboles} árbol${arboles === 1 ? '' : 'es'}** en un año.`,
    tone: co2 > 0 ? 'warn' : 'neutral',
    icon: '🌱',
  };
  return { kgCo2: co2.toFixed(1) + ' kg', resumen: `${L}L de ${i.tipo} = ${co2.toFixed(0)} kg CO₂ emitido.`, _insight };
}
