/**
 * Promedio ponderado universitario — Perú (escala vigesimal 0-20).
 * Promedio ponderado = Σ(nota × créditos) ÷ Σ(créditos).
 * En la mayoría de universidades peruanas se aprueba con 11 (el 10,5 se redondea a 11).
 * Incluye el modo "¿cuánto necesito?": nota que te falta en una materia pendiente
 * para alcanzar un promedio objetivo.
 */

export interface Inputs {
  notas?: string;                    // notas 0-20 separadas por coma/espacio
  creditos?: string;                 // créditos por materia, mismo orden
  creditosPendiente?: number | string; // créditos de la materia pendiente (opcional)
  objetivo?: number | string;          // promedio objetivo (opcional)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const notasRaw = String(i.notas || '').trim();
  const creditosRaw = String(i.creditos || '').trim();
  if (!notasRaw) throw new Error('Ingresa al menos una nota (0-20).');
  if (!creditosRaw) throw new Error('Ingresa los créditos de cada curso.');

  const parse = (s: string) => s.split(/[,;\s]+/).filter(Boolean).map((x) => parseFloat(x.replace(',', '.'))).filter((n) => !isNaN(n));
  const notas = parse(notasRaw);
  const creditos = parse(creditosRaw);

  if (notas.length === 0) throw new Error('No se encontraron notas válidas.');
  if (creditos.length === 0) throw new Error('No se encontraron créditos válidos.');
  if (notas.length !== creditos.length) throw new Error(`La cantidad de notas (${notas.length}) y de créditos (${creditos.length}) debe coincidir.`);
  for (const n of notas) if (n < 0 || n > 20) throw new Error(`La nota ${n} está fuera de la escala vigesimal (0-20).`);
  for (const c of creditos) if (c <= 0) throw new Error('Los créditos deben ser mayores a 0.');

  const totalCreditos = creditos.reduce((a, b) => a + b, 0);
  const sumaPonderada = notas.reduce((acc, n, idx) => acc + n * creditos[idx], 0);
  const promedio = sumaPonderada / totalCreditos;
  const prom = Math.round(promedio * 100) / 100;

  const promSimple = notas.reduce((a, b) => a + b, 0) / notas.length;
  const dif = prom - Math.round(promSimple * 100) / 100;

  let cat: string, tone: 'good' | 'warn' | 'neutral';
  if (prom < 10.5) { cat = 'desaprobatorio'; tone = 'warn'; }
  else if (prom < 14) { cat = 'aprobatorio'; tone = 'neutral'; }
  else if (prom < 17) { cat = 'bueno (zona de tercio superior)'; tone = 'good'; }
  else { cat = 'sobresaliente'; tone = 'good'; }

  // Modo "¿cuánto necesito?": nota requerida en una materia pendiente para llegar al objetivo.
  const cp = Math.max(0, Number(i.creditosPendiente) || 0);
  const objetivo = Math.max(0, Math.min(20, Number(i.objetivo) || 0));
  let necesitas = '—';
  let notaNecesaria: number | null = null;
  if (cp > 0 && objetivo > 0) {
    notaNecesaria = (objetivo * (totalCreditos + cp) - sumaPonderada) / cp;
    const nn = Math.round(notaNecesaria * 100) / 100;
    if (nn > 20) necesitas = `Imposible: necesitarías ${nn.toFixed(2)} (máx. 20)`;
    else if (nn <= 0) necesitas = 'Ya alcanzaste ese promedio (con 0 basta)';
    else necesitas = `${nn.toFixed(2)} en la materia de ${cp} crédito(s)`;
  }

  const efecto = Math.abs(dif) < 0.05
    ? 'Los créditos casi no cambian tu promedio frente al simple.'
    : dif > 0
      ? `Ponderar por créditos te **sube ${dif.toFixed(2)}** frente al promedio simple (${promSimple.toFixed(2)}): tus mejores notas están en los cursos de más créditos.`
      : `Ponderar por créditos te **baja ${Math.abs(dif).toFixed(2)}** frente al promedio simple (${promSimple.toFixed(2)}): los cursos pesados son los que más te cuestan.`;

  const _insight = {
    title: 'Tu promedio ponderado',
    text: `Promedio ponderado **${prom.toFixed(2)}/20** en ${notas.length} curso(s) y ${totalCreditos} créditos — nivel **${cat}**. ${efecto}${notaNecesaria !== null && notaNecesaria > 0 && notaNecesaria <= 20 ? ` Para llegar a **${objetivo}** necesitas **${notaNecesaria.toFixed(2)}** en tu materia pendiente.` : ''}`,
    tone,
    icon: '🎓',
  };

  const _chart = {
    type: 'scale' as const,
    marker: prom,
    markerLabel: prom.toFixed(2),
    min: 0,
    segments: [
      { nombre: 'Desaprobado', max: 10.5, color: '#ef4444', colorDark: '#dc2626' },
      { nombre: 'Aprobado', max: 14, color: '#f59e0b', colorDark: '#d97706' },
      { nombre: 'Bueno', max: 17, color: '#84cc16', colorDark: '#65a30d' },
      { nombre: 'Sobresaliente', max: 20, color: '#22c55e', colorDark: '#16a34a' },
    ],
    ariaLabel: 'Promedio ponderado en la escala vigesimal peruana de 0 a 20.',
  };

  return {
    promedioPonderado: `${prom.toFixed(2)} / 20`,
    totalCreditos,
    cursos: notas.length,
    necesitas,
    detalle: `Σ(nota × créditos) = ${sumaPonderada.toLocaleString('de-DE', { maximumFractionDigits: 2 })} ÷ ${totalCreditos} créditos = ${prom.toFixed(2)} (escala 0-20).`,
    _insight,
    _chart,
  };
}
