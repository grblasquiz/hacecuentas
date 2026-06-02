/** YT tiempo monetizar */
export interface YoutubeTiempoParaMonetizarInputs { subsActuales: number; horasActuales: number; subsMes: number; horasMes: number; }
export interface YoutubeTiempoParaMonetizarOutputs { mesesParaSubs: number; mesesParaHoras: number; mesesTotal: number; cuelloBotella: string; _insight?: any; }
export function youtubeTiempoParaMonetizar(i: YoutubeTiempoParaMonetizarInputs): YoutubeTiempoParaMonetizarOutputs {
  const s=Number(i.subsActuales), h=Number(i.horasActuales), sm=Number(i.subsMes), hm=Number(i.horasMes);
  if (sm<=0) throw new Error('Subs/mes > 0');
  if (hm<=0) throw new Error('Horas/mes > 0');
  const ms = s>=1000 ? 0 : Math.ceil((1000-s)/sm);
  const mh = h>=4000 ? 0 : Math.ceil((4000-h)/hm);
  const tot = Math.max(ms, mh);
  const cb = ms>mh ? 'Te frenan los suscriptores' : mh>ms ? 'Te frenan las 4000 horas' : 'Ambos al mismo nivel';

  const yaListo = tot === 0;
  const cuelloTxt = ms > mh
    ? `lo que te frena son los **suscriptores** (${ms} meses vs ${mh} de horas)`
    : mh > ms
      ? `lo que te frena son las **4.000 horas de reproducción** (${mh} meses vs ${ms} de subs)`
      : 'ambos requisitos llegan **a la par**';
  const _insight = {
    title: yaListo ? 'Ya cumplís los requisitos' : 'Cuándo activás la monetización',
    text: yaListo
      ? 'Ya alcanzaste los **1.000 suscriptores** y las **4.000 horas**: podés postular al Programa de Socios de YouTube ahora mismo.'
      : `A tu ritmo actual llegás a los requisitos en **${tot} ${tot === 1 ? 'mes' : 'meses'}**: ${cuelloTxt}. Acelerá ese flanco para adelantar la fecha.`,
    tone: yaListo ? 'good' : (tot <= 6 ? 'good' : 'neutral'),
    icon: '▶️',
  };
  return { mesesParaSubs: ms, mesesParaHoras: mh, mesesTotal: tot, cuelloBotella: cb, _insight };
}
