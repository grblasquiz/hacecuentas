export interface Inputs {
  activo_total: number;
  pasivo_total: number;
  valor_uvt_2026: number;
}

export interface Outputs {
  patrimonio_liquido: number;
  uvt_base_exenta: number;
  base_gravable_cop: number;
  tramo_patrimonio: string;
  tarifa_aplicable: number;
  cuota_impuesto: number;
  tasa_efectiva: number;
  detalles_escala: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 según Ley 2277/2022 (DIAN)
  const BASE_EXENTA_UVT = 72000; // Exención patrimonio 72,000 UVT
  
  // Escala tributaria progresiva Ley 2277 (tarifas en %)
  const ESCALAS = [
    { minUVT: 0, maxUVT: 72000, tarifa: 0, nombre: "Exento" },
    { minUVT: 72000, maxUVT: 144000, tarifa: 0.5, nombre: "72,000 a 143,999 UVT" },
    { minUVT: 144000, maxUVT: 288000, tarifa: 0.75, nombre: "144,000 a 287,999 UVT" },
    { minUVT: 288000, maxUVT: 576000, tarifa: 1.0, nombre: "288,000 a 575,999 UVT" },
    { minUVT: 576000, maxUVT: Infinity, tarifa: 1.5, nombre: "576,000 UVT en adelante" }
  ];

  // Validaciones básicas
  const activo_total = Math.max(0, i.activo_total || 0);
  const pasivo_total = Math.max(0, i.pasivo_total || 0);
  const uvt = Math.max(1, i.valor_uvt_2026 || 47248);

  // 1. Calcular patrimonio líquido
  const patrimonio_liquido = activo_total - pasivo_total;

  // 2. Patrimonio líquido en UVT
  const patrimonio_en_uvt = patrimonio_liquido / uvt;

  // 3. Base exenta en COP
  const uvt_base_exenta = BASE_EXENTA_UVT;
  const base_exenta_cop = BASE_EXENTA_UVT * uvt;

  // 4. Base gravable: patrimonio líquido - exención
  const base_gravable_cop = Math.max(0, patrimonio_liquido - base_exenta_cop);

  // 5. Determinar tramo y tarifa aplicable
  let tramo_patrimonio = "Exento (patrimonio ≤ 72,000 UVT)";
  let tarifa_aplicable = 0;

  for (const escala of ESCALAS) {
    if (patrimonio_en_uvt >= escala.minUVT && patrimonio_en_uvt < escala.maxUVT) {
      tramo_patrimonio = escala.nombre;
      tarifa_aplicable = escala.tarifa;
      break;
    }
  }

  // 6. Calcular cuota de impuesto
  const cuota_impuesto = base_gravable_cop * (tarifa_aplicable / 100);

  // 7. Tasa efectiva (impuesto / patrimonio líquido)
  const tasa_efectiva = patrimonio_liquido > 0 
    ? (cuota_impuesto / patrimonio_liquido) * 100 
    : 0;

  // 8. Detalles de escala (informativo)
  const detalles_escala = `Patrimonio líquido: $${patrimonio_liquido.toLocaleString('es-CO', {maximumFractionDigits: 0})} COP = ${patrimonio_en_uvt.toFixed(2).toLocaleString('es-CO')} UVT. Base exenta: ${BASE_EXENTA_UVT.toLocaleString('es-CO')} UVT (~$${base_exenta_cop.toLocaleString('es-CO', {maximumFractionDigits: 0})} COP). Tarifa aplicable: ${tarifa_aplicable}% por tramo ${tramo_patrimonio}.`;

  return {
    patrimonio_liquido: Math.round(patrimonio_liquido),
    uvt_base_exenta: BASE_EXENTA_UVT,
    base_gravable_cop: Math.round(base_gravable_cop),
    tramo_patrimonio: tramo_patrimonio,
    tarifa_aplicable: tarifa_aplicable,
    cuota_impuesto: Math.round(cuota_impuesto),
    tasa_efectiva: Math.round(tasa_efectiva * 1000) / 1000,
    detalles_escala: detalles_escala
  };
}
