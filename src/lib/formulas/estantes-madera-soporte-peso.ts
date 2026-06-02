/**
 * Calculadora de estante de madera: peso máximo soportado
 */

export interface Inputs {
  largo: number; ancho: number; espesor: number; material: number; soporte: number;
}

export interface Outputs {
  pesoMaximo: string; pesoDistribuido: string; deflexionEstimada: string; consejo: string;
  _insight?: any; _chart?: any;
}

export function estantesMaderaSoportePeso(inputs: Inputs): Outputs {
  const L = Number(inputs.largo) / 100; // cm → m
  const b = Number(inputs.ancho) / 100;
  const h = Number(inputs.espesor) / 1000; // mm → m
  const mat = Math.round(Number(inputs.material));
  const sop = Math.round(Number(inputs.soporte));
  if (!L || !b || !h || !mat || !sop) throw new Error('Completá los campos');
  const eGPa: Record<number, number> = { 1: 2.7, 2: 9, 3: 9, 4: 2.7, 5: 21 };
  const E = (eGPa[mat] || 2.7) * 1e9; // Pa
  const I = (b * Math.pow(h, 3)) / 12; // m⁴
  // Deflexión máx permitida 3 mm = 0.003 m
  // Para carga distribuida: delta = 5PL³/(384EI)
  // Con empotramiento dividir por 4 aprox
  const factorSop = sop === 2 ? 4 : 1;
  const defMax = 0.003;
  const PmaxN = (defMax * 384 * E * I * factorSop) / (5 * Math.pow(L, 3));
  const PmaxKg = PmaxN / 9.81;
  // Distribución segura: 60% del P max
  const distKg = PmaxKg * 0.6;
  // Deflexión a 10 kg (10 × 9.81 N)
  const def10kg = (5 * 10 * 9.81 * Math.pow(L, 3)) / (384 * E * I * factorSop);
  let tip = '';
  if (PmaxKg < 10) tip = '⚠️ Muy bajo: aumentá espesor o acortá el largo.';
  else if (PmaxKg < 25) tip = 'Moderado: libros de tapa blanda sí, tapa dura con cuidado.';
  else if (PmaxKg < 60) tip = 'Bueno: aguanta libros tapa dura o electrónica.';
  else tip = 'Excelente: carga pesada sin problemas.';

  const tone = PmaxKg < 10 ? 'warn' : PmaxKg < 25 ? 'neutral' : 'good';
  const insightText = PmaxKg < 10
    ? `Este estante aguanta apenas **${PmaxKg.toFixed(1)} kg** antes de flexarse de más: poné solo objetos livianos o reforzá el espesor.`
    : PmaxKg < 25
    ? `Soporta hasta **${PmaxKg.toFixed(1)} kg**, pero lo seguro operativo son **${distKg.toFixed(1)} kg** repartidos: ideal para deco o libros de tapa blanda, no lo cargues al tope.`
    : `Aguanta **${PmaxKg.toFixed(1)} kg** al límite y **${distKg.toFixed(1)} kg** con margen seguro: carga pesada repartida sin problema.`;

  return {
    pesoMaximo: `${PmaxKg.toFixed(1)} kg`,
    pesoDistribuido: `${distKg.toFixed(1)} kg (recomendado operativo)`,
    deflexionEstimada: `${(def10kg * 1000).toFixed(1)} mm a 10 kg`,
    consejo: tip,
    _insight: {
      title: 'Tu estante en la práctica',
      text: insightText,
      tone,
      icon: '📚',
    },
    _chart: {
      type: 'scale',
      marker: Number(PmaxKg.toFixed(1)),
      markerLabel: `${PmaxKg.toFixed(1)} kg`,
      min: 0,
      segments: [
        { nombre: 'Muy bajo', max: 10, color: '#ef4444', colorDark: '#f87171' },
        { nombre: 'Moderado', max: 25, color: '#f59e0b', colorDark: '#fbbf24' },
        { nombre: 'Bueno', max: 60, color: '#22c55e', colorDark: '#4ade80' },
        { nombre: 'Excelente', max: Math.max(100, Math.ceil(PmaxKg * 1.15)), color: '#15803d', colorDark: '#22c55e' },
      ],
      ariaLabel: `Peso máximo soportado de ${PmaxKg.toFixed(1)} kg en una escala de capacidad de estante`,
    },
  };
}
