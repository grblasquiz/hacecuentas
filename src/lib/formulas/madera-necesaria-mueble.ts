/**
 * Calculadora de madera necesaria para un mueble
 */

export interface Inputs {
  ancho: number; alto: number; profundidad: number; estantes: number; conTechoBase: number;
}

export interface Outputs {
  m2Neto: string; m2ConDesperdicio: string; tablasEstandar: string; desglose: string;
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
  return {
    m2Neto: `${m2.toFixed(2)} m²`,
    m2ConDesperdicio: `${m2Desp.toFixed(2)} m² (15% buffer)`,
    tablasEstandar: `${tablas} tabla${tablas > 1 ? 's' : ''} de 183×274 cm`,
    desglose: `Laterales ${(laterales/10000).toFixed(2)} + Estantes ${(estantes/10000).toFixed(2)} + Techo/base ${(techoBase/10000).toFixed(2)} + Fondo ${(fondo/10000).toFixed(2)} m²`,
  };
}
