/**
 * Calculadora de costo de impresión 3D por pieza
 */

export interface Inputs {
  gramos: number; precioKg: number; horas: number; watts: number; kwh: number; margen: number;
}

export interface Outputs {
  precioFinal: number; costoMaterial: number; costoLuz: number; costoDesgaste: number; costoTotal: number; desglose: string;
}

export function costoImpresion3dPieza(inputs: Inputs): Outputs {
  const g = Number(inputs.gramos);
  const pk = Number(inputs.precioKg);
  const h = Number(inputs.horas);
  const w = Number(inputs.watts);
  const kwh = Number(inputs.kwh);
  const mg = Number(inputs.margen);
  if (!g || !pk || !h || !w || !kwh) throw new Error('Completá todos los campos');
  const material = (g / 1000) * pk;
  const luz = h * (w / 1000) * kwh;
  const desgaste = (material + luz) * 0.10;
  const total = material + luz + desgaste;
  const precio = total * (1 + mg / 100);
  return {
    precioFinal: Number(precio.toFixed(0)),
    costoMaterial: Number(material.toFixed(0)),
    costoLuz: Number(luz.toFixed(0)),
    costoDesgaste: Number(desgaste.toFixed(0)),
    costoTotal: Number(total.toFixed(0)),
    desglose: `Material ${Math.round((material/total)*100)}% · Luz ${Math.round((luz/total)*100)}% · Desgaste ${Math.round((desgaste/total)*100)}%`,
  };
}
