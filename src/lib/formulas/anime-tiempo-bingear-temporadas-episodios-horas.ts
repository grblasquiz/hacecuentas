export interface Inputs {
  episodios: number;
  duracion: number;
  velocidad: string;
  horasPorDia: number;
}

export interface Outputs {
  totalMinutos: string;
  totalHoras: number;
  diasMirando: number;
  diasConHorario: number;
  resumenRitmo: string;
  _insight?: any;
}

export function compute(i: Inputs): Outputs {
  const episodios = Math.floor(Number(i.episodios) || 0);
  const duracion = Number(i.duracion) || 24;
  const velocidad = Number(i.velocidad) || 1;
  const horasPorDia = Number(i.horasPorDia) || 2;

  if (episodios <= 0) {
    return {
      totalMinutos: "Ingresá una cantidad de episodios válida",
      totalHoras: 0,
      diasMirando: 0,
      diasConHorario: 0,
      resumenRitmo: "—",
    };
  }

  if (duracion <= 0) {
    return {
      totalMinutos: "Ingresá una duración válida por episodio",
      totalHoras: 0,
      diasMirando: 0,
      diasConHorario: 0,
      resumenRitmo: "—",
    };
  }

  // Minutos totales sin ajuste de velocidad
  const minutosBrutos = episodios * duracion;

  // Minutos ajustados según velocidad de reproducción
  const minutosAjustados = minutosBrutos / velocidad;

  // Horas totales
  const totalHoras = minutosAjustados / 60;

  // Días mirando 24 horas seguidas (sin parar)
  const diasMirando = totalHoras / 24;

  // Días según el ritmo diario del usuario
  const diasConHorario = horasPorDia > 0 ? totalHoras / horasPorDia : 0;

  // Formatear tiempo total como texto legible
  const horasEnteras = Math.floor(totalHoras);
  const minutosRestantes = Math.round((totalHoras - horasEnteras) * 60);

  let totalMinutos: string;
  if (horasEnteras === 0) {
    totalMinutos = `${minutosRestantes} minutos`;
  } else if (minutosRestantes === 0) {
    totalMinutos = `${horasEnteras} horas`;
  } else {
    totalMinutos = `${horasEnteras} horas y ${minutosRestantes} minutos`;
  }

  // Resumen del plan según el ritmo diario
  const diasRedondeados = Math.ceil(diasConHorario);
  const velocidadLabel =
    velocidad === 1
      ? "velocidad normal (1x)"
      : velocidad === 1.25
      ? "velocidad 1.25x"
      : velocidad === 1.5
      ? "velocidad 1.5x"
      : "velocidad 2x";

  const resumenRitmo =
    horasPorDia > 0
      ? `Mirando ${horasPorDia} hora${horasPorDia !== 1 ? "s" : ""} por día a ${velocidadLabel}, terminás en ${diasRedondeados} día${diasRedondeados !== 1 ? "s" : ""}.`
      : "Ingresá cuántas horas mirás por día para ver el plan.";

  const ahorroVelocidad = velocidad > 1 ? (minutosBrutos - minutosAjustados) / 60 : 0;
  const tono = diasRedondeados <= 7 ? 'good' : diasRedondeados <= 30 ? 'neutral' : 'warn';
  const notaPlan = diasRedondeados <= 7
    ? 'es un maratón corto, perfectamente bingeable en una semana.'
    : diasRedondeados <= 30
    ? 'un mes de constancia y lo terminás sin apurarte.'
    : 'es una serie enorme: vas a estar varios meses, ideal para tomártelo con calma.';
  const extraVelocidad = velocidad > 1
    ? ` Mirando a **${velocidad}x** te ahorrás unas **${ahorroVelocidad.toFixed(1)} h** respecto a velocidad normal.`
    : '';

  return {
    totalMinutos,
    totalHoras: Math.round(totalHoras * 100) / 100,
    diasMirando: Math.round(diasMirando * 100) / 100,
    diasConHorario: Math.round(diasConHorario * 100) / 100,
    resumenRitmo,
    _insight: {
      title: 'Tu plan de maratón',
      text: `Son **${episodios} episodios** = **${totalMinutos}** de visionado. A **${horasPorDia} h/día** lo terminás en **${diasRedondeados} día${diasRedondeados !== 1 ? 's' : ''}**: ${notaPlan}${extraVelocidad}`,
      tone: tono,
      icon: '🍿',
    },
  };
}
