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

  return { horasDia, horasAnio, diasAnio, librosEquivalente, resumen };
}
