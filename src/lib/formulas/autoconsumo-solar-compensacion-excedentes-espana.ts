export interface Inputs {
  consumo_mensual_kwh: number;
  potencia_instalada_kwp: number;
  porcentaje_autoconsumo_directo: number;
  precio_venta_excedentes_eur_kwh: number;
  precio_compra_electricidad_eur_kwh: number;
  produccion_media_diaria_kwh: number;
  inversion_inicial_eur: number;
}

export interface Outputs {
  produccion_mensual_kwh: number;
  energia_autoconsumo_directo_kwh: number;
  energia_excedentes_kwh: number;
  ahorro_consumo_directo_eur: number;
  ingresos_excedentes_eur: number;
  ahorro_total_mensual_eur: number;
  ahorro_anual_eur: number;
  payback_anos: number;
  factura_sin_solar_mensual_eur: number;
  factura_con_solar_mensual_eur: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes AEAT/PVPC 2026
  const DIAS_MES = 30;
  const MESES_AÑO = 12;
  
  // Producción solar mensual (kWh)
  // Fuente: Cálculo basado en irradiancia global (3,5-4,5 kWh/kWp/día según zona)
  const produccion_mensual_kwh = i.produccion_media_diaria_kwh * DIAS_MES;
  
  // Energía de autoconsumo directo (kWh)
  // Fuente: RD 244/2019, balance neto - porcentaje directo típico 35-50%
  const energia_autoconsumo_directo_kwh = (produccion_mensual_kwh * i.porcentaje_autoconsumo_directo) / 100;
  
  // Energía de excedentes inyectada a red (kWh)
  const energia_excedentes_kwh = produccion_mensual_kwh - energia_autoconsumo_directo_kwh;
  
  // Ahorro por consumo directo (€)
  // Ahorras la tarifa completa de compra en kWh solar
  // Fuente: PVPC 2026 promedio 0,18€/kWh
  const ahorro_consumo_directo_eur = energia_autoconsumo_directo_kwh * i.precio_compra_electricidad_eur_kwh;
  
  // Ingresos por venta de excedentes (€)
  // Compensación según balance neto AEAT 2026
  // Fuente: Mercado mayorista (OMIE) + margen distribuidor ~0,13€/kWh
  const ingresos_excedentes_eur = energia_excedentes_kwh * i.precio_venta_excedentes_eur_kwh;
  
  // Ahorro total mensual (€)
  const ahorro_total_mensual_eur = ahorro_consumo_directo_eur + ingresos_excedentes_eur;
  
  // Ahorro anual (€)
  const ahorro_anual_eur = ahorro_total_mensual_eur * MESES_AÑO;
  
  // Payback: tiempo de amortización en años
  // Payback = Inversión / Ahorro anual
  // Típico 6-10 años según zona; degradación paneles -0,5% anual no incluida
  const payback_anos = i.inversion_inicial_eur > 0 
    ? i.ahorro_anual_eur > 0 
      ? i.inversion_inicial_eur / ahorro_anual_eur 
      : 0 
    : 0;
  
  // Factura sin solar (referencia: todo de red)
  // Fuente: consumo × PVPC
  const factura_sin_solar_mensual_eur = i.consumo_mensual_kwh * i.precio_compra_electricidad_eur_kwh;
  
  // Factura con solar instalado
  // Consumo restante (no cubierto por autoconsumo directo) × tarifa
  // Excedentes generan compensación/ingresos (negativo en factura)
  const consumo_red_con_solar_kwh = Math.max(0, i.consumo_mensual_kwh - energia_autoconsumo_directo_kwh);
  const factura_consumo_red = consumo_red_con_solar_kwh * i.precio_compra_electricidad_eur_kwh;
  const factura_con_solar_mensual_eur = Math.max(0, factura_consumo_red - ingresos_excedentes_eur);
  
  return {
    produccion_mensual_kwh: Math.round(produccion_mensual_kwh * 10) / 10,
    energia_autoconsumo_directo_kwh: Math.round(energia_autoconsumo_directo_kwh * 10) / 10,
    energia_excedentes_kwh: Math.round(energia_excedentes_kwh * 10) / 10,
    ahorro_consumo_directo_eur: Math.round(ahorro_consumo_directo_eur * 100) / 100,
    ingresos_excedentes_eur: Math.round(ingresos_excedentes_eur * 100) / 100,
    ahorro_total_mensual_eur: Math.round(ahorro_total_mensual_eur * 100) / 100,
    ahorro_anual_eur: Math.round(ahorro_anual_eur * 100) / 100,
    payback_anos: Math.round(payback_anos * 10) / 10,
    factura_sin_solar_mensual_eur: Math.round(factura_sin_solar_mensual_eur * 100) / 100,
    factura_con_solar_mensual_eur: Math.round(factura_con_solar_mensual_eur * 100) / 100
  };
}
