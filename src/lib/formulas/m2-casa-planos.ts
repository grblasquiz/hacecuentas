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
  _insight?: any;
  _chart?: any;
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

  const cubR = Number(cubiertos.toFixed(2));
  const semiPondR = Number(semiPond.toFixed(2));
  const totalR = Number(total.toFixed(2));
  const pctSemi = total > 0 ? (semiPond / total) * 100 : 0;

  const insight = semiReales > 0
    ? {
        title: 'Cubiertos vs. semicubiertos',
        text: `De los **${totalR.toFixed(2)} m² construidos**, ${cubR.toFixed(2)} m² son cubiertos y ${semiReales.toFixed(2)} m² semicubiertos que ponderan al ×${coef} (${semiPondR.toFixed(2)} m², el **${pctSemi.toFixed(0)}%** del total). Confirmá el coeficiente con tu municipio: algunos exigen ×0,5 y otros computan la galería al 100%.`,
        tone: 'neutral',
        icon: '🏠',
      }
    : {
        title: 'Superficie construida',
        text: `Sumás **${cubR.toFixed(2)} m² cubiertos** sin semicubiertos. Si tenés galería, patio o balcón, agregalos: suelen computar a la mitad para la superficie construida total.`,
        tone: 'neutral',
        icon: '🏠',
      };

  const chart = semiPondR > 0
    ? {
        type: 'doughnut' as const,
        slices: [
          { label: 'Cubiertos', value: cubR },
          { label: `Semicubiertos (×${coef})`, value: semiPondR },
        ],
        prefix: '',
        centerValue: totalR.toFixed(2) + ' m²',
        centerLabel: 'Total construido',
        ariaLabel: 'Composición de la superficie construida: metros cubiertos más semicubiertos ponderados.',
      }
    : undefined;

  return {
    m2Cubiertos: cubR,
    m2SemicubiertosReales: Number(semiReales.toFixed(2)),
    m2SemicubiertosPonderados: semiPondR,
    m2TotalConstruido: totalR,
    resumen: `Casa con **${cubiertos.toFixed(2)} m² cubiertos** + ${semiReales.toFixed(2)} m² semicubiertos (×${coef} = ${semiPond.toFixed(2)} m²) = **${total.toFixed(2)} m² construidos totales**.`,
    _insight: insight,
    _chart: chart,
  };
}
