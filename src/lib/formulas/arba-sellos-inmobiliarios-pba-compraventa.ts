export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
// Provincia de Buenos Aires — Impuesto de Sellos, Ley Impositiva 15.558 (vigente 2026).
// Alícuota general compraventa/transferencia de dominio de inmuebles: 2% sobre el mayor
// entre precio de escritura y valuación fiscal, repartido por mitades (1% c/u) salvo pacto.
// Exención por vivienda única, familiar y de ocupación permanente: rige sobre la VALUACIÓN
// FISCAL del inmueble (no sobre el precio), con un tope bajo definido en la ley impositiva.
// Como esta calc toma el valor de operación (no la valuación fiscal), la exención se informa
// como posible: ARBA la aplica recién al verificar la valuación fiscal del inmueble.
const ALICUOTA_SELLOS_PBA = 0.02; // 2% — Ley Impositiva PBA 15.558 (2026)
export function arbaSellosInmobiliariosPbaCompraventa(i: Inputs): Outputs {
  const v=Number(i.valorPropiedad)||0; const u=String(i.unicaVivienda||'no');
  const aliq=ALICUOTA_SELLOS_PBA;
  const total=v*aliq; const porParte=total/2;
  const posibleExento = u==='si';
  const _insight = {
    title: 'Impuesto de sellos (PBA)',
    text: `Sobre una operación de **$${Math.round(v).toLocaleString('es-AR')}** el sello es del **2%** = **$${Math.round(total).toLocaleString('es-AR')}**, y cada parte aporta $${Math.round(porParte).toLocaleString('es-AR')} (1% c/u).${posibleExento?' Por ser vivienda única, familiar y de ocupación permanente podés quedar **exento** si la valuación fiscal del inmueble no supera el tope de la Ley Impositiva PBA — ARBA lo verifica sobre la valuación fiscal, no sobre el precio.':' Si fuera vivienda única, familiar y de ocupación permanente con valuación fiscal bajo el tope de la ley, la operación estaría exenta.'}`,
    tone: 'warn',
    icon: '🏛️',
  };
  return { sellos:`$${Math.round(total).toLocaleString('es-AR')}`, porParte:`$${Math.round(porParte).toLocaleString('es-AR')}`, interpretacion:`Sellos 2% = $${Math.round(total).toLocaleString('es-AR')}. Paga mitad cada parte (1% c/u).${posibleExento?' Posible exención por vivienda única según valuación fiscal.':''}`, _insight };
}
