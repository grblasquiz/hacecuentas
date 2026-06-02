export interface Inputs { celularHs?: number; computadoraHs?: number; tvHs?: number; tabletHs?: number; }
export interface Outputs { totalSemanal: number; totalDiario: number; porcentajeDespierto: number; mensaje: string; _chart?: any; _insight?: any; }
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
  const chart = diario > 0 ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Celular', value: cel },
      { label: 'Computadora', value: comp },
      { label: 'TV', value: tv },
      { label: 'Tablet', value: tab },
    ],
    prefix: '',
    centerValue: Number(diario.toFixed(1)).toLocaleString('es-AR') + ' h',
    centerLabel: 'Horas/día',
    ariaLabel: 'Composición del tiempo de pantalla diario por dispositivo',
  } : undefined;
  const tone = diario<=4 ? 'good' : diario<=8 ? 'neutral' : 'warn';
  const insight = {
    title: diario<=4 ? 'Uso bajo de pantallas' : diario<=8 ? 'Uso moderado' : 'Uso alto de pantallas',
    text: `Pasás **${Number(diario.toFixed(1)).toLocaleString('es-AR')} h/día** frente a pantallas, el **${pct}%** de tus horas despierto, y **${semanal} h** por semana.`,
    tone,
    icon: diario<=4 ? '✅' : diario<=8 ? '📺' : '⚠️',
  };
  return { totalSemanal: semanal, totalDiario: Number(diario.toFixed(1)), porcentajeDespierto: pct, mensaje: msg, _chart: chart, _insight: insight };
}
