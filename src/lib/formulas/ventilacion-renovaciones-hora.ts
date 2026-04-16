export interface Inputs { ambiente: string; largo: number; ancho: number; alto: number; }
export interface Outputs { m3h: number; renovaciones: number; volumen: number; extractorRecomendado: string; }
const RENOV: Record<string, number> = { cocina: 12, bano: 10, dormitorio: 3, oficina: 6, garaje: 8, comercio: 10 };
export function ventilacionRenovacionesHora(i: Inputs): Outputs {
  const amb = String(i.ambiente || 'cocina');
  const vol = Number(i.largo) * Number(i.ancho) * Number(i.alto);
  if (vol <= 0) throw new Error('Ingresá las medidas del ambiente');
  const renov = RENOV[amb] || 6;
  const m3h = Math.round(vol * renov);
  let extractor = '';
  if (m3h <= 100) extractor = 'Extractor chico (100 m³/h) — tipo baño';
  else if (m3h <= 300) extractor = 'Extractor mediano (300 m³/h) — tipo cocina';
  else if (m3h <= 600) extractor = 'Extractor grande (600 m³/h) — tipo campana';
  else extractor = 'Extractor industrial o múltiples extractores';
  return { m3h, renovaciones: renov, volumen: Number(vol.toFixed(1)), extractorRecomendado: extractor };
}