/** Calculadora de carbohidratos durante ejercicio */
export interface Inputs {
  duracion: number;
  intensidad: string;
  peso: number;
}
export interface Outputs {
  gramosHora: number;
  totalSesion: number;
  geles: number;
  bananas: number;
  tipoCarb: string;
  mensaje: string;
}

export function carbohidratosDuranteEjercicio(i: Inputs): Outputs {
  const duracion = Number(i.duracion) || 60;
  const intensidad = String(i.intensidad || 'moderada');
  const peso = Number(i.peso);
  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');

  let gramosHora: number;
  let tipoCarb: string;

  if (duracion < 60) {
    gramosHora = 0;
    tipoCarb = 'No necesitás carbs durante el ejercicio para esta duración.';
  } else if (duracion <= 150) {
    gramosHora = intensidad === 'alta' ? 60 : intensidad === 'moderada' ? 45 : 30;
    tipoCarb = 'Glucosa simple: geles, gomitas deportivas, banana, bebida deportiva.';
  } else {
    gramosHora = intensidad === 'alta' ? 90 : intensidad === 'moderada' ? 70 : 50;
    tipoCarb = 'Mezcla glucosa + fructosa (2:1) para absorción máxima de hasta 90g/hora.';
  }

  const horasEjercicio = duracion / 60;
  // Only count fueling time after first 30-45 min
  const horasFueling = Math.max(0, horasEjercicio - 0.5);
  const totalSesion = Math.round(gramosHora * horasFueling);
  const geles = Math.ceil(totalSesion / 25);
  const bananas = Math.ceil(totalSesion / 27);

  return {
    gramosHora,
    totalSesion,
    geles,
    bananas,
    tipoCarb,
    mensaje: duracion < 60
      ? 'No necesitás carbohidratos extra para sesiones menores a 60 minutos.'
      : `Necesitás ~\${gramosHora}g/hora de carbs (\${totalSesion}g total ≈ \${geles} geles). Empezá a los 30-45 min de ejercicio.`
  };
}