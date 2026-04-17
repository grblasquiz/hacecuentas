/**
 * Calculadora de ovulación y ventana fértil
 *
 * Día de ovulación = FUM + (largo_ciclo - 14)
 * Ventana fértil = ovulación - 5 días a ovulación + 1 día
 * (El óvulo vive ~24h, los espermatozoides hasta 5 días)
 */

export interface OvulacionInputs {
  fum: string;
  largoCiclo: number;
}

export interface OvulacionOutputs {
  fechaOvulacion: string;
  ventanaFertilInicio: string;
  ventanaFertilFin: string;
  diasHastaOvulacion: number;
  proximaMenstruacion: string;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date + 'T00:00:00');
  result.setDate(result.getDate() + days);
  return result;
}

function toISODate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

export function ovulacion(inputs: OvulacionInputs): OvulacionOutputs {
  if (!inputs.fum) throw new Error('Ingresá la fecha de tu última menstruación');
  const largoCiclo = Number(inputs.largoCiclo) || 28;
  if (largoCiclo < 21 || largoCiclo > 40) {
    throw new Error('El largo del ciclo debe estar entre 21 y 40 días');
  }

  const fum = new Date(inputs.fum + 'T00:00:00');
  if (isNaN(fum.getTime())) throw new Error('Fecha inválida');

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  fum.setHours(0, 0, 0, 0);

  const fechaOvulacion = addDays(fum, largoCiclo - 14);
  const ventanaInicio = addDays(fechaOvulacion, -5);
  const ventanaFin = addDays(fechaOvulacion, 1);
  const proximaMenstruacion = addDays(fum, largoCiclo);

  const diasHasta = Math.round((fechaOvulacion.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

  return {
    fechaOvulacion: toISODate(fechaOvulacion),
    ventanaFertilInicio: toISODate(ventanaInicio),
    ventanaFertilFin: toISODate(ventanaFin),
    diasHastaOvulacion: diasHasta,
    proximaMenstruacion: toISODate(proximaMenstruacion),
  };
}
