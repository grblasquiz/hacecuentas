/** Edad corregida para bebés prematuros */
export interface Inputs { fechaNacPrem: string; semanasGestPrem: number; }
export interface Outputs { edadCronologica: string; edadCorregida: string; semanasPrematurez: string; nota: string; }

export function edadCorregidaPrematuro(i: Inputs): Outputs {
  const parts = String(i.fechaNacPrem || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error('Ingresá una fecha de nacimiento válida');
  const [yy, mm, dd] = parts;
  const nac = new Date(yy, mm - 1, dd);
  if (isNaN(nac.getTime())) throw new Error('Ingresá una fecha de nacimiento válida');
  const semGest = Math.round(Number(i.semanasGestPrem));
  if (semGest < 22 || semGest > 36) throw new Error('Ingresá semanas de gestación entre 22 y 36');

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const diasCronologicos = Math.floor((hoy.getTime() - nac.getTime()) / (1000 * 60 * 60 * 24));
  if (diasCronologicos < 0) throw new Error('La fecha de nacimiento no puede ser futura');

  const semanasPrematurez = 40 - semGest;
  const diasPrematurez = semanasPrematurez * 7;
  const diasCorregidos = Math.max(0, diasCronologicos - diasPrematurez);

  const mesesCron = Math.floor(diasCronologicos / 30.44);
  const diasExtraCron = Math.round(diasCronologicos % 30.44);
  const mesesCorr = Math.floor(diasCorregidos / 30.44);
  const diasExtraCorr = Math.round(diasCorregidos % 30.44);

  let nota = 'Usá la edad corregida para evaluar desarrollo motor, crecimiento y alimentación. Las vacunas se dan por edad cronológica.';
  if (mesesCorr >= 24) nota = 'Tu bebé ya tiene más de 2 años de edad corregida. A partir de ahora se puede empezar a usar la edad cronológica para la mayoría de las evaluaciones.';

  return {
    edadCronologica: `${mesesCron} meses y ${diasExtraCron} días`,
    edadCorregida: `${mesesCorr} meses y ${diasExtraCorr} días`,
    semanasPrematurez: `${semanasPrematurez} semanas (nació a las ${semGest} semanas en vez de 40)`,
    nota,
  };
}
