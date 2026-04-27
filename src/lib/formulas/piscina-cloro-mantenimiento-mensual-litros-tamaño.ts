export interface Inputs {
  volumen: number;
  sistema: string;
  uso: string;
  exposicionSolar: string;
  precioCloroGranulado: number;
  precioAlguicida: number;
}

export interface Outputs {
  cloroSemanaGramos: number;
  cloroMesKg: number;
  alguicidaMesLitros: number;
  costoMensualARS: number;
  detalle: string;
}

export function compute(i: Inputs): Outputs {
  const volumenM3 = Number(i.volumen) || 0;
  const sistema = i.sistema || "granulado";
  const uso = i.uso || "medio";
  const exposicion = i.exposicionSolar || "mixta";
  const precioCloroGranulado = Number(i.precioCloroGranulado) || 4500;
  const precioAlguicida = Number(i.precioAlguicida) || 3200;

  if (volumenM3 <= 0) {
    return {
      cloroSemanaGramos: 0,
      cloroMesKg: 0,
      alguicidaMesLitros: 0,
      costoMensualARS: 0,
      detalle: "Ingresá un volumen válido mayor a 0 m³.",
    };
  }

  const volumenLitros = volumenM3 * 1000;

  // Dosis base de cloro activo: 2 ppm/día (mg/L/día) — referencia estándar industria piscinas
  // Factor de ajuste combinado uso + exposición solar
  // uso: bajo=0.75, medio=1.0, alto=1.4
  // solar: sombra=0.8, mixta=1.0, sol=1.25
  const factorUso: Record<string, number> = {
    bajo: 0.75,
    medio: 1.0,
    alto: 1.4,
  };
  const factorSolar: Record<string, number> = {
    sombra: 0.8,
    mixta: 1.0,
    sol: 1.25,
  };

  const fUso = factorUso[uso] ?? 1.0;
  const fSolar = factorSolar[exposicion] ?? 1.0;

  // Dosis de cloro activo ajustada (ppm/día)
  const DOSIS_BASE_PPM_DIA = 2.0; // mg/L por día
  const dosisActivaPpmDia = DOSIS_BASE_PPM_DIA * fUso * fSolar;

  // Gramos de cloro activo necesarios por día
  // dosisActiva (mg/L) * volumen (L) / 1000 = gramos
  const cloroActivoGrDia = (dosisActivaPpmDia * volumenLitros) / 1000;

  // Porcentaje de cloro activo según sistema
  // Referencia: fichas técnicas de productos de cloración
  const CLORO_ACTIVO: Record<string, number> = {
    granulado: 0.65,   // dicloro/tricloro granulado 65%
    liquido: 0.10,     // hipoclorito de sodio líquido 10%
    sal: 1.0,          // sistema salino: produce cloro in situ, no se compra producto
    pastillas: 0.90,   // pastillas tricloroisocianurato 90%
  };

  const pctActivo = CLORO_ACTIVO[sistema] ?? 0.65;

  // Gramos de producto por día y por semana
  // Para sistema salino no se calcula producto comprado
  let cloroSemanaGramos = 0;
  let cloroMesKg = 0;

  if (sistema === "sal") {
    // Clorador salino: se indica en kg de sal por temporada, no en cloro comprado
    cloroSemanaGramos = 0;
    cloroMesKg = 0;
  } else {
    const productoPorDiaGr = cloroActivoGrDia / pctActivo;
    cloroSemanaGramos = productoPorDiaGr * 7;
    // 4.33 semanas promedio por mes
    cloroMesKg = (cloroSemanaGramos * 4.33) / 1000;
  }

  // Alguicida: dosis preventiva 1 mL por 1.000 L por semana (uso normal)
  // Con uso alto o pleno sol, duplicar
  const ALGUICIDA_ML_POR_1000L_SEMANA = 1.0;
  let factorAlguicida = 1.0;
  if (uso === "alto" || exposicion === "sol") factorAlguicida = 2.0;
  if (uso === "alto" && exposicion === "sol") factorAlguicida = 2.5;

  const alguicidaSemanaMl = (volumenLitros / 1000) * ALGUICIDA_ML_POR_1000L_SEMANA * factorAlguicida;
  const alguicidaMesLitros = (alguicidaSemanaMl * 4.33) / 1000;

  // Costo mensual estimado
  // Para sistema salino el costo de cloro es 0 (se cobra por sal y electricidad aparte)
  // Se usa precio del granulado como referencia para todos los sistemas con un factor ajuste precio
  // El precio ingresado por el usuario es para granulado; para los demás se estima el equivalente
  // Factor precio relativo por sistema (relativo al granulado por unidad de cloro activo)
  const factorPrecioSistema: Record<string, number> = {
    granulado: 1.0,
    liquido: 0.55,   // más barato por litro pero menor concentración; resultado: costo/cloro activo similar o mayor
    sal: 0.0,        // no aplica
    pastillas: 1.35, // más caro por kg pero mayor concentración
  };

  const fPrecio = factorPrecioSistema[sistema] ?? 1.0;
  const costoCloro = cloroMesKg * precioCloroGranulado * fPrecio;
  const costoAlguicida = alguicidaMesLitros * precioAlguicida;
  const costoMensualARS = costoCloro + costoAlguicida;

  // Detalle
  const sistemaLabel: Record<string, string> = {
    granulado: "cloro granulado 65%",
    liquido: "cloro líquido 10%",
    sal: "clorador salino",
    pastillas: "pastillas 90%",
  };
  const usoLabel: Record<string, string> = {
    bajo: "uso bajo",
    medio: "uso medio",
    alto: "uso alto",
  };
  const solarLabel: Record<string, string> = {
    sombra: "sombra",
    mixta: "sol/sombra",
    sol: "pleno sol",
  };

  let detalle = "";
  if (sistema === "sal") {
    detalle =
      `Piscina de ${volumenM3} m³ (${volumenLitros.toLocaleString("es-AR")} L) con ${sistemaLabel[sistema]}, ` +
      `${usoLabel[uso]}, ${solarLabel[exposicion]}. ` +
      `El sistema salino produce cloro in situ: no requiere compra de cloro. ` +
      `Alguicida estimado: ${alguicidaMesLitros.toFixed(2)} L/mes ` +
      `(≈$${costoAlguicida.toLocaleString("es-AR", { maximumFractionDigits: 0 })} ARS).`;
  } else {
    detalle =
      `Piscina de ${volumenM3} m³ (${volumenLitros.toLocaleString("es-AR")} L) con ${sistemaLabel[sistema]}, ` +
      `${usoLabel[uso]}, ${solarLabel[exposicion]}. ` +
      `Dosis cloro activo: ${dosisActivaPpmDia.toFixed(2)} ppm/día. ` +
      `Producto: ${cloroSemanaGramos.toFixed(0)} g/sem → ${cloroMesKg.toFixed(2)} kg/mes. ` +
      `Alguicida: ${alguicidaMesLitros.toFixed(2)} L/mes. ` +
      `Costo cloro: $${costoCloro.toLocaleString("es-AR", { maximumFractionDigits: 0 })} ARS. ` +
      `Costo alguicida: $${costoAlguicida.toLocaleString("es-AR", { maximumFractionDigits: 0 })} ARS.`;
  }

  return {
    cloroSemanaGramos: Math.round(cloroSemanaGramos * 10) / 10,
    cloroMesKg: Math.round(cloroMesKg * 100) / 100,
    alguicidaMesLitros: Math.round(alguicidaMesLitros * 1000) / 1000,
    costoMensualARS: Math.round(costoMensualARS),
    detalle,
  };
}
