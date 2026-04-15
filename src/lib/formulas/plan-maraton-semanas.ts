/** Semanas recomendadas para preparar una maratón según experiencia y meta */
export interface Inputs {
  experiencia: string; // 'principiante' | 'intermedio' | 'avanzado'
  metaTiempoHoras: number; // ej 4 para 4h
  kmSemanalesActuales: number;
}

export interface Outputs {
  semanasRecomendadas: number;
  kmSemanalesPico: number;
  kmPrimeraSemana: number;
  longRunMaxKm: number;
  recomendacion: string;
  resumen: string;
  _chart?: any;
}

export function planMaratonSemanas(i: Inputs): Outputs {
  const exp = String(i.experiencia || 'principiante');
  const meta = Number(i.metaTiempoHoras);
  const kmActual = Number(i.kmSemanalesActuales) || 0;

  if (!meta || meta < 2 || meta > 8) throw new Error('Meta entre 2h y 8h');

  // Semanas base según experiencia
  let semanas = 16;
  if (exp === 'principiante') semanas = 22;
  else if (exp === 'intermedio') semanas = 18;
  else if (exp === 'avanzado') semanas = 14;

  // Ajustar por meta
  let kmPico = 50;
  if (meta <= 2.75) kmPico = 100; // Sub 2:45
  else if (meta <= 3.25) kmPico = 80; // Sub 3:15
  else if (meta <= 3.75) kmPico = 70; // Sub 3:45
  else if (meta <= 4.25) kmPico = 60;
  else if (meta <= 5) kmPico = 50;
  else kmPico = 40;

  // Si viene muy bajo, suma 2 semanas base
  if (kmActual < kmPico * 0.3) semanas += 2;

  const kmPrimeraSemana = Math.round(Math.max(20, kmActual * 1.1));
  const longRun = Math.round(kmPico * 0.42); // ~35km en pico de 85km/sem

  let recom = 'Aplicá progresión del 10% por semana con una semana de descarga cada 4.';
  if (kmActual < 20) recom = 'Primero construí base de 20+ km/semana durante 4-6 semanas antes de empezar el plan.';
  else if (kmActual > kmPico * 0.8) recom = 'Ya tenés buena base. Podés acortar el plan 2-3 semanas.';

  // Progresión de volumen semanal (km/semana) con deload cada 4 semanas y taper final
  const taperSemanas = 3;
  const buildSemanas = semanas - taperSemanas;
  const kmSemanales: number[] = [];
  const labels: string[] = [];
  for (let s = 1; s <= semanas; s++) {
    labels.push(`S${s}`);
    if (s > buildSemanas) {
      // Taper: 70%, 55%, 40% del pico
      const taperIdx = s - buildSemanas;
      const taperPct = [0.7, 0.55, 0.4][Math.min(taperIdx - 1, 2)];
      kmSemanales.push(Math.round(kmPico * taperPct));
    } else {
      // Build con deload cada 4 semanas
      const avanceLineal = kmPrimeraSemana + ((kmPico - kmPrimeraSemana) * s) / buildSemanas;
      const esDeload = s % 4 === 0;
      kmSemanales.push(Math.round(esDeload ? avanceLineal * 0.7 : avanceLineal));
    }
  }

  const chart = {
    type: 'bar' as const,
    ariaLabel: `Plan de ${semanas} semanas: arranca en ${kmPrimeraSemana} km/semana, pico de ${kmPico} km/semana, taper final de ${taperSemanas} semanas.`,
    data: {
      labels,
      datasets: [
        {
          label: 'Km/semana',
          data: kmSemanales,
          suffix: ' km',
        },
      ],
    },
  };

  return {
    semanasRecomendadas: semanas,
    kmSemanalesPico: kmPico,
    kmPrimeraSemana: kmPrimeraSemana,
    longRunMaxKm: longRun,
    recomendacion: recom,
    resumen: `Para una maratón en **${meta}h** con nivel ${exp}: **${semanas} semanas** de entrenamiento, pico de ${kmPico} km/semana y long run máximo de ${longRun} km.`,
    _chart: chart,
  };
}
