export interface Inputs { personas: number; duchasXdia: number; minutoDucha: number; lavadasRopaSemana: number; }
export interface Outputs { litrosMes: number; m3Mes: number; litrosDia: number; desglose: string; }
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
  return { litrosMes: Math.round(totalMes), m3Mes: Number((totalMes/1000).toFixed(1)), litrosDia: Math.round(totalDia), desglose: `${partes[0].n} (${Math.round(partes[0].v)} L/mes)` };
}