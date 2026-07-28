export interface Inputs {
  superficie: number;
  tipoMembrana: string;
  solape: number;
  incluirManoObra: string;
}

export interface Outputs {
  rollosNecesarios: number;
  kgPegamento: number;
  costoMateriales: number;
  costoManoObra: number;
  costoTotal: number;
  detalle: string;
  _chart?: any;
  _insight?: any;
}

// Precios orientativos AMBA, julio 2026 (sin IVA)
// Fuente: relevamiento corralones/e-commerce (Sodimac, MercadoLibre, El Amigo) y guías de colocación 2026.
// Geotextil 40 kg retail $115-137k c/IVA; aluminio 35 kg estándar $47-51k c/IVA; MO profesional ~$17,5k/m².
const CONFIGS: Record<string, {
  label: string;
  areaPorRollo: number;      // m² por rollo
  precioRollo: number;       // ARS por rollo
  kgPegPorM2: number;        // kg adhesivo por m² (superficie neta)
  precioPegKg: number;       // ARS por kg de adhesivo
  moporM2: number;           // ARS mano de obra por m²
}> = {
  geotextil_35: {
    label: "Geotextil 3,5 mm",
    areaPorRollo: 10,
    precioRollo: 80000,
    kgPegPorM2: 0.30,
    precioPegKg: 2400,
    moporM2: 16000,
  },
  geotextil_40: {
    label: "Geotextil 4 mm",
    areaPorRollo: 10,
    precioRollo: 100000,
    kgPegPorM2: 0.30,
    precioPegKg: 2400,
    moporM2: 17000,
  },
  aluminio: {
    label: "Aluminio 4 mm",
    areaPorRollo: 10,
    precioRollo: 48000,
    kgPegPorM2: 0.25,
    precioPegKg: 2400,
    moporM2: 18000,
  },
};

const DEFAULT_CONFIG = CONFIGS["geotextil_40"];

export function compute(i: Inputs): Outputs {
  const superficie = Number(i.superficie) || 0;
  if (superficie <= 0) {
    return {
      rollosNecesarios: 0,
      kgPegamento: 0,
      costoMateriales: 0,
      costoManoObra: 0,
      costoTotal: 0,
      detalle: "Ingresá una superficie válida (mayor a 0 m²).",
    };
  }

  const solape = Math.min(Math.max((Number.isFinite(Number(i.solape)) ? Number(i.solape) : 10), 0), 50); // entre 0% y 50%
  const config = CONFIGS[i.tipoMembrana] ?? DEFAULT_CONFIG;
  const conManoObra = (i.incluirManoObra ?? "si") === "si";

  // Superficie con solape y desperdicio
  const superficieConSolape = superficie * (1 + solape / 100);

  // Cantidad de rollos (redondear hacia arriba)
  const rollosNecesarios = Math.ceil(superficieConSolape / config.areaPorRollo);

  // Kg de pegamento (sobre superficie neta, las solapas ya consumen parte)
  const kgPegamento = parseFloat((superficie * config.kgPegPorM2).toFixed(2));

  // Costo materiales
  const costoRollos = rollosNecesarios * config.precioRollo;
  const costoPegamento = kgPegamento * config.precioPegKg;
  const costoMateriales = costoRollos + costoPegamento;

  // Costo mano de obra
  const costoManoObra = conManoObra ? superficie * config.moporM2 : 0;

  // Total
  const costoTotal = costoMateriales + costoManoObra;

  // Detalle textual
  const moTexto = conManoObra
    ? `Mano de obra (${superficie} m² × $${config.moporM2.toLocaleString("es-AR")}): $${costoManoObra.toLocaleString("es-AR")}.`
    : "Mano de obra no incluida.";

  const detalle =
    `Membrana: ${config.label}. ` +
    `Superficie: ${superficie} m² + ${solape}% solape = ${superficieConSolape.toFixed(1)} m². ` +
    `Rollos: ${rollosNecesarios} × $${config.precioRollo.toLocaleString("es-AR")} = $${costoRollos.toLocaleString("es-AR")}. ` +
    `Pegamento: ${kgPegamento} kg × $${config.precioPegKg.toLocaleString("es-AR")} = $${costoPegamento.toLocaleString("es-AR")}. ` +
    moTexto +
    ` Precios orientativos sin IVA, AMBA julio 2026.`;

  const chart = {
    type: "doughnut" as const,
    slices: [
      { label: "Membrana (rollos)", value: costoRollos },
      { label: "Pegamento", value: costoPegamento },
      { label: "Mano de obra", value: costoManoObra },
    ],
    prefix: "$",
    centerValue: "$" + Math.round(costoTotal).toLocaleString("es-AR"),
    centerLabel: "Total",
    ariaLabel: "Composición del costo: membrana, pegamento y mano de obra",
  };

  const costoPorM2 = superficie > 0 ? costoTotal / superficie : 0;
  const fmt = (n: number) => "$" + Math.round(n).toLocaleString("es-AR");
  const pctMO = costoTotal > 0 ? Math.round((costoManoObra / costoTotal) * 100) : 0;
  const insight = {
    title: "Costo de impermeabilizar el techo",
    text: conManoObra
      ? `Impermeabilizar **${superficie} m²** con ${config.label} sale **${fmt(costoTotal)}** (**${fmt(costoPorM2)}/m²**), de los cuales la mano de obra es el **${pctMO}%** (${fmt(costoManoObra)}). Vas a necesitar **${rollosNecesarios} rollos** y **${kgPegamento} kg** de adhesivo.`
      : `Solo los materiales para **${superficie} m²** con ${config.label} suman **${fmt(costoMateriales)}** (**${fmt(costoPorM2)}/m²**): **${rollosNecesarios} rollos** y **${kgPegamento} kg** de adhesivo. La mano de obra no está incluida.`,
    tone: "neutral",
    icon: "🏠",
  };

  return {
    rollosNecesarios,
    kgPegamento,
    costoMateriales,
    costoManoObra,
    costoTotal,
    detalle,
    _chart: chart,
    _insight: insight,
  };
}
