/** Moka Pot */
export interface Inputs { tazasMoka: string; }
export interface Outputs { gramosCafe: number; mlAgua: number; mlFinal: number; molido: string; tiempo: string; }

export function mokaPotAguaCafe(i: Inputs): Outputs {
  const tazas = Number(i.tazasMoka);
  if (!tazas) throw new Error('Ingresá tamaño');

  // Volúmenes típicos por tamaño
  const data: Record<number, { ml: number; cafe: number; agua: number }> = {
    1: { ml: 60, cafe: 7, agua: 50 },
    2: { ml: 100, cafe: 10, agua: 85 },
    3: { ml: 150, cafe: 16, agua: 130 },
    4: { ml: 200, cafe: 20, agua: 170 },
    6: { ml: 300, cafe: 30, agua: 250 },
    9: { ml: 450, cafe: 45, agua: 380 },
    12: { ml: 600, cafe: 60, agua: 500 },
  };
  const d = data[tazas] ?? data[3];
  let tiempo = '3-4 min a fuego medio';
  if (tazas >= 6) tiempo = '4-5 min a fuego medio';
  if (tazas <= 2) tiempo = '2-3 min a fuego medio';

  return {
    gramosCafe: d.cafe,
    mlAgua: d.agua,
    mlFinal: d.ml,
    molido: 'Medio-fino (más fino que V60, menos que espresso)',
    tiempo,
  };
}
