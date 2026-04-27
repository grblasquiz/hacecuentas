export interface Inputs {
  discosMes: number;
  tipoCompra: string;
  genero: string;
}

export interface Outputs {
  presupuestoMensualUSD: number;
  presupuestoAnualUSD: number;
  precioPorDiscoUSD: number;
  desglose: string;
}

export function compute(i: Inputs): Outputs {
  const discosMes = Math.round(Math.abs(Number(i.discosMes) || 0));

  if (discosMes <= 0) {
    return {
      presupuestoMensualUSD: 0,
      presupuestoAnualUSD: 0,
      precioPorDiscoUSD: 0,
      desglose: "Ingresá al menos 1 disco por mes para calcular el presupuesto.",
    };
  }

  // Precios promedio por tipo de compra (USD, referencia 2026)
  // Segunda mano: USD 3–8 → promedio 5.50
  // Reedición local: USD 15–25 → promedio 20.00
  // Nuevo importado: USD 25–40 → promedio 32.50
  // Mix equilibrado: promedio de los tres = (5.50 + 20.00 + 32.50) / 3 ≈ 19.33
  const PRECIOS: Record<string, { precio: number; label: string }> = {
    segunda_mano:    { precio: 5.50,  label: "Segunda mano" },
    reedicion:       { precio: 20.00, label: "Reedición local" },
    nuevo_importado: { precio: 32.50, label: "Nuevo importado" },
    mixto:           { precio: (5.50 + 20.00 + 32.50) / 3, label: "Mix equilibrado" },
  };

  // Factor de ajuste por género (orientativo, basado en disponibilidad de mercado)
  const FACTORES_GENERO: Record<string, { factor: number; label: string }> = {
    rock:           { factor: 1.00, label: "Rock / Rock clásico" },
    jazz:           { factor: 1.05, label: "Jazz / Blues" },
    pop:            { factor: 1.10, label: "Pop / Electrónica" },
    clasica:        { factor: 0.95, label: "Música clásica" },
    latinoamericana:{ factor: 0.90, label: "Latinoamericana / Folklore" },
    otro:           { factor: 1.00, label: "Otro / Variado" },
  };

  const tipoData = PRECIOS[i.tipoCompra] ?? PRECIOS["mixto"];
  const generoData = FACTORES_GENERO[i.genero] ?? FACTORES_GENERO["otro"];

  const precioBase = tipoData.precio;
  const factor = generoData.factor;
  const precioPorDiscoUSD = precioBase * factor;

  const presupuestoMensualUSD = precioPorDiscoUSD * discosMes;
  const presupuestoAnualUSD = presupuestoMensualUSD * 12;

  const desglose =
    `Tipo: ${tipoData.label} (USD ${precioBase.toFixed(2)}/disco base) · ` +
    `Género: ${generoData.label} (factor ×${factor.toFixed(2)}) · ` +
    `Precio ajustado por disco: USD ${precioPorDiscoUSD.toFixed(2)} · ` +
    `${discosMes} disco${discosMes !== 1 ? "s" : ""}/mes`;

  return {
    presupuestoMensualUSD: Math.round(presupuestoMensualUSD * 100) / 100,
    presupuestoAnualUSD: Math.round(presupuestoAnualUSD * 100) / 100,
    precioPorDiscoUSD: Math.round(precioPorDiscoUSD * 100) / 100,
    desglose,
  };
}
