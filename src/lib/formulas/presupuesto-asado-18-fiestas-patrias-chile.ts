// Presupuesto de asado para el 18 (Fiestas Patrias) en Chile — precios de referencia 2026 (CLP).
// Cantidades: 450 g de carne por adulto, 220 g por menor; 1 longaniza por adulto + 0,5 por menor.
// Precios por kg según el tipo de carne elegido (mix económico / clásico / premium).
export interface Inputs {
  adultos: number;
  menores: number;
  tipoCarne: string; // "economico" | "clasico" | "premium"
  incluirBebidas: string; // "si" | "no"
  incluirAcompanamientos: string; // "si" | "no"
}

export interface Outputs {
  costoCarne: number;
  costoBebidas: number;
  costoAcompanamientos: number;
  totalPresupuesto: number;
  costoPorPersona: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

// Precios de referencia 2026 (CLP), supermercado/carnicería zona central.
const PRECIO_KG: Record<string, { nombre: string; precio: number }> = {
  economico: { nombre: 'económico (pollo, malaya, cerdo)', precio: 7_500 },
  clasico: { nombre: 'clásico (costillar + plateada)', precio: 11_500 },
  premium: { nombre: 'premium (lomo vetado, entraña)', precio: 16_000 },
};
const PRECIO_LONGANIZA = 1_500; // por unidad
const PRECIO_CARBON_KG = 1_250;
const BEBIDA_ADULTO = 3_000; // cerveza + bebida + agua por adulto
const BEBIDA_MENOR = 1_500; // bebida/jugo por menor
const ACOMP_PERSONA = 2_500; // pan amasado, ensalada a la chilena, pebre, papas

const G_ADULTO = 450;
const G_MENOR = 220;
const CARBON_POR_PERSONA = 0.7; // kg

export function compute(i: Inputs): Outputs {
  const adultos = Math.max(0, Math.round(i.adultos || 0));
  const menores = Math.max(0, Math.round(i.menores || 0));
  const personas = Math.max(1, adultos + menores);
  const tipo = PRECIO_KG[i.tipoCarne] ? i.tipoCarne : 'clasico';
  const conBebidas = i.incluirBebidas !== 'no';
  const conAcomp = i.incluirAcompanamientos !== 'no';

  // Carne: kg redondeados hacia arriba al medio kilo
  const kgCarne = Math.ceil(((adultos * G_ADULTO + menores * G_MENOR) / 1000) * 2) / 2;
  const longanizas = Math.ceil(adultos + menores * 0.5);
  const kgCarbon = Math.ceil(personas * CARBON_POR_PERSONA);

  const costoCarneSola = kgCarne * PRECIO_KG[tipo].precio;
  const costoLonganizas = longanizas * PRECIO_LONGANIZA;
  const costoCarbon = kgCarbon * PRECIO_CARBON_KG;
  const costoCarne = Math.round(costoCarneSola + costoLonganizas + costoCarbon);

  const costoBebidas = conBebidas ? adultos * BEBIDA_ADULTO + menores * BEBIDA_MENOR : 0;
  const costoAcompanamientos = conAcomp ? personas * ACOMP_PERSONA : 0;

  const totalPresupuesto = costoCarne + costoBebidas + costoAcompanamientos;
  const costoPorPersona = Math.round(totalPresupuesto / personas);

  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

  const detalle = `${kgCarne} kg de carne ${PRECIO_KG[tipo].nombre} (${fmt(costoCarneSola)}) + ${longanizas} longanizas (${fmt(costoLonganizas)}) + ${kgCarbon} kg de carbón (${fmt(costoCarbon)})${conBebidas ? ` + bebidas ${fmt(costoBebidas)}` : ''}${conAcomp ? ` + acompañamientos ${fmt(costoAcompanamientos)}` : ''}.`;

  const _insight = {
    title: `Asado del 18 para ${personas}: ${fmt(totalPresupuesto)} (${fmt(costoPorPersona)} por persona)`,
    text: `Para **${adultos} adulto${adultos === 1 ? '' : 's'}${menores ? ` y ${menores} menor${menores === 1 ? '' : 'es'}` : ''}** necesitás **${kgCarne} kg** de carne ${PRECIO_KG[tipo].nombre}, ${longanizas} longanizas y ${kgCarbon} kg de carbón. Presupuesto total: **${fmt(totalPresupuesto)}** — si dividen la cuenta, son **${fmt(costoPorPersona)} por cabeza**. Precios de referencia 2026 zona central; en ferias y carnicerías de barrio puede salir 15-20 % menos.`,
    tone: 'good' as const,
    icon: '🇨🇱',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Carne + longaniza + carbón', value: costoCarne },
      { label: 'Bebidas', value: costoBebidas },
      { label: 'Acompañamientos', value: costoAcompanamientos },
    ],
    prefix: '$',
    centerValue: fmt(totalPresupuesto),
    ariaLabel: `Presupuesto del asado: carne ${fmt(costoCarne)}, bebidas ${fmt(costoBebidas)}, acompañamientos ${fmt(costoAcompanamientos)}.`,
  };

  return {
    costoCarne,
    costoBebidas,
    costoAcompanamientos,
    totalPresupuesto,
    costoPorPersona,
    detalle,
    _insight,
    _chart,
  };
}
