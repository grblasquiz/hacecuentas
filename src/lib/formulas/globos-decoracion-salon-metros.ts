/**
 * Calculadora de Globos para Decoración - Metros Arco.
 */
export interface GlobosDecoracionSalonMetrosInputs { metrosArco:number; tipoDecoracion:string; }
export interface GlobosDecoracionSalonMetrosOutputs { globosTotales:number; globos12pulg:number; globos5pulg:number; costoEstimado:number; }
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
  return {
    globosTotales,
    globos12pulg,
    globos5pulg,
    costoEstimado: Number(costo.toFixed(0)),
  };
}
