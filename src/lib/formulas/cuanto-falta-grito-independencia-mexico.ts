// Calculadora: cuenta regresiva al Grito de Independencia (15-sep 23:00 CDMX)
// y al 16 de septiembre (Día de la Independencia, feriado obligatorio Art. 74 fr. V LFT).
// Fuente: https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf
// Zona horaria: America/Mexico_City (UTC−6, sin horario de verano desde 2022).

export interface Inputs {}

export interface Outputs {
  diasAlGrito: number;
  diasAlDia16: number;
  horasAlGrito: number;
  diaSemanaGrito: string;
  detalle: string;
}

export function cuantoFaltaGritoIndependenciaMexico(_inputs: Inputs = {}): Outputs {
  const nowMs = Date.now();
  const nowDate = new Date(nowMs);

  // Año actual según calendario en CDMX (UTC−6 fijo).
  const cdmxYearStr = nowDate.toLocaleString('en-US', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
  });
  let year = parseInt(cdmxYearStr, 10);
  if (Number.isNaN(year)) {
    year = nowDate.getUTCFullYear();
  }

  // El Grito es el 15-sep a las 23:00 CDMX = 16-sep 05:00 UTC.
  // CDMX = UTC−6 fijo (Ley de Husos Horarios DOF 30-oct-2022).
  let gritoUtcMs = Date.UTC(year, 8, 16, 5, 0, 0);
  if (gritoUtcMs <= nowMs) {
    year += 1;
    gritoUtcMs = Date.UTC(year, 8, 16, 5, 0, 0);
  }

  // 16-sep 00:00 CDMX = 16-sep 06:00 UTC.
  const dia16UtcMs = Date.UTC(year, 8, 16, 6, 0, 0);

  const MS_HORA = 3_600_000;
  const MS_DIA = 86_400_000;

  const horasAlGrito = Math.max(0, Math.ceil((gritoUtcMs - nowMs) / MS_HORA));
  const diasAlGrito = Math.max(0, Math.ceil((gritoUtcMs - nowMs) / MS_DIA));
  const diasAlDia16 = Math.max(0, Math.ceil((dia16UtcMs - nowMs) / MS_DIA));

  // Día de la semana del 15-sep en CDMX. Tomo el mediodía CDMX (18:00 UTC)
  // para evitar problemas de borde con el cambio de día.
  const sept15Mediodia = new Date(Date.UTC(year, 8, 15, 18, 0, 0));
  let diaSemana = sept15Mediodia.toLocaleString('es-MX', {
    timeZone: 'America/Mexico_City',
    weekday: 'long',
  });
  diaSemana = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);

  let detalle: string;
  if (diasAlGrito === 0 && horasAlGrito === 0) {
    detalle = `¡VIVA MÉXICO! Es el momento del Grito en Palacio Nacional. Mañana 16 de septiembre de ${year} es feriado obligatorio (Art. 74 LFT).`;
  } else if (diasAlGrito <= 1) {
    detalle = `Faltan ${horasAlGrito} hora(s) para el Grito de Independencia del ${diaSemana} 15 de septiembre de ${year} a las 23:00 hrs CDMX.`;
  } else {
    detalle = `Faltan ${diasAlGrito} día(s) (${horasAlGrito} horas) para el Grito de Independencia del ${diaSemana} 15 de septiembre de ${year} a las 23:00 hrs CDMX. El 16 de septiembre es feriado obligatorio (Art. 74 fr. V LFT).`;
  }

  return {
    diasAlGrito,
    diasAlDia16,
    horasAlGrito,
    diaSemanaGrito: diaSemana,
    detalle,
  };
}
