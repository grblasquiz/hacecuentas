export interface Inputs {
  facturacion12m: number;
  actividad: string; // 'servicios' | 'comercio'
  superficie: number;
  energia: number;
  categoriaActual: string; // 'A'..'K' | 'ninguna'
}

export interface Outputs {
  categoriaNueva: string;
  cuotaMensual: number;
  diferenciaCuota: number;
  parametroLimitante: string;
  alertaExclusion: string;
  _insight?: any;
  _chart?: any;
}

// ---------------------------------------------------------------------------
// Tablas de parámetros 2026 — Fuente: AFIP/ARCA RG 4309 y actualizaciones
// ---------------------------------------------------------------------------

interface Categoria {
  nombre: string;
  topeIngresosServicios: number;
  topeIngresosComercio: number;
  topeSuperficie: number;   // m²
  topeEnergia: number;      // kWh/año
  cuotaMensual: number;     // impuesto + obra social + jubilacion
}

const CATEGORIAS: Categoria[] = [
  // Categoría A
  {
    nombre: "A",
    topeIngresosServicios: 2109726,
    topeIngresosComercio: 2109726,
    topeSuperficie: 20,
    topeEnergia: 2000,
    cuotaMensual: 16780,
  },
  // Categoría B
  {
    nombre: "B",
    topeIngresosServicios: 3133369,
    topeIngresosComercio: 3133369,
    topeSuperficie: 30,
    topeEnergia: 3300,
    cuotaMensual: 17990,
  },
  // Categoría C
  {
    nombre: "C",
    topeIngresosServicios: 4368771,
    topeIngresosComercio: 4368771,
    topeSuperficie: 45,
    topeEnergia: 5000,
    cuotaMensual: 20220,
  },
  // Categoría D
  {
    nombre: "D",
    topeIngresosServicios: 5403344,
    topeIngresosComercio: 5403344,
    topeSuperficie: 60,
    topeEnergia: 6700,
    cuotaMensual: 22440,
  },
  // Categoría E
  {
    nombre: "E",
    topeIngresosServicios: 6437918,
    topeIngresosComercio: 6437918,
    topeSuperficie: 85,
    topeEnergia: 10000,
    cuotaMensual: 25990,
  },
  // Categoría F
  {
    nombre: "F",
    topeIngresosServicios: 8064985,
    topeIngresosComercio: 8064985,
    topeSuperficie: 110,
    topeEnergia: 13000,
    cuotaMensual: 31560,
  },
  // Categoría G
  {
    nombre: "G",
    topeIngresosServicios: 9888819,
    topeIngresosComercio: 9888819,
    topeSuperficie: 150,
    topeEnergia: 16500,
    cuotaMensual: 37130,
  },
  // Categoría H — tope final para servicios
  {
    nombre: "H",
    topeIngresosServicios: 14016760,
    topeIngresosComercio: 14016760,
    topeSuperficie: 200,
    topeEnergia: 20000,
    cuotaMensual: 48380,
  },
  // Categorías I, J, K — solo venta de cosas muebles
  {
    nombre: "I",
    topeIngresosServicios: 0, // no aplica a servicios
    topeIngresosComercio: 21025140,
    topeSuperficie: 200,
    topeEnergia: 20000,
    cuotaMensual: 70820,
  },
  {
    nombre: "J",
    topeIngresosServicios: 0,
    topeIngresosComercio: 25230168,
    topeSuperficie: 200,
    topeEnergia: 20000,
    cuotaMensual: 82060,
  },
  {
    nombre: "K",
    topeIngresosServicios: 0,
    topeIngresosComercio: 87498044,
    topeSuperficie: 200,
    topeEnergia: 20000,
    cuotaMensual: 93290,
  },
];

// Cuota por nombre de categoría (para lookup de categoría actual)
function cuotaPorNombre(nombre: string): number {
  const cat = CATEGORIAS.find((c) => c.nombre === nombre);
  return cat ? cat.cuotaMensual : 0;
}

// Índice de la categoría en el array (para comparar cuál es "más alta")
function indicePorNombre(nombre: string): number {
  return CATEGORIAS.findIndex((c) => c.nombre === nombre);
}

