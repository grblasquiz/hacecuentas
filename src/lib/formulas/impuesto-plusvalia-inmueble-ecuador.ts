/**
 * Impuesto a las utilidades y plusvalía en la transferencia de inmuebles urbanos — Ecuador.
 * Base legal: Art. 556 del COOTAD (tarifa 10% sobre las utilidades y plusvalía de la
 * transferencia de predios urbanos; modificable por ordenanza, p.ej. Loja aplica 5%).
 * Deducciones (Art. 557 COOTAD): costo de adquisición, valor de mejoras/obra nueva incorporada,
 * contribución especial de mejoras pagada al GAD, y el 5% de las utilidades líquidas por cada
 * año transcurrido desde la adquisición hasta la venta (a los 20 años la deducción llega al
 * 100% → exención, Art. 559 COOTAD).
 * Ecuador está dolarizado → todos los montos en USD ("$"), sin conversión.
 * Fuentes:
 *  - COOTAD Art. 556/557/559 (Registro Oficial Supl. 303, 2010, con reformas vigentes 2026).
 *  - GAD Municipal de Cuenca, "Impuesto por Utilidades y Plusvalía" (10%).
 *    https://www.cuenca.gob.ec/content/impuesto-por-utilidades-y-plusvalia
 */
import { fmtUSDec } from '../data/ecuador-2026.ts';

// Tarifa general nacional del impuesto (Art. 556 COOTAD). Algunos GAD la modifican por ordenanza.
// fuente: COOTAD Art. 556; GAD Cuenca, 2026.
const TASA_GENERAL_COOTAD = 0.10;      // 10% — tarifa nacional por defecto
const DEDUCCION_POR_ANIO = 0.05;       // 5% de las utilidades líquidas por año de tenencia (Art. 557)
const ANIOS_EXENCION = 20;             // a los 20 años la deducción llega al 100% → exención (Art. 559)

export interface Inputs {
  precioCompra: number;          // valor de adquisición (USD)
  precioVenta: number;           // valor de venta / transferencia (USD)
  mejoras?: number;              // obra nueva / mejoras incorporadas desde la compra (USD)
  contribucionMejoras?: number;  // contribución especial de mejoras pagada al GAD (USD)
  aniosTenencia?: number;        // años transcurridos entre compra y venta
  tasaMunicipal?: number;        // % de la ordenanza local (si difiere del 10% nacional)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const precioCompra = Number(i.precioCompra) || 0;
  const precioVenta = Number(i.precioVenta) || 0;
  // Campos numéricos opcionales: el form manda '' → tratamos ''/null/undefined como 0.
  const mejoras = i.mejoras === '' as any || i.mejoras == null ? 0 : Number(i.mejoras) || 0;
  const contribucionMejoras =
    i.contribucionMejoras === '' as any || i.contribucionMejoras == null ? 0 : Number(i.contribucionMejoras) || 0;
  const aniosTenencia =
    i.aniosTenencia === '' as any || i.aniosTenencia == null ? 0 : Math.max(0, Number(i.aniosTenencia) || 0);
  // Tasa: usa la ordenanza local si se ingresa (>0), si no la tarifa nacional del 10%.
  const tasaIn = i.tasaMunicipal === '' as any || i.tasaMunicipal == null ? NaN : Number(i.tasaMunicipal);
  const tasa = Number.isFinite(tasaIn) && tasaIn > 0 ? tasaIn / 100 : TASA_GENERAL_COOTAD;

  if (precioVenta <= 0) throw new Error('Ingresá el precio de venta del inmueble');
  if (precioCompra <= 0) throw new Error('Ingresá el precio de compra (valor de adquisición)');

  // 1) Utilidad bruta = venta − (compra + mejoras + contribución especial de mejoras).
  const costoTotal = precioCompra + mejoras + contribucionMejoras;
  const utilidadBruta = precioVenta - costoTotal;

