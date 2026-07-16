/**
 * Nuevo Crédito MIVIVIENDA + Bono del Buen Pagador (BBP) — Perú.
 * Calcula el BBP según el valor de la vivienda, la cuota inicial mínima (7,5%),
 * el monto a financiar (valor − inicial − BBP) y la cuota mensual (sistema francés).
 *
 * BBP: subsidio directo no reembolsable que otorga el Fondo MIVIVIENDA y se aplica
 * como parte de la cuota inicial. Los montos por tramo de valor de vivienda son
 * REFERENCIALES 2026 (Fondo MIVIVIENDA los actualiza por circular); el usuario puede
 * sobrescribir el BBP con el monto vigente. La matemática de la cuota es exacta.
 *
 * Fuente: Fondo MIVIVIENDA — Nuevo Crédito MIVIVIENDA / Bono del Buen Pagador.
 */
import { fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  valorVivienda: number;     // valor de la vivienda (S/)
  cuotaInicialPct?: number;  // % de cuota inicial que aporta el comprador (mín. 7,5%)
  tasaTea?: number;          // Tasa Efectiva Anual del crédito (%)
  plazoAnios?: number;       // plazo del crédito en años (5 a 25)
  bbpManual?: number;        // opcional: BBP exacto vigente (S/) — sobrescribe el estimado por tramo
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/**
 * Tramos referenciales del Bono del Buen Pagador 2026 (Fondo MIVIVIENDA) por valor
 * de vivienda, en soles. VERIFICAR el monto vigente en la circular del Fondo.
 */
const BBP_TRAMOS: { hasta: number; bono: number; label: string }[] = [
  { hasta: 93700, bono: 26300, label: 'hasta S/ 93.700' },
  { hasta: 139900, bono: 22700, label: 'S/ 93.700 – 139.900' },
  { hasta: 232600, bono: 21400, label: 'S/ 139.900 – 232.600' },
  { hasta: 371900, bono: 11800, label: 'S/ 232.600 – 371.900' },
  { hasta: 464200, bono: 6100, label: 'S/ 371.900 – 464.200' },
];

function bonoPorValor(valor: number): { bono: number; label: string } {
  for (const t of BBP_TRAMOS) {
    if (valor <= t.hasta) return { bono: t.bono, label: t.label };
  }
  return { bono: 0, label: 'fuera del rango del programa' };
}

export function compute(i: Inputs): Outputs {
  const valor = Number(i.valorVivienda) || 0;
  if (valor <= 0) throw new Error('Ingresá el valor de la vivienda (S/)');

  const inicialPct = Math.max(7.5, Number(i.cuotaInicialPct) || 7.5) / 100; // mínimo 7,5%
  const tea = (Number(i.tasaTea) || 8.5) / 100;
  const plazo = Math.min(25, Math.max(1, Number(i.plazoAnios) || 20));

  const tramo = bonoPorValor(valor);
  const bbpManual = Number(i.bbpManual) || 0;
  const bbp = bbpManual > 0 ? bbpManual : tramo.bono;

  const cuotaInicial = valor * inicialPct;
  // El BBP se aplica como parte de la cuota inicial: reduce el monto a financiar.
  const montoFinanciar = Math.max(0, valor - cuotaInicial - bbp);

  // Cuota mensual, sistema francés (cuota fija). Tasa mensual = (1+TEA)^(1/12) − 1.
  const iMensual = Math.pow(1 + tea, 1 / 12) - 1;
  const n = plazo * 12;
  const cuotaMensual = iMensual > 0
    ? montoFinanciar * (iMensual * Math.pow(1 + iMensual, n)) / (Math.pow(1 + iMensual, n) - 1)
    : montoFinanciar / n;
  const totalPagado = cuotaMensual * n;
  const totalIntereses = totalPagado - montoFinanciar;

  const dentroRango = valor >= 65200 && valor <= 464200;

  const _insight = {
    title: bbp > 0 ? 'Con el Bono del Buen Pagador' : 'Fuera del rango del BBP',
    text: bbp > 0
      ? `Para una vivienda de **${fmtPEN(valor)}**, el Bono del Buen Pagador estimado es **${fmtPEN(bbp)}** (tramo ${tramo.label}). Aportando **${(inicialPct * 100).toLocaleString('es-PE', { maximumFractionDigits: 1 })}%** de cuota inicial (${fmtPEN(cuotaInicial)}) y descontando el bono, financiás **${fmtPEN(montoFinanciar)}**: una cuota de **${fmtPEN(cuotaMensual)}/mes** a ${plazo} años (TEA ${(tea * 100).toLocaleString('es-PE', { maximumFractionDigits: 2 })}%).`
      : `Una vivienda de **${fmtPEN(valor)}** queda fuera del rango del Nuevo Crédito MIVIVIENDA con BBP (aprox. S/ 65.200 – S/ 464.200). Financiás **${fmtPEN(montoFinanciar)}**: cuota de **${fmtPEN(cuotaMensual)}/mes** a ${plazo} años.`,
    tone: bbp > 0 ? 'good' : 'neutral',
    icon: '🏠',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Cuota inicial', value: Math.round(cuotaInicial) },
      { label: 'Bono del Buen Pagador', value: Math.round(bbp) },
      { label: 'Monto financiado', value: Math.round(montoFinanciar) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(bbp),
    centerLabel: 'BBP estimado',
    ariaLabel: `Compra de vivienda de ${fmtPEN(valor)}: bono ${fmtPEN(bbp)}, inicial ${fmtPEN(cuotaInicial)} y ${fmtPEN(montoFinanciar)} financiados.`,
  };

  return {
    bono: fmtPEN(bbp),
    cuotaInicial: fmtPEN(cuotaInicial),
    montoFinanciar: fmtPEN(montoFinanciar),
    cuotaMensual: fmtPEN(cuotaMensual),
    totalIntereses: fmtPEN(totalIntereses),
    tramoBbp: tramo.label,
    detalle: `Valor ${fmtPEN(valor)} − inicial ${fmtPEN(cuotaInicial)} − BBP ${fmtPEN(bbp)} = ${fmtPEN(montoFinanciar)} a financiar · cuota ${fmtPEN(cuotaMensual)}/mes × ${n} meses · intereses ${fmtPEN(totalIntereses)}.${dentroRango ? '' : ' (Valor fuera del rango referencial del programa.)'}`,
    _insight,
    _chart,
  };
}
