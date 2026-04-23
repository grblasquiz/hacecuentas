/** Fantasy Premier League — valoracion de un once titular con budget 100M */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

export function fantasyPremierLeague(i: Inputs): Outputs {
  const budget = Number(i.budget) || 100;
  const gkp = Number(i.precioPortero) || 0;
  const def = Number(i.precioDefensa) || 0;
  const mid = Number(i.precioMedio) || 0;
  const fwd = Number(i.precioDelantero) || 0;
  const nDef = Number(i.numDefensas) || 4; // de los 4 titulares de campo
  const nMid = Number(i.numMedios) || 4;
  const nFwd = Number(i.numDelanteros) || 2;

  if (gkp <= 0 || def <= 0 || mid <= 0 || fwd <= 0) {
    throw new Error('Ingresá los precios promedio por posición');
  }
  if (nDef + nMid + nFwd !== 10) {
    throw new Error('La formación titular debe sumar 10 jugadores de campo (ej: 4-4-2, 3-5-2, 4-3-3)');
  }

  // Once titular: 1 GK + formacion. El plantel completo son 15.
  const costeOnce = gkp + nDef * def + nMid * mid + nFwd * fwd;
  // Banco: 1 GK suplente (50% del precio), 2 DEF (60% def), 1 MID (60% mid), 1 FWD (60% fwd) segun faltante de plantilla
  const suplentes = gkp * 0.5 + (5 - nDef) * def * 0.6 + (5 - nMid) * mid * 0.6 + (3 - nFwd) * fwd * 0.6;
  const totalPlantilla = costeOnce + suplentes;
  const restante = budget - totalPlantilla;

  const formacion = `${nDef}-${nMid}-${nFwd}`;

  const viable = restante >= 0 ? 'Viable' : 'Excede budget';
  let consejo = '';
  if (restante < 0) {
    consejo = 'Excedés el budget: bajá precio promedio de alguna posición o cambiá formación.';
  } else if (restante < 2) {
    consejo = 'Plantilla ajustada, queda poco margen para cambios en la temporada.';
  } else if (restante > 10) {
    consejo = 'Mucho margen sobrante: podés subir calidad de delanteros o medios premium.';
  } else {
    consejo = 'Budget balanceado: margen sano para swaps y fichajes durante la temporada.';
  }

  return {
    costeOnce: `£${costeOnce.toFixed(1)}M`,
    costeSuplentes: `£${suplentes.toFixed(1)}M`,
    costeTotalPlantilla: `£${totalPlantilla.toFixed(1)}M`,
    budgetRestante: `£${restante.toFixed(1)}M`,
    formacionUsada: formacion,
    estado: viable,
    consejo,
  };
}
