/**
 * Calculadora de Costo Mensual de Mascota - Argentina
 * Estimación: alimento + veterinario + antiparasitarios + otros
 */
export interface CostoMascotaInputs { tipoMascota: string; tamano: string; tipoAlimento: string; }
export interface CostoMascotaOutputs { costoMensual: number; alimento: number; veterinario: number; otros: number; costoAnual: number; _insight?: any; _chart?: any; }

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

  const alimentoR = Math.round(alimento);
  const veterinarioR = Math.round(veterinario);
  const otrosR = Math.round(otros);
  const fmt = (n: number) => `$${Math.round(n).toLocaleString('es-AR')}`;
  const pctAlim = costoMensual > 0 ? Math.round((alimentoR / costoMensual) * 100) : 0;
  const nombreTipo = tipo === 'gato' ? 'gato' : 'perro';

  return {
    costoMensual,
    alimento: alimentoR,
    veterinario: veterinarioR,
    otros: otrosR,
    costoAnual,
    _insight: {
      title: 'Lo que sale mantener tu mascota',
      text: `Tu ${nombreTipo} ${tamano} cuesta unos **${fmt(costoMensual)}/mes**, o sea **${fmt(costoAnual)}** al año. El alimento se lleva la mayor parte (**${pctAlim}%**, ${fmt(alimentoR)}/mes).`,
      tone: 'neutral',
      icon: tipo === 'gato' ? '🐱' : '🐶',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Alimento', value: alimentoR },
        { label: 'Veterinario', value: veterinarioR },
        { label: 'Higiene y extras', value: otrosR },
      ],
      prefix: '$',
      centerValue: fmt(costoMensual),
      centerLabel: 'Por mes',
      ariaLabel: `El costo mensual de ${fmt(costoMensual)} se reparte en alimento ${fmt(alimentoR)}, veterinario ${fmt(veterinarioR)} e higiene y extras ${fmt(otrosR)}.`,
    },
  };
}
