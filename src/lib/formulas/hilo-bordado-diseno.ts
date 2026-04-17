/**
 * Calculadora de hilo para bordado por cm²
 */

export interface Inputs {
  ancho: number; alto: number; puntada: number; colores: number; cobertura: number;
}

export interface Outputs {
  metrosTotales: string; metrosPorColor: string; madejasNecesarias: string; consejo: string;
}

export function hiloBordadoDiseno(inputs: Inputs): Outputs {
  const a = Number(inputs.ancho);
  const h = Number(inputs.alto);
  const pt = Math.round(Number(inputs.puntada));
  const c = Math.round(Number(inputs.colores));
  const cov = Number(inputs.cobertura);
  if (!a || !h || !pt || !c || !cov) throw new Error('Completá los campos');
  const consumo: Record<number, number> = { 1: 30, 2: 75, 3: 42, 4: 100, 5: 12 };
  const cons = consumo[pt] || 30;
  const areaM2 = (a * h / 10000) * (cov / 100);
  const metros = areaM2 * cons * 10000 / 10000; // m totales
  // Corregir: cons es m/m² → m = m² × cons
  const metrosReales = areaM2 * cons;
  const metrosPC = metrosReales / c;
  const madejas = Math.ceil(metrosPC / 8) + 1; // +1 seguridad
  let tip = '';
  if (pt === 1 || pt === 5) tip = 'Comprá 2 madejas por color para que todo el lote tenga igual tono.';
  else if (pt === 2 || pt === 4) tip = 'Consumo alto: considerá comprar 30% extra del color dominante.';
  else tip = 'Consumo medio: 1-2 madejas por color alcanza en diseños pequeños.';
  return {
    metrosTotales: `${metrosReales.toFixed(1)} m`,
    metrosPorColor: `${metrosPC.toFixed(1)} m`,
    madejasNecesarias: `${madejas} madejas por color`,
    consejo: tip,
  };
}
