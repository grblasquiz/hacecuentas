import { BIENES_PERSONALES_2025 } from '../data/bienes-personales-2025';

export interface Inputs {
  cripto_ars: number;
  cedears_ars: number;
  plazo_fijo_ars: number;
  fondos_inversion_ars: number;
  inmueble_vivienda_ars: number;
  otros_inmuebles_ars: number;
  automotores_ars: number;
  otros_bienes_ars: number;
  deudas_ars: number;
  situacion_vivienda: string;
}

export interface Outputs {
  patrimonio_bruto: number;
  patrimonio_neto: number;
  vivienda_exenta_aplicada: number;
  base_imponible: number;
  impuesto_determinado: number;
  alicuota_efectiva: number;
  detalle_tramos: string;
  mensaje: string;
  _chart?: any;
  _insight?: any;
}

// Fuente: Ley 23.966 y RG ARCA vigente para período fiscal 2025
// Valores oficiales ARCA para el período fiscal 2025 (DDJJ 2026).
const MNI = BIENES_PERSONALES_2025.minimoNoImponible;
const EXENCION_VIVIENDA_UNICA = BIENES_PERSONALES_2025.casaHabitacionExentaHasta;

// Escala progresiva (excedente del MNI) — período fiscal 2025
// [limite_superior, alicuota]
// El último tramo no tiene límite superior (Infinity)
const TRAMOS: Array<{ hasta: number; alicuota: number; label: string }> =
  BIENES_PERSONALES_2025.escala.map((t, i) => ({ hasta: t.hasta, alicuota: t.tasa, label: `Tramo ${i + 1} (${(t.tasa * 100).toFixed(2).replace('.', ',')}%)` }));

function calcularImpuesto(baseImponible: number): {
  impuesto: number;
  detalle: string;
} {
  if (baseImponible <= 0) return { impuesto: 0, detalle: "Base imponible cero — sin impuesto." };

  let impuesto = 0;
  let acumulado = 0;
  const lineas: string[] = [];

  for (const tramo of TRAMOS) {
    if (acumulado >= baseImponible) break;
    const limiteTramo = tramo.hasta;
    const baseEnTramo = Math.min(baseImponible, limiteTramo) - acumulado;
    if (baseEnTramo <= 0) {
      acumulado = limiteTramo;
      continue;
    }
    const impuestoTramo = baseEnTramo * tramo.alicuota;
    impuesto += impuestoTramo;
    lineas.push(
      `${tramo.label}: $${baseEnTramo.toLocaleString("es-AR", { maximumFractionDigits: 0 })} × ${(tramo.alicuota * 100).toFixed(2)}% = $${impuestoTramo.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`
    );
    acumulado = Math.min(acumulado + baseEnTramo, limiteTramo);
  }

  return { impuesto, detalle: lineas.join("\n") };
}

