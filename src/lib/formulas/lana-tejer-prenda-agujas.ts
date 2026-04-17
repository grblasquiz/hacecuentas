/**
 * Calculadora de lana para tejer por prenda
 */

export interface Inputs {
  prenda: number; talla: number; aguja: number;
}

export interface Outputs {
  gramosNecesarios: string; madejas50g: number; madejas100g: number; metrosAproximados: string;
}

export function lanaTejerPrendaAgujas(inputs: Inputs): Outputs {
  const pr = Math.round(Number(inputs.prenda));
  const ta = Math.round(Number(inputs.talla));
  const ag = Number(inputs.aguja);
  if (!pr || !ta || !ag) throw new Error('Completá los campos');
  const tabla: Record<number, number[]> = {
    1: [200, 350, 550, 650, 750], // sweater
    2: [150, 250, 350, 420, 480], // sweater bebé/niño
    3: [80, 150, 200, 250, 280], // bufanda
    4: [60, 90, 120, 140, 160], // gorro
    5: [50, 70, 100, 120, 140], // guantes
    6: [300, 450, 800, 1000, 1200], // manta bebé/grande
    7: [500, 700, 1000, 1300, 1600], // manta sofá
    8: [180, 300, 450, 550, 650], // pollera
    9: [80, 100, 150, 200, 240], // cuello
  };
  const base = tabla[pr]?.[ta - 1] || 500;
  // Factor aguja (ref 4.5 mm = 1.0)
  const factor = ag <= 2.5 ? 1.4 : ag <= 3 ? 1.25 : ag <= 3.5 ? 1.15 : ag <= 4 ? 1.10 : ag <= 4.5 ? 1.0 : ag <= 5 ? 0.90 : ag <= 6 ? 0.80 : ag <= 8 ? 0.65 : ag <= 10 ? 0.55 : 0.50;
  const gramos = base * factor * 1.10; // 10% margen
  const madejas50 = Math.ceil(gramos / 50);
  const madejas100 = Math.ceil(gramos / 100);
  const metrosPorG = ag <= 3 ? 4 : ag <= 4 ? 2.5 : ag <= 5 ? 2 : ag <= 7 ? 1.4 : ag <= 10 ? 0.8 : 0.5;
  const metros = gramos * metrosPorG;
  return {
    gramosNecesarios: `${Math.round(gramos)} g`,
    madejas50g: madejas50,
    madejas100g: madejas100,
    metrosAproximados: `~${Math.round(metros)} m`,
  };
}
