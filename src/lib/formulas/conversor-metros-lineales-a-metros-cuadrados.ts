/**
 * Conversor metros lineales ↔ metros cuadrados.
 *
 *   m² = metros_lineales × ancho
 *   metros_lineales = m² / ancho
 *
 * Requiere conocer el ancho de la tela, tabla, chapa, rollo, etc.
 * Antes la calc usaba factor = 1.0 (equivalía a "ml = m²"), un bug grave:
 * en telas el ancho típico es 1.40-1.50 m; en tablas de madera 0.20-0.30 m;
 * en rollos de chapa 1.0 m. Sin el ancho el resultado no tiene sentido.
 */

export interface Inputs {
  valor: number | string;
  ancho: number | string;    // ancho del material en metros
  direccion?: string;        // 'ida' = ml → m² ; 'vuelta' = m² → ml
}

export interface Outputs {
  resultado: string;
  resumen: string;
  metrosLineales: number;
  metrosCuadrados: number;
  anchoUsado: number;
}

export function conversorMetrosLinealesAMetrosCuadrados(i: Inputs): Outputs {
  const v = Number(i.valor);
  const ancho = Number(i.ancho);
  const d = String(i.direccion || 'ida');

  if (!v || v <= 0) throw new Error('Ingresá un valor positivo a convertir');
  if (!ancho || ancho <= 0) {
    throw new Error('Ingresá el ancho del material (ej: tela 1.40 m, chapa 1.0 m, tabla 0.25 m)');
  }
  if (ancho > 5) {
    throw new Error('Ancho muy grande (>5 m). Verificá la unidad — debe estar en metros.');
  }

  let ml: number;
  let m2: number;
  let fromLabel: string;
  let toLabel: string;
  let valorResultado: number;

  if (d === 'vuelta') {
    // m² → metros lineales
    m2 = v;
    ml = v / ancho;
    fromLabel = 'm²';
    toLabel = 'metros lineales';
    valorResultado = ml;
  } else {
    // metros lineales → m²
    ml = v;
    m2 = v * ancho;
    fromLabel = 'metros lineales';
    toLabel = 'm²';
    valorResultado = m2;
  }

  const resultado = `${valorResultado.toFixed(2).replace(/\.?0+$/, '')} ${toLabel}`;
  const resumen = `${v} ${fromLabel} con ancho ${ancho} m = ${valorResultado.toFixed(2).replace(/\.?0+$/, '')} ${toLabel}.`;

  return {
    resultado,
    resumen,
    metrosLineales: Number(ml.toFixed(4)),
    metrosCuadrados: Number(m2.toFixed(4)),
    anchoUsado: ancho,
  };
}
