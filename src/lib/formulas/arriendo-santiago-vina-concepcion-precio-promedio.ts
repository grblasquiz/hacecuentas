export interface Inputs {
  ciudad: string;
  comuna: string;
  dormitorios: string;
  incluye_servicios?: string;
}

export interface Outputs {
  arriendo_promedio: number;
  gastos_comunes: number;
  servicios_basicos: number;
  garantia_deposito: number;
  comision_inmobiliaria: number;
  total_mensual: number;
  inversion_inicial: number;
  rango_mercado: string;
}

export function compute(i: Inputs): Outputs {
  // Base de precios por ciudad y comuna (en CLP, 2026)
  // Fuente: PortalInmobiliario.cl, Mitula.cl, reportes mercado inmobiliario
  
  const preciosPorComuna: Record<string, Record<string, number>> = {
    providencia: { 1: 400000, 2: 575000, 3: 800000, 4: 1050000 },
    las_condes: { 1: 370000, 2: 525000, 3: 725000, 4: 950000 },
    nunoa: { 1: 320000, 2: 450000, 3: 625000, 4: 850000 },
    santiago_centro: { 1: 250000, 2: 340000, 3: 450000, 4: 600000 },
    macul: { 1: 280000, 2: 380000, 3: 520000, 4: 700000 },
    la_florida: { 1: 240000, 2: 320000, 3: 420000, 4: 550000 },
    puente_alto: { 1: 220000, 2: 290000, 3: 380000, 4: 500000 },
    maipu: { 1: 210000, 2: 280000, 3: 360000, 4: 470000 },
    centro_vina: { 1: 330000, 2: 475000, 3: 675000, 4: 900000 },
    recreo: { 1: 300000, 2: 415000, 3: 580000, 4: 770000 },
    con_con: { 1: 280000, 2: 390000, 3: 540000, 4: 720000 },
    centro_concepcion: { 1: 250000, 2: 375000, 3: 500000, 4: 650000 },
    juan_ferna: { 1: 220000, 2: 320000, 3: 420000, 4: 550000 },
    estacion_central: { 1: 240000, 2: 330000, 3: 430000, 4: 560000 },
    otro: { 1: 200000, 2: 280000, 3: 360000, 4: 450000 }
  };

  // Factores de reajuste por ciudad si no coincide la comuna principal
  const factoresAjuste: Record<string, number> = {
    santiago: 1.0,
    vina: 1.05,
    concepcion: 0.85,
    valparaiso: 0.90,
    valdivia: 0.75,
    puerto_montt: 0.78,
    temuco: 0.72,
    coquimbo: 0.80,
    regiones: 0.70
  };

  // Obtener precio base
  const precios = preciosPorComuna[i.comuna] || preciosPorComuna['otro'];
  let arriendo = precios[i.dormitorios] || precios['2'];
  
  // Aplicar factor de ciudad si la comuna no corresponde a la ciudad elegida
  const factor = factoresAjuste[i.ciudad] || 1.0;
  arriendo = Math.round(arriendo * factor);

  // Gastos comunes: 18-22% del arriendo según zona
  // Zonas caras (Providencia, Las Condes, Viña centro): 22%
  // Zonas medias (Ñuñoa, Macul): 19%
  // Zonas populares (La Florida, Puente Alto): 16%
  let porcentajeGC = 0.19;
  if (['providencia', 'las_condes', 'centro_vina'].includes(i.comuna)) {
    porcentajeGC = 0.22;
  } else if (['la_florida', 'puente_alto', 'maipu'].includes(i.comuna)) {
    porcentajeGC = 0.16;
  } else if (['santiago_centro', 'estacion_central'].includes(i.comuna)) {
    porcentajeGC = 0.15;
  }
  
  const gastosComunes = Math.round(arriendo * porcentajeGC);

  // Servicios básicos si no están incluidos
  // Agua caliente + luz + gas + internet: $80-150K según consumo
  // Promedio: $110K
  let serviciosBasicos = 0;
  if (i.incluye_servicios !== 'si') {
    const baseServicios = 110000;
    const ajusteSegunDormitorios = {
      '1': 0.85,
      '2': 1.0,
      '3': 1.15,
      '4': 1.35
    };
    serviciosBasicos = Math.round(baseServicios * (ajusteSegunDormitorios[i.dormitorios] || 1.0));
    
    if (i.incluye_servicios === 'parcial') {
      serviciosBasicos = Math.round(serviciosBasicos * 0.5); // Reducir 50% si hay parciales
    }
  }

  // Depósito/Garantía: 1.5 meses de arriendo (negociable 1-2)
  const garantiaDeposito = Math.round(arriendo * 1.5);

  // Comisión inmobiliaria: típicamente 1 mes de arriendo
  const comisionInmobiliaria = arriendo;

  // Total mensual
  const totalMensual = arriendo + gastosComunes + serviciosBasicos;

  // Inversión inicial (garantía + primer mes + gastos comunes primer mes)
  const inversionInicial = garantiaDeposito + arriendo + gastosComunes;

  // Rango de mercado (variación típica ±15%)
  const minRango = Math.round(arriendo * 0.85);
  const maxRango = Math.round(arriendo * 1.15);
  const rangoMercado = `$${minRango.toLocaleString('es-CL')} - $${maxRango.toLocaleString('es-CL')} (varía según estado, antigüedad y servicios)`;

  return {
    arriendo_promedio: arriendo,
    gastos_comunes: gastosComunes,
    servicios_basicos: serviciosBasicos,
    garantia_deposito: garantiaDeposito,
    comision_inmobiliaria: comisionInmobiliaria,
    total_mensual: totalMensual,
    inversion_inicial: inversionInicial,
    rango_mercado: rangoMercado
  };
}
