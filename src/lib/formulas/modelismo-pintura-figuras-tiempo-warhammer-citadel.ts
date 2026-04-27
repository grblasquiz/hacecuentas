export interface Inputs {
  cantidadFiguras: number;
  nivelDetalle: string;
  tamanoFigura: string;
  marcaPintura: string;
  horasSemana: number;
}

export interface Outputs {
  horasMinimas: number;
  horasMaximas: number;
  horasPromedio: number;
  semanasMinimas: number;
  semanasMaximas: number;
  costoEstimadoUSD: number;
  resumen: string;
}

export function compute(i: Inputs): Outputs {
  const cantidad = Math.max(0, Math.round(Number(i.cantidadFiguras) || 0));
  const horasSemana = Math.max(0.5, Number(i.horasSemana) || 5);

  if (cantidad <= 0) {
    return {
      horasMinimas: 0,
      horasMaximas: 0,
      horasPromedio: 0,
      semanasMinimas: 0,
      semanasMaximas: 0,
      costoEstimadoUSD: 0,
      resumen: "Ingresá una cantidad de figuras válida.",
    };
  }

  // Horas base por figura según nivel de detalle
  // Fuente: comunidad de modelismo / Warhammer Community tutorials
  const NIVEL_HORAS: Record<string, { min: number; max: number; pinturas: number }> = {
    tabletop: { min: 1.0, max: 2.0, pinturas: 0.08 },
    parade:   { min: 3.0, max: 5.0, pinturas: 0.15 },
    display:  { min: 10.0, max: 20.0, pinturas: 0.30 },
  };

  // Multiplicador por tamaño de figura
  const TAMANO_MULT: Record<string, number> = {
    infantry: 1.0,
    hero:     1.8,
    large:    2.5,
    vehicle:  3.5,
  };

  // Precio por pot en USD (2026)
  // Citadel 12ml ~USD 4.55 | Vallejo 17ml ~USD 3.20 | otro ~USD 3.80
  const COSTO_POT: Record<string, number> = {
    citadel: 4.55,
    vallejo: 3.20,
    otro:    3.80,
  };

  const nivel = NIVEL_HORAS[i.nivelDetalle] ?? NIVEL_HORAS["tabletop"];
  const multTamano = TAMANO_MULT[i.tamanoFigura] ?? 1.0;
  const costoPot = COSTO_POT[i.marcaPintura] ?? 3.80;

  const horasMinimas = parseFloat((cantidad * nivel.min * multTamano).toFixed(1));
  const horasMaximas = parseFloat((cantidad * nivel.max * multTamano).toFixed(1));
  const horasPromedio = parseFloat(((horasMinimas + horasMaximas) / 2).toFixed(1));

  const semanasMinimas = parseFloat((horasMinimas / horasSemana).toFixed(1));
  const semanasMaximas = parseFloat((horasMaximas / horasSemana).toFixed(1));

  // Costo pinturas: pots por figura × costo pot × multiplicador tamaño (superficie mayor = más pintura)
  const potsTotal = cantidad * nivel.pinturas * multTamano;
  const costoEstimadoUSD = parseFloat((potsTotal * costoPot).toFixed(2));

  // Etiquetas legibles para el resumen
  const nivelLabel: Record<string, string> = {
    tabletop: "Tabletop",
    parade: "Parade Ready",
    display: "Display / Competencia",
  };
  const tamanoLabel: Record<string, string> = {
    infantry: "infantería",
    hero: "héroe / personaje",
    large: "élite / monstruo",
    vehicle: "vehículo",
  };
  const marcaLabel: Record<string, string> = {
    citadel: "Citadel",
    vallejo: "Vallejo",
    otro: "otra marca",
  };

  const nivelStr = nivelLabel[i.nivelDetalle] ?? i.nivelDetalle;
  const tamanoStr = tamanoLabel[i.tamanoFigura] ?? i.tamanoFigura;
  const marcaStr = marcaLabel[i.marcaPintura] ?? i.marcaPintura;

  const resumen =
    `${cantidad} figuras de ${tamanoStr} a nivel ${nivelStr} con pinturas ${marcaStr}. ` +
    `Tiempo estimado: ${horasMinimas}–${horasMaximas} h ` +
    `(≈${semanasMinimas}–${semanasMaximas} semanas pintando ${horasSemana} h/sem). ` +
    `Costo aproximado en pinturas: USD ${costoEstimadoUSD.toFixed(2)} (excluye primer, barniz y basing).`;

  return {
    horasMinimas,
    horasMaximas,
    horasPromedio,
    semanasMinimas,
    semanasMaximas,
    costoEstimadoUSD,
    resumen,
  };
}