  // Sin utilidad no hay impuesto.
  if (utilidadBruta <= 0) {
    const _insight = {
      title: 'No hay utilidad gravada',
      text: `El precio de venta (**${fmtUSDec(precioVenta)}**) no supera el costo total deducible (**${fmtUSDec(costoTotal)}** = compra + mejoras + contribución de mejoras). Al no haber utilidad, no se genera impuesto a la plusvalía (Art. 556 COOTAD).`,
      tone: 'neutral',
      icon: '🏠',
    };
    return {
      impuesto: fmtUSDec(0),
      utilidadBruta: fmtUSDec(utilidadBruta),
      utilidadGravada: fmtUSDec(0),
      deduccionAnios: fmtUSDec(0),
      tasaAplicada: (tasa * 100).toLocaleString('es-EC', { maximumFractionDigits: 2 }) + '%',
      netoVendedor: fmtUSDec(precioVenta),
      detalle: `Venta ${fmtUSDec(precioVenta)} ≤ costo total ${fmtUSDec(costoTotal)} → utilidad 0 → impuesto 0.`,
      _insight,
      _chart: {
        type: 'donut',
        segments: [{ label: 'Costo total (sin utilidad)', value: Math.round(precioVenta * 100) / 100 }],
        ariaLabel: 'Sin utilidad: no hay impuesto a la plusvalía.',
      },
    };
  }

  // 2) Deducción del 5% de las utilidades líquidas por cada año de tenencia (tope 20 años = 100%).
  const aniosComputables = Math.min(aniosTenencia, ANIOS_EXENCION);
  const factorDeduccionAnios = Math.min(1, aniosComputables * DEDUCCION_POR_ANIO); // 0 … 1
  const deduccionAnios = utilidadBruta * factorDeduccionAnios;

  // 3) Utilidad gravada = utilidad bruta − deducción por años.
  const utilidadGravada = Math.max(0, utilidadBruta - deduccionAnios);

  // 4) Impuesto = tasa × utilidad gravada.
  const impuesto = utilidadGravada * tasa;

  // Neto que le queda al vendedor tras el impuesto.
  const netoVendedor = precioVenta - impuesto;

  const exento = aniosTenencia >= ANIOS_EXENCION;
  const _insight = {
    title: exento ? 'Venta exenta por tenencia' : 'Tu impuesto a la plusvalía',
    text: exento
      ? `Con **${aniosTenencia} años** de tenencia, la deducción del 5%/año llega al 100%: la transferencia queda **exenta** (Art. 559 COOTAD). Sobre una utilidad de **${fmtUSDec(utilidadBruta)}** no pagás impuesto a la plusvalía.`
      : `Sobre una utilidad de **${fmtUSDec(utilidadBruta)}**, la deducción por **${aniosTenencia} año(s)** de tenencia (${(factorDeduccionAnios * 100).toLocaleString('es-EC', { maximumFractionDigits: 0 })}%) baja la base gravada a **${fmtUSDec(utilidadGravada)}**. El impuesto a las utilidades y plusvalía es **${fmtUSDec(impuesto)}** (${(tasa * 100).toLocaleString('es-EC', { maximumFractionDigits: 2 })}%), que paga el vendedor en el GAD municipal.`,
    tone: exento ? 'good' : 'neutral',
    icon: '📈',
  };

  const _chart = {
    type: 'donut',
    segments: [
      { label: 'Costo total (compra + mejoras)', value: Math.round(costoTotal * 100) / 100 },
      { label: 'Deducción por años de tenencia', value: Math.round(deduccionAnios * 100) / 100 },
      { label: 'Impuesto plusvalía', value: Math.round(impuesto * 100) / 100 },
      { label: 'Utilidad neta del vendedor', value: Math.round((utilidadGravada - impuesto) * 100) / 100 },
    ].filter((s) => s.value > 0),
    ariaLabel: `De una venta de ${fmtUSDec(precioVenta)}, el impuesto a la plusvalía es ${fmtUSDec(impuesto)}.`,
  };

  return {
    impuesto: fmtUSDec(impuesto),
    utilidadBruta: fmtUSDec(utilidadBruta),
    utilidadGravada: fmtUSDec(utilidadGravada),
    deduccionAnios: fmtUSDec(deduccionAnios),
    tasaAplicada: (tasa * 100).toLocaleString('es-EC', { maximumFractionDigits: 2 }) + '%',
    netoVendedor: fmtUSDec(netoVendedor),
    detalle: `Utilidad ${fmtUSDec(utilidadBruta)} − deducción ${aniosTenencia} año(s) ${fmtUSDec(deduccionAnios)} = base ${fmtUSDec(utilidadGravada)} × ${(tasa * 100).toLocaleString('es-EC', { maximumFractionDigits: 2 })}% = ${fmtUSDec(impuesto)}.`,
    _insight,
    _chart,
  };
}
