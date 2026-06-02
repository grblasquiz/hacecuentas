export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | Record<string, any>; }
export function costoFiestaCumpleanosInfantilInvitados(i: Inputs): Outputs {
  const n=Number(i.invitados)||0; const l=String(i.nivel||'casa');
  const pc:Record<string,[number,number]>={casa:[5,15],medio:[20,60],lujo:[80,200]};
  const [mi,ma]=pc[l]||pc.casa;
  const nivelLbl:Record<string,string>={casa:'en casa',medio:'salón económico',lujo:'salón premium'};
  const _insight={
    title:'Lo que vas a gastar',
    text:`Una fiesta **${nivelLbl[l]||l}** para **${n} ${n===1?'invitado':'invitados'}** te sale entre **$${n*mi}** y **$${n*ma}**, o sea $${mi}-${ma} por chico. El número de invitados es la palanca que más mueve el total: cada nene de más multiplica todo el presupuesto.`,
    tone:l==='lujo'?'warn':'neutral',
    icon:'🎂',
  };
  return { costo:`$${(n*mi).toFixed(0)}-${(n*ma).toFixed(0)}`, perInvitado:`$${mi}-${ma}`, resumen:`${n} invitados ${l}: $${n*mi}-${n*ma}.`, _insight };
}
