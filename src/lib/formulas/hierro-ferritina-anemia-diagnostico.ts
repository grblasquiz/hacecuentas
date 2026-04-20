export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function hierroFerritinaAnemiaDiagnostico(i: Inputs): Outputs {
  const h=Number(i.hemoglobina)||0; const f=Number(i.ferritina)||0; const sx=String(i.sexo||'mujer');
  const minHb=sx==='hombre'?13:12;
  const anemia=h<minHb?'Sí':'No';
  const reserv=f<15?'Muy bajas (deficiencia)':f<30?'Bajas':f<300?'Normales':'Altas';
  const trat=f<30?'Suplementar hierro oral + vitamina C. Control en 3 meses.':'No indicado por datos aportados.';
  return { anemia:anemia, reservasHierro:reserv, tratamiento:trat };
}