export function compute(i: Inputs): Outputs {
  // Sanitizar inputs numéricos
  const cripto = Math.max(0, Number(i.cripto_ars) || 0);
  const cedears = Math.max(0, Number(i.cedears_ars) || 0);
  const plazoFijo = Math.max(0, Number(i.plazo_fijo_ars) || 0);
  const fondos = Math.max(0, Number(i.fondos_inversion_ars) || 0);
  const inmuebleVivienda = Math.max(0, Number(i.inmueble_vivienda_ars) || 0);
  const otrosInmuebles = Math.max(0, Number(i.otros_inmuebles_ars) || 0);
  const autos = Math.max(0, Number(i.automotores_ars) || 0);
  const otros = Math.max(0, Number(i.otros_bienes_ars) || 0);
  const deudas = Math.max(0, Number(i.deudas_ars) || 0);
  const situacion = i.situacion_vivienda || "no_tiene";

  // Paso 1: Patrimonio bruto (incluye vivienda por el momento)
  const patrimonioBruto =
    cripto +
    cedears +
    plazoFijo +
    fondos +
    inmuebleVivienda +
    otrosInmuebles +
    autos +
    otros;

  // Paso 2: Calcular exención de vivienda única
  let viviendaExentaAplicada = 0;

  if (situacion === "exenta") {
    // Vivienda exenta hasta el tope oficial del período fiscal 2025.
    viviendaExentaAplicada = Math.min(inmuebleVivienda, EXENCION_VIVIENDA_UNICA);
  } else if (situacion === "supera_exencion") {
    // Solo se exime hasta el tope; el excedente queda gravado
    viviendaExentaAplicada = Math.min(inmuebleVivienda, EXENCION_VIVIENDA_UNICA);
  } else {
    // "no_tiene": no aplica exención
    viviendaExentaAplicada = 0;
  }

  // Paso 3: Patrimonio neto
  const patrimonioNeto = Math.max(
    0,
    patrimonioBruto - viviendaExentaAplicada - deudas
  );

  // Paso 4: Base imponible sobre MNI
  const baseImponible = Math.max(0, patrimonioNeto - MNI);

  // Paso 5: Calcular impuesto por tramos
  const { impuesto, detalle } = calcularImpuesto(baseImponible);

  // Paso 6: Alícuota efectiva sobre patrimonio neto (para referencia)
  const alicuotaEfectiva =
    patrimonioNeto > 0 ? (impuesto / patrimonioNeto) * 100 : 0;

  // Mensaje de resultado
  let mensaje: string;
  if (patrimonioBruto === 0) {
    mensaje = "Ingresá al menos un activo para calcular el impuesto.";
  } else if (patrimonioNeto <= MNI) {
    mensaje = `Tu patrimonio neto de $${patrimonioNeto.toLocaleString("es-AR", { maximumFractionDigits: 0 })} no supera el MNI de $${MNI.toLocaleString("es-AR", { maximumFractionDigits: 0 })}. Impuesto: $0.`;
  } else {
    mensaje = `Tu base imponible es $${baseImponible.toLocaleString("es-AR", { maximumFractionDigits: 0 })}. Impuesto determinado: $${impuesto.toLocaleString("es-AR", { maximumFractionDigits: 0 })}. Alícuota efectiva: ${alicuotaEfectiva.toFixed(3)}%.`;
  }

  // Composición del patrimonio bruto (cada activo es una parte real del total)
  const composicion: Array<{ label: string; value: number }> = [
    { label: "Cripto", value: cripto },
    { label: "Cedears", value: cedears },
    { label: "Plazo fijo", value: plazoFijo },
    { label: "Fondos", value: fondos },
    { label: "Vivienda", value: inmuebleVivienda },
    { label: "Otros inmuebles", value: otrosInmuebles },
    { label: "Automotores", value: autos },
    { label: "Otros bienes", value: otros },
  ].filter((s) => s.value > 0);

  const chart =
    patrimonioBruto > 0 && composicion.length >= 2
      ? {
          type: "doughnut" as const,
          slices: composicion,
          prefix: "$",
          centerValue: "$" + Math.round(patrimonioBruto).toLocaleString("es-AR"),
          centerLabel: "Patrimonio",
          ariaLabel: "Composición del patrimonio bruto por tipo de activo",
        }
      : undefined;

  const ars = (v: number) => "$" + Math.round(v).toLocaleString("es-AR");
  let _insight;
  if (patrimonioBruto === 0) {
    _insight = {
      title: "Cargá tus activos",
      text: "Ingresá al menos un activo (cripto, cedears, plazo fijo, inmuebles…) para estimar Bienes Personales.",
      tone: "neutral" as const,
      icon: "🇦🇷",
    };
  } else if (baseImponible <= 0) {
    _insight = {
      title: "No pagás Bienes Personales",
      text: `Tu patrimonio neto de **${ars(patrimonioNeto)}** queda por debajo del mínimo no imponible de **${ars(MNI)}**: impuesto determinado **$0**.`,
      tone: "good" as const,
      icon: "✅",
    };
  } else {
    _insight = {
      title: "Bienes Personales a pagar",
      text: `Sobre una base imponible de **${ars(baseImponible)}** (excedente del MNI), el impuesto determinado es **${ars(impuesto)}**, una alícuota efectiva del **${alicuotaEfectiva.toFixed(3)}%** sobre tu patrimonio neto.`,
      tone: "warn" as const,
      icon: "🇦🇷",
    };
  }

  return {
    patrimonio_bruto: patrimonioBruto,
    patrimonio_neto: patrimonioNeto,
    vivienda_exenta_aplicada: viviendaExentaAplicada,
    base_imponible: baseImponible,
    impuesto_determinado: impuesto,
    alicuota_efectiva: alicuotaEfectiva,
    detalle_tramos: detalle || "Sin tramos aplicados.",
    mensaje,
    _chart: chart,
    _insight,
  };
}
