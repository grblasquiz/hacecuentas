/**
 * ¿Obligado a declarar renta en 2026? — Colombia, año gravable 2025 (art. 592 ET).
 * Topes con UVT 2025 ($49.799): ingresos/consumos tarjeta/compras/consignaciones 1.400 UVT
 * = $69.718.600; patrimonio bruto 4.500 UVT = $224.095.500. Responsable de IVA → declara siempre.
 * Constantes: src/lib/data/colombia-2026.ts (declaracionRenta2026 + uvt2025).
 */
import { COLOMBIA_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  ingresos?: number | string;        // ingresos brutos 2025
  patrimonio?: number | string;      // patrimonio bruto a 31-dic-2025
  consumosTarjeta?: number | string; // consumos con tarjeta de crédito 2025
  compras?: number | string;         // compras y consumos totales 2025
  consignaciones?: number | string;  // consignaciones bancarias, depósitos o inversiones 2025
  responsableIva?: string;           // 'no' | 'si'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

// Guard de defaults: ''/null/undefined → 0; el 0 explícito se respeta.
function num(v: unknown): number {
  if (v === '' || v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

export function compute(i: Inputs): Outputs {
  const C = COLOMBIA_2026;
  const D = C.declaracionRenta2026;
  const u25 = C.uvt2025;

  const ingresos = num(i.ingresos);
  const patrimonio = num(i.patrimonio);
  const consumosTarjeta = num(i.consumosTarjeta);
  const compras = num(i.compras);
  const consignaciones = num(i.consignaciones);
  const responsableIva = String(i.responsableIva || 'no') === 'si';

  if (!responsableIva && ingresos === 0 && patrimonio === 0 && consumosTarjeta === 0 && compras === 0 && consignaciones === 0) {
    throw new Error('Ingresá al menos un valor de 2025 (ingresos, patrimonio, consumos o consignaciones)');
  }

  const topeIngresos = D.topeIngresosUvt * u25;             // $69.718.600
  const topePatrimonio = D.topePatrimonioUvt * u25;         // $224.095.500
  const topeConsumos = D.topeConsumosTarjetaUvt * u25;      // $69.718.600
  const topeCompras = D.topeComprasUvt * u25;               // $69.718.600
  const topeConsignaciones = D.topeConsignacionesUvt * u25; // $69.718.600

  // Art. 592 ET: ingresos brutos "inferiores a" 1.400 UVT no declaran (≥ tope → obligado);
  // patrimonio/consumos/compras/consignaciones "que no exceda(n)" el tope (> tope → obligado).
  const criterios = [
    { nombre: 'Ingresos brutos', valor: ingresos, tope: topeIngresos, uvt: D.topeIngresosUvt, supera: ingresos >= topeIngresos && ingresos > 0 },
    { nombre: 'Patrimonio bruto', valor: patrimonio, tope: topePatrimonio, uvt: D.topePatrimonioUvt, supera: patrimonio > topePatrimonio },
    { nombre: 'Consumos con tarjeta de crédito', valor: consumosTarjeta, tope: topeConsumos, uvt: D.topeConsumosTarjetaUvt, supera: consumosTarjeta > topeConsumos },
    { nombre: 'Compras y consumos totales', valor: compras, tope: topeCompras, uvt: D.topeComprasUvt, supera: compras > topeCompras },
    { nombre: 'Consignaciones, depósitos o inversiones', valor: consignaciones, tope: topeConsignaciones, uvt: D.topeConsignacionesUvt, supera: consignaciones > topeConsignaciones },
  ];

  const superados = criterios.filter((c) => c.supera);
  const obligado = responsableIva || superados.length > 0;

  // Criterio más cercano al tope (para el margen)
  const conValor = criterios.filter((c) => c.valor > 0);
  const masCercano = (conValor.length > 0 ? conValor : criterios)
    .reduce((a, b) => (a.valor / a.tope >= b.valor / b.tope ? a : b));
  const ratioMax = masCercano.valor / masCercano.tope;

  let motivo: string;
  if (responsableIva && superados.length === 0) {
    motivo = 'Sos responsable de IVA: declarás sin importar los topes.';
  } else if (obligado) {
    motivo = superados
      .map((c) => `${c.nombre}: ${fmtCOP(c.valor)} supera el tope de ${fmtCOP(c.tope)} (${c.uvt.toLocaleString('es-CO')} UVT) por ${fmtCOP(c.valor - c.tope)}`)
      .join('; ') + (responsableIva ? '; además sos responsable de IVA' : '');
  } else {
    motivo = `Ningún tope superado. El más cercano es ${masCercano.nombre.toLowerCase()}: ${fmtCOP(masCercano.valor)} de ${fmtCOP(masCercano.tope)} (te queda un margen de ${fmtCOP(masCercano.tope - masCercano.valor)}).`;
  }

  const _insight = {
    title: obligado ? 'Estás obligado a declarar renta en 2026' : 'No estás obligado a declarar renta en 2026',
    text: obligado
      ? `${responsableIva && superados.length === 0 ? 'Por ser **responsable de IVA** tenés que presentar declaración de renta del año gravable 2025, aunque no superes ningún tope.' : `Superás ${superados.length === 1 ? 'el tope de **' + superados[0].nombre.toLowerCase() + '**' : '**' + superados.length + ' topes**'} del art. 592 ET — basta con superar uno para quedar obligado.`} Los vencimientos van del **12 de agosto al 26 de octubre de 2026**, según los dos últimos dígitos de tu cédula/NIT. Ojo: estar obligado a declarar no siempre significa pagar impuesto.`
      : `Con los valores de 2025 que ingresaste no superás ninguno de los 5 topes de la DIAN, así que no tenés que declarar en 2026. El criterio que más se acerca es **${masCercano.nombre.toLowerCase()}** (${Math.round(ratioMax * 100)}% del tope). Aun así, podés declarar voluntariamente si te conviene recuperar retenciones.`,
    tone: obligado ? 'warning' : 'good',
    icon: obligado ? '📋' : '✅',
  };

  const pct = Math.min(Math.round(ratioMax * 100), 300);
  const _chart = {
    type: 'scale',
    marker: pct,
    markerLabel: `${pct}% del tope`,
    min: 0,
    segments: [
      { nombre: 'Lejos del tope', max: 80, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Cerca del tope', max: 100, color: '#eab308', colorDark: '#facc15' },
      { nombre: 'Obligado a declarar', max: Math.max(150, pct + 20), color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Tu ${masCercano.nombre.toLowerCase()} está al ${pct}% del tope de la DIAN (${fmtCOP(masCercano.tope)}). ${obligado ? 'Estás obligado a declarar.' : 'No estás obligado a declarar.'}`,
  };

  return {
    obligado: obligado ? 'Sí — tenés que declarar' : 'No — no estás obligado',
    motivo,
    topesSuperados: responsableIva && superados.length === 0
      ? 'Responsable de IVA (obligado directo)'
      : superados.length > 0 ? superados.map((c) => c.nombre).join(', ') : 'Ninguno',
    margenMasCercano: obligado
      ? (superados.length > 0 ? `${masCercano.nombre}: ${fmtCOP(masCercano.valor - masCercano.tope)} por encima del tope` : 'No aplica (obligado por IVA)')
      : `${masCercano.nombre}: ${fmtCOP(masCercano.tope - masCercano.valor)} por debajo del tope`,
    detalle: `Topes año gravable 2025 (UVT 2025 = ${fmtCOP(u25)}): ingresos/consumos/compras/consignaciones ${fmtCOP(topeIngresos)} (1.400 UVT); patrimonio ${fmtCOP(topePatrimonio)} (4.500 UVT). ${motivo}`,
    _insight,
    _chart,
  };
}
