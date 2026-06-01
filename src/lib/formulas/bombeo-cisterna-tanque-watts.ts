export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }
export function bombeoCisternaTanqueWatts(i: Inputs): Outputs {
  const Q = Number(i.Q) || 0; const H = Number(i.H) || 0; const eff = (Number(i.eff) || 60) / 100;
  const Qm3s = Q / 60000;
  const P = Qm3s * 1000 * 9.81 * H / eff;
  const hp = P / 746;
  const hpComercial = hp <= 0.5 ? '1/2 HP' : hp <= 0.75 ? '3/4 HP' : hp <= 1 ? '1 HP' : hp <= 1.5 ? '1½ HP' : hp <= 2 ? '2 HP' : `${Math.ceil(hp)} HP`;
  const _insight = {
    title: 'Bomba recomendada',
    text: `Necesitás **${P.toFixed(0)} W** (**${hp.toFixed(2)} HP** teóricos) para elevar **${Q} L/min** a **${H} m**. En la práctica comprá una bomba comercial de **${hpComercial}** para tener margen ante pérdidas de carga en cañerías y codos.`,
    tone: 'neutral',
    icon: '💧',
  };
  return { watts: P.toFixed(0) + ' W', hp: hp.toFixed(2) + ' HP',
    resumen: `Bomba ${P.toFixed(0)} W (${hp.toFixed(2)} HP) para ${Q} L/min a ${H} m con η=${(eff*100).toFixed(0)}%.`,
    _insight };
}
