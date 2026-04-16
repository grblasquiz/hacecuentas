/** Horas de vida restantes */
export interface Inputs { edad: number; sexo: string; pais: string; }
export interface Outputs { horasRestantes: number; diasRestantes: number; semanasRestantes: number; horasDespierto: number; mensaje: string; }

export function horasVidaRestantes(i: Inputs): Outputs {
  const edad = Number(i.edad);
  const sexo = String(i.sexo || 'masculino');
  const pais = String(i.pais || 'argentina');
  if (edad < 0) throw new Error('Ingresá una edad válida');

  const esperanza: Record<string, Record<string, number>> = {
    argentina: { masculino: 74, femenino: 80 },
    mexico: { masculino: 72, femenino: 78 },
    colombia: { masculino: 74, femenino: 80 },
    espana: { masculino: 80, femenino: 86 },
    eeuu: { masculino: 76, femenino: 81 },
    japon: { masculino: 81, femenino: 87 }
  };

  const ev = esperanza[pais]?.[sexo] || 77;
  const anosRestantes = Math.max(0, ev - edad);
  const diasRestantes = Math.round(anosRestantes * 365.25);
  const horasRestantes = diasRestantes * 24;
  const semanasRestantes = Math.round(diasRestantes / 7);
  const horasDespierto = Math.round(horasRestantes * 0.67); // ~16h awake per day

  let mensaje: string;
  if (anosRestantes <= 0) {
    mensaje = 'Según las estadísticas, ya superaste la esperanza de vida promedio. ¡Cada día extra es un regalo!';
  } else {
    mensaje = `Te quedan ~${horasRestantes.toLocaleString()} horas de vida (${horasDespierto.toLocaleString()} despierto/a). Son ${semanasRestantes.toLocaleString()} semanas. ¿En qué las vas a usar?`;
  }

  return { horasRestantes, diasRestantes, semanasRestantes, horasDespierto, mensaje };
}