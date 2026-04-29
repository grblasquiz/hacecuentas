export interface Inputs {
  distancia_km: number;
  horario: string;
  ciudad: string;
}

export interface Outputs {
  tarifa_uber: number;
  tarifa_cabify: number;
  tarifa_didi: number;
  tarifa_remis: number;
  mas_economico: string;
  propina_sugerida: number;
  ahorro_vs_remis: number;
}

export function compute(i: Inputs): Outputs {
  const distancia = Number(i.distancia_km) || 0;
  if (distancia <= 0) {
    return {
      tarifa_uber: 0,
      tarifa_cabify: 0,
      tarifa_didi: 0,
      tarifa_remis: 0,
      mas_economico: "Ingresa una distancia válida",
      propina_sugerida: 0,
      ahorro_vs_remis: 0
    };
  }

  // Tarifas base por ciudad (ARS 2026)
  const tariff_data: Record<string, {uber_base: number; uber_km: number; uber_min: number; cabify_base: number; cabify_km: number; cabify_min: number; didi_base: number; didi_km: number; didi_min: number; remis_base: number; remis_km: number}> = {
    caba: {
      uber_base: 120,
      uber_km: 8.5,
      uber_min: 1.2,
      cabify_base: 150,
      cabify_km: 10.0,
      cabify_min: 1.5,
      didi_base: 100,
      didi_km: 7.8,
      didi_min: 1.0,
      remis_base: 180,
      remis_km: 18.0
    },
    gba_sur: {
      uber_base: 100,
      uber_km: 7.2,
      uber_min: 1.0,
      cabify_base: 125,
      cabify_km: 8.5,
      cabify_min: 1.2,
      didi_base: 85,
      didi_km: 6.5,
      didi_min: 0.85,
      remis_base: 150,
      remis_km: 15.0
    },
    gba_norte: {
      uber_base: 105,
      uber_km: 7.5,
      uber_min: 1.05,
      cabify_base: 130,
      cabify_km: 8.8,
      cabify_min: 1.25,
      didi_base: 88,
      didi_km: 6.8,
      didi_min: 0.90,
      remis_base: 155,
      remis_km: 16.0
    },
    cordoba: {
      uber_base: 80,
      uber_km: 5.5,
      uber_min: 0.8,
      cabify_base: 100,
      cabify_km: 6.8,
      cabify_min: 1.0,
      didi_base: 70,
      didi_km: 5.0,
      didi_min: 0.7,
      remis_base: 120,
      remis_km: 12.0
    },
    rosario: {
      uber_base: 75,
      uber_km: 5.2,
      uber_min: 0.75,
      cabify_base: 95,
      cabify_km: 6.5,
      cabify_min: 0.95,
      didi_base: 65,
      didi_km: 4.7,
      didi_min: 0.65,
      remis_base: 110,
      remis_km: 11.0
    }
  };

  const ciudad_val = i.ciudad as string;
  const tariffs = tariff_data[ciudad_val] || tariff_data.caba;

  // Tiempo estimado en minutos (8 km/h en tránsito promedio CABA, 10 km/h otras zonas)
  const speed_factor = ciudad_val === "caba" ? 8 : 10;
  const minutos_estimados = Math.max(5, (distancia / speed_factor) * 60);

  // Multiplicador por horario
  const multiplo_pico = i.horario === "pico" ? 1.65 : 1.0;

  // Cálculos Uber
  const uber_base_calc = (tariffs.uber_base + distancia * tariffs.uber_km + minutos_estimados * tariffs.uber_min) * multiplo_pico;
  const tarifa_uber = Math.round(uber_base_calc * 100) / 100;

  // Cálculos Cabify
  const cabify_base_calc = (tariffs.cabify_base + distancia * tariffs.cabify_km + minutos_estimados * tariffs.cabify_min) * multiplo_pico;
  const tarifa_cabify = Math.round(cabify_base_calc * 100) / 100;

  // Cálculos DiDi
  const didi_base_calc = (tariffs.didi_base + distancia * tariffs.didi_km + minutos_estimados * tariffs.didi_min) * multiplo_pico;
  const tarifa_didi = Math.round(didi_base_calc * 100) / 100;

  // Cálculos Remis (sin multiplicador dinámico)
  const remis_calc = tariffs.remis_base + distancia * tariffs.remis_km;
  const tarifa_remis = Math.round(remis_calc * 100) / 100;

  // Más económico
  const tarifas_apps = {
    "Uber": tarifa_uber,
    "Cabify": tarifa_cabify,
    "DiDi": tarifa_didi
  };
  const app_mas_economica = Object.keys(tarifas_apps).reduce((a, b) => tarifas_apps[a as keyof typeof tarifas_apps] < tarifas_apps[b as keyof typeof tarifas_apps] ? a : b);
  const valor_mas_economico = tarifas_apps[app_mas_economica as keyof typeof tarifas_apps];
  const mas_economico = `${app_mas_economica} ($${valor_mas_economico.toFixed(0)} ARS)`;

  // Propina sugerida (sobre app más económica)
  const porcentaje_propina = i.horario === "pico" ? 0.15 : 0.10;
  const propina_sugerida = Math.round(valor_mas_economico * porcentaje_propina * 100) / 100;

  // Ahorro vs remis
  const ahorro_vs_remis = Math.round((tarifa_remis - valor_mas_economico) * 100) / 100;

  return {
    tarifa_uber,
    tarifa_cabify,
    tarifa_didi,
    tarifa_remis,
    mas_economico,
    propina_sugerida,
    ahorro_vs_remis
  };
}
