/**
 * Recibo de gas natural Cálidda (Lima y Callao) — estimador residencial.
 * Estructura del recibo: cargo fijo mensual + consumo (m³ × precio por m³) + IGV 18%.
 * El precio del m³ residencial agrupa la molécula (gas), el transporte y el margen
 * de distribución regulado por Osinergmin. Los valores por defecto son
 * REFERENCIALES 2026; el usuario puede pegar el cargo fijo y el precio por m³ de su
 * pliego para un cálculo exacto.
 *
 * Fuente: Cálidda (Gas Natural de Lima y Callao) / Osinergmin — pliego tarifario
 * residencial. IGV 18% importado de peru-2026.
 */
import { PERU_2026, fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  consumoM3: number;    // consumo del mes en m³
  precioM3?: number;    // precio por m³ sin IGV (S/) — opcional, referencial si no se ingresa
  cargoFijo?: number;   // cargo fijo mensual sin IGV (S/) — opcional
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

// Referenciales residenciales Cálidda 2026 (sin IGV), tarifa categoría residencial baja.
const PRECIO_M3_REF = 2.05;  // S/ por m³ (molécula + transporte + distribución)
const CARGO_FIJO_REF = 3.40; // S/ mensual

export function compute(i: Inputs): Outputs {
  const consumo = Number(i.consumoM3) || 0;
  if (consumo <= 0) throw new Error('Ingresá tu consumo del mes en m³');

  const precioM3 = Number(i.precioM3) > 0 ? Number(i.precioM3) : PRECIO_M3_REF;
  const cargoFijo = Number(i.cargoFijo) > 0 ? Number(i.cargoFijo) : CARGO_FIJO_REF;

  const consumoEnergia = consumo * precioM3;
  const subtotal = cargoFijo + consumoEnergia;
  const igv = subtotal * PERU_2026.igv; // 18%
  const total = subtotal + igv;
  const costoPorM3 = total / consumo;

  // Comparación referencial vs GLP (balón de 10 kg): el gas natural suele costar
  // mucho menos por energía equivalente. 1 m³ de gas natural ≈ 0,74 kg de GLP.
  const _insight = {
    title: 'Tu recibo de gas natural',
    text: `Con **${consumo} m³** de consumo, tu recibo Cálidda estimado es **${fmtPEN(total)}** (cargo fijo ${fmtPEN(cargoFijo)} + energía ${fmtPEN(consumoEnergia)} + IGV ${fmtPEN(igv)}), es decir **${fmtPEN(costoPorM3)}/m³** todo incluido. El gas natural por red es de los servicios más económicos del hogar: el mismo consumo en balones de GLP costaría bastante más.`,
    tone: 'good',
    icon: '🔥',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Energía (m³)', value: Math.round(consumoEnergia * 100) / 100 },
      { label: 'Cargo fijo', value: Math.round(cargoFijo * 100) / 100 },
      { label: 'IGV (18%)', value: Math.round(igv * 100) / 100 },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(total),
    centerLabel: 'Total del recibo',
    ariaLabel: `Recibo de gas de ${fmtPEN(total)}: energía ${fmtPEN(consumoEnergia)}, cargo fijo ${fmtPEN(cargoFijo)} e IGV ${fmtPEN(igv)}.`,
  };

  return {
    total: fmtPEN(total),
    consumoEnergia: fmtPEN(consumoEnergia),
    cargoFijo: fmtPEN(cargoFijo),
    igv: fmtPEN(igv),
    costoPorM3: fmtPEN(costoPorM3) + '/m³',
    detalle: `${consumo} m³ × ${fmtPEN(precioM3)}/m³ = ${fmtPEN(consumoEnergia)} + cargo fijo ${fmtPEN(cargoFijo)} = ${fmtPEN(subtotal)} + IGV 18% (${fmtPEN(igv)}) = ${fmtPEN(total)}. Precios referenciales; verificá el pliego vigente de Cálidda.`,
    _insight,
    _chart,
  };
}
