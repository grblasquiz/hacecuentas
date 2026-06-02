/** Calcula la relación potencia/peso y estima la velocidad máxima */
export interface Inputs {
  potenciaHp: number;
  pesoKg: number;
  coefAerodinamico?: number;
}
export interface Outputs {
  relacionHpTon: number;
  velocidadMaxEstimada: number;
  kgPorHp: number;
  detalle: string;
  _chart?: any;
  _insight?: any;
}

export function velocidadMaximaRelacionPotenciaPeso(i: Inputs): Outputs {
  const hp = Number(i.potenciaHp);
  const peso = Number(i.pesoKg);
  const cd = Number(i.coefAerodinamico) || 0.30;

  if (!hp || hp <= 0) throw new Error('Ingresá la potencia del motor en HP');
  if (!peso || peso < 300 || peso > 5000) throw new Error('El peso debe estar entre 300 y 5.000 kg');
  if (cd < 0.15 || cd > 0.60) throw new Error('El coeficiente aerodinámico debe estar entre 0.15 y 0.60');

  const relacionHpTon = (hp / peso) * 1000;
  const kgPorHp = peso / hp;

  // Estimación de velocidad máxima usando modelo empírico simplificado
  // Potencia en Watts vs resistencia aerodinámica: P = 0.5 * rho * Cd * A * v^3
  // Donde A (área frontal) se estima como ~2.2 m² para un auto promedio
  const potenciaW = hp * 745.7;
  const areaFrontal = 2.2; // m² estimado
  const rho = 1.225; // densidad del aire kg/m³
  const eficiencia = 0.85; // pérdidas en transmisión

  const vmps = Math.pow((2 * potenciaW * eficiencia) / (rho * cd * areaFrontal), 1 / 3);
  const velocidadMaxEstimada = vmps * 3.6; // m/s a km/h

  let categoria = '';
  if (relacionHpTon < 70) categoria = 'Vehículo pesado/lento';
  else if (relacionHpTon < 100) categoria = 'Adecuado para uso diario';
  else if (relacionHpTon < 130) categoria = 'Ágil y equilibrado';
  else if (relacionHpTon < 170) categoria = 'Rápido';
  else if (relacionHpTon < 250) categoria = 'Deportivo';
  else categoria = 'Superdeportivo';

  const ratioRound = Number(relacionHpTon.toFixed(1));
  const chart = {
    type: 'scale' as const,
    marker: ratioRound,
    markerLabel: categoria + ': ' + ratioRound + ' HP/ton',
    min: 0,
    unit: ' HP/ton',
    segments: [
      { nombre: 'Pesado', max: 70, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Diario', max: 100, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Ágil', max: 130, color: '#d9f99d', colorDark: '#3f6212' },
      { nombre: 'Rápido', max: 170, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Deportivo', max: 250, color: '#a7f3d0', colorDark: '#065f46' },
      { nombre: 'Superdeportivo', max: Math.max(400, Math.ceil(ratioRound) + 50), color: '#99f6e4', colorDark: '#115e59' },
    ],
    ariaLabel: 'Escala de relación potencia/peso en HP por tonelada: de vehículo pesado a superdeportivo.',
  };

  const insight = {
    title: 'Tu relación potencia/peso',
    text: `Con **${ratioRound} HP por tonelada** (${kgPorHp.toFixed(1)} kg que mueve cada HP), tu vehículo entra en la categoría **${categoria.toLowerCase()}**. La velocidad máxima teórica estimada ronda los **~${Math.round(velocidadMaxEstimada)} km/h** (Cd=${cd}).`,
    tone: 'neutral',
    icon: '🏎️',
  };

  return {
    relacionHpTon: ratioRound,
    velocidadMaxEstimada: Math.round(velocidadMaxEstimada),
    kgPorHp: Number(kgPorHp.toFixed(2)),
    detalle: `Relación: ${relacionHpTon.toFixed(1)} HP/ton (${kgPorHp.toFixed(1)} kg/HP). Categoría: ${categoria}. Velocidad máxima teórica estimada: ~${Math.round(velocidadMaxEstimada)} km/h (Cd=${cd}).`,
    _chart: chart,
    _insight: insight,
  };
}
