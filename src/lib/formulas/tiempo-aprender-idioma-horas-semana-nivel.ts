export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function tiempoAprenderIdiomaHorasSemanaNivel(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const l=String(i.idioma||'ingles'); const h=Number(i.horasSemana)||1; const n=String(i.nivelActual||'cero');
  const horasB2={'ingles':700,'portugues':600,'italiano':650,'frances':650,'aleman':900,'japones':2200,'mandarin':2200,'arabe':2200}[l];
  const descuento={'cero':0,'a1':100,'a2':250,'b1':450}[n];
  const restante=horasB2-descuento;
  const semanas=Math.ceil(restante/h);
  const semanasB2=__lang==='en'?`${semanas} weeks (${(semanas/52).toFixed(1)} years)`:`${semanas} semanas (${(semanas/52).toFixed(1)} años)`;
  const horasTotales=__lang==='en'?`${restante} remaining hours`:`${restante} horas restantes`;
  const consejo=l==='japones'||l==='mandarin'
    ?(__lang==='en'?'Difficult language: prioritize immersion or apps like Anki.':'Idioma difícil: priorizar inmersión o apps como Anki.')
    :(__lang==='en'?'Consistency > intensity. 1 hour a day > 7 h in a single day.':'Consistencia > intensidad. 1 hora diaria > 7 h un solo día.');
  return { semanasB2, horasTotales, consejo };
}
