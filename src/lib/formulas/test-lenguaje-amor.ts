/** Test de los 5 Lenguajes del Amor */
export interface Inputs { p1: string; p2: string; p3: string; p4: string; p5: string; }
export interface Outputs { lenguajePrincipal: string; desglose: string; mensaje: string; }

const NOMBRES: Record<string, string> = {
  palabras: 'Palabras de Afirmación',
  servicio: 'Actos de Servicio',
  regalos: 'Regalos',
  tiempo: 'Tiempo de Calidad',
  contacto: 'Contacto Físico',
};

const DESC: Record<string, string> = {
  palabras: 'Te sentís amado/a cuando te dicen cosas lindas, te escriben mensajes cariñosos y te hacen cumplidos. Las palabras tienen un poder enorme sobre vos.',
  servicio: 'Te sentís amado/a cuando te ayudan, te resuelven cosas y te hacen la vida más fácil. Los gestos concretos hablan más que las palabras para vos.',
  regalos: 'Te sentís amado/a cuando te sorprenden con detalles significativos. No es materialismo — es sentir que pensaron en vos.',
  tiempo: 'Te sentís amado/a cuando te dedican atención exclusiva y de calidad. Nada de celulares: mirarse, hablar, hacer algo juntos.',
  contacto: 'Te sentís amado/a con abrazos, caricias y cercanía física. La presencia corporal te da seguridad y conexión.',
};

export function testLenguajeAmor(i: Inputs): Outputs {
  const respuestas = [i.p1, i.p2, i.p3, i.p4, i.p5].map(r => String(r || ''));
  if (respuestas.some(r => !r)) throw new Error('Respondé todas las preguntas');

  const conteo: Record<string, number> = { palabras: 0, servicio: 0, regalos: 0, tiempo: 0, contacto: 0 };
  for (const r of respuestas) {
    if (conteo[r] !== undefined) conteo[r]++;
  }

  const sorted = Object.entries(conteo).sort((a, b) => b[1] - a[1]);
  const principal = sorted[0][0];
  const desglose = sorted
    .filter(([_, v]) => v > 0)
    .map(([k, v]) => `${NOMBRES[k]}: ${v}/5 (${Math.round(v * 100 / 5)}%)`)
    .join('\n');

  return {
    lenguajePrincipal: NOMBRES[principal],
    desglose,
    mensaje: DESC[principal],
  };
}
