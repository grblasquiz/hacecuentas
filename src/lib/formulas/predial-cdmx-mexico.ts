// Calculadora de Predial CDMX 2026 según valor catastral
// Fuente: Código Fiscal de la CDMX, Arts. 130 y 131 (tarifa bimestral progresiva A-J + reducciones uso habitacional)
// https://data.consejeria.cdmx.gob.mx/portal_old/uploads/gacetas/codigo-fiscal.pdf

export interface Inputs {
  valorCatastral: number;
  tipoUso: 'habitacional' | 'noHabitacional';
}

export interface Outputs {
  predialBimestral: number;
  predialAnual: number;
  rangoTabla: string;
  detalle: string;
}

// Tabla Art. 130 CFCDMX 2026 (cuota bimestral)
interface Rango {
  letra: string;
  desde: number;
  hasta: number; // Infinity para el último rango
  cuotaFija: number;
  factor: number; // porcentaje sobre excedente, expresado como fracción decimal
}

const TABLA_PREDIAL_2026: Rango[] = [
  { letra: 'A', desde: 0,            hasta: 260506,    cuotaFija: 245.04,    factor: 0.000376 },
  { letra: 'B', desde: 260506.01,    hasta: 521011,    cuotaFija: 342.85,    factor: 0.000855 },
  { letra: 'C', desde: 521011.01,    hasta: 782213,    cuotaFija: 565.44,    factor: 0.001219 },
  { letra: 'D', desde: 782213.01,    hasta: 1043022,   cuotaFija: 884.20,    factor: 0.001620 },
  { letra: 'E', desde: 1043022.01,   hasta: 1303830,   cuotaFija: 1306.71,   factor: 0.001790 },
  { letra: 'F', desde: 1303830.01,   hasta: 2608012,   cuotaFija: 1773.69,   factor: 0.002085 },
  { letra: 'G', desde: 2608012.01,   hasta: 5216724,   cuotaFija: 4493.27,   factor: 0.002295 },
  { letra: 'H', desde: 5216724.01,   hasta: 13041810,  cuotaFija: 10481.05,  factor: 0.002510 },
  { letra: 'I', desde: 13041810.01,  hasta: 26083621,  cuotaFija: 30121.45,  factor: 0.002700 },
  { letra: 'J', desde: 26083621.01,  hasta: Infinity,  cuotaFija: 65334.32,  factor: 0.002900 },
];

// Reducciones uso habitacional (Art. 131 CFCDMX)
function obtenerReduccion(valorCatastral: number): number {
  if (valorCatastral <= 1303830) return 0.30;
  if (valorCatastral <= 1955745) return 0.25;
  if (valorCatastral <= 2608012) return 0.20;
  return 0;
}

function formatMXN(n: number): string {
  return n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 });
}

export function predialCdmxMexico(inputs: Inputs): Outputs {
  const { valorCatastral, tipoUso } = inputs;

  if (typeof valorCatastral !== 'number' || isNaN(valorCatastral) || valorCatastral < 0) {
    throw new Error('El valor catastral debe ser un número mayor o igual a 0.');
  }
  if (tipoUso !== 'habitacional' && tipoUso !== 'noHabitacional') {
    throw new Error('Tipo de uso inválido. Debe ser "habitacional" o "noHabitacional".');
  }

  // Caso valor 0
  if (valorCatastral === 0) {
    return {
      predialBimestral: 0,
      predialAnual: 0,
      rangoTabla: 'Sin valor catastral',
      detalle: 'Ingresá un valor catastral mayor a 0 para calcular el predial.',
    };
  }

  // Identificar rango aplicable
  const rango = TABLA_PREDIAL_2026.find(
    (r) => valorCatastral >= r.desde && valorCatastral <= r.hasta
  ) ?? TABLA_PREDIAL_2026[TABLA_PREDIAL_2026.length - 1];

  // Límite inferior efectivo del rango (para excedente)
  // El "límite inferior" para calcular el excedente es el valor mínimo del rango (desde, pero usando el valor entero, no el .01)
  // Para rango A: 0; para los demás: el redondeo del valor inicial.
  const limiteInferior = rango.letra === 'A' ? 0 : Math.floor(rango.desde);

  const excedente = Math.max(0, valorCatastral - limiteInferior);
  const sobreExcedente = excedente * rango.factor;
  const cuotaBimestralBruta = rango.cuotaFija + sobreExcedente;

  // Aplicar reducción si es habitacional
  let reduccion = 0;
  if (tipoUso === 'habitacional') {
    reduccion = obtenerReduccion(valorCatastral);
  }

  const montoReduccion = cuotaBimestralBruta * reduccion;
  const predialBimestral = cuotaBimestralBruta - montoReduccion;
  const predialAnual = predialBimestral * 6;

  // Construir descripción del rango
  const hastaTxt = rango.hasta === Infinity ? 'sin tope' : formatMXN(rango.hasta);
  const rangoTabla = `Rango ${rango.letra}: ${formatMXN(rango.desde)} a ${hastaTxt} (cuota fija ${formatMXN(rango.cuotaFija)} + ${(rango.factor * 100).toFixed(4)}% sobre excedente)`;

  // Detalle paso a paso
  const lineas: string[] = [];
  lineas.push(`1. Valor catastral: ${formatMXN(valorCatastral)} → Rango ${rango.letra}.`);
  lineas.push(`2. Cuota fija: ${formatMXN(rango.cuotaFija)}.`);
  lineas.push(`3. Excedente sobre límite inferior (${formatMXN(limiteInferior)}): ${formatMXN(excedente)}.`);
  lineas.push(`4. Factor ${(rango.factor * 100).toFixed(4)}% × excedente: ${formatMXN(sobreExcedente)}.`);
  lineas.push(`5. Cuota bimestral bruta: ${formatMXN(cuotaBimestralBruta)}.`);
  if (tipoUso === 'habitacional' && reduccion > 0) {
    lineas.push(`6. Reducción uso habitacional ${(reduccion * 100).toFixed(0)}%: -${formatMXN(montoReduccion)}.`);
    lineas.push(`7. Predial bimestral: ${formatMXN(predialBimestral)}.`);
    lineas.push(`8. Predial anual (× 6 bimestres): ${formatMXN(predialAnual)}.`);
  } else if (tipoUso === 'habitacional' && reduccion === 0) {
    lineas.push(`6. Sin reducción habitacional (valor catastral supera $2,608,012).`);
    lineas.push(`7. Predial bimestral: ${formatMXN(predialBimestral)}.`);
    lineas.push(`8. Predial anual (× 6 bimestres): ${formatMXN(predialAnual)}.`);
  } else {
    lineas.push(`6. Uso no habitacional: sin reducción.`);
    lineas.push(`7. Predial bimestral: ${formatMXN(predialBimestral)}.`);
    lineas.push(`8. Predial anual (× 6 bimestres): ${formatMXN(predialAnual)}.`);
  }

  return {
    predialBimestral: Math.round(predialBimestral * 100) / 100,
    predialAnual: Math.round(predialAnual * 100) / 100,
    rangoTabla,
    detalle: lineas.join('\n'),
  };
}
