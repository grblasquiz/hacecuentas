/** Kefir leche */
export interface Inputs { gramosGranos: number; temperaturaAmbiente: number; intensidadDeseada: string; }
export interface Outputs { mlLeche: number; horasFermentacion: number; textura: string; frecuencia: string; consejos: string; }

export function kefirLecheProporciones(i: Inputs): Outputs {
  const g = Number(i.gramosGranos);
  const t = Number(i.temperaturaAmbiente);
  const int = String(i.intensidadDeseada);
  if (!g || g <= 0) throw new Error('Ingresá gramos');
  if (!t) throw new Error('Ingresá temperatura');

  // Ratio según intensidad
  const ratioMap: Record<string, number> = { suave: 1, media: 2, fuerte: 4 };
  const ratio = ratioMap[int] ?? 2;
  // Leche = granos × (100 / ratio%)
  const ml = g * 100 / ratio;

  // Tiempo a 22°C base
  const baseMap: Record<string, number> = { suave: 24, media: 20, fuerte: 14 };
  let h = baseMap[int] ?? 20;
  // Ajuste por temperatura
  if (t < 20) h *= 1.3;
  else if (t > 26) h *= 0.6;
  else if (t > 30) h *= 0.4;

  let textura = '';
  if (int === 'suave') textura = 'Bebible, yogur ligero, menos ácido';
  else if (int === 'media') textura = 'Cremoso, ácido balanceado';
  else textura = 'Espeso, ácido fuerte, ligeramente efervescente';

  let cons = '';
  if (t < 18) cons = 'Clima frío: pondré el frasco cerca de calefacción para acelerar.';
  else if (t > 28) cons = 'Clima cálido: chequeá desde 8h para no pasarte. Considerá menos granos.';
  else cons = 'Temperatura ideal para kefir.';

  return {
    mlLeche: Number(ml.toFixed(0)),
    horasFermentacion: Number(h.toFixed(0)),
    textura,
    frecuencia: 'Los granos crecen 5-15% por batch. Regalá/congelá el excedente cada 2 semanas.',
    consejos: cons,
  };
}
