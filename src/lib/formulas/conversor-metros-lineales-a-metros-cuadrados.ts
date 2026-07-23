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
  _insight?: any;
  _table?: any;
  _chart?: any;
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

  const mlFmt = ml.toFixed(2).replace(/\.?0+$/, '');
  const m2Fmt = m2.toFixed(2).replace(/\.?0+$/, '');
  const _insight = {
    title: 'Lo que cambia es el ancho',
    text: `Con un ancho de **${ancho} m**, cada metro lineal rinde **${ancho} m²**: por eso **${mlFmt} m lineales** equivalen a **${m2Fmt} m²**. Si el ancho real del material es otro, el resultado cambia — confirmá la medida del rollo, tabla o chapa antes de comprar.`,
    tone: 'neutral',
    icon: '📐',
  };

  // Tabla viva: los metros lineales que la gente busca, con TU ancho aplicado.
  const escalonesBase = [1, 2, 3, 5, 10, 15, 20, 25, 30, 50, 100];
  const mlPropio = Number(ml.toFixed(2));
  const escalones = escalonesBase.includes(mlPropio)
    ? escalonesBase
    : [...escalonesBase, mlPropio].sort((a, b) => a - b);
  const n2 = (x: number) => x.toFixed(2).replace(/\.?0+$/, '').replace('.', ',');
  const _table = {
    title: `Metros lineales a m² con ancho ${n2(ancho)} m`,
    headers: ['Metros lineales', 'Metros cuadrados'],
    align: ['left', 'right'],
    rows: escalones.map((x) => [
      `${n2(x)} ml${x === mlPropio ? ' (tu medida)' : ''}`,
      `${n2(x * ancho)} m²`,
    ]),
    note: `Recalculada con el ancho que elegiste (${n2(ancho)} m). Si cambiás el ancho del material, toda la tabla cambia: m² = metros lineales × ancho.`,
  };

  // Comparación visual: el mismo metraje según los anchos más habituales.
  const anchosTipicos = [0.8, 1, 1.4, 1.5, 2];
  const _chart = {
    type: 'bar',
    label: 'Según el ancho del material',
    data: {
      labels: anchosTipicos.map((a) => `${n2(a)} m`),
      datasets: [
        {
          label: `m² con ${n2(ml)} metros lineales`,
          data: anchosTipicos.map((a) => Number((ml * a).toFixed(2))),
          suffix: ' m²',
        },
      ],
    },
    ariaLabel: `Con ${n2(ml)} metros lineales obtenés ${anchosTipicos.map((a) => `${n2(ml * a)} metros cuadrados si el ancho es ${n2(a)} metros`).join(', ')}`,
  };

  return {
    resultado,
    resumen,
    metrosLineales: Number(ml.toFixed(4)),
    metrosCuadrados: Number(m2.toFixed(4)),
    anchoUsado: ancho,
    _insight,
    _table,
    _chart,
  };
}
