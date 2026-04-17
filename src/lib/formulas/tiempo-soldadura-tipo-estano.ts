/**
 * Calculadora de tiempo de soldadura por tipo de estaño
 */

export interface Inputs {
  estano: number; tipoComponente: number; potenciaSoldador: number;
}

export interface Outputs {
  temperatura: string; tiempo: string; punta: string; consejo: string;
}

export function tiempoSoldaduraTipoEstano(inputs: Inputs): Outputs {
  const es = Math.round(Number(inputs.estano));
  const tc = Math.round(Number(inputs.tipoComponente));
  const pot = Number(inputs.potenciaSoldador);
  if (!es || !tc || !pot) throw new Error('Completá los campos');
  const tempMap: Record<number, number> = { 1: 340, 2: 330, 3: 380, 4: 280 };
  const temp = tempMap[es] || 330;
  const tiempoMap: Record<number, string> = {
    1: '2-3 seg',
    2: '3-4 seg',
    3: '1-2 seg',
    4: '1 seg',
    5: '60 seg (aire caliente)',
    6: '3-4 seg por pin',
  };
  const puntaMap: Record<number, string> = {
    1: 'Bisel 2 mm',
    2: 'Pala 2 mm',
    3: 'Cónica 1 mm',
    4: 'Cónica 0.5-0.8 mm',
    5: 'Aire caliente + paste',
    6: 'Pala 5 mm o más',
  };
  let consejo = '';
  if (pot < 40 && (tc === 6 || tc === 2)) consejo = '⚠️ Soldador débil para este trabajo. Buscá 60W+';
  else if (pot >= 60 && (tc === 3 || tc === 4)) consejo = 'Potencia alta para SMD: reducí temperatura para no dañar componente';
  else if (es === 3) consejo = 'Lead-free requiere flux extra y tiempo levemente mayor. Ventilación importante.';
  else consejo = 'Setup estándar: tinar punta antes, limpiar con brass sponge.';
  return {
    temperatura: `${temp}°C`,
    tiempo: tiempoMap[tc] || '2-3 seg',
    punta: puntaMap[tc] || 'Cónica 1 mm',
    consejo,
  };
}
