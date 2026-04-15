/** Metros de alambre para cerco perimetral */
export interface AlambreCercoInputs {
  perimetroMetros: number;
  cantidadHilos?: number;
  postes?: string;
}
export interface AlambreCercoOutputs {
  metrosAlambre: number;
  cantidadPostes: number;
  rollosAlambre: number;
  detalle: string;
}

const SEP_POSTES: Record<string, number> = {
  'cada-2m': 2,
  'cada-2.5m': 2.5,
  'cada-3m': 3,
};

export function alambreCerco(inputs: AlambreCercoInputs): AlambreCercoOutputs {
  const perimetro = Number(inputs.perimetroMetros);
  const hilos = Number(inputs.cantidadHilos ?? 7);
  const sepKey = String(inputs.postes || 'cada-2.5m');

  if (!perimetro || perimetro <= 0) throw new Error('Ingresá el perímetro en metros');
  if (hilos < 1 || hilos > 15) throw new Error('La cantidad de hilos debe estar entre 1 y 15');
  if (!SEP_POSTES[sepKey]) throw new Error('Separación de postes no válida');

  const sep = SEP_POSTES[sepKey];
  const metrosAlambre = perimetro * hilos;
  const cantPostes = Math.ceil(perimetro / sep);
  const rollos = Math.ceil(metrosAlambre / 1000);

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  return {
    metrosAlambre,
    cantidadPostes: cantPostes,
    rollosAlambre: rollos,
    detalle: `${fmt.format(perimetro)} m de perímetro × ${hilos} hilos = ${fmt.format(metrosAlambre)} m de alambre (${rollos} rollos de 1.000 m) + ${cantPostes} postes cada ${fmt.format(sep)} m.`,
  };
}
