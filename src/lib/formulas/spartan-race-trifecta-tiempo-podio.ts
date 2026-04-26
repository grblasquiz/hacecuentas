/** Tiempo aproximado de podio en Spartan Sprint/Super/Beast por categoría de edad. */
export interface Inputs { distancia: 'sprint' | 'super' | 'beast'; categoriaEdad: '18-29' | '30-39' | '40-49' | '50+'; genero: 'M' | 'F'; }
export interface Outputs { tiempoPodioMinutos: number; tiempoPodioTexto: string; tiempoTop10Minutos: number; explicacion: string; }
export function spartanRaceTrifectaTiempoPodio(i: Inputs): Outputs {
  // Tiempos podio (top 3) en minutos según data histórica Spartan World 2024-2025
  const podio: Record<string, Record<string, number>> = {
    sprint: { '18-29': 38, '30-39': 42, '40-49': 48, '50+': 55 },
    super: { '18-29': 65, '30-39': 72, '40-49': 82, '50+': 95 },
    beast: { '18-29': 110, '30-39': 120, '40-49': 135, '50+': 155 },
  };
  let base = podio[i.distancia]?.[i.categoriaEdad];
  if (!base) throw new Error('Datos no disponibles para esa combinación');
  if (i.genero === 'F') base *= 1.18;
  const top10 = base * 1.25;
  const h = Math.floor(base / 60);
  const m = Math.round(base - h * 60);
  return {
    tiempoPodioMinutos: Number(base.toFixed(1)),
    tiempoPodioTexto: h > 0 ? `${h}h ${m.toString().padStart(2, '0')}m` : `${m}m`,
    tiempoTop10Minutos: Number(top10.toFixed(1)),
    explicacion: `Para subir al podio en Spartan ${i.distancia} categoría ${i.categoriaEdad} (${i.genero === 'F' ? 'femenino' : 'masculino'}), necesitás ~${base.toFixed(0)} minutos. Top 10 ~${top10.toFixed(0)} minutos.`,
  };
}
