/** m² totales de casa sumando ambientes (cubierto + semicubierto con coef) */
export interface Inputs {
  dormitorios: number;
  m2PorDormitorio: number;
  living: number;
  cocina: number;
  banos: number;
  m2PorBano: number;
  lavadero?: number;
  otrosCubiertos?: number;
  patio?: number;        // semicubierto
  galeria?: number;      // semicubierto
  balcon?: number;       // semicubierto
  coefSemi?: number;     // coeficiente para semicubierto (0.5 típico)
}

export interface Outputs {
  m2Cubiertos: number;
  m2SemicubiertosReales: number;
  m2SemicubiertosPonderados: number;
  m2TotalConstruido: number;
  resumen: string;
}

export function m2CasaPlanos(i: Inputs): Outputs {
  const dormN = Number(i.dormitorios || 0);
  const dormM2 = Number(i.m2PorDormitorio || 0);
  const living = Number(i.living || 0);
  const cocina = Number(i.cocina || 0);
  const banosN = Number(i.banos || 0);
  const banoM2 = Number(i.m2PorBano || 0);
  const lav = Number(i.lavadero || 0);
  const otros = Number(i.otrosCubiertos || 0);
  const patio = Number(i.patio || 0);
  const galeria = Number(i.galeria || 0);
  const balcon = Number(i.balcon || 0);
  const coef = Number(i.coefSemi ?? 0.5);

  const cubiertos = dormN * dormM2 + living + cocina + banosN * banoM2 + lav + otros;
  const semiReales = patio + galeria + balcon;
  const semiPond = semiReales * coef;
  const total = cubiertos + semiPond;

  if (cubiertos <= 0 && semiReales <= 0) throw new Error('Ingresá al menos un ambiente');

  return {
    m2Cubiertos: Number(cubiertos.toFixed(2)),
    m2SemicubiertosReales: Number(semiReales.toFixed(2)),
    m2SemicubiertosPonderados: Number(semiPond.toFixed(2)),
    m2TotalConstruido: Number(total.toFixed(2)),
    resumen: `Casa con **${cubiertos.toFixed(2)} m² cubiertos** + ${semiReales.toFixed(2)} m² semicubiertos (×${coef} = ${semiPond.toFixed(2)} m²) = **${total.toFixed(2)} m² construidos totales**.`,
  };
}
