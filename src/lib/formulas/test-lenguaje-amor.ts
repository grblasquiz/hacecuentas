/** Test de los 5 Lenguajes del Amor */
export interface Inputs { p1: string; p2: string; p3: string; p4: string; p5: string; }
export interface Outputs { lenguajePrincipal: string; desglose: string; mensaje: string; _insight?: any; _chart?: any; }

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
  const principalCount = sorted[0][1];
  const principalPct = Math.round(principalCount * 100 / 5);
  const desglose = sorted
    .filter(([_, v]) => v > 0)
    .map(([k, v]) => `${NOMBRES[k]}: ${v}/5 (${Math.round(v * 100 / 5)}%)`)
    .join('\n');

  const distintos = sorted.filter(([_, v]) => v > 0).length;
  const dominante = principalCount >= 4;
  const _insight = {
    title: 'Cómo te sentís amado/a',
    text: dominante
      ? `Tu lenguaje del amor es claramente **${NOMBRES[principal]}** (${principalCount}/5 respuestas, ${principalPct}%). Contale a tu pareja: este es el gesto que más te llena.`
      : `Tu lenguaje principal es **${NOMBRES[principal]}** (${principalCount}/5, ${principalPct}%), pero valorás ${distintos} formas distintas de cariño. No dependés de una sola para sentirte querido/a.`,
    tone: 'good' as const,
    icon: '💞',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: sorted
      .filter(([_, v]) => v > 0)
      .map(([k, v]) => ({ label: NOMBRES[k], value: v })),
    centerValue: `${principalPct}%`,
    centerLabel: NOMBRES[principal],
    ariaLabel: `Reparto de tus 5 respuestas entre los lenguajes del amor; el principal es ${NOMBRES[principal]} con ${principalCount} de 5 (${principalPct}%).`,
  };

  return {
    lenguajePrincipal: NOMBRES[principal],
    desglose,
    mensaje: DESC[principal],
    _insight,
    _chart,
  };
}
