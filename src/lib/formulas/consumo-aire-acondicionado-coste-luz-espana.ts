/**
 * Coste de tener el aire acondicionado encendido (España) — factura de la luz.
 * kWh = potencia (kW) × horas × días · coste = kWh × precio del kWh.
 * Precio por defecto: 0,15 €/kWh (PVPC "todo incluido" con peajes e impuestos, referencia 2026).
 * Fórmula pura en euros (es-ES). Nota: los equipos inverter modulan y consumen menos que su potencia nominal.
 */
import { LUZ_2026 } from '../data/espana-2026.ts';

const fmtEur = (n: number, dec = 2): string =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec)) + ' €';
const fmtNum = (n: number, dec = 2): string =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec));

export interface Inputs {
  potenciaW: number | string;      // potencia eléctrica de consumo, en vatios
  horasDia: number | string;       // horas de uso al día
  diasUso?: number | string;       // días de uso (por defecto 30)
  precioKwh?: number | string;     // €/kWh (por defecto 0,15)
  factorInverter?: number | string; // % de aprovechamiento medio (inverter ~60%); 100 = potencia constante
}

export interface Outputs { [k: string]: any; detalle: string; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const potenciaW = Number(i.potenciaW) || 0;
  const horasDia = Number(i.horasDia) || 0;
  const diasUso = Number(i.diasUso) || 30;
  const precio = Number(i.precioKwh) || LUZ_2026.precioTodoIncluidoRef;
  const factor = i.factorInverter !== undefined && i.factorInverter !== '' ? Number(i.factorInverter) / 100 : 1;

  if (potenciaW <= 0) throw new Error('Introduce la potencia de consumo del aire (en vatios)');
  if (horasDia <= 0) throw new Error('Introduce las horas de uso al día');

  const potenciaKw = potenciaW / 1000;
  const kwhDia = potenciaKw * horasDia * factor;
  const kwhTotal = kwhDia * diasUso;
  const costeHora = potenciaKw * factor * precio;
  const costeDia = kwhDia * precio;
  const costeTotal = kwhTotal * precio;

  const _insight = {
    title: 'Lo que te cuesta el aire',
    text: `Un aire de **${fmtNum(potenciaW, 0)} W** funcionando **${fmtNum(horasDia, 1)} h/día** gasta unos **${fmtNum(kwhDia, 2)} kWh/día** (${fmtEur(costeDia)}). En ${fmtNum(diasUso, 0)} días son **${fmtNum(kwhTotal, 1)} kWh** y **${fmtEur(costeTotal)}** en la factura, a ${fmtEur(precio, 3)}/kWh. Subir el termostato 1 °C (de 22 a 23) recorta el consumo en torno a un 7%.`,
    tone: costeTotal > 60 ? 'warn' : 'neutral',
    icon: '❄️',
  };

  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Coste/día', value: Math.round(costeDia * 100) / 100 },
      { label: `Coste (${Math.round(diasUso)} días)`, value: Math.round(costeTotal * 100) / 100 },
    ],
    ariaLabel: `Coste por día ${fmtEur(costeDia)}, coste del periodo ${fmtEur(costeTotal)}.`,
  };

  return {
    costeTotal: fmtEur(costeTotal),
    costeDia: fmtEur(costeDia),
    costeHora: fmtEur(costeHora, 3),
    kwhTotal: fmtNum(kwhTotal, 1) + ' kWh',
    detalle: `Potencia ${fmtNum(potenciaKw, 2)} kW × ${fmtNum(horasDia, 1)} h${factor < 1 ? ` × ${fmtNum(factor * 100, 0)}% (inverter)` : ''} = ${fmtNum(kwhDia, 2)} kWh/día. × ${fmtNum(diasUso, 0)} días = ${fmtNum(kwhTotal, 1)} kWh. × ${fmtEur(precio, 3)}/kWh = ${fmtEur(costeTotal)}.`,
    _insight,
    _chart,
  };
}
