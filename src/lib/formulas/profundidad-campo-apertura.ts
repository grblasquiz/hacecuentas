/** Calculadora de Profundidad de Campo */
export interface Inputs { focalMm: number; apertura: number; distanciaM: number; sensor: string; }
export interface Outputs { dofTotal: number; dofCerca: number; dofLejos: number; hiperfocal: number; _insight?: any; }

const COC: Record<string, number> = { ff: 0.03, apsc: 0.02, m43: 0.015, '1inch': 0.011 };

export function profundidadCampoApertura(i: Inputs): Outputs {
  const f = Number(i.focalMm);
  const N = Number(i.apertura);
  const s = Number(i.distanciaM) * 1000; // convert to mm
  if (!f || f <= 0) throw new Error('Ingresá la distancia focal');
  if (!N || N <= 0) throw new Error('Ingresá la apertura');
  if (!s || s <= 0) throw new Error('Ingresá la distancia al sujeto');
  const c = COC[i.sensor];
  if (!c) throw new Error('Seleccioná un tamaño de sensor');

  // Hyperfocal distance: H = f^2 / (N * c) + f
  const H = (f * f) / (N * c) + f;

  // Near limit: Dn = s * (H - f) / (H + s - 2*f)
  const Dn = s * (H - f) / (H + s - 2 * f);

  // Far limit: Df = s * (H - f) / (H - s)
  let Df: number;
  if (s >= H) {
    Df = Infinity;
  } else {
    Df = s * (H - f) / (H - s);
  }

  const dofTotal = Df === Infinity ? Infinity : (Df - Dn) / 1000;
  const dofTotalDisplay = dofTotal === Infinity ? 9999 : dofTotal;

  const dofM = Number((dofTotalDisplay).toFixed(2));
  const cercaM = Number((Dn / 1000).toFixed(2));
  const hM = Number((H / 1000).toFixed(2));
  const esInfinito = Df === Infinity;
  const fondoFmt = (x: number) => x.toLocaleString('es-AR', { maximumFractionDigits: 2 });
  const _insight = {
    title: 'Tu zona enfocada',
    text: esInfinito
      ? `Enfocando a **${(s / 1000).toFixed(2)} m** con f/${N}, superás la distancia hiperfocal (**${fondoFmt(hM)} m**): desde **${fondoFmt(cercaM)} m** hasta el infinito queda nítido. Ideal para paisajes.`
      : dofM < 0.3
        ? `Profundidad de campo de apenas **${fondoFmt(dofM)} m** a f/${N}: muy poco margen, perfecto para aislar el sujeto con fondo cremoso, pero el foco tiene que estar exacto.`
        : `A f/${N} y **${(s / 1000).toFixed(2)} m** de distancia, tenés **${fondoFmt(dofM)} m** nítidos. Cerrá el diafragma (número f más alto) para ampliar la zona enfocada o abrilo para reducirla.`,
    tone: 'neutral',
    icon: '📷',
  };

  return {
    dofTotal: Number(dofTotalDisplay.toFixed(2)),
    dofCerca: Number((Dn / 1000).toFixed(2)),
    dofLejos: Df === Infinity ? 9999 : Number((Df / 1000).toFixed(2)),
    hiperfocal: Number((H / 1000).toFixed(2)),
    _insight,
  };
}
