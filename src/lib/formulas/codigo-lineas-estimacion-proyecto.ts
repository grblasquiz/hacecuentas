/** Estimación de esfuerzo de desarrollo por líneas de código */
export interface Inputs { tipoProyecto?: string; complejidad?: string; cantidadDevs: number; }
export interface Outputs { lineasEstimadas: number; personaMeses: number; mesesCalendario: number; detalle: string; }

const baseLoc: Record<string, number> = {
  landing: 3500,
  webapp: 30000,
  movil: 50000,
  saas: 200000,
  ecommerce: 80000,
};

const factorComplejidad: Record<string, number> = {
  baja: 0.5,
  media: 1.0,
  alta: 2.0,
};

export function codigoLineasEstimacionProyecto(i: Inputs): Outputs {
  const tipo = String(i.tipoProyecto || 'webapp');
  const comp = String(i.complejidad || 'media');
  const devs = Math.floor(Number(i.cantidadDevs));

  if (!devs || devs <= 0) throw new Error('Ingresá la cantidad de desarrolladores');

  const base = baseLoc[tipo] || baseLoc.webapp;
  const factor = factorComplejidad[comp] || 1;
  const loc = Math.round(base * factor);

  const locPorMesPorDev = 2500; // 125 LOC/día * 20 días
  const personaMeses = loc / locPorMesPorDev;

  // Factor de comunicación (overhead por equipo)
  let overheadFactor: number;
  if (devs <= 2) overheadFactor = 1.05;
  else if (devs <= 5) overheadFactor = 1.15;
  else if (devs <= 10) overheadFactor = 1.25;
  else overheadFactor = 1.35;

  const mesesCalendario = (personaMeses / devs) * overheadFactor;

  const nombreTipo: Record<string, string> = {
    landing: 'Landing page',
    webapp: 'App web',
    movil: 'App móvil',
    saas: 'SaaS',
    ecommerce: 'E-commerce',
  };

  return {
    lineasEstimadas: loc,
    personaMeses: Number(personaMeses.toFixed(1)),
    mesesCalendario: Number(mesesCalendario.toFixed(1)),
    detalle: `${nombreTipo[tipo] || tipo} complejidad ${comp}: ~${loc.toLocaleString()} LOC, ${personaMeses.toFixed(1)} persona-meses. Con ${devs} dev(s): ~${mesesCalendario.toFixed(1)} meses calendario (incluye overhead de comunicación).`,
  };
}
