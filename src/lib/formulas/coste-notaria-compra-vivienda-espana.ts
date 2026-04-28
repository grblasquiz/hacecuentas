export interface Inputs {
  precio_compra: number;
  con_hipoteca: boolean;
  importe_hipoteca?: number;
  comunidad_autonoma: string;
  incluir_gestor: boolean;
}

export interface Outputs {
  coste_escritura_compra: number;
  coste_escritura_hipoteca: number;
  registro_propiedad: number;
  tasacion: number;
  ajd: number;
  coste_gestor: number;
  gastos_totales: number;
  porcentaje_precio: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes aranceles notariales 2026 España (Colegio Notarial)
  // Escala para operaciones compraventa inmuebles
  const ESCALA_ARANCEL_NOTARIO_2026 = [
    { hasta: 6000, tarifa: 105 },
    { hasta: 12000, tarifa: 195 },
    { hasta: 30000, tarifa: 378 },
    { hasta: 60000, tarifa: 525 },
    { hasta: 150000, tarifa: 840 },
    { hasta: 300000, tarifa: 1470 },
    { hasta: 600000, tarifa: 2100 },
    { hasta: Infinity, tarifa: 2100 }
  ];

  // Tasas AJD por comunidad autónoma 2026 (AEAT)
  const TASAS_AJD: { [key: string]: number } = {
    "madrid": 0.005,         // 0,5%
    "cataluna": 0.0075,      // 0,75%
    "andalucia": 0.010,      // 1,0%
    "valencia": 0.010,       // 1,0%
    "galicia": 0.005,        // 0,5%
    "castilla_leon": 0.006,  // 0,6%
    "pais_vasco": 0.006,     // 0,6% (Impuesto Transmisiones)
    "castilla_mancha": 0.007,// 0,7%
    "murcia": 0.007,         // 0,7%
    "aragon": 0.006,         // 0,6%
    "asturias": 0.008,       // 0,8%
    "extremadura": 0.008,    // 0,8%
    "baleares": 0.007,       // 0,7%
    "canarias": 0.007,       // 0,7% (Impuesto AJD canario reducido)
    "cantabria": 0.008,      // 0,8%
    "la_rioja": 0.008,       // 0,8%
    "navarra": 0.007,        // 0,7% (régimen foral)
    "ceuta_melilla": 0.010   // 1,0%
  };

  const precioCompra = i.precio_compra || 0;
  const tieneHipoteca = i.con_hipoteca || false;
  const importeHipoteca = i.importe_hipoteca || 0;
  const ccaa = i.comunidad_autonoma || "madrid";
  const incluirGestor = i.incluir_gestor || false;

  // 1. Cálculo coste notaría escritura compra
  // Se busca en escala según precio
  let costeEscrituraCompra = 0;
  for (const tramo of ESCALA_ARANCEL_NOTARIO_2026) {
    if (precioCompra <= tramo.hasta) {
      costeEscrituraCompra = tramo.tarifa;
      break;
    }
  }
  // Añadir % complementario si supera 600k (aprox. 0,20%)
  if (precioCompra > 600000) {
    costeEscrituraCompra += (precioCompra - 600000) * 0.002;
  }

  // 2. Cálculo coste notaría escritura hipoteca (80-90% de compra)
  // Si hay hipoteca, aprox. 85% del coste de compra
  let costeEscrituraHipoteca = 0;
  if (tieneHipoteca && importeHipoteca > 0) {
    // Escala aplicada a importe hipoteca
    for (const tramo of ESCALA_ARANCEL_NOTARIO_2026) {
      if (importeHipoteca <= tramo.hasta) {
        costeEscrituraHipoteca = tramo.tarifa * 0.85; // 85% aprox.
        break;
      }
    }
    if (importeHipoteca > 600000) {
      costeEscrituraHipoteca += (importeHipoteca - 600000) * 0.002 * 0.85;
    }
  }

  // 3. Cálculo registro de propiedad
  // Arancel registrador aprox. 0,15% del valor, con mínimos/máximos por CCAA
  // Estimación simplificada: 0,15% con mín 300€, máx 700€ para normales
  let registroPropiedad = Math.max(300, Math.min(700, precioCompra * 0.0015));
  // Ajuste por CCAA (algunas son ligeramente más caras)
  if (["cataluna", "madrid", "pais_vasco"].includes(ccaa)) {
    registroPropiedad = Math.max(350, Math.min(750, precioCompra * 0.0018));
  }

  // 4. Tasación vivienda (obligatoria si hipoteca)
  let tasacion = 0;
  if (tieneHipoteca) {
    // Tasación: 300-500€ según entidad. Usar 400€ como promedio
    tasacion = 400;
  }

  // 5. AJD (Actos Jurídicos Documentados)
  const tasaAJD = TASAS_AJD[ccaa] || 0.007; // Default 0,7% si no definida
  const ajd = precioCompra * tasaAJD;

  // 6. Coste gestoría (opcional)
  let costeGestor = 0;
  if (incluirGestor) {
    // Gestoría: aprox. 300-500€, usar 400€
    costeGestor = 400;
  }

  // 7. Gastos totales
  const gastosTotales = costeEscrituraCompra + costeEscrituraHipoteca + registroPropiedad + tasacion + ajd + costeGestor;

  // 8. % sobre precio
  const porcentajePrecio = precioCompra > 0 ? (gastosTotales / precioCompra) * 100 : 0;

  return {
    coste_escritura_compra: Math.round(costeEscrituraCompra * 100) / 100,
    coste_escritura_hipoteca: Math.round(costeEscrituraHipoteca * 100) / 100,
    registro_propiedad: Math.round(registroPropiedad * 100) / 100,
    tasacion: Math.round(tasacion * 100) / 100,
    ajd: Math.round(ajd * 100) / 100,
    coste_gestor: Math.round(costeGestor * 100) / 100,
    gastos_totales: Math.round(gastosTotales * 100) / 100,
    porcentaje_precio: Math.round(porcentajePrecio * 100) / 100
  };
}
