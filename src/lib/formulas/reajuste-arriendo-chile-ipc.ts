/** Reajuste arriendo Chile por IPC SII/INE — nuevo precio según IPC acumulado */
export interface Inputs { arriendoBase: number; ipcAcumulado: number; periodoMeses: number; }
export interface Outputs { arriendoNuevo: number; incrementoClp: number; incrementoPct: number; nota: string; _insight?: any; _chart?: any; }

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

  const arriendoNuevoR = Math.round(arriendoNuevo);
  const incrementoClpR = Math.round(incrementoClp);
  const baseR = Math.round(base);
  const fmt = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 });

  const _insight = {
    title: 'Tu nuevo arriendo',
    text: `Con un IPC acumulado de **${ipc.toFixed(2)}%**, el arriendo pasa de **$${fmt.format(baseR)}** a **$${fmt.format(arriendoNuevoR)}** (${incrementoClpR >= 0 ? '+' : '-'}$${fmt.format(Math.abs(incrementoClpR))} por mes).`,
    tone: incrementoClpR > 0 ? 'warn' : 'neutral',
    icon: '🏠',
  };

  const out: Outputs = {
    arriendoNuevo: arriendoNuevoR,
    incrementoClp: incrementoClpR,
    incrementoPct: Number(incrementoPct.toFixed(2)),
    nota,
    _insight,
  };

  if (incrementoClpR > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Arriendo base', value: baseR },
        { label: 'Reajuste IPC', value: incrementoClpR },
      ],
      prefix: '$',
      centerValue: `$${fmt.format(arriendoNuevoR)}`,
      centerLabel: 'nuevo arriendo',
      ariaLabel: `Nuevo arriendo de ${fmt.format(arriendoNuevoR)} pesos compuesto por la base y el reajuste por IPC`,
    };
  }

  return out;
}
