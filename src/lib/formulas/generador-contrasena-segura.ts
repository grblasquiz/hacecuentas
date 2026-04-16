/** Evaluador de fortaleza de contraseña */
export interface Inputs { contrasena: string; }
export interface Outputs { nivel: string; entropia: number; tiempoCrackeo: string; largo: number; sugerencias: string; }

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

  return { nivel, entropia, tiempoCrackeo, largo, sugerencias: sugs.join('. ') };
}