/** Old Fashioned */
export interface Inputs { personas: number; tragosPorPersona: number; mlbourbonPorTrago: number; mljarabesimplePorTrago: number; mlbitterangosturaPorTrago: number; }
export interface Outputs { totalTragos: number; totalbourbon: string; totaljarabesimple: string; totalbitterangostura: string; listaCompras: string; }

export function oldFashionedCantidadInvitados(i: Inputs): Outputs {
  const p = Number(i.personas);
  const t = Number(i.tragosPorPersona);
  const b = Number(i.mlbourbonPorTrago);
  const j = Number(i.mljarabesimplePorTrago);
  const bit = Number(i.mlbitterangosturaPorTrago);
  if (!p || p <= 0) throw new Error('Ingresá personas');
  if (!t || t <= 0) throw new Error('Ingresá tragos por persona');

  const tot = p * t;
  const tB = b * tot;
  const tJ = j * tot;
  const tBit = bit * tot;
  const fmt = (ml: number) => `${ml}ml (${(ml / 1000).toFixed(2)}L)`;
  const lista = `Bourbon: ${fmt(Math.ceil(tB * 1.15))} (${Math.ceil(tB * 1.15 / 750)} botellas) | Jarabe: ${fmt(Math.ceil(tJ * 1.15))} | Angostura: ${Math.ceil(tBit / 2)} dashes | Naranjas: ${Math.ceil(tot / 4)}`;

  return {
    totalTragos: tot,
    totalbourbon: fmt(tB),
    totaljarabesimple: fmt(tJ),
    totalbitterangostura: `${tBit} ml (${Math.ceil(tBit / 2)} dashes)`,
    listaCompras: lista,
  };
}
