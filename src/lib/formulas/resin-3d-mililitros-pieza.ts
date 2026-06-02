/**
 * Calculadora de resina 3D en mililitros por pieza
 */

export interface Inputs {
  volumen: number; hollow: number; paredHollow: number; soportes: number; precioLitro: number;
}

export interface Outputs {
  mililitros: string; costo: string; prints: number; desglose: string;
  _insight?: any; _chart?: any;
}

export function resin3dMililitrosPieza(inputs: Inputs): Outputs {
  const vol = Number(inputs.volumen);
  const hol = Math.round(Number(inputs.hollow));
  const pared = Number(inputs.paredHollow);
  const sop = Number(inputs.soportes);
  const precioL = Number(inputs.precioLitro);
  if (!vol || vol <= 0) throw new Error('Ingresá volumen');
  if (!precioL || precioL <= 0) throw new Error('Ingresá precio por litro');
  let factorHollow = 1;
  if (hol === 1) {
    if (pared <= 1.5) factorHollow = 0.12;
    else if (pared <= 2) factorHollow = 0.20;
    else if (pared <= 3) factorHollow = 0.30;
    else factorHollow = 0.42;
  }
  const volPieza = vol * factorHollow;
  const volSop = volPieza * (sop / 100);
  const mlTotal = volPieza + volSop;
  const precioMl = precioL / 1000;
  const costo = mlTotal * precioMl;
  const printsLitro = Math.floor(1000 / mlTotal);
  const pctSop = mlTotal > 0 ? (volSop / mlTotal) * 100 : 0;
  const sopTone = pctSop >= 25 ? 'warn' : 'good';
  return {
    mililitros: `${mlTotal.toFixed(1)} mL`,
    costo: `$${costo.toFixed(0)}`,
    prints: printsLitro,
    desglose: `Pieza ${volPieza.toFixed(1)} mL + Soportes ${volSop.toFixed(1)} mL`,
    _insight: {
      title: 'Resina por pieza',
      text: `Cada copia consume **${mlTotal.toFixed(1)} mL** y cuesta **$${costo.toFixed(0)}** en resina: con 1 litro sacás **${printsLitro} piezas**. Los soportes se llevan **${pctSop.toFixed(0)}%** del material.`,
      tone: sopTone,
      icon: '🧪',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Pieza', value: Number(volPieza.toFixed(1)) },
        { label: 'Soportes', value: Number(volSop.toFixed(1)) },
      ],
      centerValue: `${mlTotal.toFixed(1)} mL`,
      centerLabel: 'por pieza',
      ariaLabel: `Resina total ${mlTotal.toFixed(1)} mL: pieza ${volPieza.toFixed(1)} mL más soportes ${volSop.toFixed(1)} mL`,
    },
  };
}
