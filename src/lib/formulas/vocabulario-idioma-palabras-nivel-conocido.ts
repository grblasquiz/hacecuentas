export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function vocabularioIdiomaPalabrasNivelConocido(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      nativoCulto: 'Nativo-culto',
      avanzado: 'Avanzado',
      intermedioAlto: 'Intermedio alto',
      intermedio: 'Intermedio',
      basico: 'Básico',
      principiante: 'Principiante',
      dominio: 'Dominio',
      obj10000: '10000+ para C2',
      obj8000: '8000 para C1',
      obj4000: '4000 para B2',
      obj2500: '2500 para B1',
      obj1500: '1500 para A2',
      insTitle: 'Tu nivel estimado',
      insTopA: 'Con', insTopB: 'palabras activas alcanzás el nivel', insTopC: ', el techo del catálogo MCER. Dominio efectivo del idioma.',
      insMidA: 'palabras activas te ubican en', insMidB: '. Próximo objetivo:',
      gMarker: 'palabras', gAria: 'Escala de vocabulario activo de A1 a C2',
    },
    en: {
      nativoCulto: 'Native/cultured',
      avanzado: 'Advanced',
      intermedioAlto: 'Upper-intermediate',
      intermedio: 'Intermediate',
      basico: 'Basic',
      principiante: 'Beginner',
      dominio: 'Mastery',
      obj10000: '10,000+ for C2',
      obj8000: '8,000 for C1',
      obj4000: '4,000 for B2',
      obj2500: '2,500 for B1',
      obj1500: '1,500 for A2',
      insTitle: 'Your estimated level',
      insTopA: 'With', insTopB: 'active words you reach level', insTopC: ', the top of the CEFR scale. Effective command of the language.',
      insMidA: 'active words place you at', insMidB: '. Next goal:',
      gMarker: 'words', gAria: 'Active vocabulary scale from A1 to C2',
    },
  } as const)[__lang];
  const p=Number(i.palabrasActivas)||0;
  let n='', int_='', obj='';
  if(p>=10000){n='C2';int_=T.nativoCulto;obj=T.dominio}
  else if(p>=8000){n='C1';int_=T.avanzado;obj=T.obj10000}
  else if(p>=4000){n='B2';int_=T.intermedioAlto;obj=T.obj8000}
  else if(p>=2500){n='B1';int_=T.intermedio;obj=T.obj4000}
  else if(p>=1500){n='A2';int_=T.basico;obj=T.obj2500}
  else {n='A1';int_=T.principiante;obj=T.obj1500}

  const isTop = n === 'C2';
  const _insight = {
    title: T.insTitle,
    text: isTop
      ? `${T.insTopA} **${p.toLocaleString(__lang === 'en' ? 'en-US' : 'es-AR')}** ${T.insTopB} **${n}**${T.insTopC}`
      : `**${p.toLocaleString(__lang === 'en' ? 'en-US' : 'es-AR')}** ${T.insMidA} **${n}**${T.insMidB} **${obj}**.`,
    tone: isTop ? 'good' : (n === 'A1' ? 'warn' : 'neutral'),
    icon: '📚',
  };

  const gaugeMax = Math.max(12000, p + 1000);
  const _chart = {
    type: 'scale',
    marker: p,
    markerLabel: `${p.toLocaleString(__lang === 'en' ? 'en-US' : 'es-AR')} ${T.gMarker}`,
    min: 0,
    segments: [
      { nombre: 'A1', max: 1500, color: '#fca5a5', colorDark: '#7f1d1d' },
      { nombre: 'A2', max: 2500, color: '#fcd34d', colorDark: '#78350f' },
      { nombre: 'B1', max: 4000, color: '#fde68a', colorDark: '#854d0e' },
      { nombre: 'B2', max: 8000, color: '#86efac', colorDark: '#166534' },
      { nombre: 'C1', max: 10000, color: '#6ee7b7', colorDark: '#065f46' },
      { nombre: 'C2', max: gaugeMax, color: '#5eead4', colorDark: '#115e59' },
    ],
    ariaLabel: T.gAria,
  };

  return { nivel:n, interpretacion:int_, objetivo:obj, _insight, _chart };
}
