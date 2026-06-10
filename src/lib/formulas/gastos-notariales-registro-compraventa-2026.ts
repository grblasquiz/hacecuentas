/**
 * Gastos de escrituración Colombia 2026 — notaría, registro, beneficencia y retefuente.
 * Constantes: COLOMBIA_2026.compraventa (Resolución SNR 2026-000964-6: derechos notariales 0,54%;
 * impuesto de registro Bogotá 1,67% + beneficencia 0,29%; retención 1% vendedor PN arts. 398-401 ET).
 */
import { COLOMBIA_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  valorInmueble: number;
  quienPagaNotaria?: string; // 'mitades' (uso Bogotá) | 'comprador' | 'vendedor'
  tipoVendedor?: string;     // 'natural' (retefuente 1%) | 'juridica'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const valor = i.valorInmueble === undefined || i.valorInmueble === null || (i.valorInmueble as any) === ''
    ? NaN : Number(i.valorInmueble);
  if (!Number.isFinite(valor) || valor <= 0) throw new Error('Ingresa el valor de venta del inmueble');

  const reparto = ['mitades', 'comprador', 'vendedor'].includes(String(i.quienPagaNotaria || 'mitades'))
    ? String(i.quienPagaNotaria || 'mitades') : 'mitades';
  const vendedorPN = String(i.tipoVendedor || 'natural') !== 'juridica';

  const C = COLOMBIA_2026.compraventa;

  // Componentes del cierre
  const notaria = valor * C.derechosNotariales;          // 0,54% del valor de la escritura
  const registro = valor * C.impuestoRegistroBogota;     // 1,67% — comprador (Bogotá/Cundinamarca)
  const beneficencia = valor * C.beneficenciaBogota;     // 0,29% — comprador
  const retefuente = vendedorPN ? valor * C.retencionVendedorPN : 0; // 1% — vendedor persona natural

  const notariaComprador = reparto === 'mitades' ? notaria / 2 : reparto === 'comprador' ? notaria : 0;
  const notariaVendedor = notaria - notariaComprador;

  const totalComprador = notariaComprador + registro + beneficencia;
  const totalVendedor = notariaVendedor + retefuente;
  const total = totalComprador + totalVendedor;

  const pct = (n: number) => ((n / valor) * 100).toFixed(2).replace('.', ',') + '%';

  // Impuesto de timbre: sólo si la venta supera 20.000 UVT (calc dedicada)
  const umbralTimbre = C.timbreDesdeUvt * COLOMBIA_2026.uvt; // $1.047.480.000 en 2026
  const aplicaTimbre = valor > umbralTimbre;

  const _insight = {
    title: 'Costo de cierre de la compraventa',
    text: aplicaTimbre
      ? `Los gastos de escrituración suman **${fmtCOP(total)}** (${pct(total)} del precio). OJO: como la venta supera ${fmtCOP(umbralTimbre)} (20.000 UVT), además aplica **impuesto de timbre** — calculalo aparte porque puede ser el rubro más grande del cierre.`
      : `Escriturar este inmueble cuesta **${fmtCOP(total)}** en total (${pct(total)} del precio): el comprador asume **${fmtCOP(totalComprador)}** y el vendedor **${fmtCOP(totalVendedor)}**. El rubro más pesado es el impuesto de registro (1,67%), que paga el comprador.`,
    tone: aplicaTimbre ? 'warn' : 'good',
    icon: '🏠',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Notaría (0,54%)', value: Math.round(notaria) },
      { label: 'Registro (1,67%)', value: Math.round(registro) },
      { label: 'Beneficencia (0,29%)', value: Math.round(beneficencia) },
      { label: 'Retefuente vendedor (1%)', value: Math.round(retefuente) },
    ].filter((s) => s.value > 0),
    prefix: '$ ',
    centerValue: fmtCOP(total),
    centerLabel: 'Total de cierre',
    ariaLabel: `Gastos de cierre de ${fmtCOP(total)}: notaría ${fmtCOP(notaria)}, registro ${fmtCOP(registro)}, beneficencia ${fmtCOP(beneficencia)} y retención en la fuente ${fmtCOP(retefuente)}.`,
  };

  const repartoTxt = reparto === 'mitades' ? 'notaría por mitades' : `notaría 100% a cargo del ${reparto}`;

  return {
    totalComprador: `${fmtCOP(totalComprador)} (${pct(totalComprador)} del precio)`,
    totalVendedor: `${fmtCOP(totalVendedor)} (${pct(totalVendedor)} del precio)`,
    totalCierre: `${fmtCOP(total)} (${pct(total)})`,
    detalle: `Notaría ${fmtCOP(notaria)} (${repartoTxt}) + registro ${fmtCOP(registro)} + beneficencia ${fmtCOP(beneficencia)} (comprador)` +
      (retefuente > 0 ? ` + retefuente ${fmtCOP(retefuente)} (vendedor persona natural)` : ' (vendedor persona jurídica: la retención del 1% en notaría no aplica)') +
      (aplicaTimbre ? `. ⚠️ Venta > 20.000 UVT: revisa el impuesto de timbre.` : '.'),
    _insight,
    _chart,
  };
}
