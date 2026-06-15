export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function paredLadrillosMetrosM2(i: Inputs): Outputs {
  const rates: Record<string, number> = { comun: 60, portante: 16, cerramiento: 20 };
  const r = rates[String(i.tipo)] || 60;
  const m = Number(i.m2) || 0;
  const total = Math.ceil(m * r * 1.1);
  const sinDesperdicio = Math.ceil(m * r);
  const desperdicio = Math.max(0, total - sinDesperdicio);
  const fmt = (n: number) => n.toLocaleString('es-AR');
  const _insight = {
    title: 'Cuántos comprar',
    text: `Para **${m} m²** de pared necesitás **${fmt(total)} ladrillos ${i.tipo}**: ${fmt(sinDesperdicio)} para el muro más ${fmt(desperdicio)} de reserva por roturas y cortes (+10%). Comprá por bulto cerrado para no quedarte corto.`,
    tone: 'neutral',
    icon: '🧱',
  };
  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Ladrillos del muro', value: sinDesperdicio },
      { label: 'Desperdicio (+10%)', value: desperdicio },
    ],
    prefix: '',
    centerValue: fmt(total),
    centerLabel: 'Ladrillos',
    ariaLabel: `Composición de los ${fmt(total)} ladrillos: muro más reserva por desperdicio.`,
  };
  return { cantidad: total.toString(), resumen: `${total} ladrillos ${i.tipo} para ${m} m² (+10% desperdicio).`, _insight, _chart };
}
