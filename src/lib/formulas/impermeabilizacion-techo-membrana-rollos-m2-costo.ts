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
}

// Precios orientativos AMBA, abril 2026 (sin IVA)
// Fuente: relevamiento de corralones y Cámara Argentina de la Construcción
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
    precioRollo: 28000,
    kgPegPorM2: 0.30,
    precioPegKg: 2200,
    moporM2: 3500,
  },
  geotextil_40: {
    label: "Geotextil 4 mm",
    areaPorRollo: 10,
    precioRollo: 36000,
    kgPegPorM2: 0.30,
    precioPegKg: 2200,
    moporM2: 3800,
  },
  aluminio: {
    label: "Aluminio 4 mm",
    areaPorRollo: 10,
    precioRollo: 52000,
    kgPegPorM2: 0.25,
    precioPegKg: 2200,
    moporM2: 4500,
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

  const solape = Math.min(Math.max(Number(i.solape) || 10, 0), 50); // entre 0% y 50%
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
    ` Precios orientativos sin IVA, AMBA abril 2026.`;

  return {
    rollosNecesarios,
    kgPegamento,
    costoMateriales,
    costoManoObra,
    costoTotal,
    detalle,
  };
}
