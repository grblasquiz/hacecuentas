/** Regla de tres compuesta (modelo obra): días necesarios variando personas y horas. */
export interface Inputs {
  personas1?: number | string;
  dias1?: number | string;
  horas1?: number | string;
  personas2?: number | string;
  horas2?: number | string;
  __country?: string;
}

export interface Outputs {
  dias_necesarios: number;
  total_horas_hombre: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function reglaTresCompuesta(i: Inputs): Outputs {
  const personas1 = Math.max(1, Number(i.personas1) || 1);
  const dias1 = Math.max(0, Number(i.dias1) || 0);
  const horas1 = Math.max(0, Number(i.horas1) || 0);
  const personas2 = Math.max(1, Number(i.personas2) || 1);
  const horas2 = Math.max(0, Number(i.horas2) || 0);

  const total_horas_hombre = Math.round(personas1 * dias1 * horas1 * 100) / 100;
  const dias_necesarios = (personas2 > 0 && horas2 > 0)
    ? Math.round((total_horas_hombre / (personas2 * horas2)) * 100) / 100
    : 0;

  const resumen = total_horas_hombre > 0
    ? `El trabajo son ${total_horas_hombre} horas-hombre. Con ${personas2} personas trabajando ${horas2} h por día, se completa en ${dias_necesarios} días.`
    : 'Cargá la situación conocida (personas, días y horas) para aplicar la regla de tres compuesta.';

  const out: Outputs = { dias_necesarios, total_horas_hombre, resumen };

  if (total_horas_hombre > 0) {
    out._insight = {
      title: 'Días necesarios',
      text: `El trabajo total equivale a **${total_horas_hombre} horas-hombre**. Repartido entre **${personas2} personas** de **${horas2} h** diarias, se termina en **${dias_necesarios} días**. A más personas u horas por día, menos días de obra.`,
      tone: 'neutral',
      icon: '➗',
    };
  }

  return out;
}
