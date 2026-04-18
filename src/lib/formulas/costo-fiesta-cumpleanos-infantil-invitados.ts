export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function costoFiestaCumpleanosInfantilInvitados(i: Inputs): Outputs {
  const n=Number(i.invitados)||0; const l=String(i.nivel||'casa');
  const pc:Record<string,[number,number]>={casa:[5,15],medio:[20,60],lujo:[80,200]};
  const [mi,ma]=pc[l]||pc.casa;
  return { costo:`$${(n*mi).toFixed(0)}-${(n*ma).toFixed(0)}`, perInvitado:`$${mi}-${ma}`, resumen:`${n} invitados ${l}: $${n*mi}-${n*ma}.` };
}
