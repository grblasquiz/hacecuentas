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
  _table?: any;
  _insight?: any;
}

const FACTORES: Record<string, number> = {
  basico: 1.0,
  moderado: 1.3,
  premium: 1.8,
};
// Coeficiente promedio menor: 0.63
const COEF_MENOR = 0.63;

// Helper central: a partir de (adultos, menores) y el costo ajustado por AE devuelve el gasto.
// Lo usan TANTO el resultado principal COMO cada fila de la tabla, así nunca divergen.
function calcGasto(adultos: number, menores: number, costoAjustado: number) {
  const adultosEquivalentes = adultos * 1.0 + menores * COEF_MENOR;
  const gastoTotal = adultosEquivalentes * costoAjustado;
  const personas = adultos + menores;
  return {
    adultosEquivalentes,
    gastoTotal,
    personas,
    gastoPorPersona: gastoTotal / personas,
    gastoDiario: gastoTotal / 30,
  };
}

export function costoSupermercadoCanasticaBasica(i: Inputs): Outputs {
  const adultos = Number(i.adultos);
  const menores = Number(i.menores) || 0;
  const costoBase = Number(i.costoBaseAdulto);
  const nivel = i.nivelConsumo || 'moderado';

  if (!adultos || adultos <= 0) throw new Error('Ingresá la cantidad de adultos');
  if (!costoBase || costoBase <= 0) throw new Error('Ingresá el costo de la CBA por adulto equivalente');

  const factor = FACTORES[nivel] || 1.3;

  const costoAjustado = costoBase * factor;
  const { adultosEquivalentes, gastoTotal, personas, gastoPorPersona, gastoDiario } = calcGasto(adultos, menores, costoAjustado);

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

  // Filas: la dimensión que varía es el tamaño del hogar (integrantes). Mantengo la mezcla
  // adultos/menores del usuario escalándola a cada tamaño; la fila igual al hogar actual usa
  // su split exacto, así coincide con el resultado principal.
  const tamanoActual = adultos + menores;
  const propMenores = tamanoActual > 0 ? menores / tamanoActual : 0;
  const tamanos = Array.from(new Set([1, 2, 3, 4, 5, 6, tamanoActual])).sort((a, b) => a - b);
  const _table = {
    title: `Gasto mensual según integrantes del hogar (nivel ${nivelLabel[nivel] || nivel})`,
    headers: ['Integrantes', 'Total/mes', 'Por persona', 'Por día'],
    align: ['left', 'right', 'right', 'right'] as ('left' | 'right' | 'center')[],
    rows: tamanos.map((n) => {
      const men = n === tamanoActual ? menores : Math.round(n * propMenores);
      const adu = n - men;
      const r = calcGasto(adu, men, costoAjustado);
      return [
        String(n),
        '$' + fmt.format(Math.round(r.gastoTotal)),
        '$' + fmt.format(Math.round(r.gastoPorPersona)),
        '$' + fmt.format(Math.round(r.gastoDiario)),
      ];
    }),
    note: `Sobre tu CBA de $${fmt.format(costoBase)}/AE y nivel ${nivelLabel[nivel] || nivel} (factor ${factor}). Conserva tu proporción de menores (cuentan ${COEF_MENOR} de un adulto equivalente).`,
  };

  return {
    gastoMensualTotal: Math.round(gastoTotal),
    gastoPorPersona: Math.round(gastoPorPersona),
    gastoDiario: Math.round(gastoDiario),
    detalle: `${adultos} adulto(s) + ${menores} menor(es) = ${adultosEquivalentes.toFixed(2)} adultos equivalentes. CBA $${fmt.format(costoBase)} × factor ${nivel} (${factor}) = $${fmt.format(costoAjustado)}/AE. Total: $${fmt.format(gastoTotal)}/mes ($${fmt.format(gastoPorPersona)}/persona, $${fmt.format(gastoDiario)}/día).`,
    _chart: chart,
    _table,
    _insight: insight,
  };
}
