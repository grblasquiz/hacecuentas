/** Test prenatal no invasivo (NIPT) precio Argentina por laboratorio */
export interface Inputs { laboratorio: string; tipoPanel: string; semanasGestacion: number; coberturaObraSocialPct: number; }
export interface Outputs { precioListaArs: number; coberturaArs: number; copagoArs: number; precioUsdEstimado: number; explicacion: string; }
export function testPrenatalNoInvasivoNiptPrecioArg(i: Inputs): Outputs {
  const lab = String(i.laboratorio || '').toLowerCase();
  const panel = String(i.tipoPanel || '').toLowerCase();
  const semanas = Number(i.semanasGestacion);
  const cobertura = Number(i.coberturaObraSocialPct) / 100;
  if (!semanas || semanas < 9) throw new Error('NIPT requiere mínimo 9-10 semanas de gestación');
  // Precios lista 2026 Argentina (ARS) — referencia
  const baseLab: Record<string, number> = {
    'genoma': 850000, 'biocodices': 920000, 'cibic': 780000, 'igen': 880000, 'manlab': 950000,
  };
  const multPanel: Record<string, number> = {
    'basico': 1, 'extendido': 1.25, 'completo': 1.5, 'microdeleciones': 1.7,
  };
  const base = baseLab[lab] ?? 880000;
  const mult = multPanel[panel] ?? 1;
  const precioLista = base * mult;
  const coberturaArs = precioLista * cobertura;
  const copago = precioLista - coberturaArs;
  const usd = precioLista / 1250;
  return {
    precioListaArs: Number(precioLista.toFixed(0)),
    coberturaArs: Number(coberturaArs.toFixed(0)),
    copagoArs: Number(copago.toFixed(0)),
    precioUsdEstimado: Number(usd.toFixed(0)),
    explicacion: `NIPT panel ${panel} en ${lab}: lista $${precioLista.toLocaleString('es-AR')} ARS. Tu copago estimado: $${copago.toLocaleString('es-AR')} ARS (cobertura ${(cobertura*100).toFixed(0)}%).`,
  };
}
