export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; }
export function chokingHeimlichEdadManiobra(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const e=String(i.edad||'adulto');
  const T = ({
    es: {
      tec: {'adulto':'Heimlich (compresiones abdominales)','nino':'Heimlich ajustado','bebe_menor_1':'5 golpes espalda + 5 compresiones torácicas','embarazada_obeso':'Compresiones torácicas'} as Record<string,string>,
      pos: {'adulto':'Detrás, puño entre ombligo y esternón','nino':'De rodillas detrás','bebe_menor_1':'Boca abajo sobre tu antebrazo','embarazada_obeso':'Detrás, manos sobre esternón'} as Record<string,string>,
      cui: {'adulto':'Si pierde conciencia: RCP','nino':'Fuerza moderada','bebe_menor_1':'Nunca compresiones abdominales','embarazada_obeso':'Nunca en abdomen'} as Record<string,string>,
      insTitle: 'Llamá al 911/112 ya',
      insText: {'adulto':'Aplicá **Heimlich (compresiones abdominales)** y si pierde el conocimiento empezá **RCP**. Que alguien llame a emergencias en paralelo.','nino':'Usá el **Heimlich ajustado con fuerza moderada**; si se desmaya, pasá a **RCP**. Pedí emergencias ya.','bebe_menor_1':'Alterná **5 golpes en la espalda + 5 compresiones torácicas**. **Nunca** hagas compresiones abdominales en un bebé. Llamá a emergencias.','embarazada_obeso':'Hacé **compresiones torácicas**, nunca sobre el abdomen. Si pierde conciencia, **RCP** y emergencias.'} as Record<string,string>,
    },
    en: {
      tec: {'adulto':'Heimlich maneuver (abdominal thrusts)','nino':'Modified Heimlich maneuver','bebe_menor_1':'5 back blows + 5 chest compressions','embarazada_obeso':'Chest thrusts'} as Record<string,string>,
      pos: {'adulto':'Behind, fist between navel and sternum','nino':'Kneeling behind','bebe_menor_1':'Face down on your forearm','embarazada_obeso':'Behind, hands on sternum'} as Record<string,string>,
      cui: {'adulto':'If unconscious: CPR','nino':'Moderate force','bebe_menor_1':'Never abdominal thrusts','embarazada_obeso':'Never on abdomen'} as Record<string,string>,
      insTitle: 'Call 911 now',
      insText: {'adulto':'Give **Heimlich (abdominal thrusts)**; if they go unconscious, start **CPR**. Have someone call emergency services in parallel.','nino':'Use the **modified Heimlich with moderate force**; if they faint, switch to **CPR**. Call for help now.','bebe_menor_1':'Alternate **5 back blows + 5 chest compressions**. **Never** do abdominal thrusts on a baby. Call emergency services.','embarazada_obeso':'Use **chest thrusts**, never on the abdomen. If they lose consciousness, **CPR** and call for help.'} as Record<string,string>,
    },
  } as const)[__lang];
  const tec=T.tec[e];
  const pos=T.pos[e];
  const cui=T.cui[e];
  return {
    tecnica:tec, posicion:pos, cuidados:cui,
    _insight: { title: T.insTitle, text: T.insText[e], tone: 'warn', icon: '🆘' },
  };
}
