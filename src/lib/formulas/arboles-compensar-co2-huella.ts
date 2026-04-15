/** Cuántos árboles plantar para compensar emisiones de CO2 */
export interface Inputs { toneladasCO2: number; absorcionArbol: number; }
export interface Outputs { arbolesNecesarios: number; hectareas: number; aniosParaMadurar: number; detalle: string; }

export function arbolesCompensarCo2Huella(i: Inputs): Outputs {
  const ton = Number(i.toneladasCO2);
  const absorcion = Number(i.absorcionArbol);

  if (!ton || ton <= 0) throw new Error('Ingresá las toneladas de CO2 a compensar');
  if (!absorcion || absorcion <= 0) throw new Error('Ingresá la absorción por árbol');

  const kgCO2 = ton * 1000;
  const arboles = Math.ceil(kgCO2 / absorcion);
  const hectareas = arboles / 400;
  const aniosParaMadurar = 12;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const fmt2 = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  return {
    arbolesNecesarios: arboles,
    hectareas: Number(hectareas.toFixed(2)),
    aniosParaMadurar,
    detalle: `${fmt2.format(ton)} toneladas = ${fmt.format(kgCO2)} kg CO2 ÷ ${fmt.format(absorcion)} kg/árbol = ${fmt.format(arboles)} árboles necesarios en ${fmt2.format(hectareas)} hectáreas. Los árboles tardan ~${aniosParaMadurar} años en alcanzar absorción plena.`,
  };
}
