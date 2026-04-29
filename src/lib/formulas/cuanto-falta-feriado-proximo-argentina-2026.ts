export interface Inputs {
  fecha_consulta: string;
}

export interface Outputs {
  proximo_feriado: string;
  fecha_feriado: string;
  dias_restantes: number;
  tipo_feriado: string;
  proximos_cinco: string;
}

interface Feriado {
  nombre: string;
  fecha: Date;
  tipo: string;
}

export function compute(i: Inputs): Outputs {
  const hoy = new Date(i.fecha_consulta);
  if (isNaN(hoy.getTime())) {
    return {
      proximo_feriado: "Fecha inválida",
      fecha_feriado: "",
      dias_restantes: 0,
      tipo_feriado: "",
      proximos_cinco: ""
    };
  }

  const feriados2026: Feriado[] = [
    { nombre: "Año Nuevo", fecha: new Date(2026, 0, 1), tipo: "Inamovible" },
    { nombre: "Día de Malvinas", fecha: new Date(2026, 1, 2), tipo: "Inamovible" },
    { nombre: "Carnaval", fecha: new Date(2026, 1, 16), tipo: "Trasladable" },
    { nombre: "Carnaval", fecha: new Date(2026, 1, 17), tipo: "Trasladable" },
    { nombre: "San José", fecha: new Date(2026, 2, 19), tipo: "Trasladable" },
    { nombre: "Memoria por la Verdad", fecha: new Date(2026, 2, 24), tipo: "Inamovible" },
    { nombre: "Día del Veterano y los Caídos", fecha: new Date(2026, 3, 2), tipo: "Inamovible" },
    { nombre: "Día del Trabajador", fecha: new Date(2026, 4, 1), tipo: "Inamovible" },
    { nombre: "Bandera Nacional", fecha: new Date(2026, 5, 20), tipo: "Inamovible" },
    { nombre: "Muerte del Gral. Güemes", fecha: new Date(2026, 5, 17), tipo: "Trasladable" },
    { nombre: "Independencia", fecha: new Date(2026, 6, 9), tipo: "Inamovible" },
    { nombre: "Muerte del Gral. San Martín", fecha: new Date(2026, 7, 17), tipo: "Inamovible" },
    { nombre: "Respeto a la Diversidad Cultural", fecha: new Date(2026, 9, 12), tipo: "Inamovible" },
    { nombre: "Soberanía Nacional", fecha: new Date(2026, 10, 20), tipo: "Trasladable" },
    { nombre: "Corpus Christi", fecha: new Date(2026, 4, 26), tipo: "Trasladable" },
    { nombre: "Navidad", fecha: new Date(2026, 11, 25), tipo: "Inamovible" }
  ];

  feriados2026.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

  let proximoFeriado: Feriado | null = null;
  for (const fer of feriados2026) {
    if (fer.fecha > hoy) {
      proximoFeriado = fer;
      break;
    }
  }

  if (!proximoFeriado) {
    return {
      proximo_feriado: "No hay feriados próximos en 2026",
      fecha_feriado: "",
      dias_restantes: 0,
      tipo_feriado: "",
      proximos_cinco: "Año 2026 finalizado"
    };
  }

  const diasRestantes = Math.ceil((proximoFeriado.fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  const fechaFormato = proximoFeriado.fecha.toISOString().split('T')[0];

  const proximos = feriados2026
    .filter(f => f.fecha > hoy)
    .slice(0, 5)
    .map(f => {
      const d = f.fecha.toISOString().split('T')[0];
      return `${f.nombre} (${d})`;
    })
    .join(" | ");

  return {
    proximo_feriado: proximoFeriado.nombre,
    fecha_feriado: fechaFormato,
    dias_restantes: diasRestantes,
    tipo_feriado: proximoFeriado.tipo,
    proximos_cinco: proximos || "Sin feriados próximos"
  };
}
