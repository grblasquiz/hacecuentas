export interface Inputs { celularHs?: number; computadoraHs?: number; tvHs?: number; tabletHs?: number; }
export interface Outputs { totalSemanal: number; totalDiario: number; porcentajeDespierto: number; mensaje: string; }
export function horasPantalla(i: Inputs): Outputs {
  const cel = Number(i.celularHs)||0;
  const comp = Number(i.computadoraHs)||0;
  const tv = Number(i.tvHs)||0;
  const tab = Number(i.tabletHs)||0;
  const diario = cel+comp+tv+tab;
  const semanal = Math.round(diario*7);
  const horasDespierto = 16;
  const pct = Math.min(100, Math.round(diario/horasDespierto*100));
  let msg='';
  if(diario<=4) msg='Uso bajo de pantallas. Muy bien — tenés tiempo para otras actividades.';
  else if(diario<=8) msg='Uso moderado. Dentro de lo normal si incluye trabajo, pero intentá reducir el tiempo recreativo.';
  else if(diario<=12) msg='Uso alto. Considerá implementar la regla 20-20-20 y no usar pantallas 1 hora antes de dormir.';
  else msg='Uso muy alto. Pasás la mayor parte del día frente a pantallas. Evaluá hacer un digital detox parcial.';
  return { totalSemanal: semanal, totalDiario: Number(diario.toFixed(1)), porcentajeDespierto: pct, mensaje: msg };
}
