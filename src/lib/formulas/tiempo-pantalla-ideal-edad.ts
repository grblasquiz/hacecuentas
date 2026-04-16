/** Tiempo de pantalla ideal por edad */
export interface Inputs { edad: number; tiempoActual: number; }
export interface Outputs { recomendado: string; exceso: string; grupo: string; mensaje: string; }

export function tiempoPantallaIdealEdad(i: Inputs): Outputs {
  const edad = Number(i.edad);
  const actual = Number(i.tiempoActual) || 0;
  if (edad < 0) throw new Error('Ingresá una edad válida');

  let recomendado: string;
  let maxHoras: number;
  let grupo: string;

  if (edad < 2) { recomendado = '0 horas (evitar pantallas)'; maxHoras = 0; grupo = 'Bebé (0-2 años)'; }
  else if (edad <= 5) { recomendado = 'Máximo 1 hora/día (contenido de calidad)'; maxHoras = 1; grupo = 'Preescolar (2-5 años)'; }
  else if (edad <= 12) { recomendado = '1-2 horas/día de ocio'; maxHoras = 2; grupo = 'Niñez (6-12 años)'; }
  else if (edad <= 17) { recomendado = '2-3 horas/día de ocio'; maxHoras = 3; grupo = 'Adolescencia (13-17 años)'; }
  else { recomendado = '2-4 horas/día de ocio (evitar antes de dormir)'; maxHoras = 4; grupo = 'Adulto (18+ años)'; }

  const diff = actual - maxHoras;
  let exceso: string;
  if (diff <= 0) exceso = '✅ Dentro de lo recomendado';
  else exceso = `⚠️ ${diff.toFixed(1)} horas por encima de lo recomendado`;

  return {
    recomendado, exceso, grupo,
    mensaje: `${grupo}: ${recomendado}. Tu tiempo actual: ${actual}h/día. ${diff > 0 ? 'Recomendamos reducir.' : 'Bien!'}`
  };
}