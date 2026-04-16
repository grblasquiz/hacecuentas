/** Calculadora Parsec-Años Luz — d(pc) = 1/p(arcsec) */
export interface Inputs { parsec?: number; anosLuz?: number; paralaje?: number; }
export interface Outputs { resultado: string; parsecOut: number; anosLuzOut: number; km: string; }

export function distanciaEstrellaParsec(i: Inputs): Outputs {
  const pc = i.parsec && Number(i.parsec) > 0 ? Number(i.parsec) : null;
  const ly = i.anosLuz && Number(i.anosLuz) > 0 ? Number(i.anosLuz) : null;
  const p = i.paralaje && Number(i.paralaje) > 0 ? Number(i.paralaje) : null;

  if (!pc && !ly && !p) throw new Error('Ingresá al menos un valor: parsec, años luz o paralaje');

  let parsec: number;
  if (pc !== null) parsec = pc;
  else if (ly !== null) parsec = ly / 3.26156;
  else parsec = 1 / p!;

  const anosLuz = parsec * 3.26156;
  const kmVal = parsec * 3.08568e13;

  return {
    resultado: `${parsec.toFixed(4)} pc = ${anosLuz.toFixed(4)} años luz`,
    parsecOut: Number(parsec.toFixed(6)),
    anosLuzOut: Number(anosLuz.toFixed(6)),
    km: `${kmVal.toExponential(4)} km`,
  };
}
