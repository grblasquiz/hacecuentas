/** Proporción de agua y sal para cocinar pasta */
export interface Inputs { gramosPasta: number; }
export interface Outputs { litrosAgua: number; gramosSal: number; tiempoCoccion: string; detalle: string; }

export function salAguaPasta(i: Inputs): Outputs {
  const gramos = Number(i.gramosPasta);
  if (!gramos || gramos <= 0) throw new Error('Ingresá los gramos de pasta');

  // Regla 1-10-100
  const litros = gramos / 100;
  const sal = gramos / 10;
  const cucharadas = sal / 15; // ~15g por cucharada sopera

  const porciones = Math.round(gramos / 100);

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

  return {
    litrosAgua: Number(litros.toFixed(1)),
    gramosSal: Math.round(sal),
    tiempoCoccion: '8-12 minutos (consultá el paquete, probá 2 min antes)',
    detalle: `Para ${fmt.format(gramos)} g de pasta: ${fmt.format(litros)} L de agua y ${fmt.format(sal)} g de sal (~${fmt.format(cucharadas)} cucharadas soperas). Rinde ~${porciones} porción${porciones > 1 ? 'es' : ''}.`,
  };
}
