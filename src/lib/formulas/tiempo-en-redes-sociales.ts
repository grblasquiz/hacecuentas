/** Tiempo en redes sociales: horas/día, horas/año, equivalencias */

export interface Inputs {
  minIG: number;
  minTikTok: number;
  minTwitter: number;
  minYouTube: number;
  minWhatsApp: number;
}

export interface Outputs {
  horasDia: number;
  horasAnio: number;
  diasAnio: number;
  librosEquivalente: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function tiempoEnRedesSociales(i: Inputs): Outputs {
  const ig = Number(i.minIG) || 0;
  const tiktok = Number(i.minTikTok) || 0;
  const twitter = Number(i.minTwitter) || 0;
  const youtube = Number(i.minYouTube) || 0;
  const whatsapp = Number(i.minWhatsApp) || 0;

  const totalMinDia = ig + tiktok + twitter + youtube + whatsapp;
  if (totalMinDia <= 0) throw new Error('Ingresá los minutos en al menos una red social');

  const horasDia = Math.round((totalMinDia / 60) * 100) / 100;
  const horasAnio = Math.round(horasDia * 365 * 100) / 100;
  const diasAnio = Math.round((horasAnio / 24) * 10) / 10;

  // Un libro promedio = ~7 horas de lectura
  const librosEquivalente = Math.floor(horasAnio / 7);

  // Equivalencias adicionales
  const cursosOnline = Math.floor(horasAnio / 40); // ~40h por curso
  const idiomasMeses = Math.round((horasAnio / 600) * 12); // 600h para idioma fácil

  const partes: string[] = [];
  partes.push(`Pasás ${horasDia} horas por día en redes = ${Math.round(horasAnio)} horas al año (${diasAnio} días completos de 24h)`);
  partes.push(`Podrías leer ${librosEquivalente} libros`);
  if (cursosOnline > 0) partes.push(`completar ${cursosOnline} cursos online`);
  if (idiomasMeses > 0 && idiomasMeses <= 12) partes.push(`aprender un idioma nuevo en ~${idiomasMeses} meses`);
  if (idiomasMeses > 12) partes.push(`aprender 1 o más idiomas`);

  const resumen = partes.join('. ') + '.';

  // Insight dinámico por intensidad de uso diario
  const diasAnioRedondeado = Math.round(diasAnio);
  let insightTitle: string;
  let insightText: string;
  let insightTone: 'good' | 'warn' | 'neutral';
  let insightIcon: string;
  if (horasDia < 2) {
    insightTitle = 'Uso controlado';
    insightText = `Con **${horasDia} h por día** estás muy por debajo del promedio (2,5 h). Aun así son **${diasAnioRedondeado} días completos** al año frente a la pantalla: tiempo de sobra para esos ${librosEquivalente} libros.`;
    insightTone = 'good';
    insightIcon = '📱';
  } else if (horasDia <= 4) {
    insightTitle = 'En el promedio mundial';
    insightText = `**${horasDia} h diarias** te dan **${Math.round(horasAnio)} h al año**, equivalentes a **${diasAnioRedondeado} días enteros** scrolleando. Es el promedio global, pero con eso leerías ${librosEquivalente} libros o harías varios cursos.`;
    insightTone = 'neutral';
    insightIcon = '⏳';
  } else {
    insightTitle = 'Mucho tiempo en pantalla';
    insightText = `**${horasDia} h por día** se acumulan en **${diasAnioRedondeado} días completos** de 24 h al año. Recortar la mitad te liberaría el equivalente a ${Math.floor(librosEquivalente / 2)} libros o un mes y medio de tu tiempo.`;
    insightTone = 'warn';
    insightIcon = '⚠️';
  }

  // Donut: reparto de minutos diarios por red (suman totalMinDia)
  const slices = [
    { label: 'Instagram', value: ig },
    { label: 'TikTok', value: tiktok },
    { label: 'Twitter/X', value: twitter },
    { label: 'YouTube', value: youtube },
    { label: 'WhatsApp', value: whatsapp },
  ].filter((s) => s.value > 0);

  const out: Outputs = {
    horasDia, horasAnio, diasAnio, librosEquivalente, resumen,
    _insight: { title: insightTitle, text: insightText, tone: insightTone, icon: insightIcon },
  };

  // Sólo tiene sentido el gráfico si hay más de una red repartiendo el tiempo
  if (slices.length > 1) {
    out._chart = {
      type: 'doughnut',
      slices,
      suffix: ' min',
      centerValue: `${horasDia} h`,
      centerLabel: 'por día',
      ariaLabel: `Reparto de los ${totalMinDia} minutos diarios entre las redes usadas`,
    };
  }

  return out;
}
