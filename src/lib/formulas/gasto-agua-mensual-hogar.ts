export interface Inputs { personas: number; duchasXdia: number; minutoDucha: number; lavadasRopaSemana: number; }
export interface Outputs { litrosMes: number; m3Mes: number; litrosDia: number; desglose: string; _insight?: any; _chart?: any; }
export function gastoAguaMensualHogar(i: Inputs): Outputs {
  const pers = Number(i.personas); const duchas = Number(i.duchasXdia); const minDucha = Number(i.minutoDucha); const lavadas = Number(i.lavadasRopaSemana);
  if (!pers) throw new Error('Ingresá la cantidad de personas');
  const duchasDia = duchas * minDucha * 9; // 9 L/min promedio
  const inodoroDia = pers * 6 * 8; // 6 descargas × 8L
  const cocinaDia = pers * 10; // 10L cocina/limpieza
  const lavadosMes = lavadas * 4 * 60; // 60L por lavado
  const totalDia = duchasDia + inodoroDia + cocinaDia + (lavadosMes / 30);
  const totalMes = totalDia * 30;
  const partes = [{n: 'Duchas', v: duchasDia*30}, {n: 'Inodoro', v: inodoroDia*30}, {n: 'Lavarropas', v: lavadosMes}, {n: 'Cocina/Limpieza', v: cocinaDia*30}];
  partes.sort((a,b) => b.v - a.v);
  const litrosMes = Math.round(totalMes);
  const litrosDia = Math.round(totalDia);
  const litrosPersonaDia = Math.round(litrosDia / pers);
  // OMS estima ~100 L/persona/día como consumo razonable; >150 es alto
  const tone = litrosPersonaDia > 150 ? 'warn' : (litrosPersonaDia < 80 ? 'good' : 'neutral');
  const _insight = {
    title: 'Tu consumo de agua',
    text: `Tu hogar usa unos **${litrosMes.toLocaleString('es-AR')} L/mes** (${litrosPersonaDia} L por persona/día). Lo que más pesa: **${partes[0].n}**, con ${Math.round(partes[0].v).toLocaleString('es-AR')} L/mes.`,
    tone,
    icon: '💧',
  };
  const _chart = {
    type: 'doughnut',
    slices: partes.map(p => ({ label: p.n, value: Math.round(p.v) })),
    prefix: '',
    centerValue: `${litrosMes.toLocaleString('es-AR')} L`,
    centerLabel: 'por mes',
    ariaLabel: `Desglose del consumo mensual de agua: ${partes.map(p => `${p.n} ${Math.round(p.v)} litros`).join(', ')}.`,
  };
  return { litrosMes, m3Mes: Number((totalMes/1000).toFixed(1)), litrosDia, desglose: `${partes[0].n} (${Math.round(partes[0].v)} L/mes)`, _insight, _chart };
}