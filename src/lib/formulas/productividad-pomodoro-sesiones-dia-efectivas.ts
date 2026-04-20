export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function productividadPomodoroSesionesDiaEfectivas(i: Inputs): Outputs {
  const h=Number(i.horasDisponibles)||8;
  const minTotales=h*60;
  const cicloCompleto=120; // 4×(25+5) + 30 pausa larga
  const ciclos=Math.floor(minTotales/cicloCompleto);
  const sesiones=ciclos*4+Math.floor((minTotales%cicloCompleto)/30);
  const efectivo=sesiones*25;
  return { sesionesMax:`${sesiones} Pomodoros`, tiempoEfectivo:`${(efectivo/60).toFixed(1)} horas efectivas`, recomendacion:sesiones<8?'Sostenible':'Considerá no más de 10 por día para mantener calidad.' };
}
