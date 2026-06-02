/** Voltaje de salida de un transformador según relación de espiras */
export interface Inputs { voltajePrimario: number; espirasPrimario: number; espirasSecundario: number; }
export interface Outputs { voltajeSecundario: number; relacionEspiras: number; tipo: string; detalle: string; _insight?: any; }

export function transformadorRelacionEspiras(i: Inputs): Outputs {
  const vp = Number(i.voltajePrimario);
  const np = Number(i.espirasPrimario);
  const ns = Number(i.espirasSecundario);

  if (!vp || vp <= 0) throw new Error('Ingresá el voltaje del primario');
  if (!np || np <= 0) throw new Error('Ingresá las espiras del primario');
  if (!ns || ns <= 0) throw new Error('Ingresá las espiras del secundario');

  const vs = vp * (ns / np);
  const relacion = np / ns;
  let tipo: string;
  if (relacion > 1) tipo = 'Reductor (step-down)';
  else if (relacion < 1) tipo = 'Elevador (step-up)';
  else tipo = 'Aislador (1:1)';

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  const sentido = relacion > 1
    ? `reduce el voltaje de ${fmt.format(vp)} V a **${fmt.format(vs)} V**`
    : relacion < 1
      ? `eleva el voltaje de ${fmt.format(vp)} V a **${fmt.format(vs)} V**`
      : `mantiene el voltaje en **${fmt.format(vs)} V** (aislación 1:1, sin cambio de tensión)`;
  const insight = {
    title: tipo,
    text: `Con ${fmt.format(np)} espiras en el primario y ${fmt.format(ns)} en el secundario, el transformador ${sentido}. La relación de espiras es **${fmt.format(relacion)}:1** (la tensión escala igual que la cantidad de vueltas).`,
    tone: 'neutral',
    icon: '🔌',
  };

  return {
    voltajeSecundario: Number(vs.toFixed(2)),
    relacionEspiras: Number(relacion.toFixed(2)),
    tipo,
    detalle: `Vs = ${fmt.format(vp)}V × (${fmt.format(ns)} / ${fmt.format(np)}) = ${fmt.format(vs)}V. Relación: ${fmt.format(relacion)}:1. Tipo: ${tipo}.`,
    _insight: insight,
  };
}
