export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function escaleraHuellaContrahuellaLeyBlondel(i: Inputs): Outputs {
  const H = Number(i.altura) || 0; const P = Number(i.profundidad) || 0;
  const nEscalones = Math.ceil(H / 18);
  const c = H / nEscalones; const h = P / nEscalones;
  const blondel = h + 2 * c;
  return {
    escalones: nEscalones.toString(), huella: h.toFixed(1), contrahuella: c.toFixed(1),
    resumen: `${nEscalones} escalones: huella ${h.toFixed(0)} cm, contrahuella ${c.toFixed(0)} cm. Blondel: ${blondel.toFixed(0)} ${blondel >= 62 && blondel <= 64 ? '✓' : '(ajustar)'}.`
  };
}
