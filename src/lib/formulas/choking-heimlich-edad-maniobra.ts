export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function chokingHeimlichEdadManiobra(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const e=String(i.edad||'adulto');
  const T = ({
    es: {
      tec: {'adulto':'Heimlich (compresiones abdominales)','nino':'Heimlich ajustado','bebe_menor_1':'5 golpes espalda + 5 compresiones torácicas','embarazada_obeso':'Compresiones torácicas'} as Record<string,string>,
      pos: {'adulto':'Detrás, puño entre ombligo y esternón','nino':'De rodillas detrás','bebe_menor_1':'Boca abajo sobre tu antebrazo','embarazada_obeso':'Detrás, manos sobre esternón'} as Record<string,string>,
      cui: {'adulto':'Si pierde conciencia: RCP','nino':'Fuerza moderada','bebe_menor_1':'Nunca compresiones abdominales','embarazada_obeso':'Nunca en abdomen'} as Record<string,string>,
    },
    en: {
      tec: {'adulto':'Heimlich maneuver (abdominal thrusts)','nino':'Modified Heimlich maneuver','bebe_menor_1':'5 back blows + 5 chest compressions','embarazada_obeso':'Chest thrusts'} as Record<string,string>,
      pos: {'adulto':'Behind, fist between navel and sternum','nino':'Kneeling behind','bebe_menor_1':'Face down on your forearm','embarazada_obeso':'Behind, hands on sternum'} as Record<string,string>,
      cui: {'adulto':'If unconscious: CPR','nino':'Moderate force','bebe_menor_1':'Never abdominal thrusts','embarazada_obeso':'Never on abdomen'} as Record<string,string>,
    },
  } as const)[__lang];
  const tec=T.tec[e];
  const pos=T.pos[e];
  const cui=T.cui[e];
  return { tecnica:tec, posicion:pos, cuidados:cui };
}
