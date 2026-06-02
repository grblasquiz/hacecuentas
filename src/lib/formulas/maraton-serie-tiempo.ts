/** Calculadora de Maratón de Serie */
export interface Inputs { episodios: number; duracionMin: number; horasDia: number; }
export interface Outputs { horasTotal: number; diasCompletos: number; finesSemana: number; mensaje: string; _insight?: any; }

export function maratonSerieTiempo(i: Inputs): Outputs {
  const eps = Number(i.episodios);
  const dur = Number(i.duracionMin);
  const hpd = Number(i.horasDia);
  if (!eps || eps < 1) throw new Error('Ingresá el total de episodios');
  if (!dur || dur < 1) throw new Error('Ingresá la duración por episodio');
  if (!hpd || hpd <= 0) throw new Error('Ingresá las horas por día');

  const totalMin = eps * dur;
  const horasTotal = totalMin / 60;
  const diasCompletos = Math.ceil(horasTotal / hpd);
  const finesSemana = Math.ceil(horasTotal / 16); // 8 hs sábado + 8 hs domingo

  let mensaje: string;
  if (horasTotal < 10) mensaje = 'Serie corta — la terminás en un fin de semana tranquilo.';
  else if (horasTotal < 30) mensaje = 'Serie mediana — un buen maratón de 1-2 semanas.';
  else if (horasTotal < 80) mensaje = 'Serie larga — preparate para un compromiso de varias semanas.';
  else mensaje = 'Serie maratónica — esto es un proyecto de meses. ¡Suerte!';

  const horasFmt = Number(horasTotal.toFixed(1));
  const tone = horasTotal < 30 ? 'good' : horasTotal < 80 ? 'neutral' : 'warn';
  const _insight = {
    title: 'Cuánto te va a llevar',
    text: `Son **${horasFmt} h** de pantalla en total (${eps} episodios × ${dur} min). A **${hpd} h por día** la terminás en **${diasCompletos} días**, o en unos **${finesSemana} fin${finesSemana === 1 ? '' : 'es'} de semana** mirando 8 h sábado y 8 h domingo.`,
    tone,
    icon: '📺',
  };
  return {
    horasTotal: horasFmt,
    diasCompletos,
    finesSemana,
    mensaje,
    _insight,
  };
}
