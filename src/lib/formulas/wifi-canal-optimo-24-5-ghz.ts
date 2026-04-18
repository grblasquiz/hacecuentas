export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function wifiCanalOptimo245Ghz(i: Inputs): Outputs {
  const b=String(i.banda||'24');
  if (b==='24') return { canales:'1, 6, 11', consejos:'Ancho 20 MHz', resumen:'Usar canales 1/6/11 únicos sin solape.' };
  return { canales:'36-48, 149-165', consejos:'DFS 52-144 requiere radar check', resumen:'5 GHz: 36/149 seguros, evitar DFS si hay cortes.' };
}
