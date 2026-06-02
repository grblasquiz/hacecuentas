export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function sueldoProgramadorDesarrolladorArgentinaSeniority(i: Inputs): Outputs {
  const s=String(i.seniority||'jr'); const m=String(i.modo||'relacion'); const d=Number(i.dolar)||1400;
  const rangosUsd: Record<string,[number,number]> = {
    trainee:[700,1200], jr:[1200,2200], ssr:[2200,3500], sr:[3500,5500], lead:[5000,8000], arch:[7000,12000]
  };
  const [minU,maxU]=rangosUsd[s]||rangosUsd.jr;
  let minAr:number, maxAr:number;
  if (m==='relacion') { minAr=minU*d*0.55; maxAr=maxU*d*0.55; }
  else if (m==='mono') { minAr=minU*d*0.80; maxAr=maxU*d*0.80; }
  else { minAr=minU*d; maxAr=maxU*d; }
  const nivel: Record<string,string> = { trainee:'Trainee', jr:'Junior', ssr:'Semi-senior', sr:'Senior', lead:'Tech Lead', arch:'Arquitecto/a' };
  const modoTxt: Record<string,string> = { relacion:'en relación de dependencia', mono:'como monotributista', freelanceUSD:'freelance cobrando en USD' };
  const arFmt=`$${Math.round(minAr).toLocaleString('es-AR')} a $${Math.round(maxAr).toLocaleString('es-AR')}`;
  const insight = {
    title: 'Tu rango salarial',
    text: m==='freelanceUSD'
      ? `Un perfil **${nivel[s]||'Junior'}** ${modoTxt[m]} apunta a **USD ${minU}-${maxU}** por mes, sin que el dólar te recorte el bolsillo. A $${Math.round(d).toLocaleString('es-AR')}/USD serían unos **${arFmt}**.`
      : `Un perfil **${nivel[s]||'Junior'}** ${modoTxt[m]} ronda **${arFmt}** por mes (equivalente a **USD ${minU}-${maxU}** al cambio de $${Math.round(d).toLocaleString('es-AR')}/USD). ${m==='relacion' ? 'En blanco el bolsillo rinde menos por los aportes; comparalo con monotributo.' : 'El monotributo deja más en mano que la relación de dependencia, pero sin aguinaldo ni vacaciones pagas.'}`,
    tone: 'neutral' as const,
    icon: '💻',
  };
  return { rangoAr:`$${Math.round(minAr).toLocaleString('es-AR')} - $${Math.round(maxAr).toLocaleString('es-AR')}`, rangoUsd:`USD ${minU}-${maxU}`, resumen:`${s} ${m}: ${m==='freelanceUSD'?'USD '+minU+'-'+maxU:'$'+Math.round(minAr).toLocaleString('es-AR')+'-'+Math.round(maxAr).toLocaleString('es-AR')}.`, _insight: insight };
}
