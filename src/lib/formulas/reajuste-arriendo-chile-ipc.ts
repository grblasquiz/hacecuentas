/** Reajuste arriendo Chile por IPC SII/INE — nuevo precio según IPC acumulado */
export interface Inputs { arriendoBase: number; ipcAcumulado: number; periodoMeses: number; }
export interface Outputs { arriendoNuevo: number; incrementoClp: number; incrementoPct: number; nota: string; }

export function reajusteArriendoChileIpc(i: Inputs): Outputs {
  const base = Number(i.arriendoBase);
  const ipc = Number(i.ipcAcumulado);
  const periodo = Number(i.periodoMeses) || 12;
  if (!base || base <= 0) throw new Error('Ingresá arriendo base válido');
  if (isNaN(ipc)) throw new Error('Ingresá IPC acumulado válido');
  // En Chile los contratos de arriendo habitual se reajustan por IPC acumulado según cláusula
  // Típicamente cada 6 o 12 meses. El INE publica IPC mensual y el SII lo usa para tributación
  const factorReajuste = 1 + (ipc / 100);
  const arriendoNuevo = base * factorReajuste;
  const incrementoClp = arriendoNuevo - base;
  const incrementoPct = ipc;
  const nota = `Reajuste cada ${periodo} meses con IPC acumulado ${ipc.toFixed(2)}%. Fuente: INE Chile / SII.`;
  return {
    arriendoNuevo: Math.round(arriendoNuevo),
    incrementoClp: Math.round(incrementoClp),
    incrementoPct: Number(incrementoPct.toFixed(2)),
    nota,
  };
}
