export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function ahorroEnergiaModoOscuroPantalla(i: Inputs): Outputs {
  const h = Number(i.horasDia) || 0; const w = Number(i.potenciaW) || 3;
  const ahorroDia = w * 0.6 * h / 1000;
  const ahorroMes = ahorroDia * 30;
  const ahorroAno = ahorroMes * 12;
  return {
    ahorroKwhMes: ahorroMes.toFixed(3) + ' kWh',
    resumen: `Ahorro estimado ${ahorroMes.toFixed(2)} kWh/mes con modo oscuro en pantalla OLED.`,
    _insight: { title: 'Efecto modesto', text: `Con **${h} h/día** de pantalla OLED, el modo oscuro ahorra apenas **${ahorroMes.toFixed(2)} kWh/mes** (~${ahorroAno.toFixed(1)} kWh/año). El beneficio real es más la vista y la batería que la factura.`, tone: 'neutral', icon: '🌙' }
  };
}
