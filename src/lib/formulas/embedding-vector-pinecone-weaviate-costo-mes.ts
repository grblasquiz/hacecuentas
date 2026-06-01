/** Costo mensual vector DB (Pinecone, Weaviate, Qdrant) según vectores, dimensión y QPS */
export interface Inputs { vectoresMillones: number; dimension: number; qps: number; precioGbMesUsd: number; precioPorMillonQueriesUsd: number; }
export interface Outputs { storageGb: number; queriesMes: number; costoStorageUsd: number; costoQueriesUsd: number; costoTotalMesUsd: number; explicacion: string; _chart?: any; }
export function embeddingVectorPineconeWeaviateCostoMes(i: Inputs): Outputs {
  const m = Number(i.vectoresMillones);
  const dim = Number(i.dimension);
  const qps = Number(i.qps);
  const pGb = Number(i.precioGbMesUsd);
  const pQ = Number(i.precioPorMillonQueriesUsd);
  if (!m || m <= 0) throw new Error('Ingresá millones de vectores');
  if (!dim || dim <= 0) throw new Error('Ingresá la dimensión');
  // 1 vector float32 = dim * 4 bytes. Vectores en M.
  const bytes = m * 1e6 * dim * 4;
  const gb = bytes / (1024 ** 3);
  const queriesMes = qps * 60 * 60 * 24 * 30;
  const costoStorage = gb * pGb;
  const costoQueries = (queriesMes / 1e6) * pQ;
  const total = costoStorage + costoQueries;
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Storage', value: Number(costoStorage.toFixed(2)) },
      { label: 'Queries', value: Number(costoQueries.toFixed(2)) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(total).toLocaleString('es-AR'),
    centerLabel: 'Total/mes USD',
    ariaLabel: 'Composición del costo mensual de la base de datos vectorial: almacenamiento frente a consultas.',
  };
  return {
    storageGb: Number(gb.toFixed(2)),
    queriesMes: Number(queriesMes.toFixed(0)),
    costoStorageUsd: Number(costoStorage.toFixed(2)),
    costoQueriesUsd: Number(costoQueries.toFixed(2)),
    costoTotalMesUsd: Number(total.toFixed(2)),
    explicacion: `${m}M vectores de dim ${dim} = ${gb.toFixed(1)} GB storage. ${qps} QPS = ${(queriesMes / 1e6).toFixed(1)}M queries/mes. Total USD ${total.toFixed(2)}/mes.`,
    _chart: chart,
  };
}
