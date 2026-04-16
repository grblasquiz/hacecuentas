/** Calculadora Número de Oxidación — suma = carga total */
export interface Inputs { oxidacionConocida1: number; cantidadElem1: number; oxidacionConocida2: number; cantidadElem2: number; cantidadIncognita: number; cargaTotal: number; }
export interface Outputs { oxidacionDesconocida: string; verificacion: string; interpretacion: string; formula: string; }

export function numeroOxidacionElemento(i: Inputs): Outputs {
  const ox1 = Number(i.oxidacionConocida1);
  const n1 = Number(i.cantidadElem1);
  const ox2 = Number(i.oxidacionConocida2);
  const n2 = Number(i.cantidadElem2);
  const nx = Number(i.cantidadIncognita);
  const carga = Number(i.cargaTotal);
  if (nx <= 0) throw new Error('La cantidad de átomos del desconocido debe ser mayor a 0');

  // carga = n1*ox1 + n2*ox2 + nx*oxX → oxX = (carga - n1*ox1 - n2*ox2) / nx
  const sumaConocida = n1 * ox1 + n2 * ox2;
  const oxX = (carga - sumaConocida) / nx;

  const signo = oxX > 0 ? '+' : '';
  const verificacionSuma = sumaConocida + nx * oxX;

  let interp: string;
  if (oxX > 0) interp = `El elemento perdió ${oxX} electrones (estado oxidado).`;
  else if (oxX < 0) interp = `El elemento ganó ${Math.abs(oxX)} electrones (estado reducido).`;
  else interp = 'El elemento está en su estado elemental (oxidación 0).';

  return {
    oxidacionDesconocida: `${signo}${Number.isInteger(oxX) ? oxX : oxX.toFixed(2)}`,
    verificacion: `${n1}×(${ox1}) + ${n2}×(${ox2}) + ${nx}×(${signo}${oxX}) = ${verificacionSuma} ✓`,
    interpretacion: interp,
    formula: `${carga} = ${n1}×(${ox1}) + ${n2}×(${ox2}) + ${nx}×x → x = ${signo}${Number.isInteger(oxX) ? oxX : oxX.toFixed(2)}`,
  };
}
