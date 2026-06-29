// Reajuste de arriendo por IPC en Chile. El IPC acumulado del período lo publica el INE.
// El reajuste es simplemente el arriendo actual multiplicado por la variación del IPC.
export interface Inputs {
  arriendoActual: number;
  ipcAcumulado: number; // variación porcentual del período (%)
  periodicidad: string; // "anual" | "semestral" | "trimestral"
}

export interface Outputs {
  montoReajuste: number;
  arriendoNuevo: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  const arriendo = Math.max(0, i.arriendoActual || 0);
  const ipc = i.ipcAcumulado || 0;

  const montoReajuste = Math.round(arriendo * ipc / 100);
  const arriendoNuevo = arriendo + montoReajuste;

  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');
  const periodo = i.periodicidad === 'trimestral' ? 'trimestral'
    : i.periodicidad === 'semestral' ? 'semestral' : 'anual';

  const _insight = {
    title: `Arriendo reajustado: ${fmt(arriendoNuevo)}`,
    text: `Con un IPC ${periodo} acumulado del **${ipc}%**, tu arriendo de **${fmt(arriendo)}** sube **${fmt(montoReajuste)}** y queda en **${fmt(arriendoNuevo)}**. El IPC lo publica el INE cada mes; usá el acumulado del período pactado en tu contrato.`,
    tone: ipc < 0 ? 'warn' as const : 'good' as const,
    icon: '🏠',
  };

  const _chart = {
    type: 'bars',
    bars: [
      { label: 'Arriendo actual', value: arriendo, color: '#64748b', colorDark: '#94a3b8' },
      { label: 'Arriendo nuevo', value: arriendoNuevo, color: '#2563eb', colorDark: '#3b82f6' },
    ],
    valueFormat: 'currency',
    ariaLabel: `Arriendo actual ${fmt(arriendo)} y arriendo reajustado ${fmt(arriendoNuevo)} con IPC ${ipc}%.`,
  };

  return { montoReajuste, arriendoNuevo, _insight, _chart };
}
