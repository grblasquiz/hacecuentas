/** Impuesto a la renta Perú — 4ta y 5ta categoría 2026
 *  UIT 2026 estimada: S/ 5,350 (basado en UIT 2025: S/ 5,150 + inflación)
 */

export interface Inputs {
  ingresoAnual: number;
  categoria: string;
  deduccionesAdicionales: number;
}

export interface Outputs {
  ingresos: number;
  deduccion20Porc: number;
  deduccion7Uit: number;
  rentaNetaTrabajo: number;
  impuestoBruto: number;
  tasaEfectiva: number;
  formula: string;
  explicacion: string;
}

const UIT = 5_350; // UIT 2026 estimada

// Tabla impuesto renta trabajo (4ta + 5ta categoría)
// Art. 53 LIR
const TABLA: Array<{ hastaUit: number; tasa: number }> = [
  { hastaUit: 5, tasa: 8 },
  { hastaUit: 20, tasa: 14 },
  { hastaUit: 35, tasa: 17 },
  { hastaUit: 45, tasa: 20 },
  { hastaUit: Infinity, tasa: 30 },
];

function calcImpuesto(rentaNeta: number): number {
  if (rentaNeta <= 0) return 0;
  const rentaUit = rentaNeta / UIT;
  let impuesto = 0;
  let anterior = 0;

  for (const t of TABLA) {
    const tramo = Math.min(rentaUit, t.hastaUit) - anterior;
    if (tramo <= 0) break;
    impuesto += tramo * UIT * (t.tasa / 100);
    anterior = t.hastaUit;
    if (rentaUit <= t.hastaUit) break;
  }

  return impuesto;
}

export function impuestoRentaPeru(i: Inputs): Outputs {
  const ingreso = Number(i.ingresoAnual);
  const categoria = String(i.categoria || '5ta');
  const deduccionesAd = Number(i.deduccionesAdicionales) || 0;

  if (!ingreso || ingreso <= 0) throw new Error('Ingresá tu ingreso anual en soles');

  let deduccion20Porc = 0;
  const deduccion7Uit = 7 * UIT; // S/ 37,450

  if (categoria === '4ta') {
    // 4ta categoría: 20% de deducción (máximo 24 UIT)
    deduccion20Porc = Math.min(ingreso * 0.20, 24 * UIT);
  }

  // Renta neta de trabajo
  const rentaBruta = ingreso - deduccion20Porc;
  const rentaNetaTrabajo = Math.max(0, rentaBruta - deduccion7Uit - deduccionesAd);

  const impuestoBruto = calcImpuesto(rentaNetaTrabajo);
  const tasaEfectiva = ingreso > 0 ? (impuestoBruto / ingreso) * 100 : 0;

  const catStr = categoria === '4ta' ? '4ta categoría (independiente)' : '5ta categoría (dependiente)';
  const formula = `Renta neta = S/${ingreso.toLocaleString()} - ${categoria === '4ta' ? `20% (S/${deduccion20Porc.toLocaleString()}) - ` : ''}7 UIT (S/${deduccion7Uit.toLocaleString()}) = S/${rentaNetaTrabajo.toLocaleString()}`;
  const explicacion = `Renta ${catStr}: ingreso anual S/${ingreso.toLocaleString()}.${deduccion20Porc > 0 ? ` Deducción 20%: S/${deduccion20Porc.toLocaleString()}.` : ''} Deducción 7 UIT: S/${deduccion7Uit.toLocaleString()}${deduccionesAd > 0 ? `. Otras deducciones: S/${deduccionesAd.toLocaleString()}` : ''}. Renta neta: S/${rentaNetaTrabajo.toLocaleString()}. Impuesto a la renta: S/${Math.round(impuestoBruto).toLocaleString()} (tasa efectiva ${tasaEfectiva.toFixed(2)}%). UIT 2026: S/${UIT.toLocaleString()}.`;

  return {
    ingresos: ingreso,
    deduccion20Porc: Math.round(deduccion20Porc),
    deduccion7Uit: deduccion7Uit,
    rentaNetaTrabajo: Math.round(rentaNetaTrabajo),
    impuestoBruto: Math.round(impuestoBruto),
    tasaEfectiva: Number(tasaEfectiva.toFixed(2)),
    formula,
    explicacion,
  };
}
