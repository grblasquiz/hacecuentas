// Desglose del precio de la bencina (Chile) — impuesto específico, IVA y componente base por litro.
// El impuesto específico (Ley 18.502 + MEPCO) se expresa en UTM/m³ y varía cada semana por el MEPCO.
import { CHILE_2026, fmtCLP } from '../data/chile-2026.ts';

export interface Inputs {
  precioLitro: number;    // precio de venta en surtidor (CLP/L)
  tipoCombustible: string; // 'g93' | 'g97' | 'diesel'
  valorUTM: number;       // valor de la UTM (CLP)
}
export interface Outputs {
  impuestoEspecifico: number;
  iva: number;
  componenteBase: number;
  totalImpuestos: number;
  porcentajeImpuestos: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

// Impuesto específico final (base + componente MEPCO) en UTM/m³ — referencia mayo 2026 (SII/MEPCO).
// 1 m³ = 1.000 litros. Cambia cada jueves con el nuevo decreto MEPCO.
const TASA_UTM_M3: Record<string, { valor: number; nombre: string }> = {
  g93: { valor: 5.1774, nombre: 'Gasolina 93 octanos' },
  g97: { valor: 5.2286, nombre: 'Gasolina 97 octanos' },
  diesel: { valor: 2.5123, nombre: 'Petróleo diésel' },
};

const UTM_FALLBACK = 71_649;  // UTM jul-2026 (mindicador.cl / SII), fallback.

export function compute(i: Inputs): Outputs {
  const precio = Math.max(0, Number(i.precioLitro) || 0);
  const utm = Number(i.valorUTM) > 0 ? Number(i.valorUTM) : UTM_FALLBACK;
  const comb = TASA_UTM_M3[String(i.tipoCombustible)] || TASA_UTM_M3.g93;

  // Impuesto específico por litro = (UTM/m³) × UTM ÷ 1.000.
  const impuestoEspecifico = Math.round((comb.valor * utm) / 1000);
  // IVA (19%) incluido en el precio de venta: precio × 0,19/1,19.
  const iva = Math.round(precio * (CHILE_2026.iva / (1 + CHILE_2026.iva)));
  // Componente base (paridad de importación + margen + transporte).
  const componenteBase = Math.max(0, Math.round(precio - iva - impuestoEspecifico));

  const totalImpuestos = impuestoEspecifico + iva;
  const porcentajeImpuestos = precio > 0 ? Math.round((totalImpuestos / precio) * 1000) / 10 : 0;

  const _insight = {
    title: `Impuestos: ${fmtCLP(totalImpuestos)} de cada litro (${porcentajeImpuestos.toLocaleString('es-CL')}%)`,
    text: `De los **${fmtCLP(precio)}** que pagás por litro de ${comb.nombre.toLowerCase()}, **${fmtCLP(impuestoEspecifico)}** son impuesto específico y **${fmtCLP(iva)}** son IVA: en total **${fmtCLP(totalImpuestos)}** (${porcentajeImpuestos.toLocaleString('es-CL')}%) se los lleva el Estado. Los otros **${fmtCLP(componenteBase)}** cubren el combustible, el margen y el transporte. El impuesto específico se ajusta cada semana por el MEPCO.`,
    tone: 'neutral',
    icon: '⛽',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Combustible + margen', value: componenteBase },
      { label: 'Impuesto específico', value: impuestoEspecifico },
      { label: 'IVA', value: iva },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmtCLP(precio),
    centerLabel: 'Precio/litro',
    ariaLabel: `De ${fmtCLP(precio)} por litro: ${fmtCLP(componenteBase)} combustible y margen, ${fmtCLP(impuestoEspecifico)} impuesto específico, ${fmtCLP(iva)} IVA.`,
  };

  return {
    impuestoEspecifico,
    iva,
    componenteBase,
    totalImpuestos,
    porcentajeImpuestos,
    detalle: `${comb.nombre}: específico ${fmtCLP(impuestoEspecifico)} + IVA ${fmtCLP(iva)} = ${fmtCLP(totalImpuestos)} (${porcentajeImpuestos.toLocaleString('es-CL')}% de ${fmtCLP(precio)}).`,
    _insight,
    _chart,
  };
}
