export interface Inputs {
  year: string;
  filterType: string;
}

export interface Outputs {
  bridgeList: string;
  totalDays: number;
  recommendation: string;
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

  const bridges2026: Bridge[] = [
    {
      name: "Año Nuevo + Fin de semana",
      startDate: "1 enero",
      endDate: "5 enero",
      type: "inamovible",
      continuousDays: 5
    },
    {
      name: "Puente Carnaval",
      startDate: "9 febrero",
      endDate: "12 febrero",
      type: "movible",
      continuousDays: 4
    },
    {
      name: "Semana Santa + Puente",
      startDate: "9 abril",
      endDate: "13 abril",
      type: "movible",
      continuousDays: 5
    },
    {
      name: "Día del Trabajo + Puente",
      startDate: "30 abril",
      endDate: "4 mayo",
      type: "inamovible",
      continuousDays: 5
    },
    {
      name: "Día de la Bandera + Invierno",
      startDate: "19 junio",
      endDate: "23 junio",
      type: "inamovible",
      continuousDays: 5
    },
    {
      name: "Independencia + Puente",
      startDate: "9 julio",
      endDate: "13 julio",
      type: "inamovible",
      continuousDays: 5
    },
    {
      name: "Muerte Gral. San Martín + Puente",
      startDate: "16 agosto",
      endDate: "20 agosto",
      type: "inamovible",
      continuousDays: 5
    },
    {
      name: "Diversidad Cultural + Puente",
      startDate: "12 octubre",
      endDate: "16 octubre",
      type: "inamovible",
      continuousDays: 5
    },
    {
      name: "Navidad + Año Nuevo 2027",
      startDate: "25 diciembre",
      endDate: "31 diciembre",
      type: "inamovible",
      continuousDays: 7
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

  return {
    bridgeList: bridgeText.trim() || "Sin puentes en el filtro seleccionado.",
    totalDays: totalDays,
    recommendation: recommendation
  };
}
