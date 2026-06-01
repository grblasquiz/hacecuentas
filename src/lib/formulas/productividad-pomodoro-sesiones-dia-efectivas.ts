export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function productividadPomodoroSesionesDiaEfectivas(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      tiempoEfectivo: (h: string) => `${h} horas efectivas`,
      sostenible: 'Sostenible',
      recomendacion: 'Considerá no más de 10 por día para mantener calidad.',
    },
    en: {
      tiempoEfectivo: (h: string) => `${h} effective hours`,
      sostenible: 'Sustainable',
      recomendacion: 'Consider no more than 10 per day to maintain quality.',
    },
  } as const)[__lang];
  const h=Number(i.horasDisponibles)||8;
  const minTotales=h*60;
  const cicloCompleto=120; // 4×(25+5) + 30 pausa larga
  const ciclos=Math.floor(minTotales/cicloCompleto);
  const sesiones=ciclos*4+Math.floor((minTotales%cicloCompleto)/30);
  const efectivo=sesiones*25;
  return { sesionesMax:`${sesiones} Pomodoros`, tiempoEfectivo:T.tiempoEfectivo((efectivo/60).toFixed(1)), recomendacion:sesiones<8?T.sostenible:T.recomendacion };
}
