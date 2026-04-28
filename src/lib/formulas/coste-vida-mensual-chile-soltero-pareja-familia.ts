export interface Inputs {
  ciudad: 'santiago' | 'valparaiso' | 'concepcion' | 'puerto_montt' | 'antofagasta' | 'iquique' | 'temuco' | 'otra_region';
  composicion_familiar: 'soltero' | 'pareja_sin_hijos' | 'familia_2_hijos' | 'familia_3_hijos' | 'monoparental';
  nivel_vida: 'bajo' | 'medio' | 'alto';
  tipo_vivienda: 'depart_centro' | 'depart_periferia' | 'casa_periferia' | 'casa_buena';
  tiene_auto: 'no' | 'uno' | 'dos';
  sistema_salud: 'fonasa_grupo_a' | 'fonasa_grupo_b' | 'isapre_basica' | 'isapre_premium';
}

export interface Outputs {
  arriendo_estimado: number;
  alimentacion_estimada: number;
  transporte_estimado: number;
  salud_estimada: number;
  servicios_basicos: number;
  ocio_cultura: number;
  otros_gastos: number;
  total_mensual: number;
  rango_ahorro: string;
  notas_ciudad: string;
}

export function compute(i: Inputs): Outputs {
  // Datos 2026 Chile — Fuente: INE, Banco Central, SUSESO
  
  // Coeficiente regional (relativo a Santiago = 1.0)
  const coeficiente_ciudad: Record<string, number> = {
    santiago: 1.0,
    valparaiso: 0.85,
    concepcion: 0.80,
    puerto_montt: 0.75,
    antofagasta: 0.90,
    iquique: 0.92,
    temuco: 0.78,
    otra_region: 0.77
  };
  const coef = coeficiente_ciudad[i.ciudad] || 0.77;

  // Multiplicadores por composición familiar
  const mult_familia: Record<string, number> = {
    soltero: 1.0,
    pareja_sin_hijos: 1.6,
    familia_2_hijos: 2.4,
    familia_3_hijos: 3.0,
    monoparental: 1.8
  };
  const mult_fam = mult_familia[i.composicion_familiar] || 1.0;

  // Multiplicadores nivel de vida
  const mult_nivel: Record<string, number> = {
    bajo: 0.75,
    medio: 1.0,
    alto: 1.4
  };
  const mult_niv = mult_nivel[i.nivel_vida] || 1.0;

  // BASE SANTIAGO NIVEL MEDIO
  let arriendo_base = 0;
  switch (i.tipo_vivienda) {
    case 'depart_centro':
      arriendo_base = 600000;
      break;
    case 'depart_periferia':
      arriendo_base = 480000;
      break;
    case 'casa_periferia':
      arriendo_base = 520000;
      break;
    case 'casa_buena':
      arriendo_base = 700000;
      break;
    default:
      arriendo_base = 550000;
  }

  // Ajuste arriendo por composición (m² creciente)
  arriendo_base = arriendo_base * (0.8 + 0.2 * mult_fam);

  // Alimentación base: soltero medio = 300K, escala con familia
  const alimentacion_base = 300000 * mult_fam * mult_niv;

  // Transporte base
  let transporte_base = 0;
  if (i.tiene_auto === 'no') {
    transporte_base = 80000; // Transantiago ~$40K 2x semana
  } else if (i.tiene_auto === 'uno') {
    transporte_base = 220000; // Auto $180K + público $40K
  } else {
    transporte_base = 420000; // Dos autos
  }
  transporte_base = transporte_base * mult_niv;

  // Salud base
  let salud_base = 0;
  switch (i.sistema_salud) {
    case 'fonasa_grupo_a':
      salud_base = 25000; // Copagos mínimos
      break;
    case 'fonasa_grupo_b':
      salud_base = 60000;
      break;
    case 'isapre_basica':
      salud_base = 140000; // Aporte 7% + copagos
      break;
    case 'isapre_premium':
      salud_base = 200000;
      break;
    default:
      salud_base = 70000;
  }
  salud_base = salud_base * (0.9 + 0.1 * mult_fam);

  // Servicios básicos (luz, agua, gas, internet, telefonía)
  const servicios_base = 110000 * (0.85 + 0.15 * mult_fam) * mult_niv;

  // Ocio y cultura
  const ocio_base = (i.nivel_vida === 'bajo' ? 60000 : i.nivel_vida === 'medio' ? 150000 : 300000) * (0.85 + 0.15 * mult_fam);

  // Otros (vestuario, higiene, mascotas, hogar)
  const otros_base = (i.nivel_vida === 'bajo' ? 50000 : i.nivel_vida === 'medio' ? 120000 : 200000) * mult_fam * mult_niv;

  // Aplicar coeficiente regional a todos
  const arriendo_estimado = Math.round(arriendo_base * coef);
  const alimentacion_estimada = Math.round(alimentacion_base * coef);
  const transporte_estimado = Math.round(transporte_base * coef);
  const salud_estimada = Math.round(salud_base * coef);
  const servicios_basicos = Math.round(servicios_base * coef);
  const ocio_cultura = Math.round(ocio_base * coef);
  const otros_gastos = Math.round(otros_base * coef);

  const total_mensual = arriendo_estimado + alimentacion_estimada + transporte_estimado + salud_estimada + servicios_basicos + ocio_cultura + otros_gastos;

  // Rango ahorro
  const ahorro_min = Math.round(total_mensual * 0.10);
  const ahorro_max = Math.round(total_mensual * 0.20);
  const rango_ahorro = `$${ahorro_min.toLocaleString('es-CL')} – $${ahorro_max.toLocaleString('es-CL')} (recomendado 10–20%)`;

  // Notas por ciudad
  const notas_ciudad = getNotasCiudad(i.ciudad);

  return {
    arriendo_estimado,
    alimentacion_estimada,
    transporte_estimado,
    salud_estimada,
    servicios_basicos,
    ocio_cultura,
    otros_gastos,
    total_mensual,
    rango_ahorro,
    notas_ciudad
  };
}

