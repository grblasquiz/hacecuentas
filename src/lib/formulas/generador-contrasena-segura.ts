/** Evaluador de fortaleza de contraseña */
export interface Inputs { contrasena: string; }
export interface Outputs { nivel: string; entropia: number; tiempoCrackeo: string; largo: number; sugerencias: string; _insight?: any; _chart?: any; }

export function generadorContrasenaSegura(i: Inputs): Outputs {
  const pw = String(i.contrasena || '');
  if (!pw) throw new Error('Ingresá una contraseña');

  const largo = pw.length;
  let poolSize = 0;
  if (/[a-z]/.test(pw)) poolSize += 26;
  if (/[A-Z]/.test(pw)) poolSize += 26;
  if (/[0-9]/.test(pw)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) poolSize += 33;

  const entropia = Math.round(Math.log2(Math.pow(poolSize || 1, largo)));

  // Time to crack at 10 billion guesses/second
  const combinations = Math.pow(poolSize || 1, largo);
  const seconds = combinations / 1e10;

  let tiempoCrackeo: string;
  if (seconds < 1) tiempoCrackeo = 'Menos de 1 segundo';
  else if (seconds < 60) tiempoCrackeo = `${Math.round(seconds)} segundos`;
  else if (seconds < 3600) tiempoCrackeo = `${Math.round(seconds / 60)} minutos`;
  else if (seconds < 86400) tiempoCrackeo = `${Math.round(seconds / 3600)} horas`;
  else if (seconds < 86400 * 365) tiempoCrackeo = `${Math.round(seconds / 86400)} días`;
  else if (seconds < 86400 * 365 * 1000) tiempoCrackeo = `${Math.round(seconds / (86400 * 365))} años`;
  else if (seconds < 86400 * 365 * 1e6) tiempoCrackeo = `${(seconds / (86400 * 365 * 1000)).toFixed(0)} mil años`;
  else tiempoCrackeo = 'Millones de años+';

  let nivel: string;
  if (entropia < 28) nivel = '🔴 Muy débil';
  else if (entropia < 36) nivel = '🟠 Débil';
  else if (entropia < 60) nivel = '🟡 Moderada';
  else if (entropia < 128) nivel = '🟢 Fuerte';
  else nivel = '🟢 Excelente';

  const sugs: string[] = [];
  if (largo < 12) sugs.push('Aumentá a 12+ caracteres');
  if (!/[A-Z]/.test(pw)) sugs.push('Agregá mayúsculas');
  if (!/[0-9]/.test(pw)) sugs.push('Agregá números');
  if (!/[^a-zA-Z0-9]/.test(pw)) sugs.push('Agregá caracteres especiales (!@#$)');
  if (/^[a-z]+$/i.test(pw)) sugs.push('Usá una frase: "mesa-caballo-lampara-azul"');
  if (sugs.length === 0) sugs.push('Tu contraseña es fuerte. Usá un password manager para no olvidarla.');

  const _tone = entropia < 36 ? 'warn' : entropia < 60 ? 'neutral' : 'good';
  const _icon = entropia < 36 ? '🚨' : entropia < 60 ? '🔐' : '🛡️';
  const _insight = {
    title: 'Qué tan segura es',
    text: entropia < 36
      ? `Con **${entropia} bits** de entropía, una PC potente la adivina en **${tiempoCrackeo.toLowerCase()}**. Sumá largo y variedad de caracteres antes de usarla.`
      : entropia < 60
        ? `Tiene **${entropia} bits** de entropía: resiste **${tiempoCrackeo.toLowerCase()}** ante un ataque masivo. Aceptable, pero llegar a 60+ bits la vuelve realmente sólida.`
        : `Excelente: **${entropia} bits** de entropía hacen falta **${tiempoCrackeo.toLowerCase()}** para crackearla a 10 mil millones de intentos/segundo. Guardala en un gestor de contraseñas.`,
    tone: _tone,
    icon: _icon,
  };
  const _chart = {
    type: 'scale',
    marker: entropia,
    markerLabel: `${entropia} bits`,
    min: 0,
    segments: [
      { nombre: 'Muy débil', max: 28, color: '#dc2626', colorDark: '#ef4444' },
      { nombre: 'Débil', max: 36, color: '#f97316', colorDark: '#fb923c' },
      { nombre: 'Moderada', max: 60, color: '#eab308', colorDark: '#facc15' },
      { nombre: 'Fuerte', max: 128, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Excelente', max: Math.max(160, entropia + 10), color: '#059669', colorDark: '#10b981' },
    ],
    ariaLabel: `Entropía de ${entropia} bits sobre una escala de fortaleza de contraseñas`,
  };

  return { nivel, entropia, tiempoCrackeo, largo, sugerencias: sugs.join('. '), _insight, _chart };
}