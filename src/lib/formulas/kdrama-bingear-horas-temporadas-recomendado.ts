export interface Inputs {
  series: string;
  episodios_custom: number;
  minutos_custom: number;
  series_extra: number;
  horas_dia: number;
  velocidad: string;
}

export interface Outputs {
  horas_totales: number;
  dias_necesarios: number;
  fecha_fin: string;
  recomendacion: string;
  detalle_serie: string;
}

interface SerieData {
  nombre: string;
  episodios: number;
  minutos: number;
}

// Catálogo de series predefinidas (datos 2026)
const CATALOGO: Record<string, SerieData> = {
  squid_game_s1:      { nombre: "Squid Game T1",               episodios: 9,  minutos: 55 },
  squid_game_s2:      { nombre: "Squid Game T2",               episodios: 7,  minutos: 55 },
  crash_landing:      { nombre: "Crash Landing on You",        episodios: 16, minutos: 87 },
  goblin:             { nombre: "Goblin",                      episodios: 16, minutos: 75 },
  its_okay:           { nombre: "It's Okay to Not Be Okay",   episodios: 16, minutos: 70 },
  my_mister:          { nombre: "My Mister",                   episodios: 16, minutos: 70 },
  reply_1988:         { nombre: "Reply 1988",                  episodios: 20, minutos: 90 },
  descendants_sun:    { nombre: "Descendants of the Sun",      episodios: 16, minutos: 60 },
  vincenzo:           { nombre: "Vincenzo",                    episodios: 20, minutos: 70 },
  moving:             { nombre: "Moving",                      episodios: 20, minutos: 55 },
  sweet_home_s1:      { nombre: "Sweet Home T1",               episodios: 10, minutos: 55 },
  business_proposal:  { nombre: "A Business Proposal",         episodios: 12, minutos: 65 },
  hospital_playlist:  { nombre: "Hospital Playlist",           episodios: 12, minutos: 90 },
};

function padZero(n: number): string {
  return n < 10 ? "0" + n : String(n);
}

function fechaFin(diasDecimales: number): string {
  const diasEnteros = Math.ceil(diasDecimales);
  const hoy = new Date();
  hoy.setDate(hoy.getDate() + diasEnteros);
  return `${padZero(hoy.getDate())}/${padZero(hoy.getMonth() + 1)}/${hoy.getFullYear()}`;
}

export function compute(i: Inputs): Outputs {
  // Validar velocidad
  const velocidad = parseFloat(i.velocidad) || 1.0;
  const velocidadSafe = velocidad > 0 ? velocidad : 1.0;

  // Validar horas por día
  const horasDia = Number(i.horas_dia) || 0;
  if (horasDia <= 0) {
    return {
      horas_totales: 0,
      dias_necesarios: 0,
      fecha_fin: "—",
      recomendacion: "Ingresá una cantidad válida de horas por día.",
      detalle_serie: "—",
    };
  }

  // Determinar episodios y minutos según selección
  let episodios: number;
  let minutosPorEp: number;
  let nombreSerie: string;

  if (i.series === "custom") {
    episodios = Math.max(1, Math.floor(Number(i.episodios_custom) || 16));
    minutosPorEp = Math.max(1, Number(i.minutos_custom) || 70);
    nombreSerie = "Serie personalizada";
  } else {
    const data = CATALOGO[i.series];
    if (!data) {
      return {
        horas_totales: 0,
        dias_necesarios: 0,
        fecha_fin: "—",
        recomendacion: "Serie no encontrada en el catálogo.",
        detalle_serie: "—",
      };
    }
    episodios = data.episodios;
    minutosPorEp = data.minutos;
    nombreSerie = data.nombre;
  }

  // Series extra: deben ser >= 0
  const seriesExtra = Math.max(0, Math.floor(Number(i.series_extra) || 0));

  // Cálculo principal
  // Minutos ajustados por velocidad
  const minutosAjustados = (episodios * minutosPorEp) / velocidadSafe;
  const horasSerie = minutosAjustados / 60;

  // Total incluyendo series adicionales similares
  const horasTotales = horasSerie * (1 + seriesExtra);

  // Días necesarios
  const diasNecesarios = horasTotales / horasDia;

  // Fecha estimada de fin
  const fecha = fechaFin(diasNecesarios);

  // Detalle
  const seriesLabel = seriesExtra > 0
    ? `${nombreSerie} + ${seriesExtra} serie${seriesExtra > 1 ? "s" : ""} adicional${seriesExtra > 1 ? "es" : ""}`
    : nombreSerie;

  const detalle = `${seriesLabel} · ${episodios} ep × ${minutosPorEp} min · velocidad ${velocidadSafe}×`;

  // Recomendación
  let recomendacion: string;
  if (diasNecesarios <= 1) {
    recomendacion = "🔥 Podés terminarlo en un solo día. ¡Maratón total!";
  } else if (diasNecesarios <= 3) {
    recomendacion = "🍿 Un finde largo es suficiente. Plan perfecto para no salir de casa.";
  } else if (diasNecesarios <= 7) {
    recomendacion = "📅 Una semana completa. Ideal para vacaciones o una semana relajada.";
  } else if (diasNecesarios <= 14) {
    recomendacion = "🗓️ Unas dos semanas. Ritmo cómodo si lo combinás con trabajo o estudio.";
  } else if (diasNecesarios <= 30) {
    recomendacion = "📆 Más de dos semanas. Considerá aumentar las horas diarias o reducir la lista.";
  } else {
    recomendacion = "⚠️ Más de un mes. Puede que la lista sea demasiado larga para tu disponibilidad actual. Reducí series o aumentá horas diarias.";
  }

  return {
    horas_totales: Math.round(horasTotales * 10) / 10,
    dias_necesarios: Math.round(diasNecesarios * 10) / 10,
    fecha_fin: fecha,
    recomendacion,
    detalle_serie: detalle,
  };
}
