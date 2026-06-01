export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function hierroFerritinaAnemiaDiagnostico(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      anemiaYes: 'Sí',
      anemiaNo: 'No',
      reservMuyBajas: 'Muy bajas (deficiencia)',
      reservBajas: 'Bajas',
      reservNormales: 'Normales',
      reservAltas: 'Altas',
      tratSuplementar: 'Suplementar hierro oral + vitamina C. Control en 3 meses.',
      tratNoIndicado: 'No indicado por datos aportados.',
    },
    en: {
      anemiaYes: 'Yes',
      anemiaNo: 'No',
      reservMuyBajas: 'Very low (deficiency)',
      reservBajas: 'Low',
      reservNormales: 'Normal',
      reservAltas: 'High',
      tratSuplementar: 'Supplement oral iron + vitamin C. Follow up in 3 months.',
      tratNoIndicado: 'Not indicated based on the data provided.',
    },
  } as const)[__lang];
  const h=Number(i.hemoglobina)||0; const f=Number(i.ferritina)||0; const sx=String(i.sexo||'mujer');
  const minHb=sx==='hombre'?13:12;
  const anemia=h<minHb?T.anemiaYes:T.anemiaNo;
  const reserv=f<15?T.reservMuyBajas:f<30?T.reservBajas:f<300?T.reservNormales:T.reservAltas;
  const trat=f<30?T.tratSuplementar:T.tratNoIndicado;
  return { anemia:anemia, reservasHierro:reserv, tratamiento:trat };
}
