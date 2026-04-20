export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function tiempoAprenderIdiomaHorasSemanaNivel(i: Inputs): Outputs {
  const l=String(i.idioma||'ingles'); const h=Number(i.horasSemana)||1; const n=String(i.nivelActual||'cero');
  const horasB2={'ingles':700,'portugues':600,'italiano':650,'frances':650,'aleman':900,'japones':2200,'mandarin':2200,'arabe':2200}[l];
  const descuento={'cero':0,'a1':100,'a2':250,'b1':450}[n];
  const restante=horasB2-descuento;
  const semanas=Math.ceil(restante/h);
  return { semanasB2:`${semanas} semanas (${(semanas/52).toFixed(1)} años)`, horasTotales:`${restante} horas restantes`, consejo:l==='japones'||l==='mandarin'?'Idioma difícil: priorizar inmersión o apps como Anki.':'Consistencia > intensidad. 1 hora diaria > 7 h un solo día.' };
}
