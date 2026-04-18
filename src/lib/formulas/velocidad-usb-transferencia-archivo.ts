const SPEEDS: Record<string, number> = { '2.0': 35, '3.0': 400, '3.1': 800, '3.2': 1500, '4.0': 3500 };
export interface VelocidadUsbTransferenciaArchivoInputs { tamano: number; version: string; }
export interface VelocidadUsbTransferenciaArchivoOutputs { tiempo: string; velocidadReal: string; resumen: string; }
export function velocidadUsbTransferenciaArchivo(i: VelocidadUsbTransferenciaArchivoInputs): VelocidadUsbTransferenciaArchivoOutputs {
  const gb = Number(i.tamano); const mbs = SPEEDS[i.version] ?? 400;
  if (!gb || gb <= 0) throw new Error('Ingresá tamaño');
  const segundos = (gb * 1024) / mbs;
  let tFmt: string;
  if (segundos < 60) tFmt = segundos.toFixed(1) + ' s';
  else if (segundos < 3600) tFmt = (segundos / 60).toFixed(1) + ' min';
  else tFmt = (segundos / 3600).toFixed(2) + ' h';
  return { tiempo: tFmt, velocidadReal: mbs + ' MB/s',
    resumen: `${gb} GB por USB ${i.version}: ${tFmt} a ~${mbs} MB/s real.` };
}
