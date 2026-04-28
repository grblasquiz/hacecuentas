export interface Inputs {
  tipo_mascota: 'perro_pequeno' | 'perro_mediano' | 'perro_grande' | 'gato';
  tipo_comida: 'standard' | 'premium';
  veterinario_anual: number;
  peluqueria_anual: number;
  incluir_vacunas: boolean;
  incluir_esterilizacion: boolean;
}

export interface Outputs {
  gasto_mensual_comida: number;
  gasto_mensual_veterinario: number;
  gasto_mensual_peluqueria: number;
  gasto_mensual_total: number;
  gasto_anual_base: number;
  gasto_anual_con_adicionales: number;
  costo_esterilizacion: number;
  detalle_mascota: string;
}

export function compute(i: Inputs): Outputs {
  // Costos mensuales comida 2026 Chile (pesos, valores medios)
  const costos_comida_mensual: Record<string, { standard: number; premium: number }> = {
    perro_pequeno: { standard: 13500, premium: 21500 },
    perro_mediano: { standard: 24000, premium: 37000 },
    perro_grande: { standard: 33000, premium: 55000 },
    gato: { standard: 12000, premium: 19000 }
  };

  // Costo consulta veterinaria rutinaria (sin urgencia)
  const costo_consulta_veterinaria = 75000; // pesos 2026

  // Costos peluquería por sesión
  const costos_peluqueria: Record<string, number> = {
    perro_pequeno: 32500,
    perro_mediano: 47500,
    perro_grande: 62500,
    gato: 27500
  };

  // Costos esterilización
  const costos_esterilizacion: Record<string, number> = {
    perro_pequeno: 325000,
    perro_mediano: 375000,
    perro_grande: 450000,
    gato: 240000
  };

  // Costo vacunas
  const costo_vacuna_refuerzo_anual = 65000;

  // Gasto mensual comida
  const gasto_mensual_comida = costos_comida_mensual[i.tipo_mascota][i.tipo_comida];

  // Gasto mensual veterinario (promediado)
  const gasto_anual_veterinario = costo_consulta_veterinaria * i.veterinario_anual;
  const gasto_mensual_veterinario = gasto_anual_veterinario / 12;

  // Gasto mensual peluquería (promediado)
  const gasto_anual_peluqueria = costos_peluqueria[i.tipo_mascota] * i.peluqueria_anual;
  const gasto_mensual_peluqueria = gasto_anual_peluqueria / 12;

  // Gasto mensual total
  const gasto_mensual_total = gasto_mensual_comida + gasto_mensual_veterinario + gasto_mensual_peluqueria;

  // Gasto anual base (sin vacunas ni esterilización)
  const gasto_anual_base = gasto_mensual_total * 12;

  // Costo esterilización
  const costo_esterilizacion = i.incluir_esterilizacion ? 0 : costos_esterilizacion[i.tipo_mascota];

  // Gasto anual con adicionales
  let gasto_anual_con_adicionales = gasto_anual_base;
  if (i.incluir_vacunas) {
    gasto_anual_con_adicionales += costo_vacuna_refuerzo_anual;
  }
  if (!i.incluir_esterilizacion) {
    gasto_anual_con_adicionales += costo_esterilizacion;
  }

  // Detalle mascota
  const tipo_nombre: Record<string, string> = {
    perro_pequeno: 'Perro pequeño (< 10 kg)',
    perro_mediano: 'Perro mediano (10–25 kg)',
    perro_grande: 'Perro grande (> 25 kg)',
    gato: 'Gato'
  };
  const comida_nombre = i.tipo_comida === 'premium' ? 'Premium' : 'Estándar';
  const detalle_mascota = `${tipo_nombre[i.tipo_mascota]} | Comida ${comida_nombre} | ${i.veterinario_anual} visitas vet/año | ${i.peluqueria_anual} peluquería/año | Esterilizado: ${i.incluir_esterilizacion ? 'Sí' : 'No'}`;

  return {
    gasto_mensual_comida: Math.round(gasto_mensual_comida),
    gasto_mensual_veterinario: Math.round(gasto_mensual_veterinario),
    gasto_mensual_peluqueria: Math.round(gasto_mensual_peluqueria),
    gasto_mensual_total: Math.round(gasto_mensual_total),
    gasto_anual_base: Math.round(gasto_anual_base),
    gasto_anual_con_adicionales: Math.round(gasto_anual_con_adicionales),
    costo_esterilizacion: Math.round(costo_esterilizacion),
    detalle_mascota: detalle_mascota
  };
}
