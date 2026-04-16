export interface Inputs { transporte?: string; kmSemanales?: number; dieta?: string; energia?: string; }
export interface Outputs { toneladas: number; comparacion: string; mensaje: string; }
export function huellaCarbono(i: Inputs): Outputs {
  const trans = String(i.transporte||'auto');
  const km = Number(i.kmSemanales)||100;
  const dieta = String(i.dieta||'mixta');
  const energia = String(i.energia||'media');
  const CO2_KM:Record<string,number> = { auto:0.21, electrico:0.05, 'transporte-publico':0.06, bicicleta:0 };
  const CO2_DIETA:Record<string,number> = { 'carne-diaria':2.5, mixta:1.5, vegetariana:1.0, vegana:0.7 };
  const CO2_ENERGIA:Record<string,number> = { baja:0.6, media:1.0, alta:1.8 };
  const transAnual = (CO2_KM[trans]||0.21) * km * 52 / 1000;
  const dietaAnual = CO2_DIETA[dieta]||1.5;
  const energiaAnual = CO2_ENERGIA[energia]||1.0;
  const otros = 1.0;
  const total = Number((transAnual + dietaAnual + energiaAnual + otros).toFixed(1));
  const promedioArg = 4.7;
  const diff = total - promedioArg;
  const comp = diff > 0.5 ? `${diff.toFixed(1)} ton por encima del promedio argentino (${promedioArg} ton).` : diff < -0.5 ? `${Math.abs(diff).toFixed(1)} ton por debajo del promedio argentino. ¡Bien!` : `Cerca del promedio argentino (${promedioArg} ton).`;
  const tips:string[]=[];
  if(trans==='auto') tips.push('Cambiar el auto por transporte público o bici bajaría ~1-2 ton/año.');
  if(dieta==='carne-diaria') tips.push('Reducir la carne a 3x/semana ahorraría ~1 ton/año.');
  if(energia==='alta') tips.push('Reducir el consumo energético (LED, menos AC) ahorraría ~0.5-1 ton/año.');
  return { toneladas: total, comparacion: comp, mensaje: tips.length?tips.join(' '):'Buen nivel de emisiones. Seguí así.' };
}
