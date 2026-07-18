import { NAFTA_NACIONAL, NAFTA_POR_PROVINCIA, NAFTA_META, type NaftaPrecios } from '../data/nafta-precios';
import { fmtARS } from '../data/argentina-2026';

export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * ¿Cuánto sale llenar el tanque? litros a cargar × precio del litro.
 * Precio: editable, o promedio oficial por provincia/nacional (Secretaría de Energía,
 * precios en surtidor Res. 314/2016, snapshot del data file).
 */
export function compute(i: Inputs): Outputs {
  const capacidad = Math.min(300, Math.max(1, Number(i.capacidadTanque) || 45));
  const nivelPct = Math.min(100, Math.max(0, Number(i.nivelActualPct) || 0));
  const combustible = String(i.combustible || 'Nafta Súper') as keyof NaftaPrecios;
  const provincia = String(i.provincia || 'nacional');
  const precioManual = Math.max(0, Number(i.precioLitro) || 0);

  const tabla: NaftaPrecios = provincia !== 'nacional' && NAFTA_POR_PROVINCIA[provincia]
    ? NAFTA_POR_PROVINCIA[provincia]
    : NAFTA_NACIONAL;
  const precioTabla = tabla[combustible] ?? NAFTA_NACIONAL[combustible] ?? 0;
  const precio = precioManual > 0 ? precioManual : (precioTabla || 0);

  const litros = capacidad * (1 - nivelPct / 100);
  const costo = litros * precio;
  const tanqueCompleto = capacidad * precio;

  const origenPrecio = precioManual > 0
    ? 'precio cargado por vos'
    : `promedio ${provincia === 'nacional' ? 'nacional' : provincia} ${NAFTA_META.mes} (Sec. Energía)`;

  const out: Outputs = {
    costoLlenado: fmtARS(costo),
    litrosACargar: litros.toLocaleString('es-AR', { maximumFractionDigits: 2 }) + ' L',
    precioPorLitro: `${fmtARS(precio)} · ${origenPrecio}`,
    tanqueCompletoDesdeCero: fmtARS(tanqueCompleto),
  };

  out._insight = {
    title: `Llenar el tanque: ${fmtARS(costo)}`,
    text:
      `Te faltan **${litros.toLocaleString('es-AR', { maximumFractionDigits: 2 })} litros** para llenar un tanque de ${capacidad} L que está al ${nivelPct}%. ` +
      `A **${fmtARS(precio)}** el litro de ${combustible} (${origenPrecio}), la carga sale **${fmtARS(costo)}**. ` +
      `De vacío a lleno serían ${fmtARS(tanqueCompleto)}. Los precios varían fuerte por provincia y bandera (YPF suele estar debajo del promedio; AXION y PUMA arriba): si tenés el precio del surtidor de tu estación, cargalo para el número exacto.`,
    tone: 'neutral',
    icon: '⛽',
  };
  return out;
}
