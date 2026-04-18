export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function huellaCarbonoStreamingVideoHoras(i: Inputs): Outputs {
  const h = Number(i.horasDia) || 0;
  const factor = i.calidad === '4K' ? 75 : i.calidad === 'SD' ? 10 : 36;
  const gDia = h * factor; const kgMes = (gDia * 30) / 1000;
  return { gCo2Dia: gDia.toFixed(0) + ' g', kgCo2Mes: kgMes.toFixed(2) + ' kg', resumen: `${h}h/día en ${i.calidad}: ${gDia.toFixed(0)} g CO₂/día = ${kgMes.toFixed(1)} kg/mes.` };
}
