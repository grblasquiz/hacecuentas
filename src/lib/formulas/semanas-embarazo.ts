/** Semanas y días de embarazo desde FUM */
export interface Inputs {
  fum: string;
}
export interface Outputs {
  semanasYDias: string;
  trimestre: string;
  fpp: string;
  porcentaje: string;
}

export function semanasEmbarazo(i: Inputs): Outputs {
  const fum = new Date(i.fum + 'T00:00:00');
  if (isNaN(fum.getTime())) throw new Error('Ingresá una fecha de última menstruación válida');

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const diasTranscurridos = Math.floor((hoy.getTime() - fum.getTime()) / (1000 * 60 * 60 * 24));
  if (diasTranscurridos < 0) throw new Error('La FUM no puede ser futura');
  if (diasTranscurridos > 320) throw new Error('La FUM parece demasiado antigua (más de 45 semanas)');

  const semanas = Math.floor(diasTranscurridos / 7);
  const dias = diasTranscurridos % 7;

  // FPP = FUM + 280
  const fpp = new Date(fum.getTime());
  fpp.setDate(fpp.getDate() + 280);

  // Trimestre
  let trimestre = '';
  if (semanas < 13) trimestre = 'Primer trimestre (semanas 1-12)';
  else if (semanas < 28) trimestre = 'Segundo trimestre (semanas 13-27)';
  else if (semanas <= 42) trimestre = 'Tercer trimestre (semanas 28-40+)';
  else trimestre = 'Postérmino';

  const porcentaje = Math.min(100, (diasTranscurridos / 280) * 100);

  return {
    semanasYDias: `${semanas} semanas y ${dias} días`,
    trimestre,
    fpp: `${fpp.getFullYear()}-${String(fpp.getMonth()+1).padStart(2,'0')}-${String(fpp.getDate()).padStart(2,'0')}`,
    porcentaje: `${porcentaje.toFixed(1)}% completado`,
  };
}
