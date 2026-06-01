export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function veganaProteinaCompletaCombinacionAminoacidos(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const p=String(i.plato||'lentejas_arroz');
  const data={
    'lentejas_arroz':{c:{es:'Sí',en:'Yes',pt:'Sim'},lim:{es:'Ninguno',en:'None',pt:'Nenhum'},pd:0.95},
    'hummus_pan_pita':{c:{es:'Sí',en:'Yes',pt:'Sim'},lim:{es:'Ninguno',en:'None',pt:'Nenhum'},pd:0.9},
    'tofu_quinoa':{c:{es:'Excelente',en:'Excellent',pt:'Excelente'},lim:{es:'Ninguno (ambos completos)',en:'None (both complete)',pt:'Nenhum (ambos completos)'},pd:1.0},
    'mani_pan_integral':{c:{es:'Casi',en:'Almost',pt:'Quase'},lim:{es:'Trazas metionina',en:'Methionine traces',pt:'Traços de metionina'},pd:0.85},
    'poroto_maiz':{c:{es:'Sí',en:'Yes',pt:'Sim'},lim:{es:'Ninguno',en:'None',pt:'Nenhum'},pd:0.9}
  };
  const d=data[p];
  return { completo:d.c[__lang], aminoacidoLimitante:d.lim[__lang], pdcaas:`${d.pd}` };
}
