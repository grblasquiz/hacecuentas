export interface Inputs { edad: number; genero?: string; actividad?: string; fuma?: string; imc?: string; }
export interface Outputs { esperanzaVida: number; anosRestantes: number; mensaje: string; _insight?: any; _chart?: any; }
export function expectativaVida(i: Inputs): Outputs {
  const edad = Number(i.edad);
  if (!edad || edad < 1) throw new Error('Ingresá tu edad');
  const genero = String(i.genero || 'm');
  const act = String(i.actividad || 'moderada');
  const fuma = String(i.fuma || 'no');
  const imc = String(i.imc || 'normal');
  let base = genero === 'f' ? 80 : 74;
  // Actividad
  if (act === 'activo') base += 4;
  else if (act === 'moderada') base += 2;
  else base -= 3;
  // Tabaco
  if (fuma === 'si') base -= 8;
  else if (fuma === 'ex') base -= 2;
  // IMC
  if (imc === 'normal') base += 1;
  else if (imc === 'sobrepeso') base -= 1;
  else if (imc === 'obesidad') base -= 4;
  else if (imc === 'bajo') base -= 2;
  const restantes = Math.max(0, Math.round(base - edad));
  const tips: string[] = [];
  if (fuma === 'si') tips.push('Dejar de fumar podría sumar hasta 8 años.');
  if (act === 'sedentario') tips.push('Sumar actividad física moderada sumaría ~3-5 años.');
  if (imc === 'obesidad') tips.push('Bajar a peso normal sumaría ~3-4 años.');
  const msg = `Esperanza de vida estimada: ${base} años. Te quedan ~${restantes} años. ` + (tips.length ? tips.join(' ') : 'Buen estilo de vida — seguí así.');

  // --- Insight dinámico según factores de estilo de vida ---
  let toneIns: 'good' | 'warn' | 'neutral';
  let textIns: string;
  if (fuma === 'si' || imc === 'obesidad') {
    toneIns = 'warn';
    const palancas: string[] = [];
    if (fuma === 'si') palancas.push('dejar de fumar (**+8 años**)');
    if (imc === 'obesidad') palancas.push('volver a peso normal (**+4 años**)');
    if (act === 'sedentario') palancas.push('sumar actividad física (**+5 años**)');
    textIns =
      `Tu estimación es de **${base} años** (~${restantes} restantes), pero hay margen claro de mejora: ${palancas.join(', ')}. ` +
      `Son cambios que mueven la cifra de forma medible.`;
  } else if (act === 'activo' && (imc === 'normal') && (fuma === 'no')) {
    toneIns = 'good';
    textIns =
      `Tu perfil —activo, no fumador, peso normal— empuja la estimación a **${base} años**, por encima de la media. ` +
      `Te quedan unos **${restantes} años**: el estilo de vida ya juega a favor.`;
  } else {
    toneIns = 'neutral';
    textIns =
      `Tu esperanza de vida estimada es de **${base} años**, con unos **${restantes} años** por delante desde los ${edad} actuales. ` +
      `Pequeños ajustes en actividad, peso y tabaco pueden mover esa cifra.`;
  }
  const _insight = {
    title: 'Qué dice tu estimación',
    text: textIns,
    tone: toneIns,
    icon: '⏳',
  };

  // --- Gauge: estimación dentro de zonas de longevidad humana ---
  const _chart = {
    type: 'scale',
    marker: base,
    markerLabel: `${base} años`,
    min: 50,
    segments: [
      { nombre: 'Baja', max: 70, color: '#ef4444', colorDark: '#b91c1c' },
      { nombre: 'Media', max: 80, color: '#f59e0b', colorDark: '#b45309' },
      { nombre: 'Alta', max: 90, color: '#84cc16', colorDark: '#4d7c0f' },
      { nombre: 'Excepcional', max: 100, color: '#22c55e', colorDark: '#15803d' },
    ],
    ariaLabel: `Esperanza de vida estimada de ${base} años en una escala de 50 a 100 años.`,
  };

  return { esperanzaVida: base, anosRestantes: restantes, mensaje: msg, _insight, _chart };
}
