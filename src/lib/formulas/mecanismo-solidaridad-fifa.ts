/** Mecanismo solidaridad FIFA — 5% del fee de transferencia repartido entre clubes formadores */
export interface Inputs {
  feeTransferencia: number; // USD o EUR
  edadJugador: number; // edad al momento del transfer
  // años formado en cada rango (entre 12-23)
  anos12a15: number;
  anos16a23: number;
  numClubesFormadores: number; // cantidad de clubes que reclaman (para dividir por club)
}

export interface Outputs {
  poolSolidaridad: number;
  pctPool: number;
  repartoPorAno: number;
  repartoClub12a15: number;
  repartoClub16a23: number;
  totalAClubesFormadores: number;
  repartoPorClubPromedio: number;
  moneda: string;
  resumen: string;
}

export function mecanismoSolidaridadFifa(i: Inputs): Outputs {
  const fee = Math.max(0, Number(i.feeTransferencia) || 0);
  const edad = Math.max(12, Math.min(40, Number(i.edadJugador) || 23));
  const a12 = Math.max(0, Math.min(4, Number(i.anos12a15) || 0));
  const a16 = Math.max(0, Math.min(8, Number(i.anos16a23) || 0));
  const clubes = Math.max(1, Number(i.numClubesFormadores) || 1);

  const pool = fee * 0.05; // 5% FIFA Art. 21 Reglamento Estatuto y Transferencia
  // Reparto: 0,25% por año entre 12-15; 0,5% por año entre 16-23
  const pctPorAno12 = 0.25;
  const pctPorAno16 = 0.50;
  const fraccion12 = (a12 * pctPorAno12) / 100;
  const fraccion16 = (a16 * pctPorAno16) / 100;
  const reparto12 = fee * fraccion12;
  const reparto16 = fee * fraccion16;
  const totalClubes = reparto12 + reparto16;
  const porClub = totalClubes / clubes;
  const repartoPorAno = (pctPorAno12 + pctPorAno16) / 2; // info

  return {
    poolSolidaridad: Math.round(pool),
    pctPool: 5,
    repartoPorAno,
    repartoClub12a15: Math.round(reparto12),
    repartoClub16a23: Math.round(reparto16),
    totalAClubesFormadores: Math.round(totalClubes),
    repartoPorClubPromedio: Math.round(porClub),
    moneda: 'USD',
    resumen: `Sobre fee US$ ${fee.toLocaleString('en')}, pool 5% = **US$ ${Math.round(pool).toLocaleString('en')}**. Clubes formadores reciben **US$ ${Math.round(totalClubes).toLocaleString('en')}** (${a12} años 12-15 + ${a16} años 16-23). Por club (${clubes}): **US$ ${Math.round(porClub).toLocaleString('en')}**.`,
  };
}
