/** Precio pase Cerro Catedral Bariloche según temporada y modalidad. */
export interface Inputs { temporada: 'baja' | 'media' | 'alta'; modalidad: 'dia' | 'tres-dias' | 'semana' | 'temporada'; categoriaEdad: 'menor' | 'adulto' | 'mayor'; }
export interface Outputs { precioArs: number; precioPorDiaArs: number; ahorroVsDiarioPct: number; explicacion: string; }
export function esquiPaseCerroCatedralBarilochePrecioDia(i: Inputs): Outputs {
  // Precios referenciales temporada 2026 (ARS) - Cerro Catedral
  const precioDia: Record<string, number> = { baja: 65000, media: 95000, alta: 125000 };
  const baseDia = precioDia[i.temporada];
  if (!baseDia) throw new Error('Temporada inválida');
  const factoresMod: Record<string, { factor: number; dias: number }> = {
    dia: { factor: 1, dias: 1 },
    'tres-dias': { factor: 2.7, dias: 3 },
    semana: { factor: 5.5, dias: 6 },
    temporada: { factor: 18, dias: 60 },
  };
  const mod = factoresMod[i.modalidad];
  if (!mod) throw new Error('Modalidad inválida');
  let precio = baseDia * mod.factor;
  // Descuentos por edad
  if (i.categoriaEdad === 'menor') precio *= 0.6;
  else if (i.categoriaEdad === 'mayor') precio *= 0.7;
  const precioPorDia = precio / mod.dias;
  const ahorro = ((baseDia - precioPorDia) / baseDia) * 100;
  return {
    precioArs: Number(precio.toFixed(0)),
    precioPorDiaArs: Number(precioPorDia.toFixed(0)),
    ahorroVsDiarioPct: Number(ahorro.toFixed(1)),
    explicacion: `Pase ${i.modalidad} en temporada ${i.temporada} para ${i.categoriaEdad}: $${precio.toLocaleString('es-AR')} ARS ($${precioPorDia.toLocaleString('es-AR')}/día). Ahorro vs diario: ${ahorro.toFixed(1)}%.`,
  };
}
