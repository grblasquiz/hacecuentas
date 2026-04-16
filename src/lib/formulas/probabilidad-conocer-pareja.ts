/** Ecuación de Drake aplicada al amor */
export interface Inputs { poblacion: number; rangoEdad?: number; generoPreferido?: number; solteros?: number; atraccion?: number; atraccionMutua?: number; compatibilidad?: number; }
export interface Outputs { personasCompatibles: number; probabilidad: string; mensaje: string; }

export function probabilidadConocerPareja(i: Inputs): Outputs {
  const pop = Number(i.poblacion);
  if (!pop || pop < 1000) throw new Error('Ingresá la población de tu ciudad');

  const pEdad = (Number(i.rangoEdad) || 20) / 100;
  const pGenero = (Number(i.generoPreferido) || 50) / 100;
  const pSolteros = (Number(i.solteros) || 40) / 100;
  const pAtraccion = (Number(i.atraccion) || 10) / 100;
  const pMutua = (Number(i.atraccionMutua) || 10) / 100;
  const pCompat = (Number(i.compatibilidad) || 20) / 100;

  const result = pop * pEdad * pGenero * pSolteros * pAtraccion * pMutua * pCompat;
  const personas = Math.max(1, Math.round(result));
  const ratio = Math.round(pop / personas);

  const prob = `1 de cada ${ratio.toLocaleString('es-AR')} personas en tu ciudad`;

  let msg = '';
  if (personas >= 500) msg = `¡${personas} personas compatibles! Hay mucho potencial — salí, participá en actividades y usá apps de citas.`;
  else if (personas >= 100) msg = `${personas} personas compatibles. Es un pool razonable — con apps y vida social activa, las chances son buenas.`;
  else if (personas >= 20) msg = `${personas} personas compatibles. Pool chico pero real — cada encuentro social cuenta.`;
  else msg = `${personas} persona(s) compatible(s). Pool muy reducido — considerá ampliar tu radio geográfico o flexibilizar algún filtro.`;

  return { personasCompatibles: personas, probabilidad: prob, mensaje: msg };
}
