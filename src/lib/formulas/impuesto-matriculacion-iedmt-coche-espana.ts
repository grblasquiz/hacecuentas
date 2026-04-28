export interface Inputs {
  precio_sin_iva: number;       // Precio del vehículo sin IVA en euros
  emisiones_co2: number;        // Emisiones de CO2 en g/km (ciclo WLTP)
  comunidad_autonoma: string;   // 'peninsula_baleares' | 'canarias' | 'ceuta_melilla'
  tipo_iva: number;             // 21 | 7 | 0
}

export interface Outputs {
  tramo_co2: string;      // Descripción del tramo de emisiones
  tipo_iedmt: number;     // Tipo aplicable en porcentaje (0, 4.75, 9.75, 14.75, etc.)
  cuota_iedmt: number;    // Cuota IEDMT en euros
  cuota_iva: number;      // Cuota IVA o IGIC en euros
  total_a_pagar: number;  // Total estimado: precio sin IVA + IEDMT + IVA/IGIC
  exento: string;         // 'Sí' | 'No'
}

// Tipos IEDMT vigentes 2026 — Ley 38/1992, art. 70
// Fuente: https://www.boe.es/buscar/act.php?id=BOE-A-1992-28741
const TIPOS_IEDMT: Record<string, number[]> = {
  // Tramos: [exento, 121-159, 160-199, >=200]
  peninsula_baleares: [0, 4.75, 9.75, 14.75],
  canarias:           [0, 3.75, 8.75, 13.75],
  ceuta_melilla:      [0, 2.75, 6.75, 10.75],
};

const TRAMOS_CO2 = [
  { max: 120,  label: '≤ 120 g/km (exento)',  index: 0 },
  { max: 159,  label: '121 – 159 g/km',       index: 1 },
  { max: 199,  label: '160 – 199 g/km',       index: 2 },
  { max: Infinity, label: '≥ 200 g/km',       index: 3 },
];

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function compute(i: Inputs): Outputs {
  // Valores por defecto / saneamiento
  const precio = Math.max(0, i.precio_sin_iva || 0);
  const co2    = Math.max(0, i.emisiones_co2  || 0);
  const ccaa   = i.comunidad_autonoma in TIPOS_IEDMT
    ? i.comunidad_autonoma
    : 'peninsula_baleares';
  const ivaRate = [0, 7, 21].includes(Number(i.tipo_iva))
    ? Number(i.tipo_iva)
    : 21;

  // Determinar tramo de CO2
  const tramo = TRAMOS_CO2.find(t => co2 <= t.max) ?? TRAMOS_CO2[3];

  // Obtener tipo IEDMT según territorio y tramo
  const tipos  = TIPOS_IEDMT[ccaa];
  const tipo   = tipos[tramo.index];

  // Cálculo de cuotas
  // Base imponible IEDMT = precio sin IVA (art. 69 Ley 38/1992)
  const cuota_iedmt = round2(precio * tipo / 100);

  // IVA / IGIC sobre el precio sin IVA
  // Nota: en la práctica algunos concesionarios incluyen el IEDMT en la base del IVA;
  // aquí se aplica el método estricto (IEDMT fuera de la base del IVA).
  const cuota_iva   = round2(precio * ivaRate / 100);

  const total_a_pagar = round2(precio + cuota_iedmt + cuota_iva);

  const exento = tipo === 0 ? 'Sí' : 'No';

  return {
    tramo_co2:    tramo.label,
    tipo_iedmt:   tipo,
    cuota_iedmt,
    cuota_iva,
    total_a_pagar,
    exento,
  };
}
