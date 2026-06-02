export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
const FPS_LABELS: Record<string, string> = {
  '60_1080p': '60 FPS en 1080p',
  '144_1080p': '144 FPS en 1080p',
  '60_4k': '60 FPS en 4K',
  '144_1440p': '144 FPS en 1440p',
  '240_competitive': '240 FPS competitivo',
};
export function gamingFpsComponentesPcArmarPresupuesto(i: Inputs): Outputs {
  const f=String(i.objetivoFps||'144_1080p');
  const data={'60_1080p':{pr:700,gpu:'RTX 3060 / RX 7600',cpu:'Ryzen 5 5600'},'144_1080p':{pr:1150,gpu:'RTX 4060 Ti / RX 7700 XT',cpu:'Ryzen 5 7600'},'60_4k':{pr:1800,gpu:'RTX 4070 Super',cpu:'Ryzen 7 7700X'},'144_1440p':{pr:1700,gpu:'RTX 4070 Ti / RX 7800 XT',cpu:'Ryzen 7 7700X'},'240_competitive':{pr:2200,gpu:'RTX 4070 Ti Super',cpu:'Ryzen 7 7800X3D'}}[f];
  const objetivo = FPS_LABELS[f] || f;
  const _insight = {
    title: `Build para ${objetivo}`,
    text: `Para apuntar a **${objetivo}** necesitás un presupuesto de **USD ${data.pr.toLocaleString('en-US')}**, con una **${data.gpu}** como GPU y una **${data.cpu}**. La GPU es la que manda los FPS; no escatimes ahí.`,
    tone: 'neutral',
    icon: '🎮',
  };
  return { presupuestoTotal:`USD ${data.pr.toLocaleString('en-US')}`, gpuSugerida:data.gpu, cpuSugerido:data.cpu, _insight };
}
