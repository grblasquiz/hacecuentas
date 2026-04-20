export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function veganaProteinaCompletaCombinacionAminoacidos(i: Inputs): Outputs {
  const p=String(i.plato||'lentejas_arroz');
  const data={'lentejas_arroz':{c:'Sí',lim:'Ninguno',pd:0.95},'hummus_pan_pita':{c:'Sí',lim:'Ninguno',pd:0.9},'tofu_quinoa':{c:'Excelente',lim:'Ninguno (ambos completos)',pd:1.0},'mani_pan_integral':{c:'Casi',lim:'Trazas metionina',pd:0.85},'poroto_maiz':{c:'Sí',lim:'Ninguno',pd:0.9}};
  const d=data[p];
  return { completo:d.c, aminoacidoLimitante:d.lim, pdcaas:`${d.pd}` };
}
