export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function bombeoCisternaTanqueWatts(i: Inputs): Outputs {
  const Q = Number(i.Q) || 0; const H = Number(i.H) || 0; const eff = (Number(i.eff) || 60) / 100;
  const Qm3s = Q / 60000;
  const P = Qm3s * 1000 * 9.81 * H / eff;
  const hp = P / 746;
  return { watts: P.toFixed(0) + ' W', hp: hp.toFixed(2) + ' HP',
    resumen: `Bomba ${P.toFixed(0)} W (${hp.toFixed(2)} HP) para ${Q} L/min a ${H} m con η=${(eff*100).toFixed(0)}%.` };
}
