export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function dietaMediterraneaAdherenciaScoreTest(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      alta: 'Alta',
      media: 'Media',
      baja: 'Baja',
      consejoMejorar: 'Sumá más vegetales, pescado y aceite oliva.',
      consejoBuena: 'Buena base. Optimizar detalles.',
      versionReducida: 'versión reducida',
    },
    en: {
      alta: 'High',
      media: 'Medium',
      baja: 'Low',
      consejoMejorar: 'Add more vegetables, fish and olive oil.',
      consejoBuena: 'Good foundation. Optimize the details.',
      versionReducida: 'reduced version',
    },
  } as const)[__lang];
  const a=String(i.aceiteOliva||'no')==='si'?1:0;
  const p=String(i.pescadoSemana||'no')==='si'?1:0;
  const v=String(i.vinoTintoDiario||'no')==='si'?1:0;
  const f=String(i.frutasDiarias||'no')==='si'?1:0;
  const total=a+p+v+f;
  const adh=total>=3?T.alta:total>=2?T.media:T.baja;
  const cons=total<3?T.consejoMejorar:T.consejoBuena;
  return { puntaje:`${total}/4 (${T.versionReducida})`, adherencia:adh, consejo:cons };
}
