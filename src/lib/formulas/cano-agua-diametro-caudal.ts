export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function canoAguaDiametroCaudal(i: Inputs): Outputs {
  const Q_ls = Number(i.Q) || 0;
  const Qm3s = Q_ls / 1000;
  const V = 1.5;
  const A = Qm3s / V;
  const d = Math.sqrt(4 * A / Math.PI) * 1000;
  const comerciales = [13, 20, 25, 32, 40, 50, 63, 75, 90, 110];
  const next = comerciales.find(x => x >= d) || d;
  return { diametro: d.toFixed(0) + ' mm', canoComercial: next + ' mm',
    resumen: `Ø ${d.toFixed(0)} mm necesario (V=1.5 m/s). Comercial: ${next} mm.` };
}
