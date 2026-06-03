/**
 * Calendario de vacunación canina según edad y estado vacunal previo.
 * Marco: vacunas core WSAVA (quíntuple: moquillo, parvovirus, adenovirus,
 * parainfluenza, leptospirosis) + antirrábica obligatoria (Ley 22.953, SENASA).
 * Orientativo: no reemplaza el examen clínico veterinario previo a cada dosis.
 */
export interface Inputs {
  edad: number | string;
  unidadEdad?: string; // 'semanas' | 'meses' | 'anios'
  vacunadoPrevio?: string; // 'si' | 'no'
  [k: string]: number | string | undefined;
}
export interface Outputs {
  etapa: string;
  ahora: string;
  proximo: string;
  antirrabica: string;
  resumen: string;
  _chart?: any;
  _insight?: any;
  [k: string]: string | number | any;
}

function aSemanas(edad: number, unidad: string): number {
  if (unidad === 'meses') return edad * 4.345;
  if (unidad === 'anios') return edad * 52.14;
  return edad; // semanas
}

export function vacunasPerroCachorroAdultoCalendario(i: Inputs): Outputs {
  const edad = Number(i.edad);
  const unidad = String(i.unidadEdad ?? 'semanas');
  if (!Number.isFinite(edad) || edad <= 0) {
    throw new Error('Ingresá la edad de tu perro (mayor a 0).');
  }
  const semanas = aSemanas(edad, unidad);
  const vacunado = String(i.vacunadoPrevio ?? 'no') === 'si';

  let etapa: string, ahora: string, proximo: string, antirrabica: string;
  let tone: 'good' | 'warn' | 'neutral' = 'neutral';

  if (semanas < 6) {
    etapa = 'Cachorro muy chico (< 6 semanas)';
    ahora = 'Todavía es temprano para vacunar: hasta las 6 semanas los anticuerpos maternos interfieren con la vacuna.';
    proximo = 'Primera dosis de quíntuple entre las 6 y 8 semanas de vida.';
    antirrabica = 'La antirrábica recién corresponde desde las 12 semanas.';
    tone = 'warn';
  } else if (semanas < 52) {
    etapa = 'Cachorro — esquema inicial';
    tone = 'good';
    if (semanas < 9) {
      ahora = 'Toca la 1ª dosis de quíntuple (ventana 6–8 semanas).';
      proximo = '2ª dosis de quíntuple a las 10–12 semanas.';
    } else if (semanas < 13) {
      ahora = 'Toca la 2ª dosis de quíntuple.';
      proximo = '3ª dosis de quíntuple a las 12–16 semanas, junto con la antirrábica.';
    } else if (semanas < 17) {
      ahora = '3ª dosis de quíntuple + antirrábica (ya corresponde desde las 12 semanas).';
      proximo = 'Refuerzo a las 16–20 semanas en razas de alto riesgo (Rottweiler, Doberman); después, refuerzo anual.';
    } else {
      ahora = 'Última dosis del esquema de cachorro (16–20 semanas) si todavía falta alguna.';
      proximo = 'Primer refuerzo anual completo al cumplir el año.';
    }
    antirrabica = semanas >= 12 ? 'Ya corresponde la antirrábica.' : 'Antirrábica desde las 12 semanas.';
  } else if (!vacunado) {
    etapa = 'Adulto sin cartilla de vacunación';
    ahora = 'Iniciá el esquema como si fuera la primera vez: 2 dosis de quíntuple con 3–4 semanas de diferencia (clave para parvovirus).';
    proximo = 'Antirrábica en la misma serie; luego, refuerzo anual estándar.';
    antirrabica = 'Corresponde aplicar la antirrábica ahora.';
    tone = 'warn';
  } else {
    etapa = 'Adulto vacunado';
    ahora = 'Mantené el refuerzo anual completo (quíntuple + antirrábica).';
    proximo = 'Próximo refuerzo: al año de la última dosis registrada en la cartilla.';
    antirrabica = 'Antirrábica anual (campañas gratuitas del SENASA, generalmente agosto–octubre).';
    tone = 'good';
  }

  // Gráfico sólo para cachorros/jóvenes: la escala de edad muestra los hitos.
  let chart: any = undefined;
  if (semanas <= 24) {
    chart = {
      type: 'scale' as const,
      marker: Number(semanas.toFixed(1)),
      markerLabel: `Tu perro: ${fmt(semanas)} sem`,
      min: 0,
      unit: ' sem',
      segments: [
        { nombre: 'Muy chico', max: 6, color: '#fef9c3', colorDark: '#854d0e' },
        { nombre: '1ª dosis', max: 8, color: '#bbf7d0', colorDark: '#166534' },
        { nombre: '2ª dosis', max: 12, color: '#a7f3d0', colorDark: '#047857' },
        { nombre: '3ª + rabia', max: 16, color: '#bfdbfe', colorDark: '#1e40af' },
        { nombre: 'Refuerzos', max: Math.max(24, Math.ceil(semanas) + 1), color: '#ddd6fe', colorDark: '#5b21b6' },
      ],
      ariaLabel: 'Escala del calendario de vacunación del cachorro por semanas de edad.',
    };
  }

  return {
    etapa,
    ahora,
    proximo,
    antirrabica,
    resumen: `${etapa}: ${ahora} ${proximo}`,
    _chart: chart,
    _insight: {
      title: 'Qué vacunas tocan ahora',
      text: `**${etapa}.** ${ahora} Próximo paso: ${proximo} ${antirrabica} El veterinario debe registrar lote y fecha en la cartilla sanitaria.`,
      tone,
      icon: '🐶',
    },
  };
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ',');
}
