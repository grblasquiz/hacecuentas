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
}

export function costoMascotaMes(i: Inputs): Outputs {
  const tipo = String(i.tipoMascota || 'perro-mediano');
  const incluyeVet = String(i.incluyeVeterinario || 'si');

  // Costos estimados en ARS (abril 2026, orientativos)
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

  return {
    costoMensual,
    costoAlimento: data.alimento,
    costoVeterinario,
    costoOtros: data.otros,
    costoAnual,
    detalle: `${data.nombre}: ~$${fmt.format(costoMensual)}/mes (alimento $${fmt.format(data.alimento)} + ${incluyeVet === 'si' ? `veterinario $${fmt.format(costoVeterinario)} + ` : ''}higiene y extras $${fmt.format(data.otros)}). Costo anual: ~$${fmt.format(costoAnual)}. Valores orientativos Argentina abril 2026.`,
  };
}
