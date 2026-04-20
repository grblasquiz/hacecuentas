export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function gamingFpsComponentesPcArmarPresupuesto(i: Inputs): Outputs {
  const f=String(i.objetivoFps||'144_1080p');
  const data={'60_1080p':{pr:700,gpu:'RTX 3060 / RX 7600',cpu:'Ryzen 5 5600'},'144_1080p':{pr:1150,gpu:'RTX 4060 Ti / RX 7700 XT',cpu:'Ryzen 5 7600'},'60_4k':{pr:1800,gpu:'RTX 4070 Super',cpu:'Ryzen 7 7700X'},'144_1440p':{pr:1700,gpu:'RTX 4070 Ti / RX 7800 XT',cpu:'Ryzen 7 7700X'},'240_competitive':{pr:2200,gpu:'RTX 4070 Ti Super',cpu:'Ryzen 7 7800X3D'}}[f];
  return { presupuestoTotal:`USD ${data.pr.toLocaleString('en-US')}`, gpuSugerida:data.gpu, cpuSugerido:data.cpu };
}
