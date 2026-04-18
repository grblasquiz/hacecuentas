export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function efectoDopplerVelocidadFrecuencia(i: Inputs): Outputs {
  const f = Number(i.f); const vs = Number(i.vs); const vo = Number(i.vo) || 0;
  const v = Number(i.v) || 343; const dir = String(i.direccion);
  if (!f || vs === undefined) throw new Error('Completá');
  let fp: number;
  if (dir === 'acerca') fp = f * (v + vo) / (v - vs);
  else fp = f * (v - vo) / (v + vs);
  return { fPercibida: fp.toFixed(1) + ' Hz', resumen: `Frecuencia percibida: ${fp.toFixed(0)} Hz ${dir === 'acerca' ? '(más aguda)' : '(más grave)'}.` };
}