function getNotasCiudad(ciudad: string): string {
  const notas: Record<string, string> = {
    santiago: '**Santiago RM**: Mayor costo arriendo y servicios. Transantiago integrado. Comidas fuera 20% más caro. Oferta educación privada amplia. Estrés tráfico (+transporte).',
    valparaiso: 'Valparaíso: Puerto con buen clima. Arriendo 15% menos Santiago. Transporte ascensores antiguos, colectivos locales. Menos oferta gastronómica premium. Playas accesibles.',
    concepcion: 'Concepción: Universidad ciudad. Arriendo 20% menos. Biobío frío en invierno (+calefacción). Transporte local económico. Menos opciones ocio nocturno que Santiago.',
    puerto_montt: 'Puerto Montt: Sur lago. Arriendo 25% menos Santiago. Invierno muy lluvioso (+servicios). Salmón/mariscos baratos. Vuelos a Castro/Dalcahue extras. Turismo estacional.',
    antofagasta: 'Antofagasta: Minería, costa norte. Arriendo 10% menos Santiago. Clima seco (no lluvia). Servicios 10% más caros (aislamiento). Playas buenas. Muy soleado (menos calefacción).',
    iquique: 'Iquique: Extremo norte. Arriendo similar Santiago. Zona franca retail + ocio. Muy calor verano. Vuelos Lima/Arequipa frecuentes. Aislamiento geográfico caro.',
    temuco: 'Temuco: Centro-sur, capital Araucanía. Arriendo 22% menos. Clima templado. Transporte colectivos, poco metro. Mercado feria barato. Menos cinemas/restaurantes finos.',
    otra_region: 'Otra región: Estimación promedio sur-centro. Costo 23% menos Santiago. Revisar precios locales en inmobiliarios.cl, jumbo.cl, supermercados regionales.'
  };
  return notas[ciudad] || notas['otra_region'];
}
