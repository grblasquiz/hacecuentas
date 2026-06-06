export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function ahorroEnergiaModoOscuroPantalla(i: Inputs): Outputs {
  const h = Number(i.horasDia) || 0;
  const w = Number(i.potenciaW) || 3;
  // Factor ahorro OLED dark mode: ~40% a brillo típico (Purdue 2018, Google Android Dev Summit 2018)
  const factorAhorro = 0.40;
  const ahorroDia = w * factorAhorro * h / 1000;
  const ahorroMes = ahorroDia * 30;
  const ahorroAno = ahorroMes * 12;
  return {
    ahorroKwhMes: ahorroMes.toFixed(3) + ' kWh',
    resumen: `Ahorro estimado ${ahorroMes.toFixed(2)} kWh/mes y ${ahorroAno.toFixed(2)} kWh/año con modo oscuro en pantalla OLED/AMOLED.`,
    _insight: {
      title: 'Solo en OLED/AMOLED',
      text: `Con **${h} h/día** de pantalla OLED, el modo oscuro ahorra **${ahorroMes.toFixed(2)} kWh/mes** (~${ahorroAno.toFixed(1)} kWh/año). Factor: 40% de la potencia del panel (Purdue 2018). En LCD/IPS el ahorro es cero.`,
      tone: 'neutral',
      icon: '🌙'
    }
  };
}
