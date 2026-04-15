/** Estimación de costo mensual de servidor cloud */
export interface Inputs { vcpus: number; ramGb: number; storageGb: number; traficoGb?: number; }
export interface Outputs { costoMensualUsd: number; costoCompute: number; costoStorage: number; costoTrafico: number; detalle: string; }

export function costoCloudServidorMensual(i: Inputs): Outputs {
  const vcpus = Number(i.vcpus);
  const ram = Number(i.ramGb);
  const storage = Number(i.storageGb);
  const trafico = Number(i.traficoGb || 0);

  if (!vcpus || vcpus <= 0) throw new Error('Ingresá la cantidad de vCPUs');
  if (!ram || ram <= 0) throw new Error('Ingresá la cantidad de RAM en GB');
  if (!storage || storage <= 0) throw new Error('Ingresá el almacenamiento en GB');
  if (trafico < 0) throw new Error('El tráfico no puede ser negativo');

  // Precios promedio de referencia on-demand (USD/mes)
  const precioCpu = 10; // por vCPU
  const precioRam = 5; // por GB
  const precioStorage = 0.10; // por GB SSD
  const precioTrafico = 0.09; // por GB egress

  const costoCompute = vcpus * precioCpu + ram * precioRam;
  const costoStorage = storage * precioStorage;
  const costoTrafico = trafico * precioTrafico;
  const total = costoCompute + costoStorage + costoTrafico;

  return {
    costoMensualUsd: Number(total.toFixed(2)),
    costoCompute: Number(costoCompute.toFixed(2)),
    costoStorage: Number(costoStorage.toFixed(2)),
    costoTrafico: Number(costoTrafico.toFixed(2)),
    detalle: `Servidor ${vcpus} vCPU / ${ram} GB RAM / ${storage} GB SSD: ~USD ${total.toFixed(2)}/mes (Compute: $${costoCompute.toFixed(2)}, Storage: $${costoStorage.toFixed(2)}, Tráfico ${trafico} GB: $${costoTrafico.toFixed(2)}). Precios on-demand de referencia.`,
  };
}
