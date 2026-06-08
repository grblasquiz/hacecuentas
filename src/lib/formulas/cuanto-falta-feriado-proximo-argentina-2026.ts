export interface Inputs {
  fecha_consulta: string;
}

export interface Outputs {
  proximo_feriado: string;
  fecha_feriado: string;
  dias_restantes: number;
  tipo_feriado: string;
  proximos_cinco: string;
  _insight?: any;
}

interface Feriado {
  nombre: string;
  fecha: Date;
  tipo: string;
}

export function compute(i: Inputs): Outputs {
  // Parsear como fecha LOCAL (no UTC) para que el conteo de días coincida con
  // las fechas de feriados (new Date(año, mes, día) = medianoche local) sin
  // depender del huso horario del runtime.
  const _p = String(i.fecha_consulta || '').split('-').map(Number);
  const hoy = (_p.length === 3 && !_p.some(isNaN))
    ? new Date(_p[0], _p[1] - 1, _p[2])
    : new Date(i.fecha_consulta);
  if (isNaN(hoy.getTime())) {
    return {
      proximo_feriado: "Fecha inválida",
      fecha_feriado: "",
      dias_restantes: 0,
      tipo_feriado: "",
      proximos_cinco: ""
    };
  }

  // Fechas observadas 2026 (con traslados aplicados) según Ley 27.399.
  // Güemes (17/6 mié) → lun 15/6; Soberanía (20/11 vie) → lun 23/11.
  const feriados2026: Feriado[] = [
    { nombre: "Año Nuevo", fecha: new Date(2026, 0, 1), tipo: "Inamovible" },
    { nombre: "Carnaval", fecha: new Date(2026, 1, 16), tipo: "Trasladable" },
    { nombre: "Carnaval", fecha: new Date(2026, 1, 17), tipo: "Trasladable" },
    { nombre: "Día de la Memoria por la Verdad y la Justicia", fecha: new Date(2026, 2, 24), tipo: "Inamovible" },
    { nombre: "Día del Veterano y de los Caídos en Malvinas", fecha: new Date(2026, 3, 2), tipo: "Inamovible" },
    { nombre: "Viernes Santo", fecha: new Date(2026, 3, 3), tipo: "Inamovible" },
    { nombre: "Día del Trabajador", fecha: new Date(2026, 4, 1), tipo: "Inamovible" },
    { nombre: "Día de la Revolución de Mayo", fecha: new Date(2026, 4, 25), tipo: "Inamovible" },
    { nombre: "Paso a la Inmortalidad del Gral. Güemes", fecha: new Date(2026, 5, 15), tipo: "Trasladable" },
    { nombre: "Día de la Bandera (Gral. Belgrano)", fecha: new Date(2026, 5, 20), tipo: "Inamovible" },
    { nombre: "Día de la Independencia", fecha: new Date(2026, 6, 9), tipo: "Inamovible" },
    { nombre: "Paso a la Inmortalidad del Gral. San Martín", fecha: new Date(2026, 7, 17), tipo: "Trasladable" },
    { nombre: "Día del Respeto a la Diversidad Cultural", fecha: new Date(2026, 9, 12), tipo: "Trasladable" },
    { nombre: "Día de la Soberanía Nacional", fecha: new Date(2026, 10, 23), tipo: "Trasladable" },
    { nombre: "Inmaculada Concepción de María", fecha: new Date(2026, 11, 8), tipo: "No laborable" },
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

  const diaSemana = proximoFeriado.fecha.toLocaleDateString('es-AR', { weekday: 'long' });
  const esFinde = proximoFeriado.fecha.getDay() === 1 || proximoFeriado.fecha.getDay() === 5;
  const notaTipo = proximoFeriado.tipo === 'Trasladable'
    ? ' Al ser **trasladable**, puede correrse al lunes para armar fin de semana largo.'
    : ' Es **inamovible**: se conmemora en su fecha exacta sin importar el día.';
  let insightText: string;
  let insightTone: 'good' | 'warn' | 'neutral';
  if (diasRestantes <= 1) {
    insightText = `El próximo feriado es **${proximoFeriado.nombre}** ¡mañana mismo (${diaSemana})!${notaTipo}`;
    insightTone = 'good';
  } else if (diasRestantes <= 14) {
    insightText = `Faltan solo **${diasRestantes} días** para **${proximoFeriado.nombre}** (${diaSemana}).${esFinde ? ' Cae pegado al fin de semana: posible escapada.' : ''}${notaTipo}`;
    insightTone = 'good';
  } else {
    insightText = `El próximo feriado es **${proximoFeriado.nombre}**, dentro de **${diasRestantes} días** (${diaSemana}).${notaTipo}`;
    insightTone = 'neutral';
  }

  return {
    proximo_feriado: proximoFeriado.nombre,
    fecha_feriado: fechaFormato,
    dias_restantes: diasRestantes,
    tipo_feriado: proximoFeriado.tipo,
    proximos_cinco: proximos || "Sin feriados próximos",
    _insight: {
      title: 'Próximo feriado',
      text: insightText,
      tone: insightTone,
      icon: '🇦🇷',
    }
  };
}
