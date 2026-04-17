/**
 * Calculadora de peso de madera por tipo y volumen
 */

export interface Inputs {
  largo: number; ancho: number; espesor: number; tipoMadera: number; cantidad: number;
}

export interface Outputs {
  pesoTotal: string; pesoUnidad: string; volumenM3: string; densidad: string;
}

export function pesoMaderaPorTipoVolumen(inputs: Inputs): Outputs {
  const l = Number(inputs.largo);
  const a = Number(inputs.ancho);
  const e = Number(inputs.espesor);
  const tm = Math.round(Number(inputs.tipoMadera));
  const cant = Math.round(Number(inputs.cantidad));
  if (!l || !a || !e || !tm || !cant) throw new Error('Completá los campos');
  const densidades: Record<number, { d: number; n: string }> = {
    1: { d: 450, n: 'Pino' },
    2: { d: 400, n: 'Cedro' },
    3: { d: 650, n: 'Eucalipto' },
    4: { d: 750, n: 'Roble' },
    5: { d: 900, n: 'Lapacho' },
    6: { d: 1200, n: 'Quebracho colorado' },
    7: { d: 820, n: 'Algarrobo' },
    8: { d: 720, n: 'Haya' },
  };
  const md = densidades[tm] || densidades[1];
  const volM3 = (l * a * e) / 1000000; // cm³ → m³
  const pesoUn = volM3 * md.d;
  const pesoTot = pesoUn * cant;
  return {
    pesoTotal: `${pesoTot.toFixed(1)} kg (${cant} pieza${cant>1?'s':''})`,
    pesoUnidad: `${pesoUn.toFixed(2)} kg cada una`,
    volumenM3: `${(volM3 * cant).toFixed(4)} m³`,
    densidad: `${md.n}: ${md.d} kg/m³`,
  };
}
