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
// Tablas de parámetros 2026 — topes y cuotas desde la fuente única
// src/lib/data/monotributo-2026.ts (ARCA). Reforma 2026: servicios y comercio
// comparten la escala completa A–K (mismos topes); difiere la CUOTA en las
// categorías altas (servicios paga más).
// ---------------------------------------------------------------------------

import {
  CATEGORIAS as CATS_2026,
  TOPES,
  CUOTA_SERVICIOS,
  CUOTA_BIENES,
  PARAMS_FISICOS,
  categoriaPorIngresos,
  type Cat,
} from "../data/monotributo-2026";

interface Categoria {
  nombre: Cat;
  topeIngresos: number;     // igual para servicios y comercio (reforma 2026)
  topeSuperficie: number;   // m²
  topeEnergia: number;      // kWh/año
  cuotaServicios: number;   // impuesto + obra social + jubilación
  cuotaComercio: number;
}

// Parámetros físicos (superficie/energía): fuente única PARAMS_FISICOS en
// src/lib/data/monotributo-2026.ts (orientativos, verificar contra ARCA).

const CATEGORIAS: Categoria[] = CATS_2026.map((nombre) => ({
  nombre,
  topeIngresos: Math.round(TOPES[nombre]),
  topeSuperficie: PARAMS_FISICOS[nombre].superficie,
  topeEnergia: PARAMS_FISICOS[nombre].energia,
  cuotaServicios: Math.round(CUOTA_SERVICIOS[nombre]),
  cuotaComercio: Math.round(CUOTA_BIENES[nombre]),
}));

// Cuota por nombre de categoría (para lookup de categoría actual)
function cuotaPorNombre(nombre: string, actividad: string): number {
  const cat = CATEGORIAS.find((c) => c.nombre === nombre);
  if (!cat) return 0;
  return actividad === "comercio" ? cat.cuotaComercio : cat.cuotaServicios;
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

  // --- Categorías disponibles: reforma 2026, A–K para ambas actividades ---
  const categoriasDisponibles = CATEGORIAS;

  // --- Categoría por ingresos (tope igual para servicios y comercio) ---
  const catPorIngresos = categoriaPorIngresos(facturacion);
  const idxPorIngresos = catPorIngresos === null ? -1 : indicePorNombre(catPorIngresos);

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

  // --- Excluido del régimen: facturación supera el tope máximo (cat. K) ---
  if (idxPorIngresos === -1) {
    const topeMax = "$108.357.084 (Categoría K, igual para servicios y comercio desde la reforma 2026)";
    return {
      categoriaNueva: "EXCLUIDO",
      cuotaMensual: 0,
      diferenciaCuota: 0,
      parametroLimitante: "Ingresos",
      alertaExclusion:
        `⚠️ Tu facturación supera el tope máximo del monotributo (${topeMax}). Debés inscribirte como Responsable Inscripto.`,
    };
  }

  // --- Excluido del régimen: superficie supera el máximo de la tabla (200 m²) ---
  const ultimaCat = categoriasDisponibles[categoriasDisponibles.length - 1];
  if (superficie > 0 && idxPorSuperficie === -1) {
    return {
      categoriaNueva: "EXCLUIDO",
      cuotaMensual: 0,
      diferenciaCuota: 0,
      parametroLimitante: "Superficie",
      alertaExclusion:
        `⚠️ La superficie afectada (${superficie} m²) supera el máximo permitido en el monotributo (${ultimaCat.topeSuperficie} m², tope de la categoría ${ultimaCat.nombre}). Quedás excluido del régimen: consultá con tu contador el pase a Responsable Inscripto.`,
    };
  }

  // --- Excluido del régimen: energía supera el máximo de la tabla (20.000 kWh/año) ---
  if (energia > 0 && idxPorEnergia === -1) {
    return {
      categoriaNueva: "EXCLUIDO",
      cuotaMensual: 0,
      diferenciaCuota: 0,
      parametroLimitante: "Energía eléctrica",
      alertaExclusion:
        `⚠️ El consumo de energía eléctrica (${energia.toLocaleString("es-AR")} kWh/año) supera el máximo permitido en el monotributo (${ultimaCat.topeEnergia.toLocaleString("es-AR")} kWh/año, tope de la categoría ${ultimaCat.nombre}). Quedás excluido del régimen: consultá con tu contador el pase a Responsable Inscripto.`,
    };
  }

  // --- Determinar índice final (el más alto de los tres parámetros) ---
  let idxFinal = idxPorIngresos;
  let limitante = "Ingresos";

  if (idxPorSuperficie > idxFinal) {
    idxFinal = idxPorSuperficie;
    limitante = "Superficie";
  }
  if (idxPorEnergia > idxFinal) {
    idxFinal = idxPorEnergia;
    limitante = "Energía eléctrica";
  }

  const categoriaResultante = categoriasDisponibles[idxFinal];
  const cuotaNueva =
    actividad === "comercio" ? categoriaResultante.cuotaComercio : categoriaResultante.cuotaServicios;

  // --- Cuota actual ---
  const cuotaActual =
    categoriaActual === "ninguna" ? 0 : cuotaPorNombre(categoriaActual, actividad);
  const diferencia = cuotaNueva - cuotaActual;

  // --- Construir detalle del parámetro limitante ---
  let detalleParametro = `${limitante}`;
  if (limitante === "Ingresos") {
    const tope = categoriaResultante.topeIngresos;
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
  const segmentos = categoriasDisponibles.map((cat, idx) => ({
    nombre: cat.nombre,
    max: cat.topeIngresos,
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
