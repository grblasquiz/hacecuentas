export interface Inputs { transporte?: string; kmSemanales?: number; dieta?: string; energia?: string; }
export interface Outputs { toneladas: number; comparacion: string; mensaje: string; _insight?: any; _chart?: any; }
export function huellaCarbono(i: Inputs): Outputs {
  const trans = String(i.transporte||'auto');
  const km = Number(i.kmSemanales)||100;
  const dieta = String(i.dieta||'mixta');
  const energia = String(i.energia||'media');
  const CO2_KM:Record<string,number> = { auto:0.21, electrico:0.05, 'transporte-publico':0.06, bicicleta:0 };
  const CO2_DIETA:Record<string,number> = { 'carne-diaria':2.5, mixta:1.5, vegetariana:1.0, vegana:0.7 };
  const CO2_ENERGIA:Record<string,number> = { baja:0.6, media:1.0, alta:1.8 };
  const factorKm = Number.isFinite(CO2_KM[trans]) ? CO2_KM[trans] : 0.21;
  const transAnual = factorKm * km * 52 / 1000;
  const dietaAnual = Number.isFinite(CO2_DIETA[dieta]) ? CO2_DIETA[dieta] : 1.5;
  const energiaAnual = Number.isFinite(CO2_ENERGIA[energia]) ? CO2_ENERGIA[energia] : 1.0;
  const otros = 1.0;
  const total = Number((transAnual + dietaAnual + energiaAnual + otros).toFixed(1));
  const promedioArg = 4.7;
  const diff = total - promedioArg;
  const comp = diff > 0.5 ? `${diff.toFixed(1)} ton por encima del promedio argentino (${promedioArg} ton).` : diff < -0.5 ? `${Math.abs(diff).toFixed(1)} ton por debajo del promedio argentino. ¡Bien!` : `Cerca del promedio argentino (${promedioArg} ton).`;
  const tips:string[]=[];
  if(trans==='auto') tips.push('Cambiar el auto por transporte público o bici bajaría ~1-2 ton/año.');
  if(dieta==='carne-diaria') tips.push('Reducir la carne a 3x/semana ahorraría ~1 ton/año.');
  if(energia==='alta') tips.push('Reducir el consumo energético (LED, menos AC) ahorraría ~0.5-1 ton/año.');
  // Insight dinámico según comparación con el promedio argentino
  let _insight: any;
  if (diff > 0.5) {
    _insight = { title: 'Por encima del promedio', text: `Tu huella es de **${total} t CO₂/año**, **${diff.toFixed(1)} t por encima** del promedio argentino (${promedioArg} t). El mayor margen de mejora está en transporte y dieta.`, tone: 'warn', icon: '🌍' };
  } else if (diff < -0.5) {
    _insight = { title: 'Por debajo del promedio', text: `Tu huella es de **${total} t CO₂/año**, **${Math.abs(diff).toFixed(1)} t por debajo** del promedio argentino (${promedioArg} t). Vas muy bien.`, tone: 'good', icon: '🌱' };
  } else {
    _insight = { title: 'En torno al promedio', text: `Tu huella es de **${total} t CO₂/año**, cerca del promedio argentino (**${promedioArg} t**). Pequeños cambios en transporte o dieta te mueven hacia abajo.`, tone: 'neutral', icon: '🌍' };
  }

  // Donut: las 4 fuentes suman el total anual
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Transporte', value: Number(transAnual.toFixed(1)) },
      { label: 'Dieta', value: Number(dietaAnual.toFixed(1)) },
      { label: 'Energía', value: Number(energiaAnual.toFixed(1)) },
      { label: 'Otros', value: Number(otros.toFixed(1)) },
    ].filter(s => s.value > 0),
    prefix: '',
    centerValue: total.toFixed(1) + ' t',
    centerLabel: 'CO₂/año',
    ariaLabel: `Reparto de tu huella de carbono anual por categoría, total ${total.toFixed(1)} toneladas`,
  };

  return { toneladas: total, comparacion: comp, mensaje: tips.length?tips.join(' '):'Buen nivel de emisiones. Seguí así.', _insight, _chart };
}
