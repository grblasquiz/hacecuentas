export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function piletaCloroLitrosVolumenDosificacion(i: Inputs): Outputs {
  const l = Number(i.largoM) || 0;
  const a = Number(i.anchoM) || 0;
  const p = Number(i.profundidadM) || 0;
  const ppm = Number(i.ppmObjetivo) || 2;
  // Pureza del producto (% de cloro activo). Hipoclorito de calcio granulado: 65% típico.
  // El form envía '' cuando el campo está vacío → Number('')=0, por eso el guard con default.
  const purezaRaw = Number(i.purezaPct);
  const pureza = Number.isFinite(purezaRaw) && purezaRaw > 0 ? purezaRaw : 65;

  const vol = l * a * p * 1000; // litros
  const m3 = vol / 1000;

  // Cloro activo necesario (mg) = volumen (L) × ppm. ÷1000 → gramos de cloro activo.
  const cloroActivoG = (vol * ppm) / 1000;
  // Gramos de producto comercial = cloro activo ÷ (pureza/100) = (vol × ppm) ÷ (10 × pureza%).
  const productoG = cloroActivoG / (pureza / 100);

  const volFmt = Math.round(vol).toLocaleString('es-AR');
  const m3Fmt = Math.round(m3).toLocaleString('es-AR');
  const productoFmt = Math.round(productoG).toLocaleString('es-AR');
  const activoFmt = Math.round(cloroActivoG).toLocaleString('es-AR');

  const _insight = {
    title: 'Dosis de cloro',
    text: `Tu pileta tiene unos **${m3Fmt} m³** (**${volFmt} L**). Para alcanzar **${ppm} ppm** de cloro libre con hipoclorito de calcio al **${pureza}%** agregá **${productoFmt} g** de producto granulado (equivalen a ${activoFmt} g de cloro activo puro). Disolvelo en un balde, distribuilo con la bomba en marcha y medí el nivel antes de bañarte.`,
    tone: 'neutral',
    icon: '🏊',
  };

  return {
    volumen: `${volFmt} L`,
    cloroGranulos: `${Math.round(productoG)} g`,
    frecuencia: 'Mantenimiento 2×/semana + choque al abrir',
    _insight,
  };
}
