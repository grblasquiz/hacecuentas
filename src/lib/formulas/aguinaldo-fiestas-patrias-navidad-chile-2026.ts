// Aguinaldo de Fiestas Patrias 2026 en Chile (sector público y pensionados IPS/PGU) + Navidad.
// Sector público FP 2026: $88.667 si la remuneración líquida es ≤ $1.025.622, $61.552 si la supera.
// Pensionados IPS/PGU FP 2026: base $25.280 + $12.969 por cada carga familiar acreditada.
// Navidad: los montos 2026 se confirman con la ley de reajuste de fin de año (valores referenciales).
export interface Inputs {
  tipo: string; // "fiestas_patrias_publico" | "fiestas_patrias_pensionado" | "navidad"
  rentaLiquida: number;
  cargasFamiliares: number;
}

export interface Outputs {
  montoBase: number;
  adicionalCargas: number;
  total: number;
  _insight?: any;
  _chart?: any;
}

const UMBRAL_PUBLICO = 1_025_622; // remuneración líquida que separa el tramo alto del bajo (FP 2026)

const FP_PUBLICO = { bajo: 88_667, alto: 61_552 };
const FP_PENSIONADO_BASE = 25_280;
const FP_PENSIONADO_POR_CARGA = 12_969;
// Navidad 2026: montos referenciales (la ley de reajuste de diciembre los confirma).
const NAVIDAD = { bajo: 71_206, alto: 37_666 };

export function compute(i: Inputs): Outputs {
  const tipo =
    i.tipo === 'navidad'
      ? 'navidad'
      : i.tipo === 'fiestas_patrias_pensionado'
        ? 'fiestas_patrias_pensionado'
        : 'fiestas_patrias_publico';
  const renta = Math.max(0, i.rentaLiquida || 0);
  const cargas = Math.max(0, Math.round(i.cargasFamiliares || 0));

  let montoBase = 0;
  let adicionalCargas = 0;

  if (tipo === 'fiestas_patrias_pensionado') {
    montoBase = FP_PENSIONADO_BASE;
    adicionalCargas = FP_PENSIONADO_POR_CARGA * cargas;
  } else {
    const tabla = tipo === 'navidad' ? NAVIDAD : FP_PUBLICO;
    montoBase = renta <= UMBRAL_PUBLICO ? tabla.bajo : tabla.alto;
    adicionalCargas = 0;
  }

  const total = montoBase + adicionalCargas;

  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');
  const nombre =
    tipo === 'navidad'
      ? 'Navidad'
      : tipo === 'fiestas_patrias_pensionado'
        ? 'Fiestas Patrias (pensionado IPS/PGU)'
        : 'Fiestas Patrias (sector público)';

  let text: string;
  if (tipo === 'fiestas_patrias_pensionado') {
    text = `Como pensionado IPS/PGU te corresponde el aguinaldo base de **${fmt(FP_PENSIONADO_BASE)}** más **${fmt(FP_PENSIONADO_POR_CARGA)}** por cada carga familiar acreditada (${cargas} carga${cargas === 1 ? '' : 's'} = ${fmt(adicionalCargas)}). Se paga junto con la pensión de septiembre; los requisitos se miden al 31 de agosto.`;
  } else {
    const tramo = renta <= UMBRAL_PUBLICO ? 'tramo de renta más baja' : 'tramo de renta más alta';
    const extra =
      tipo === 'navidad'
        ? ' Los montos de Navidad 2026 se confirman con la ley de reajuste de fin de año (valores referenciales).'
        : '';
    text = `Con una remuneración líquida de **${fmt(renta)}** caés en el **${tramo}** (umbral ${fmt(UMBRAL_PUBLICO)}), así que el aguinaldo de ${nombre} es de **${fmt(montoBase)}**.${extra}`;
  }

  const _insight = {
    title: `Aguinaldo de ${nombre}: ${fmt(total)}`,
    text,
    tone: 'good' as const,
    icon: '🎁',
  };

  const _chart =
    tipo === 'fiestas_patrias_pensionado'
      ? {
          type: 'bar',
          labels: ['Base pensionado', `Cargas (${cargas})`, 'Total'],
          values: [montoBase, adicionalCargas, total],
          prefix: '$',
          ariaLabel: `Aguinaldo de pensionado: base ${fmt(montoBase)} más ${fmt(adicionalCargas)} por cargas, total ${fmt(total)}.`,
        }
      : {
          type: 'scale',
          marker: Math.round(renta),
          markerLabel: `Tu renta: ${fmt(renta)}`,
          min: 0,
          segments: [
            { nombre: `≤ umbral (${fmt(tipo === 'navidad' ? NAVIDAD.bajo : FP_PUBLICO.bajo)})`, max: UMBRAL_PUBLICO, color: '#16a34a', colorDark: '#22c55e' },
            { nombre: `> umbral (${fmt(tipo === 'navidad' ? NAVIDAD.alto : FP_PUBLICO.alto)})`, max: Math.max(UMBRAL_PUBLICO + 600000, renta + 1), color: '#d97706', colorDark: '#f59e0b' },
          ],
          ariaLabel: `Tramos de renta para el aguinaldo de ${nombre}: tu renta de ${fmt(renta)}.`,
        };

  return { montoBase, adicionalCargas, total, _insight, _chart };
}
