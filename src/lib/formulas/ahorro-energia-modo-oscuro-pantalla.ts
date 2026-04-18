export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ahorroEnergiaModoOscuroPantalla(i: Inputs): Outputs {
  const h = Number(i.horasDia) || 0; const w = Number(i.potenciaW) || 3;
  const ahorroDia = w * 0.6 * h / 1000;
  const ahorroMes = ahorroDia * 30;
  return { ahorroKwhMes: ahorroMes.toFixed(3) + ' kWh', resumen: `Ahorro estimado ${ahorroMes.toFixed(2)} kWh/mes con modo oscuro en pantalla OLED.` };
}
