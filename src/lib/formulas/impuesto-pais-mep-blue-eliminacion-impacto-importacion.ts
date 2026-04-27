export interface Inputs {
  montoUsd: number;
  tipoCambio: number;
  tipoOperacion: string; // 'consumidor_final' | 'responsable_inscripto' | 'monotributista'
  incluyeIIBB: string;  // 'si' | 'no'
}

export interface Outputs {
  costoConPais: number;
  costoSinPais: number;
  ahorroPesos: number;
  ahorroPorcentaje: number;
  desglose: string;
}

export function compute(i: Inputs): Outputs {
  const montoUsd = Number(i.montoUsd) || 0;
  const tipoCambio = Number(i.tipoCambio) || 0;

  if (montoUsd <= 0 || tipoCambio <= 0) {
    return {
      costoConPais: 0,
      costoSinPais: 0,
      ahorroPesos: 0,
      ahorroPorcentaje: 0,
      desglose: "Ingresá un monto y tipo de cambio válidos.",
    };
  }

  // Alícuotas vigentes 2025-2026
  const PAIS_RATE = 0.30;          // Impuesto PAIS (eliminado 23/12/2024, referencia histórica)
  const IVA_RATE = 0.21;           // IVA alícuota general — Ley 23.349
  const IIBB_RATE = 0.03;          // Percepción IIBB referencial (varía por provincia)

  // Percepción de Ganancias: 30% para RI y Monotributistas, 0% para consumidor final
  // Fuente: RG AFIP 4815/2020
  let GANANCIAS_RATE = 0;
  const op = String(i.tipoOperacion);
  if (op === "responsable_inscripto" || op === "monotributista") {
    GANANCIAS_RATE = 0.30;
  }

  const conIIBB = String(i.incluyeIIBB) === "si";
  const iibbEfectivo = conIIBB ? IIBB_RATE : 0;

  // Base en pesos (tipo de cambio oficial)
  const baseARS = montoUsd * tipoCambio;

  // ── CON Impuesto PAIS (vigente hasta 22/12/2024) ──────────────────────────
  const baseConPais = baseARS * (1 + PAIS_RATE);  // el PAIS eleva la base de conversión
  const ivaConPais       = baseConPais * IVA_RATE;
  const gananciasConPais = baseConPais * GANANCIAS_RATE;
  const iibbConPais      = baseConPais * iibbEfectivo;
  const costoConPais     = baseConPais + ivaConPais + gananciasConPais + iibbConPais;

  // ── SIN Impuesto PAIS (desde 23/12/2024) ─────────────────────────────────
  const baseSinPais = baseARS;
  const ivaSinPais       = baseSinPais * IVA_RATE;
  const gananciasSinPais = baseSinPais * GANANCIAS_RATE;
  const iibbSinPais      = baseSinPais * iibbEfectivo;
  const costoSinPais     = baseSinPais + ivaSinPais + gananciasSinPais + iibbSinPais;

  // ── Ahorro ────────────────────────────────────────────────────────────────
  const ahorroPesos      = costoConPais - costoSinPais;
  const ahorroPorcentaje = costoConPais > 0 ? (ahorroPesos / costoConPais) * 100 : 0;

  // ── Desglose textual ─────────────────────────────────────────────────────
  const fmt = (n: number) =>
    n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 });
  const pct = (n: number) => (n * 100).toFixed(1) + "%";

  const perfil =
    op === "responsable_inscripto"
      ? "Responsable Inscripto"
      : op === "monotributista"
      ? "Monotributista"
      : "Consumidor Final";

  const desgloseLineas = [
    `Perfil fiscal: ${perfil}`,
    `Base ARS (USD ${montoUsd.toFixed(2)} × $${tipoCambio.toLocaleString("es-AR")}): ${fmt(baseARS)}`,
    ``,
    `── CON PAIS (hasta dic 2024) ──`,
    `  Base ajustada (+${pct(PAIS_RATE)} PAIS): ${fmt(baseConPais)}`,
    `  IVA ${pct(IVA_RATE)}: ${fmt(ivaConPais)}`,
    GANANCIAS_RATE > 0 ? `  Percep. Ganancias ${pct(GANANCIAS_RATE)}: ${fmt(gananciasConPais)}` : `  Percep. Ganancias: no aplica`,
    conIIBB ? `  Percep. IIBB ${pct(IIBB_RATE)}: ${fmt(iibbConPais)}` : `  Percep. IIBB: no incluida`,
    `  TOTAL CON PAIS: ${fmt(costoConPais)}`,
    ``,
    `── SIN PAIS (desde dic 2024) ──`,
    `  Base ARS: ${fmt(baseSinPais)}`,
    `  IVA ${pct(IVA_RATE)}: ${fmt(ivaSinPais)}`,
    GANANCIAS_RATE > 0 ? `  Percep. Ganancias ${pct(GANANCIAS_RATE)}: ${fmt(gananciasSinPais)}` : `  Percep. Ganancias: no aplica`,
    conIIBB ? `  Percep. IIBB ${pct(IIBB_RATE)}: ${fmt(iibbSinPais)}` : `  Percep. IIBB: no incluida`,
    `  TOTAL SIN PAIS: ${fmt(costoSinPais)}`,
    ``,
    `Ahorro: ${fmt(ahorroPesos)} (${ahorroPorcentaje.toFixed(1)}%)`,
  ];

  const desglose = desgloseLineas.join("\n");

  return {
    costoConPais,
    costoSinPais,
    ahorroPesos,
    ahorroPorcentaje,
    desglose,
  };
}
