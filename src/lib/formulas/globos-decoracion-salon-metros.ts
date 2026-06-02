/**
 * Calculadora de Globos para Decoración - Metros Arco.
 */
export interface GlobosDecoracionSalonMetrosInputs { metrosArco:number; tipoDecoracion:string; }
export interface GlobosDecoracionSalonMetrosOutputs { globosTotales:number; globos12pulg:number; globos5pulg:number; costoEstimado:number; _insight?:any; _chart?:any; }
export function globosDecoracionSalonMetros(inputs: GlobosDecoracionSalonMetrosInputs): GlobosDecoracionSalonMetrosOutputs {
  const m = Number(inputs.metrosArco);
  const tipo = inputs.tipoDecoracion;
  if (!m || m <= 0) throw new Error('Ingresá metros');
  let porMetro = 32;
  if (tipo === 'guirnalda') porMetro = 16;
  else if (tipo === 'columna') porMetro = 18;
  const globosTotales = Math.ceil(m * porMetro);
  const globos12pulg = Math.ceil(globosTotales * 0.7);
  const globos5pulg = globosTotales - globos12pulg;
  const costo = globos12pulg * 0.4 + globos5pulg * 0.15;
  const tipoLabel = tipo === 'guirnalda' ? 'guirnalda' : tipo === 'columna' ? 'columna' : 'arco orgánico';
  return {
    globosTotales,
    globos12pulg,
    globos5pulg,
    costoEstimado: Number(costo.toFixed(0)),
    _insight: {
      title: 'Tu lista de compra',
      text: `Para ${m} m de ${tipoLabel} necesitás **${globosTotales} globos** (${globos12pulg} de 12\" + ${globos5pulg} de 5\"). Comprá un **10-15% extra** por roturas al inflar y armado.`,
      tone: 'neutral',
      icon: '🎈',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Globos 12"', value: globos12pulg },
        { label: 'Globos 5"', value: globos5pulg },
      ],
      centerValue: String(globosTotales),
      centerLabel: 'globos',
      ariaLabel: `Composición de ${globosTotales} globos: ${globos12pulg} de 12 pulgadas y ${globos5pulg} de 5 pulgadas`,
    },
  };
}
