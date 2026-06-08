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

  // Fines de semana largos reales 2026 (Ley 27.399 + Resolución 164/2025 de
  // puentes turísticos: lun 23/3, vie 10/7, lun 7/12). Fechas observadas.
  const bridges2026: Bridge[] = [
    {
      name: "Carnaval",
      startDate: "14 febrero",
      endDate: "17 febrero",
      type: "movible",
      continuousDays: 4
    },
    {
      name: "Puente Día de la Memoria",
      startDate: "21 marzo",
      endDate: "24 marzo",
      type: "puente",
      continuousDays: 4
    },
    {
      name: "Semana Santa (Malvinas + Viernes Santo)",
      startDate: "2 abril",
      endDate: "5 abril",
      type: "inamovible",
      continuousDays: 4
    },
    {
      name: "Revolución de Mayo",
      startDate: "23 mayo",
      endDate: "25 mayo",
      type: "inamovible",
      continuousDays: 3
    },
    {
      name: "Paso a la Inmortalidad de Güemes",
      startDate: "13 junio",
      endDate: "15 junio",
      type: "movible",
      continuousDays: 3
    },
    {
      name: "Puente Día de la Independencia",
      startDate: "9 julio",
      endDate: "12 julio",
      type: "puente",
      continuousDays: 4
    },
    {
      name: "Paso a la Inmortalidad de San Martín",
      startDate: "15 agosto",
      endDate: "17 agosto",
      type: "movible",
      continuousDays: 3
    },
    {
      name: "Día del Respeto a la Diversidad Cultural",
      startDate: "10 octubre",
      endDate: "12 octubre",
      type: "movible",
      continuousDays: 3
    },
    {
      name: "Día de la Soberanía Nacional",
      startDate: "21 noviembre",
      endDate: "23 noviembre",
      type: "movible",
      continuousDays: 3
    },
    {
      name: "Puente Inmaculada Concepción",
      startDate: "5 diciembre",
      endDate: "8 diciembre",
      type: "puente",
      continuousDays: 4
    }
  ];

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
