/** Estimación de consumo de datos móviles mensual por streaming y apps */
export interface Inputs {
  horasVideoHd?: number;
  horasVideoSd?: number;
  horasMusica?: number;
  horasVideollamadas?: number;
  horasRedesSociales?: number;
}
export interface Outputs { gbMensuales: number; gbDiarios: number; mayorConsumo: string; detalle: string; _insight?: any; _chart?: any; }

export function consumoDatosMovilesStreaming(i: Inputs): Outputs {
  const videoHd = Number(i.horasVideoHd || 0);
  const videoSd = Number(i.horasVideoSd || 0);
  const musica = Number(i.horasMusica || 0);
  const videollamadas = Number(i.horasVideollamadas || 0);
  const redes = Number(i.horasRedesSociales || 0);

  if (videoHd < 0 || videoSd < 0 || musica < 0 || videollamadas < 0 || redes < 0) {
    throw new Error('Las horas no pueden ser negativas');
  }

  const total = videoHd + videoSd + musica + videollamadas + redes;
  if (total === 0) throw new Error('Ingresá al menos una categoría de uso');

  // GB por hora por categoría
  const gbVideoHd = videoHd * 3.0;
  const gbVideoSd = videoSd * 0.7;
  const gbMusica = musica * 0.07;
  const gbVideollamadas = videollamadas * 1.5;
  const gbRedes = redes * 0.8;
  const gbBase = 0.3; // navegación, WhatsApp, mail, etc.

  const gbDiarios = gbVideoHd + gbVideoSd + gbMusica + gbVideollamadas + gbRedes + gbBase;
  const gbMensuales = gbDiarios * 30;

  const consumos: [string, number][] = [
    ['Video HD', gbVideoHd],
    ['Video SD', gbVideoSd],
    ['Música', gbMusica],
    ['Videollamadas', gbVideollamadas],
    ['Redes sociales', gbRedes],
  ];
  consumos.sort((a, b) => b[1] - a[1]);
  const mayor = consumos[0][0];

  const planSugerido = gbMensuales <= 5 ? 'un plan de 5 GB' : gbMensuales <= 10 ? 'un plan de 8–10 GB' : gbMensuales <= 20 ? 'un plan de 15–20 GB' : 'un plan ilimitado o de 30+ GB';
  const insightText = gbMensuales <= 10
    ? `Con ~**${gbMensuales.toFixed(1)} GB/mes** te alcanza ${planSugerido}. Lo que más consume es **${mayor}**.`
    : `Estás en ~**${gbMensuales.toFixed(1)} GB/mes**: vas a necesitar ${planSugerido}. El grueso se va en **${mayor}** (${(consumos[0][1] * 30).toFixed(1)} GB/mes), pasalo a WiFi para ahorrar datos.`;

  const slices = [
    { label: 'Video HD', value: Number((gbVideoHd * 30).toFixed(1)) },
    { label: 'Video SD', value: Number((gbVideoSd * 30).toFixed(1)) },
    { label: 'Música', value: Number((gbMusica * 30).toFixed(1)) },
    { label: 'Videollamadas', value: Number((gbVideollamadas * 30).toFixed(1)) },
    { label: 'Redes sociales', value: Number((gbRedes * 30).toFixed(1)) },
    { label: 'Navegación base', value: Number((gbBase * 30).toFixed(1)) },
  ].filter((s) => s.value > 0);

  return {
    gbMensuales: Number(gbMensuales.toFixed(1)),
    gbDiarios: Number(gbDiarios.toFixed(2)),
    mayorConsumo: `${mayor} (${(consumos[0][1] * 30).toFixed(1)} GB/mes)`,
    detalle: `Consumo estimado: ${gbDiarios.toFixed(2)} GB/día → ${gbMensuales.toFixed(1)} GB/mes. Mayor consumo: ${mayor}. Incluye ~9 GB/mes de navegación base.`,
    _insight: {
      title: 'Cuántos datos necesitás',
      text: insightText,
      tone: gbMensuales > 20 ? 'warn' : 'neutral',
      icon: '📱',
    },
    _chart: {
      type: 'doughnut',
      slices,
      prefix: '',
      centerValue: `${gbMensuales.toFixed(1)} GB`,
      centerLabel: 'al mes',
      ariaLabel: `Distribución del consumo mensual de datos: ${slices.map((s) => `${s.label} ${s.value} GB`).join(', ')}.`,
    },
  };
}
