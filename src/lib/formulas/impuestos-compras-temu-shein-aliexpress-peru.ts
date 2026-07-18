/**
 * Impuestos a compras internacionales (Temu, Shein, AliExpress, Amazon) — Perú.
 * Régimen simplificado de envíos courier/postales (SUNAT):
 *   - Valor FOB hasta US$ 200: SIN tributos (de minimis) — llega directo.
 *   - FOB > US$ 200 y hasta US$ 2.000: Ad Valorem 4% + IGV 18% (16% IGV + 2% IPM)
 *     sobre la base (valor + ad valorem, cascada estándar del art. 13 de la Ley del IGV).
 *   - Más de US$ 2.000: régimen general de importación (agente de aduana, DUA).
 * OJO: en abril 2026 SUNAT ANUNCIÓ que evalúa gravar también las compras < US$ 200,
 * pero eso requiere cambiar la Ley General de Aduanas en el Congreso y NO está vigente.
 * Fuente: SUNAT (clasificación de envíos postales). Verificado 2026-07-18.
 */
import { COURIER_TRIBUTOS_PERU, fmtPEN2 } from '../data/peru-2026.ts';

export interface Inputs {
  valor?: number | string;        // valor de la compra en US$ (FOB)
  tipoCambio?: number | string;   // tipo de cambio S/ por US$ (editable)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const fmtUSD = (n: number) => 'US$ ' + new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);

export function compute(i: Inputs): Outputs {
  const valor = Math.max(0, Number(i.valor) || 0);
  const tc = Math.max(0.5, Number(i.tipoCambio) || 3.5);
  const { deMinimisUsd, topeSimplificadoUsd, adValorem, igv } = COURIER_TRIBUTOS_PERU;

  if (valor > topeSimplificadoUsd) {
    return {
      tributos: 'Excede el régimen courier',
      adValoremOut: 'Según subpartida (régimen general)',
      igvOut: '18% (régimen general)',
      totalConImpuestos: '—',
      detalle: `Compras por más de ${fmtUSD(topeSimplificadoUsd)} FOB no entran al régimen simplificado courier: pasan al régimen general de importación con agente de aduana y declaración (DUA), con aranceles según la partida de cada producto.`,
      _insight: {
        title: 'Supera el tope courier de US$ 2.000',
        text: `Tu compra de **${fmtUSD(valor)}** supera el tope FOB de **US$ 2.000** por envío del régimen simplificado. Debes importarla por el **régimen general** (agente de aduana + DUA) y el arancel dependerá de la subpartida de cada producto. Para evitarlo, divide la compra en envíos menores (máximo 3 importaciones al año de hasta US$ 1.000, o 1 de hasta US$ 2.000, como persona natural sin RUC).`,
        tone: 'warn',
        icon: '📦',
      },
    };
  }

  const exento = valor <= deMinimisUsd;
  const adv = exento ? 0 : valor * adValorem;
  const baseIgv = valor + adv;
  const igvMonto = exento ? 0 : baseIgv * igv;
  const tributosUsd = adv + igvMonto;
  const tributosSoles = tributosUsd * tc;
  const totalUsd = valor + tributosUsd;
  const pctSobreCompra = valor > 0 ? (tributosUsd / valor) * 100 : 0;

  const _insight = exento
    ? {
        title: 'Tu compra NO paga impuestos',
        text: `Tu compra de **${fmtUSD(valor)}** no supera el tope de **US$ 200 FOB**, así que entra como envío "de minimis": **S/ 0 de tributos**, sin trámite aduanero. Ojo: SUNAT anunció en abril 2026 que evalúa gravar estas compras con IGV 18%, pero necesita una ley del Congreso y **todavía no está vigente**.`,
        tone: 'good',
        icon: '🛍️',
      }
    : {
        title: 'Tu compra paga Ad Valorem + IGV',
        text: `Por superar los US$ 200, tu compra de **${fmtUSD(valor)}** paga **${fmtUSD(adv)}** de Ad Valorem (4%) más **${fmtUSD(igvMonto)}** de IGV (18% sobre valor + arancel): **${fmtUSD(tributosUsd)}** de tributos (~${pctSobreCompra.toFixed(1)}% extra), unos **${fmtPEN2(tributosSoles)}** al tipo de cambio ${tc.toLocaleString('de-DE', { minimumFractionDigits: 2 })}. El courier suele cobrarlos al entregarte el paquete.`,
        tone: 'warn',
        icon: '🛍️',
      };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Tu compra', value: Math.round(valor * 100) / 100 },
      { label: 'Ad Valorem 4%', value: Math.round(adv * 100) / 100 },
      { label: 'IGV 18%', value: Math.round(igvMonto * 100) / 100 },
    ].filter((s) => s.value > 0),
    prefix: 'US$ ',
    centerValue: fmtUSD(totalUsd),
    centerLabel: 'Total',
    ariaLabel: `Compra de ${fmtUSD(valor)} más ${fmtUSD(tributosUsd)} de tributos: total ${fmtUSD(totalUsd)}.`,
  };

  return {
    tributos: exento ? 'S/ 0 — exonerada (≤ US$ 200)' : `${fmtUSD(tributosUsd)} (≈ ${fmtPEN2(tributosSoles)})`,
    adValoremOut: exento ? 'US$ 0' : fmtUSD(adv),
    igvOut: exento ? 'US$ 0' : fmtUSD(igvMonto),
    totalConImpuestos: `${fmtUSD(totalUsd)} (≈ ${fmtPEN2(totalUsd * tc)})`,
    detalle: exento
      ? `Compra de ${fmtUSD(valor)} ≤ US$ 200 FOB → sin Ad Valorem ni IGV (régimen courier/postal SUNAT). Total: ${fmtUSD(valor)}.`
      : `Ad Valorem: 4% × ${fmtUSD(valor)} = ${fmtUSD(adv)} · IGV: 18% × (${fmtUSD(valor)} + ${fmtUSD(adv)}) = ${fmtUSD(igvMonto)} · Tributos: ${fmtUSD(tributosUsd)} ≈ ${fmtPEN2(tributosSoles)} (TC ${tc.toLocaleString('de-DE', { minimumFractionDigits: 2 })}).`,
    _insight,
    _chart,
  };
}
