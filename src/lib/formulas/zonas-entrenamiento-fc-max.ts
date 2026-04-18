export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function zonasEntrenamientoFcMax(i: Inputs): Outputs {
  const e = Number(i.edad) || 30; const fr = Number(i.fcReposo) || 60;
  const fm = 208 - 0.7 * e;
  const reserve = fm - fr;
  const zona = (pct: number) => Math.round(fr + reserve * pct);
  const z1 = `${zona(0)}-${zona(0.6)}`; const z2 = `${zona(0.6)}-${zona(0.7)}`;
  const z3 = `${zona(0.7)}-${zona(0.8)}`; const z4 = `${zona(0.8)}-${zona(0.9)}`; const z5 = `${zona(0.9)}-${zona(1)}`;
  return { fcMax: fm.toFixed(0), zonas: `Z1 ${z1} | Z2 ${z2} | Z3 ${z3} | Z4 ${z4} | Z5 ${z5}`,
    resumen: `FC máx ${fm.toFixed(0)} bpm. Zonas por Karvonen: Z2 ${z2} (base aeróbica).` };
}
