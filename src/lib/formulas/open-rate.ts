/** Email marketing: open rate, CTR, click to open */
export interface Inputs {
  enviados: number;
  entregados?: number;
  aperturas: number;
  clicks: number;
  bajas?: number;
}
export interface Outputs {
  openRate: number;
  ctr: number;
  clickToOpen: number;
  tasaEntrega: number;
  tasaBaja: number;
  mensaje: string;
}

export function openRate(i: Inputs): Outputs {
  const env = Number(i.enviados);
  const ent = Number(i.entregados) || env;
  const ap = Number(i.aperturas);
  const cl = Number(i.clicks);
  const bajas = Number(i.bajas) || 0;
  if (!env || env <= 0) throw new Error('Ingresá los enviados');

  const openR = (ap / ent) * 100;
  const ctr = (cl / ent) * 100;
  const cto = ap > 0 ? (cl / ap) * 100 : 0;
  const entrega = (ent / env) * 100;
  const baja = (bajas / ent) * 100;

  let msg = '';
  if (openR > 30) msg = 'Open rate excelente — audiencia muy comprometida.';
  else if (openR > 20) msg = 'Open rate saludable — en línea con el estándar de industria.';
  else if (openR > 10) msg = 'Open rate bajo — revisá asunto y segmentación.';
  else msg = 'Open rate crítico — problemas de entregabilidad o lista fría.';

  return {
    openRate: Number(openR.toFixed(2)),
    ctr: Number(ctr.toFixed(2)),
    clickToOpen: Number(cto.toFixed(2)),
    tasaEntrega: Number(entrega.toFixed(2)),
    tasaBaja: Number(baja.toFixed(2)),
    mensaje: msg,
  };
}
