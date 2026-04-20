export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function chokingHeimlichEdadManiobra(i: Inputs): Outputs {
  const e=String(i.edad||'adulto');
  const tec={'adulto':'Heimlich (compresiones abdominales)','nino':'Heimlich ajustado','bebe_menor_1':'5 golpes espalda + 5 compresiones torácicas','embarazada_obeso':'Compresiones torácicas'}[e];
  const pos={'adulto':'Detrás, puño entre ombligo y esternón','nino':'De rodillas detrás','bebe_menor_1':'Boca abajo sobre tu antebrazo','embarazada_obeso':'Detrás, manos sobre esternón'}[e];
  const cui={'adulto':'Si pierde conciencia: RCP','nino':'Fuerza moderada','bebe_menor_1':'Nunca compresiones abdominales','embarazada_obeso':'Nunca en abdomen'}[e];
  return { tecnica:tec, posicion:pos, cuidados:cui };
}
