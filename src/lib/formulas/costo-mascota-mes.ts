/** Costo mensual estimado de tener una mascota en Argentina */
export interface Inputs {
  tipoMascota?: string;
  incluyeVeterinario?: string;
}
export interface Outputs {
  costoMensual: number;
  costoAlimento: number;
  costoVeterinario: number;
  costoOtros: number;
  costoAnual: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function costoMascotaMes(i: Inputs): Outputs {
  const tipo = String(i.tipoMascota || 'perro-mediano');
  const incluyeVet = String(i.incluyeVeterinario || 'si');

  // Costos estimados en ARS (revalidados julio 2026, orientativos)
  const costos: Record<string, { alimento: number; vet: number; otros: number; nombre: string }> = {
    'perro-chico': { alimento: 30000, vet: 13000, otros: 15000, nombre: 'Perro chico (<10 kg)' },
    'perro-mediano': { alimento: 55000, vet: 15000, otros: 12000, nombre: 'Perro mediano (10-25 kg)' },
    'perro-grande': { alimento: 90000, vet: 18000, otros: 16000, nombre: 'Perro grande (>25 kg)' },
    gato: { alimento: 24000, vet: 12000, otros: 18000, nombre: 'Gato' },
  };

  const data = costos[tipo] || costos['perro-mediano'];

  const costoVeterinario = incluyeVet === 'si' ? data.vet : 0;
  const costoMensual = data.alimento + costoVeterinario + data.otros;
  const costoAnual = costoMensual * 12;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const pctAlim = costoMensual > 0 ? Math.round((data.alimento / costoMensual) * 100) : 0;
  const slices = [
    { label: 'Alimento', value: data.alimento },
  ];
  if (costoVeterinario > 0) slices.push({ label: 'Veterinario', value: costoVeterinario });
  slices.push({ label: 'Higiene y extras', value: data.otros });

  return {
    costoMensual,
    costoAlimento: data.alimento,
    costoVeterinario,
    costoOtros: data.otros,
    costoAnual,
    detalle: `${data.nombre}: ~$${fmt.format(costoMensual)}/mes (alimento $${fmt.format(data.alimento)} + ${incluyeVet === 'si' ? `veterinario $${fmt.format(costoVeterinario)} + ` : ''}higiene y extras $${fmt.format(data.otros)}). Costo anual: ~$${fmt.format(costoAnual)}. Valores orientativos Argentina julio 2026.`,
    _insight: {
      title: 'Lo que sale tener tu mascota',
      text: `${data.nombre} cuesta unos **$${fmt.format(costoMensual)}/mes**, o sea **$${fmt.format(costoAnual)}** al año. El alimento se lleva el grueso del gasto (**${pctAlim}%**, $${fmt.format(data.alimento)}/mes).`,
      tone: 'neutral',
      icon: tipo === 'gato' ? '🐱' : '🐶',
    },
    _chart: {
      type: 'doughnut',
      slices,
      prefix: '$',
      centerValue: `$${fmt.format(costoMensual)}`,
      centerLabel: 'Por mes',
      ariaLabel: `El costo mensual de $${fmt.format(costoMensual)} se reparte en alimento $${fmt.format(data.alimento)}${costoVeterinario > 0 ? `, veterinario $${fmt.format(costoVeterinario)}` : ''} e higiene y extras $${fmt.format(data.otros)}.`,
    },
  };
}
