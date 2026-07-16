/**
 * Costo de importar un auto usado — PARAGUAY.
 *
 * Nacionalizar un vehículo importado a Paraguay suma, sobre el valor CIF (costo +
 * seguro + flete):
 *
 *  1. Arancel de importación (derecho aduanero): 10% a 20% del CIF según cilindrada
 *     y combustible. Los vehículos 100% eléctricos están exentos (0%).
 *  2. IVA de importación: 10% sobre (CIF + arancel).
 *  3. Gastos de despacho: honorario del despachante de aduana (obligatorio,
 *     matriculado) + INTN + tasas y servicios. Estimación referencial, editable.
 *
 * Importante: está prohibida la importación de autos con más de 10 años de
 * antigüedad, y la aduana puede reajustar el valor declarado. Los aranceles exactos
 * los define el simulador de tributos de la DNIT / tu despachante.
 * Moneda: guaraníes (PYG).
 */
import { PARAGUAY_2026, TIPO_CAMBIO_PY, fmtPYG } from '../data/paraguay-2026.ts';

// Aranceles referenciales por tipo de vehículo (rango 10%–20% + exención eléctricos).
const ARANCELES: Record<string, number> = {
  auto: 0.20,        // automóvil de pasajeros (referencial máximo)
  utilitario: 0.10,  // utilitario / pick-up
  medio: 0.14,       // gama intermedia
  electrico: 0.0,    // 100% eléctrico — exento
};

export interface Inputs {
  valorCif: number;         // valor CIF del vehículo
  monedaCif?: string;       // 'USD' | 'PYG' — moneda en que ingresás el CIF
  tipoArancel?: string;     // 'auto' | 'utilitario' | 'medio' | 'electrico'
  gastosDespacho?: number;  // gastos de despacho (opcional; default = 3% del CIF)
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; }

export function compute(i: Inputs): Outputs {
  const valorCif = Number(i.valorCif) || 0;
  if (valorCif <= 0) throw new Error('Ingresá el valor CIF del vehículo');
  const enUsd = String(i.monedaCif || 'USD') === 'USD';
  const tipo = String(i.tipoArancel || 'auto');
  const rate = ARANCELES[tipo] ?? ARANCELES.auto;

  // CIF a guaraníes (si viene en dólares, se convierte con la referencia BCP).
  const cifGs = enUsd ? valorCif * TIPO_CAMBIO_PY.usdPyg : valorCif;

  const arancel = Math.round(cifGs * rate);
  const baseIva = cifGs + arancel;
  const iva = Math.round(baseIva * PARAGUAY_2026.iva.general); // 10%
  const gastosDespacho = i.gastosDespacho != null && Number(i.gastosDespacho) > 0
    ? Math.round(Number(i.gastosDespacho))
    : Math.round(cifGs * 0.03); // estimación referencial del despacho

  const totalTributos = arancel + iva;
  const costoTotal = Math.round(cifGs) + totalTributos + gastosDespacho;

  const _table = {
    title: 'Desglose del costo de nacionalización',
    headers: ['Concepto', 'Base / tasa', 'Monto'],
    rows: [
      ['Valor CIF', enUsd ? `US$ convertido a Gs.` : 'ingresado en Gs.', fmtPYG(Math.round(cifGs))],
      [`Arancel de importación (${(rate * 100).toLocaleString('de-DE')}%)`, `CIF × ${(rate * 100).toLocaleString('de-DE')}%`, fmtPYG(arancel)],
      ['IVA (10%)', '(CIF + arancel) × 10%', fmtPYG(iva)],
      ['Gastos de despacho', 'despachante + tasas', fmtPYG(gastosDespacho)],
      ['Costo total estimado', '', fmtPYG(costoTotal)],
    ],
    note: `Arancel referencial ${(rate * 100).toLocaleString('de-DE')}% (rango 10%–20%; eléctricos 0%). La aduana puede reajustar el valor declarado. Verificá el arancel exacto por cilindrada/combustible en el simulador de la DNIT o con tu despachante.`,
  };

  const _insight = {
    type: 'highlight',
    icon: '🚙',
    text: `Sobre un CIF de **${fmtPYG(Math.round(cifGs))}**, los tributos (arancel ${(rate * 100).toLocaleString('de-DE')}% + IVA 10%) suman **${fmtPYG(totalTributos)}** y, con el despacho (${fmtPYG(gastosDespacho)}), el costo total de nacionalización ronda **${fmtPYG(costoTotal)}**.`,
  };

  return {
    cifGs: fmtPYG(Math.round(cifGs)),
    arancel: fmtPYG(arancel),
    iva: fmtPYG(iva),
    gastosDespacho: fmtPYG(gastosDespacho),
    totalTributos: fmtPYG(totalTributos),
    costoTotal: fmtPYG(costoTotal),
    detalle: `CIF ${fmtPYG(Math.round(cifGs))} + arancel ${fmtPYG(arancel)} + IVA ${fmtPYG(iva)} + despacho ${fmtPYG(gastosDespacho)} = ${fmtPYG(costoTotal)}.`,
    _insight,
    _table,
  };
}
