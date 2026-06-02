export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function envejecerMascotaHumanoTablaRazaTamano(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: {
      cachorro: 'Cachorro/Junior',
      adultoJoven: 'Adulto joven',
      adulto: 'Adulto',
      senior: 'Senior',
      geriatria: 'Geriatría',
      anios: 'años',
      insTitle: 'Qué significa esta edad',
      etapaVida: 'Etapa de vida',
      scaleAria: 'Edad humana equivalente ubicada en la etapa de vida',
    },
    en: {
      cachorro: 'Puppy/Junior',
      adultoJoven: 'Young adult',
      adulto: 'Adult',
      senior: 'Senior',
      geriatria: 'Geriatric',
      anios: 'years',
      insTitle: 'What this age means',
      etapaVida: 'Life stage',
      scaleAria: 'Equivalent human age placed on the life stage',
    },
    pt: {
      cachorro: 'Filhote/Júnior',
      adultoJoven: 'Adulto jovem',
      adulto: 'Adulto',
      senior: 'Sênior',
      geriatria: 'Geriátrico',
      anios: 'anos',
      insTitle: 'O que significa esta idade',
      etapaVida: 'Fase de vida',
      scaleAria: 'Idade humana equivalente na fase de vida',
    },
  } as const)[__lang];
  const t=String(i.tipo||'perro_mediano'); const e=Number(i.edadMascota)||0;
  let h=0;
  if(t==='gato'){ if(e<1) h=e*15; else if(e<2) h=15+(e-1)*9; else h=24+(e-2)*4; }
  else {
    const multByTamano={'perro_chico':4,'perro_mediano':5,'perro_grande':6,'perro_gigante':7}[t];
    if(e<1) h=e*15; else if(e<2) h=15+(e-1)*9; else h=24+(e-2)*multByTamano;
  }
  let etapa='';
  if(h<12) etapa=T.cachorro;
  else if(h<30) etapa=T.adultoJoven;
  else if(h<55) etapa=T.adulto;
  else if(h<70) etapa=T.senior;
  else etapa=T.geriatria;
  const edadHumana = __lang === 'en'
    ? `~${Math.round(h)} years`
    : __lang === 'pt' ? `~${Math.round(h)} anos`
    : `~${Math.round(h)} años`;
  const observacion = __lang === 'en'
    ? `${e} pet year${e>1?'s':''} ≈ ${Math.round(h)} human years (${etapa}).`
    : __lang === 'pt' ? `${e} ano${e>1?'s':''} do pet ≈ ${Math.round(h)} anos humanos (${etapa}).`
    : `${e} año${e>1?'s':''} mascota ≈ ${Math.round(h)} humanos (${etapa}).`;
  const hr = Math.round(h);
  const _insight = {
    title: T.insTitle,
    text: __lang === 'en'
      ? `Each of your pet's ${e} year${e>1?'s':''} maps to roughly **${hr} human years**, placing it in the **${etapa}** stage. Early years age fastest, then the pace settles into a steadier ratio.`
      : __lang === 'pt'
      ? `Cada um dos ${e} ano${e>1?'s':''} do seu pet equivale a cerca de **${hr} anos humanos**, o que o coloca na fase **${etapa}**. Os primeiros anos envelhecem mais rápido e depois o ritmo estabiliza.`
      : `Cada uno de los ${e} año${e>1?'s':''} de tu mascota equivale a unos **${hr} años humanos**, lo que la ubica en la etapa **${etapa}**. Los primeros años envejecen más rápido y después el ritmo se estabiliza.`,
    tone: (h >= 70 ? 'warn' : h >= 55 ? 'neutral' : 'good'),
    icon: t === 'gato' ? '🐱' : '🐶',
  };
  const _chart = {
    type: 'scale',
    marker: hr,
    markerLabel: `${hr} ${T.anios} · ${etapa}`,
    min: 0,
    segments: [
      { nombre: T.cachorro, max: 12, color: '#86efac', colorDark: '#22c55e' },
      { nombre: T.adultoJoven, max: 30, color: '#bef264', colorDark: '#84cc16' },
      { nombre: T.adulto, max: 55, color: '#fde047', colorDark: '#eab308' },
      { nombre: T.senior, max: 70, color: '#fdba74', colorDark: '#f97316' },
      { nombre: T.geriatria, max: Math.max(90, hr + 5), color: '#fca5a5', colorDark: '#ef4444' },
    ],
    ariaLabel: T.scaleAria,
  };
  return { edadHumana, etapa, observacion, _insight, _chart };
}
