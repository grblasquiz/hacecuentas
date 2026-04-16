/**
 * Calculadora de Costo Mensual de Mascota - Argentina
 * Estimación: alimento + veterinario + antiparasitarios + otros
 */
export interface CostoMascotaInputs { tipoMascota: string; tamano: string; tipoAlimento: string; }
export interface CostoMascotaOutputs { costoMensual: number; alimento: number; veterinario: number; otros: number; costoAnual: number; }

export function costoMascotaMensual(inputs: CostoMascotaInputs): CostoMascotaOutputs {
  const tipo = inputs.tipoMascota || 'perro';
  const tamano = inputs.tamano || 'mediano';
  const alim = inputs.tipoAlimento || 'premium';

  // Kg de alimento por mes según tamaño
  const kgMes: Record<string, Record<string, number>> = {
    perro: { pequeno: 3, mediano: 7, grande: 14 },
    gato: { pequeno: 1.5, mediano: 2, grande: 3 },
  };
  // Precio por kg según gama (AR$ 2026 estimado)
  const precioPorKg: Record<string, number> = { economico: 4000, premium: 8000, 'super-premium': 12000 };

  const kg = (kgMes[tipo] || kgMes.perro)[tamano] || 7;
  const precioKg = precioPorKg[alim] || 8000;
  const alimento = kg * precioKg;

  // Veterinario prorrateado mensual
  const vetBase = tipo === 'perro' ? 15000 : 10000;
  const veterinario = tamano === 'grande' ? vetBase * 1.3 : tamano === 'pequeno' ? vetBase * 0.8 : vetBase;

  // Antiparasitarios + higiene + accesorios
  const otrosBase = tipo === 'perro' ? 20000 : 12000;
  const otros = tamano === 'grande' ? otrosBase * 1.4 : tamano === 'pequeno' ? otrosBase * 0.7 : otrosBase;

  const costoMensual = Math.round(alimento + veterinario + otros);
  const costoAnual = costoMensual * 12;

  return {
    costoMensual,
    alimento: Math.round(alimento),
    veterinario: Math.round(veterinario),
    otros: Math.round(otros),
    costoAnual,
  };
}
