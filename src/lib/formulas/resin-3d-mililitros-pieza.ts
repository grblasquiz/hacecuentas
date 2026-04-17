/**
 * Calculadora de resina 3D en mililitros por pieza
 */

export interface Inputs {
  volumen: number; hollow: number; paredHollow: number; soportes: number; precioLitro: number;
}

export interface Outputs {
  mililitros: string; costo: string; prints: number; desglose: string;
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
  return {
    mililitros: `${mlTotal.toFixed(1)} mL`,
    costo: `$${costo.toFixed(0)}`,
    prints: printsLitro,
    desglose: `Pieza ${volPieza.toFixed(1)} mL + Soportes ${volSop.toFixed(1)} mL`,
  };
}
