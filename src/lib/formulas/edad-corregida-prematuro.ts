/** Edad corregida para bebés prematuros */
export interface Inputs { fechaNacPrem: string; semanasGestPrem: number; __lang?: string; }
export interface Outputs { edadCronologica: string; edadCorregida: string; semanasPrematurez: string; nota: string; _insight?: any; }

export function edadCorregidaPrematuro(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const T = ({
    es: {
      errorFecha: 'Ingresá una fecha de nacimiento válida',
      errorSemanas: 'Ingresá semanas de gestación entre 22 y 36',
      errorFutura: 'La fecha de nacimiento no puede ser futura',
      notaDefault: 'Usá la edad corregida para evaluar desarrollo motor, crecimiento y alimentación. Las vacunas se dan por edad cronológica.',
      notaDos: 'Tu bebé ya tiene más de 2 años de edad corregida. A partir de ahora se puede empezar a usar la edad cronológica para la mayoría de las evaluaciones.',
      insTitle: 'Qué edad usar',
      insGap: (sem: number) => `Tu bebé nació **${sem} semanas antes** de término, así que su desarrollo se evalúa con la **edad corregida**, no la del calendario. Es esperable que vaya “atrasado” respecto a su edad cronológica: ese desfasaje se recupera solo, en general hacia los 2 años.`,
      insDos: (sem: number) => `Tu bebé nació **${sem} semanas antes** de término, pero ya superó los **2 años de edad corregida**: a partir de ahora podés usar la edad del calendario para casi todas las evaluaciones. La prematurez ya no marca diferencia en el desarrollo.`,
    },
    en: {
      errorFecha: 'Enter a valid date of birth',
      errorSemanas: 'Enter gestational weeks between 22 and 36',
      errorFutura: 'Date of birth cannot be in the future',
      notaDefault: 'Use the corrected age to evaluate motor development, growth, and feeding. Vaccines are given based on chronological age.',
      notaDos: 'Your baby is already over 2 years of corrected age. From now on, chronological age can be used for most evaluations.',
      insTitle: 'Which age to use',
      insGap: (sem: number) => `Your baby was born **${sem} weeks early**, so development is assessed using the **corrected age**, not the calendar one. It is expected to lag behind the chronological age: that gap usually catches up on its own, generally by age 2.`,
      insDos: (sem: number) => `Your baby was born **${sem} weeks early**, but is already over **2 years of corrected age**: from now on you can use the calendar age for almost all evaluations. Prematurity no longer makes a difference in development.`,
    },
  } as const)[__lang];

  const parts = String(i.fechaNacPrem || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error(T.errorFecha);
  const [yy, mm, dd] = parts;
  const nac = new Date(yy, mm - 1, dd);
  if (isNaN(nac.getTime())) throw new Error(T.errorFecha);
  const semGest = Math.round(Number(i.semanasGestPrem));
  if (semGest < 22 || semGest > 36) throw new Error(T.errorSemanas);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const diasCronologicos = Math.floor((hoy.getTime() - nac.getTime()) / (1000 * 60 * 60 * 24));
  if (diasCronologicos < 0) throw new Error(T.errorFutura);

  const semanasPrematurez = 40 - semGest;
  const diasPrematurez = semanasPrematurez * 7;
  const diasCorregidos = Math.max(0, diasCronologicos - diasPrematurez);

  const mesesCron = Math.floor(diasCronologicos / 30.44);
  const diasExtraCron = Math.round(diasCronologicos % 30.44);
  const mesesCorr = Math.floor(diasCorregidos / 30.44);
  const diasExtraCorr = Math.round(diasCorregidos % 30.44);

  let nota = T.notaDefault;
  if (mesesCorr >= 24) nota = T.notaDos;

  const _insight = {
    title: T.insTitle,
    text: mesesCorr >= 24 ? T.insDos(semanasPrematurez) : T.insGap(semanasPrematurez),
    tone: mesesCorr >= 24 ? 'good' : 'neutral',
    icon: '👶',
  };

  return {
    edadCronologica: __lang === 'en'
      ? `${mesesCron} months and ${diasExtraCron} days`
      : `${mesesCron} meses y ${diasExtraCron} días`,
    edadCorregida: __lang === 'en'
      ? `${mesesCorr} months and ${diasExtraCorr} days`
      : `${mesesCorr} meses y ${diasExtraCorr} días`,
    semanasPrematurez: __lang === 'en'
      ? `${semanasPrematurez} weeks (born at ${semGest} weeks instead of 40)`
      : `${semanasPrematurez} semanas (nació a las ${semGest} semanas en vez de 40)`,
    nota,
    _insight,
  };
}
