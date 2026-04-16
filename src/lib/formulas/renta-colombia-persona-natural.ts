/** Impuesto de renta Colombia persona natural 2026
 *  Tabla Art. 241 Estatuto Tributario (UVT 2026 estimado $49,799)
 */

export interface Inputs {
  ingresoAnualCop: number;
  deduccionesAnuales: number;
  rentasExentas: number;
  retencionesAnuales: number;
}

export interface Outputs {
  ingresoNeto: number;
  rentaGravable: number;
  rentaGravableUvt: number;
  impuestoBruto: number;
  retencionAcreditada: number;
  impuestoNeto: number;
  tasaEfectiva: number;
  formula: string;
  explicacion: string;
}

// UVT 2026 estimado (UVT 2025: $49,799 — ajuste por inflación ~6%)
const UVT = 52_787;

// Tabla Art. 241 ET — personas naturales (en UVT)
const TABLA_RENTA: Array<{
  desde: number; hasta: number; tasa: number; formula: (uvt: number) => number;
}> = [
  { desde: 0, hasta: 1090, tasa: 0, formula: () => 0 },
  { desde: 1090, hasta: 1700, tasa: 19, formula: (uvt) => (uvt - 1090) * 0.19 },
  { desde: 1700, hasta: 4100, tasa: 28, formula: (uvt) => 115.9 + (uvt - 1700) * 0.28 },
  { desde: 4100, hasta: 8670, tasa: 33, formula: (uvt) => 787.9 + (uvt - 4100) * 0.33 },
  { desde: 8670, hasta: 18970, tasa: 35, formula: (uvt) => 2296 + (uvt - 8670) * 0.35 },
  { desde: 18970, hasta: 31000, tasa: 37, formula: (uvt) => 5901 + (uvt - 18970) * 0.37 },
  { desde: 31000, hasta: Infinity, tasa: 39, formula: (uvt) => 10352 + (uvt - 31000) * 0.39 },
];

function calcImpuestoUVT(rentaUvt: number): number {
  if (rentaUvt <= 0) return 0;
  for (const t of TABLA_RENTA) {
    if (rentaUvt > t.desde && rentaUvt <= t.hasta) {
      return t.formula(rentaUvt);
    }
  }
  const last = TABLA_RENTA[TABLA_RENTA.length - 1];
  return last.formula(rentaUvt);
}

export function rentaColombiaPersonaNatural(i: Inputs): Outputs {
  const ingreso = Number(i.ingresoAnualCop);
  const deducciones = Number(i.deduccionesAnuales) || 0;
  const exentas = Number(i.rentasExentas) || 0;
  const retenciones = Number(i.retencionesAnuales) || 0;

  if (!ingreso || ingreso <= 0) throw new Error('Ingresá tu ingreso anual en COP');

  const ingresoNeto = ingreso - deducciones;
  // Límite 40% de deducciones y exenciones (Art. 336 ET)
  const limiteExenciones = ingresoNeto * 0.40;
  const totalExenciones = Math.min(exentas, limiteExenciones);
  const rentaGravable = Math.max(0, ingresoNeto - totalExenciones);
  const rentaGravableUvt = rentaGravable / UVT;

  const impuestoUvt = calcImpuestoUVT(rentaGravableUvt);
  const impuestoBruto = Math.round(impuestoUvt * UVT);
  const retencionAcreditada = Math.min(retenciones, impuestoBruto);
  const impuestoNeto = Math.max(0, impuestoBruto - retencionAcreditada);
  const tasaEfectiva = ingreso > 0 ? (impuestoNeto / ingreso) * 100 : 0;

  const formula = `Renta gravable: ${rentaGravableUvt.toFixed(0)} UVT → Impuesto: ${impuestoUvt.toFixed(1)} UVT × $${UVT.toLocaleString()} = $${impuestoBruto.toLocaleString()}`;
  const explicacion = `Ingreso anual: $${ingreso.toLocaleString()} COP. Deducciones: $${deducciones.toLocaleString()}. Rentas exentas aplicadas: $${totalExenciones.toLocaleString()} (tope 40%). Renta gravable: $${rentaGravable.toLocaleString()} (${rentaGravableUvt.toFixed(0)} UVT). Impuesto bruto: $${impuestoBruto.toLocaleString()}. Retenciones acreditadas: $${retencionAcreditada.toLocaleString()}. Impuesto neto a pagar: $${impuestoNeto.toLocaleString()} COP (tasa efectiva ${tasaEfectiva.toFixed(2)}%).`;

  return {
    ingresoNeto: Math.round(ingresoNeto),
    rentaGravable: Math.round(rentaGravable),
    rentaGravableUvt: Number(rentaGravableUvt.toFixed(2)),
    impuestoBruto,
    retencionAcreditada,
    impuestoNeto,
    tasaEfectiva: Number(tasaEfectiva.toFixed(2)),
    formula,
    explicacion,
  };
}
