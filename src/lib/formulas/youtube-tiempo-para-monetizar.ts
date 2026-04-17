/** YT tiempo monetizar */
export interface YoutubeTiempoParaMonetizarInputs { subsActuales: number; horasActuales: number; subsMes: number; horasMes: number; }
export interface YoutubeTiempoParaMonetizarOutputs { mesesParaSubs: number; mesesParaHoras: number; mesesTotal: number; cuelloBotella: string; }
export function youtubeTiempoParaMonetizar(i: YoutubeTiempoParaMonetizarInputs): YoutubeTiempoParaMonetizarOutputs {
  const s=Number(i.subsActuales), h=Number(i.horasActuales), sm=Number(i.subsMes), hm=Number(i.horasMes);
  if (sm<=0) throw new Error('Subs/mes > 0');
  if (hm<=0) throw new Error('Horas/mes > 0');
  const ms = s>=1000 ? 0 : Math.ceil((1000-s)/sm);
  const mh = h>=4000 ? 0 : Math.ceil((4000-h)/hm);
  const tot = Math.max(ms, mh);
  const cb = ms>mh ? 'Te frenan los suscriptores' : mh>ms ? 'Te frenan las 4000 horas' : 'Ambos al mismo nivel';
  return { mesesParaSubs: ms, mesesParaHoras: mh, mesesTotal: tot, cuelloBotella: cb };
}
