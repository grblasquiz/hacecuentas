export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function densidadPixelesPantallaPpiRetina(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errDiag: 'Diagonal no puede ser 0.', yes: 'Sí', near: 'Cercano', no: 'No', enLabel: 'en',
      insTitle: 'Nitidez de tu pantalla',
      insRetina: (ppi: string) => `Con **${ppi} PPI** tu pantalla es **densidad Retina**: a distancia normal el ojo no distingue píxeles individuales.`,
      insNear: (ppi: string) => `Con **${ppi} PPI** estás **cerca de Retina**: la imagen se ve nítida, aunque de muy cerca podrían notarse los píxeles.`,
      insLow: (ppi: string) => `Con **${ppi} PPI** la densidad es **baja**: a distancia corta vas a distinguir píxeles individuales.`,
      gLow: 'Baja', gNear: 'Cercano', gRetina: 'Retina',
      gAria: (ppi: string) => `Densidad de ${ppi} PPI sobre la escala de nitidez`,
    },
    en: {
      errDiag: 'Diagonal cannot be 0.', yes: 'Yes', near: 'Near', no: 'No', enLabel: 'in',
      insTitle: 'Your screen sharpness',
      insRetina: (ppi: string) => `At **${ppi} PPI** your screen is **Retina density**: at normal viewing distance the eye cannot make out individual pixels.`,
      insNear: (ppi: string) => `At **${ppi} PPI** you are **near Retina**: the image looks sharp, though pixels may show up very close.`,
      insLow: (ppi: string) => `At **${ppi} PPI** the density is **low**: at short distance you will notice individual pixels.`,
      gLow: 'Low', gNear: 'Near', gRetina: 'Retina',
      gAria: (ppi: string) => `Density of ${ppi} PPI on the sharpness scale`,
    },
  } as const)[__lang];
  const w=Number(i.ancho)||0; const h=Number(i.alto)||0; const d=Number(i.diag)||0;
  if (d===0) return { ppi:'—', retina:'—', resumen: T.errDiag };
  const ppi=Math.sqrt(w*w+h*h)/d;
  const retina=ppi>=300?T.yes:(ppi>=200?T.near:T.no);
  const resumen = __lang === 'en'
    ? `${w}×${h} at ${d}" = ${ppi.toFixed(0)} PPI.`
    : `${w}×${h} en ${d}" = ${ppi.toFixed(0)} PPI.`;
  const ppiStr = ppi.toFixed(0);
  const tono: 'good' | 'warn' | 'neutral' = ppi >= 300 ? 'good' : (ppi >= 200 ? 'neutral' : 'warn');
  const _insight = {
    title: T.insTitle,
    text: ppi >= 300 ? T.insRetina(ppiStr) : (ppi >= 200 ? T.insNear(ppiStr) : T.insLow(ppiStr)),
    tone: tono,
    icon: '🖥️',
  };
  const _chart = {
    type: 'scale',
    marker: Number(ppi.toFixed(0)),
    markerLabel: `${ppiStr} PPI`,
    min: 0,
    segments: [
      { nombre: T.gLow, max: 200, color: '#f59e0b', colorDark: '#b45309' },
      { nombre: T.gNear, max: 300, color: '#60a5fa', colorDark: '#2563eb' },
      { nombre: T.gRetina, max: Math.max(500, Math.ceil(ppi) + 50), color: '#22c55e', colorDark: '#15803d' },
    ],
    ariaLabel: T.gAria(ppiStr),
  };
  return { ppi:ppi.toFixed(1), retina, resumen, _insight, _chart };
}
