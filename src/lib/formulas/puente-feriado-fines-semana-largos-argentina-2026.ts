import { parseLocal, MESES, esDiaNoHabilPorFeriado } from '../data/feriados-ar-2026';

export interface Inputs {
  year: string;
  filterType: string;
}

export interface Outputs {
  bridgeList: string;
  bridgeDetalle: string;
  totalDays: number;
  recommendation: string;
  _insight?: any;
}

interface Bridge {
  name: string;
  startDate: string;
  endDate: string;
  type: string;
  continuousDays: number;
}

export function compute(i: Inputs): Outputs {
  const year = i.year || "2026";
  const filterType = i.filterType || "all";

  // Fines de semana largos reales 2026. El NOMBRE/TIPO de cada ventana es curado
  // (incluye recomendaciones de turismo), pero las FECHAS se derivan de la fuente
  // única (src/lib/data/feriados-ar-2026.ts): para cada ancla se expande la corrida
  // de días no laborables contiguos (finde + feriados + puentes). Así las fechas no
  // pueden quedar desincronizadas con el calendario oficial.
  const ANCLAS: { name: string; type: string; anchor: string }[] = [
    { name: "Carnaval", type: "movible", anchor: "2026-02-16" },
    { name: "Puente Día de la Memoria", type: "puente", anchor: "2026-03-23" },
    { name: "Semana Santa (Malvinas + Viernes Santo)", type: "inamovible", anchor: "2026-04-02" },
    { name: "Revolución de Mayo", type: "inamovible", anchor: "2026-05-25" },
    { name: "Paso a la Inmortalidad de Güemes", type: "movible", anchor: "2026-06-15" },
    { name: "Puente Día de la Independencia", type: "puente", anchor: "2026-07-09" },
    { name: "Paso a la Inmortalidad de San Martín", type: "movible", anchor: "2026-08-17" },
    { name: "Día del Respeto a la Diversidad Cultural", type: "movible", anchor: "2026-10-12" },
    { name: "Día de la Soberanía Nacional", type: "movible", anchor: "2026-11-23" },
    { name: "Puente Inmaculada Concepción", type: "puente", anchor: "2026-12-08" },
  ];

  // Un día es "no laborable" si es sábado, domingo, o está en el calendario oficial.
  const esOff = (d: Date) => d.getDay() === 0 || d.getDay() === 6 || esDiaNoHabilPorFeriado(d);
  const fmtDdMes = (d: Date) => `${d.getDate()} ${MESES[d.getMonth() + 1].toLowerCase()}`;

  const bridges2026: Bridge[] = ANCLAS.map(a => {
    const start = parseLocal(a.anchor);
    const end = parseLocal(a.anchor);
    // Expandir hacia atrás y adelante mientras siga siendo día no laborable.
    for (;;) {
      const prev = new Date(start); prev.setDate(prev.getDate() - 1);
      if (esOff(prev)) start.setTime(prev.getTime()); else break;
    }
    for (;;) {
      const next = new Date(end); next.setDate(next.getDate() + 1);
      if (esOff(next)) end.setTime(next.getTime()); else break;
    }
    const continuousDays = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
    return { name: a.name, startDate: fmtDdMes(start), endDate: fmtDdMes(end), type: a.type, continuousDays };
  });

  let filtered = bridges2026;

  if (filterType === "bridge") {
    filtered = bridges2026.filter(b => b.name.includes("Puente"));
  } else if (filterType === "movible") {
    filtered = bridges2026.filter(b => b.type === "movible");
  } else if (filterType === "fixed") {
    filtered = bridges2026.filter(b => b.type === "inamovible");
  }

  const totalDays = filtered.reduce((sum, b) => sum + b.continuousDays, 0);

  let bridgeText = "";
  filtered.forEach((b, idx) => {
    bridgeText += `${idx + 1}. ${b.name}: ${b.startDate} a ${b.endDate} (${b.continuousDays} días)\n`;
  });

  let recommendation = "";
  if (year === "2026") {
    if (totalDays >= 40) {
      recommendation = "2026 es un excelente año para turismo. Hay 9 períodos de descanso bien distribuidos. Anticipa reservas 6-8 semanas antes en julio, diciembre y enero. Junio es ideal para clima fresco y menos aglomeración.";
    } else if (totalDays >= 30) {
      recommendation = "Año con buena cantidad de puentes. Prioriza mayo-junio para viajes internacionales. Evita diciembre por picos de reservas. Turismo doméstico tendrá demanda fuerte en abril y julio.";
    } else {
      recommendation = "Año con distribución estándar de puentes. Recomendación: combina puentes con vacaciones anuales. Julio y diciembre son períodos de mayor afluencia.";
    }
  } else {
    recommendation = "Año seleccionado: " + year + ". Total de días de descanso: " + totalDays + ". Consulta con tu empleador sobre trasladables en tu provincia.";
  }

  const detalle = bridgeText.trim();
  const resumen = filtered.length > 0
    ? `${filtered.length} períodos largos`
    : "Sin puentes en el filtro";

  const cantidad = filtered.length;
  const masLargo = filtered.reduce((best, b) => b.continuousDays > best.continuousDays ? b : best, filtered[0]);
  const _insight = cantidad > 0
    ? {
        title: `${cantidad} ${cantidad === 1 ? 'fin de semana largo' : 'fines de semana largos'} en ${year}`,
        text: `Sumás **${totalDays} días** de descanso en ${cantidad} ${cantidad === 1 ? 'período' : 'períodos'}. El más largo es **${masLargo.name}** (${masLargo.continuousDays} días, del ${masLargo.startDate} al ${masLargo.endDate}). Reservá vuelos y alojamiento **6-8 semanas antes** para los de julio, diciembre y enero.`,
        tone: 'good',
        icon: '🏖️',
      }
    : {
        title: 'Sin puentes en el filtro',
        text: `No hay fines de semana largos para el filtro seleccionado en ${year}. Probá quitar el filtro para ver todos los períodos del año.`,
        tone: 'neutral',
        icon: '📅',
      };

  return {
    bridgeList: resumen,
    bridgeDetalle: detalle || "Sin puentes en el filtro seleccionado.",
    totalDays: totalDays,
    recommendation: recommendation,
    _insight,
  };
}
