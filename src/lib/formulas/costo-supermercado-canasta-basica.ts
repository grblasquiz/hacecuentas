/** Estimación de gasto mensual en supermercado según canasta básica */
export interface Inputs {
  adultos: number;
  menores?: number;
  costoBaseAdulto: number;
  nivelConsumo?: string;
}
export interface Outputs {
  gastoMensualTotal: number;
  gastoPorPersona: number;
  gastoDiario: number;
  detalle: string;
  _chart?: any;
  _insight?: any;
}

export function costoSupermercadoCanasticaBasica(i: Inputs): Outputs {
  const adultos = Number(i.adultos);
  const menores = Number(i.menores) || 0;
  const costoBase = Number(i.costoBaseAdulto);
  const nivel = i.nivelConsumo || 'moderado';

  if (!adultos || adultos <= 0) throw new Error('Ingresá la cantidad de adultos');
  if (!costoBase || costoBase <= 0) throw new Error('Ingresá el costo de la CBA por adulto equivalente');

  // Coeficiente promedio menor: 0.63
  const adultosEquivalentes = adultos * 1.0 + menores * 0.63;

  const factores: Record<string, number> = {
    basico: 1.0,
    moderado: 1.3,
    premium: 1.8,
  };
  const factor = factores[nivel] || 1.3;

  const costoAjustado = costoBase * factor;
  const gastoTotal = adultosEquivalentes * costoAjustado;
  const personas = adultos + menores;
  const gastoPorPersona = gastoTotal / personas;
  const gastoDiario = gastoTotal / 30;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const chart = menores > 0 ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Adultos', value: Math.round(adultos * 1.0 * costoAjustado) },
      { label: 'Menores', value: Math.round(menores * 0.63 * costoAjustado) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(gastoTotal).toLocaleString('es-AR'),
    centerLabel: 'Total/mes',
    ariaLabel: 'Reparto del gasto mensual en supermercado entre adultos y menores',
  } : undefined;

  const sobreCBA = Math.round((factor - 1) * 100);
  const nivelLabel: Record<string, string> = { basico: 'básico', moderado: 'moderado', premium: 'premium' };
  const insight = nivel === 'basico'
    ? {
        title: 'Consumo en el piso de la CBA',
        text: `Elegiste nivel **básico**: el gasto se apoya en la canasta de subsistencia, **$${fmt.format(gastoDiario)}/día** para ${personas} persona(s). Es lo mínimo nutricional; cualquier extra mensual lo supera.`,
        tone: 'neutral',
        icon: '🛒',
      }
    : {
        title: `Nivel ${nivelLabel[nivel] || nivel}: +${sobreCBA}% sobre la CBA`,
        text: `Tu consumo **${nivelLabel[nivel] || nivel}** gasta **${sobreCBA}% más** que la canasta básica pura: **$${fmt.format(gastoDiario)}/día** ($${fmt.format(gastoPorPersona)}/persona al mes). Bajando a básico recortás cerca de $${fmt.format(gastoTotal - adultosEquivalentes * costoBase)}/mes.`,
        tone: nivel === 'premium' ? 'warn' : 'neutral',
        icon: '🛒',
      };

  return {
    gastoMensualTotal: Math.round(gastoTotal),
    gastoPorPersona: Math.round(gastoPorPersona),
    gastoDiario: Math.round(gastoDiario),
    detalle: `${adultos} adulto(s) + ${menores} menor(es) = ${adultosEquivalentes.toFixed(2)} adultos equivalentes. CBA $${fmt.format(costoBase)} × factor ${nivel} (${factor}) = $${fmt.format(costoAjustado)}/AE. Total: $${fmt.format(gastoTotal)}/mes ($${fmt.format(gastoPorPersona)}/persona, $${fmt.format(gastoDiario)}/día).`,
    _chart: chart,
    _insight: insight,
  };
}
