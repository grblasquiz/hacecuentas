/**
 * Régimen Especial de Renta (RER) — Perú 2026.
 * Calcula la cuota mensual del Impuesto a la Renta del RER (1,5% de los ingresos netos mensuales),
 * el IGV resultante de la operación, el total a pagar a SUNAT y verifica si el negocio cumple los
 * topes para acogerse o permanecer en el RER (ingresos/compras anuales ≤ S/ 525.000 y ≤ 10 trabajadores).
 *
 * Fuentes (verificado 2026-06-15):
 * - SUNAT — RER: https://www.gob.pe/6989-regimen-especial-de-renta-rer
 *   cuota IR 1,5% de ingresos netos mensuales; tope ingresos/compras anuales S/ 525.000;
 *   máx. 10 trabajadores por turno; activos fijos ≤ S/ 126.000 (excl. predios y vehículos);
 *   declaración mensual (Formulario 621), sin declaración anual.
 * - SUNAT — IGV 18% (16% IGV + 2% IPM): tasa general.
 */
import { PERU_2026, fmtPEN } from '../data/peru-2026.ts';

// Constantes del RER 2026 — fuente: SUNAT, https://www.gob.pe/6989-regimen-especial-de-renta-rer, 2026
const RER = {
  tasaRenta: 0.015,        // 1,5% de los ingresos netos mensuales (Impuesto a la Renta)
  topeIngresosAnual: 525000, // S/ — tope de ingresos netos anuales
  topeComprasAnual: 525000,  // S/ — tope de adquisiciones (compras) anuales
  maxTrabajadores: 10,       // por turno de trabajo
  topeActivosFijos: 126000,  // S/ — valor de activos fijos (excluye predios y vehículos)
} as const;

export interface Inputs {
  ingresosMensuales: number;   // ingresos netos del mes (sin IGV), S/
  igvCompras?: number;         // IGV de compras del mes (crédito fiscal), S/ — opcional
  trabajadores?: number;       // cantidad de trabajadores (por turno) — opcional, para verificar el tope
  incluyeIgvVentas?: string;   // 'si' si quiere ver el IGV de las ventas y total a pagar
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const ingresos = Number(i.ingresosMensuales) || 0;
  if (ingresos <= 0) throw new Error('Ingresá los ingresos netos del mes (mayores a 0)');

  // Acepta '' / null / undefined como ausentes (FieldRow manda '' en campos opcionales vacíos).
  const igvCompras = i.igvCompras === '' || i.igvCompras == null ? 0 : Math.max(0, Number(i.igvCompras) || 0);
  const trabajadores = i.trabajadores === '' || i.trabajadores == null ? 0 : Math.max(0, Math.floor(Number(i.trabajadores) || 0));
  const verIgv = String(i.incluyeIgvVentas || 'si') === 'si';

  // 1) Impuesto a la Renta del RER: 1,5% de los ingresos netos del mes.
  const cuotaRenta = ingresos * RER.tasaRenta;

  // 2) IGV: débito fiscal (18% de las ventas) menos crédito fiscal (IGV de compras).
  const igvVentas = ingresos * PERU_2026.igv;
  const igvPagar = verIgv ? Math.max(0, igvVentas - igvCompras) : 0;

  // 3) Total a pagar a SUNAT en el mes (Formulario 621): Renta + IGV.
  const totalPagar = cuotaRenta + igvPagar;

  // 4) Proyección anual de ingresos (12 meses al mismo ritmo) y verificación de topes.
  const ingresosAnualProyectado = ingresos * 12;
  const superaTopeIngresos = ingresosAnualProyectado > RER.topeIngresosAnual;
  const superaTopeTrabajadores = trabajadores > RER.maxTrabajadores;
  const cumpleRequisitos = !superaTopeIngresos && !superaTopeTrabajadores;
  const margenIngresos = RER.topeIngresosAnual - ingresosAnualProyectado; // positivo = margen disponible

  // Estado e _insight según cumplimiento de topes.
  let tone: string, icon: string, title: string, text: string;
  if (!cumpleRequisitos) {
    tone = 'warn';
    icon = '⚠️';
    title = 'Tu negocio supera los topes del RER';
    const motivos: string[] = [];
    if (superaTopeIngresos)
      motivos.push(`tus ingresos proyectados (**${fmtPEN(ingresosAnualProyectado)}** al año) superan el tope de **${fmtPEN(RER.topeIngresosAnual)}**`);
    if (superaTopeTrabajadores)
      motivos.push(`tenés **${trabajadores} trabajadores**, por encima del máximo de **${RER.maxTrabajadores}** por turno`);
    text = `Con estos datos **no cumplís los requisitos del RER**: ${motivos.join(' y ')}. En ese caso corresponde pasar al **Régimen MYPE Tributario (RMT)** o al **Régimen General**, donde el impuesto se calcula sobre la utilidad y no sobre los ingresos.`;
  } else {
    tone = 'good';
    icon = '🧾';
    title = 'Cumplís los topes del RER';
    text = `Pagás **${fmtPEN(cuotaRenta)}** de Impuesto a la Renta este mes (**1,5%** de ${fmtPEN(ingresos)})${verIgv ? ` más **${fmtPEN(igvPagar)}** de IGV` : ''}, total **${fmtPEN(totalPagar)}** a SUNAT con el Formulario 621. Proyectando 12 meses llegarías a **${fmtPEN(ingresosAnualProyectado)}**, con un margen de **${fmtPEN(Math.max(0, margenIngresos))}** antes del tope anual de ${fmtPEN(RER.topeIngresosAnual)}.`;
  }

  const _insight = { title, text, tone, icon };

  const slices = verIgv
    ? [
        { label: 'Renta RER (1,5%)', value: Math.round(cuotaRenta) },
        { label: 'IGV neto a pagar', value: Math.round(igvPagar) },
      ].filter((s) => s.value > 0)
    : [
        { label: 'Renta RER (1,5%)', value: Math.round(cuotaRenta) },
        { label: 'Te queda', value: Math.round(ingresos - cuotaRenta) },
      ].filter((s) => s.value > 0);

  const _chart = {
    type: 'doughnut',
    slices,
    prefix: 'S/ ',
    centerValue: fmtPEN(totalPagar),
    centerLabel: verIgv ? 'Total a SUNAT' : 'Renta del mes',
    ariaLabel: `Cuota del RER: ${fmtPEN(cuotaRenta)} de Impuesto a la Renta${verIgv ? ` y ${fmtPEN(igvPagar)} de IGV` : ''}, total ${fmtPEN(totalPagar)} a SUNAT.`,
  };

  return {
    cuotaRenta: fmtPEN(cuotaRenta),
    igvPagar: verIgv ? fmtPEN(igvPagar) : 'No calculado',
    totalPagar: fmtPEN(totalPagar),
    ingresosAnualProyectado: fmtPEN(ingresosAnualProyectado),
    estadoRequisitos: cumpleRequisitos ? 'Cumple los topes del RER' : 'Supera los topes del RER',
    detalle: `Renta: 1,5% de ${fmtPEN(ingresos)} = ${fmtPEN(cuotaRenta)}${verIgv ? ` · IGV: 18% de ventas (${fmtPEN(igvVentas)}) − crédito (${fmtPEN(igvCompras)}) = ${fmtPEN(igvPagar)}` : ''} · Total Formulario 621: ${fmtPEN(totalPagar)}.`,
    _insight,
    _chart,
  };
}
