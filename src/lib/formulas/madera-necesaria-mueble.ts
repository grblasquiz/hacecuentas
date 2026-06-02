/**
 * Calculadora de madera necesaria para un mueble
 */

export interface Inputs {
  ancho: number; alto: number; profundidad: number; estantes: number; conTechoBase: number;
}

export interface Outputs {
  m2Neto: string; m2ConDesperdicio: string; tablasEstandar: string; desglose: string;
  _insight?: any; _chart?: any;
}

export function maderaNecesariaMueble(inputs: Inputs): Outputs {
  const a = Number(inputs.ancho);
  const h = Number(inputs.alto);
  const p = Number(inputs.profundidad);
  const n = Math.round(Number(inputs.estantes));
  const tb = Math.round(Number(inputs.conTechoBase));
  if (!a || !h || !p) throw new Error('Completá medidas');
  const laterales = 2 * h * p;
  const estantes = n * a * p;
  const techoBase = tb === 1 ? 2 * a * p : 0;
  const fondo = a * h;
  const totalCm2 = laterales + estantes + techoBase + fondo;
  const m2 = totalCm2 / 10000;
  const m2Desp = m2 * 1.15;
  const m2Tabla = 183 * 274 / 10000; // 5.01 m²
  const tablas = Math.ceil(m2Desp / m2Tabla);
  const m2Laterales = laterales / 10000;
  const m2Estantes = estantes / 10000;
  const m2TechoBase = techoBase / 10000;
  const m2Fondo = fondo / 10000;
  const slices = [
    { label: 'Laterales', value: Number(m2Laterales.toFixed(3)) },
    { label: 'Estantes', value: Number(m2Estantes.toFixed(3)) },
    { label: 'Techo/base', value: Number(m2TechoBase.toFixed(3)) },
    { label: 'Fondo', value: Number(m2Fondo.toFixed(3)) },
  ].filter((s) => s.value > 0);
  return {
    m2Neto: `${m2.toFixed(2)} m²`,
    m2ConDesperdicio: `${m2Desp.toFixed(2)} m² (15% buffer)`,
    tablasEstandar: `${tablas} tabla${tablas > 1 ? 's' : ''} de 183×274 cm`,
    desglose: `Laterales ${m2Laterales.toFixed(2)} + Estantes ${m2Estantes.toFixed(2)} + Techo/base ${m2TechoBase.toFixed(2)} + Fondo ${m2Fondo.toFixed(2)} m²`,
    _insight: {
      title: 'Material y desperdicio',
      text: `Necesitás **${m2.toFixed(2)} m²** de madera neta; sumando un **15% de desperdicio** por cortes llegás a **${m2Desp.toFixed(2)} m²**, equivalente a **${tablas} tabla${tablas > 1 ? 's' : ''}** estándar de 183×274 cm.`,
      tone: 'neutral',
      icon: '🪵',
    },
    _chart: {
      type: 'doughnut',
      slices,
      centerValue: `${m2.toFixed(2)} m²`,
      centerLabel: 'Madera neta',
      ariaLabel: `Reparto de la madera neta por pieza: laterales ${m2Laterales.toFixed(2)}, estantes ${m2Estantes.toFixed(2)}, techo/base ${m2TechoBase.toFixed(2)}, fondo ${m2Fondo.toFixed(2)} m²`,
    },
  };
}