export function compute(i: Inputs): Outputs {
  const facturacion = Number(i.facturacion12m) || 0;
  const superficie = Number(i.superficie) || 0;
  const energia = Number(i.energia) || 0;
  const actividad = i.actividad === "comercio" ? "comercio" : "servicios";
  const categoriaActual = i.categoriaActual || "ninguna";

  // --- Validaciones básicas ---
  if (facturacion <= 0) {
    return {
      categoriaNueva: "—",
      cuotaMensual: 0,
      diferenciaCuota: 0,
      parametroLimitante: "Ingresá una facturación válida",
      alertaExclusion: "",
    };
  }

  // --- Filtrar categorías disponibles según actividad ---
  const categoriasDisponibles =
    actividad === "servicios"
      ? CATEGORIAS.filter((c) => c.topeIngresosServicios > 0)
      : CATEGORIAS;

  // --- Categoría por ingresos ---
  const topeIngresos =
    actividad === "servicios" ? "topeIngresosServicios" : "topeIngresosComercio";

  let idxPorIngresos = -1;
  for (let idx = 0; idx < categoriasDisponibles.length; idx++) {
    const tope =
      actividad === "servicios"
        ? categoriasDisponibles[idx].topeIngresosServicios
        : categoriasDisponibles[idx].topeIngresosComercio;
    if (facturacion <= tope) {
      idxPorIngresos = idx;
      break;
    }
  }

  // --- Categoría por superficie (aplica solo si > 0) ---
  let idxPorSuperficie = -1;
  if (superficie > 0) {
    for (let idx = 0; idx < categoriasDisponibles.length; idx++) {
      if (superficie <= categoriasDisponibles[idx].topeSuperficie) {
        idxPorSuperficie = idx;
        break;
      }
    }
  }

  // --- Categoría por energía (aplica solo si > 0) ---
  let idxPorEnergia = -1;
  if (energia > 0) {
    for (let idx = 0; idx < categoriasDisponibles.length; idx++) {
      if (energia <= categoriasDisponibles[idx].topeEnergia) {
        idxPorEnergia = idx;
        break;
      }
    }
  }

  // --- Excluido del régimen ---
  const superaTodosTopes =
    idxPorIngresos === -1 &&
    (idxPorSuperficie === -1 || superficie === 0) &&
    (idxPorEnergia === -1 || energia === 0);

  // Caso: facturación supera tope máximo
  if (idxPorIngresos === -1) {
    const topeMax =
      actividad === "servicios"
        ? "$14.016.760 (Categoría H — tope servicios)"
        : "$87.498.044 (Categoría K)";
    return {
      categoriaNueva: "EXCLUIDO",
      cuotaMensual: 0,
      diferenciaCuota: 0,
      parametroLimitante: "Ingresos",
      alertaExclusion:
        `⚠️ Tu facturación supera el tope máximo del monotributo para ${actividad} (${topeMax}). Debés inscribirte como Responsable Inscripto.`,
    };
  }

  // --- Determinar índice final (el más alto de los tres parámetros) ---
  let idxFinal = idxPorIngresos;
  let limitante = "Ingresos";

  if (idxPorSuperficie !== -1 && idxPorSuperficie > idxFinal) {
    idxFinal = idxPorSuperficie;
    limitante = "Superficie";
  }
  if (idxPorEnergia !== -1 && idxPorEnergia > idxFinal) {
    idxFinal = idxPorEnergia;
    limitante = "Energía eléctrica";
  }

  // Si tras aplicar superficie o energía se supera el tope disponible
  if (idxFinal >= categoriasDisponibles.length) {
    return {
      categoriaNueva: "EXCLUIDO",
      cuotaMensual: 0,
      diferenciaCuota: 0,
      parametroLimitante: limitante,
      alertaExclusion:
        "⚠️ Uno o más parámetros superan el tope máximo permitido. Consultá con tu contador sobre la exclusión del régimen.",
    };
  }

  const categoriaResultante = categoriasDisponibles[idxFinal];
  const cuotaNueva = categoriaResultante.cuotaMensual;

  // --- Cuota actual ---
  const cuotaActual =
    categoriaActual === "ninguna" ? 0 : cuotaPorNombre(categoriaActual);
  const diferencia = cuotaNueva - cuotaActual;

  // --- Construir detalle del parámetro limitante ---
  let detalleParametro = `${limitante}`;
  if (limitante === "Ingresos") {
    const tope =
      actividad === "servicios"
        ? categoriaResultante.topeIngresosServicios
        : categoriaResultante.topeIngresosComercio;
    detalleParametro = `Ingresos: $${facturacion.toLocaleString("es-AR")} ≤ $${tope.toLocaleString("es-AR")} (tope cat. ${categoriaResultante.nombre})`;
  } else if (limitante === "Superficie") {
    detalleParametro = `Superficie: ${superficie} m² ≤ ${categoriaResultante.topeSuperficie} m² (tope cat. ${categoriaResultante.nombre})`;
  } else if (limitante === "Energía eléctrica") {
    detalleParametro = `Energía: ${energia.toLocaleString("es-AR")} kWh ≤ ${categoriaResultante.topeEnergia.toLocaleString("es-AR")} kWh (tope cat. ${categoriaResultante.nombre})`;
  }

  // --- Alerta de cambio ---
  let alerta = "";
  if (categoriaActual === "ninguna") {
    alerta = `Alta nueva en categoría ${categoriaResultante.nombre}.`;
  } else {
    const idxActual = indicePorNombre(categoriaActual);
    const idxNuevo = indicePorNombre(categoriaResultante.nombre);
    if (idxNuevo > idxActual) {
      alerta = `⬆️ Debés subir de categoría ${categoriaActual} a ${categoriaResultante.nombre} antes del 20 de julio.`;
    } else if (idxNuevo < idxActual) {
      alerta = `⬇️ Podés bajar de categoría ${categoriaActual} a ${categoriaResultante.nombre} y pagar menos cuota.`;
    } else {
      alerta = `✅ Tu categoría ${categoriaActual} es correcta. No necesitás recategorizarte.`;
    }
  }

  // --- Insight dinámico según dirección del cambio ---
  const idxActualNum = categoriaActual === "ninguna" ? -1 : indicePorNombre(categoriaActual);
  const sube = idxActualNum !== -1 && idxFinal > idxActualNum;
  const baja = idxActualNum !== -1 && idxFinal < idxActualNum;

  let insightText: string;
  let insightTone: "good" | "warn" | "neutral";
  if (categoriaActual === "ninguna") {
    insightText = `Te corresponde la **categoría ${categoriaResultante.nombre}**, con una cuota mensual de **$${cuotaNueva.toLocaleString("es-AR")}**. El parámetro que define tu categoría es **${limitante.toLowerCase()}**.`;
    insightTone = "neutral";
  } else if (sube) {
    insightText = `Tenés que **subir de ${categoriaActual} a ${categoriaResultante.nombre}**: la cuota pasa a **$${cuotaNueva.toLocaleString("es-AR")}** (**+$${Math.abs(diferencia).toLocaleString("es-AR")}/mes**). Recategorizate antes del 20 de julio para no quedar excluido. Te empuja el parámetro **${limitante.toLowerCase()}**.`;
    insightTone = "warn";
  } else if (baja) {
    insightText = `Podés **bajar de ${categoriaActual} a ${categoriaResultante.nombre}** y ahorrar **$${Math.abs(diferencia).toLocaleString("es-AR")}/mes**: tu cuota quedaría en **$${cuotaNueva.toLocaleString("es-AR")}**. No es obligatorio, pero conviene recategorizarte.`;
    insightTone = "good";
  } else {
    insightText = `Tu **categoría ${categoriaActual} es correcta**: seguís pagando **$${cuotaNueva.toLocaleString("es-AR")}/mes** y no necesitás recategorizarte en julio.`;
    insightTone = "good";
  }

  // --- Gauge: dónde cae tu facturación en la escala de topes ---
  const topeDe = (cat: Categoria) =>
    actividad === "servicios" ? cat.topeIngresosServicios : cat.topeIngresosComercio;
  const segmentos = categoriasDisponibles.map((cat, idx) => ({
    nombre: cat.nombre,
    max: topeDe(cat),
    color: idx <= idxFinal ? "#22c55e" : "#f59e0b",
    colorDark: idx <= idxFinal ? "#15803d" : "#b45309",
  }));

  return {
    categoriaNueva: `Categoría ${categoriaResultante.nombre}`,
    cuotaMensual: cuotaNueva,
    diferenciaCuota: diferencia,
    parametroLimitante: detalleParametro,
    alertaExclusion: alerta,
    _insight: {
      title: "Tu recategorización",
      text: insightText,
      tone: insightTone,
      icon: "📋",
    },
    _chart: {
      type: "scale" as const,
      marker: facturacion,
      markerLabel: `Cat. ${categoriaResultante.nombre}`,
      min: 0,
      segments: segmentos,
      ariaLabel: `Facturación de $${facturacion.toLocaleString("es-AR")} ubicada en la categoría ${categoriaResultante.nombre} de la escala del monotributo`,
    },
  };
}
