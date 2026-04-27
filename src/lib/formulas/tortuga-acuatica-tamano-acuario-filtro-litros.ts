export interface Inputs {
  especie: string;
  largo_caparazon_cm: number;
  cantidad_tortugas: number;
  sexo: string;
}

export interface Outputs {
  litros_minimos: number;
  caudal_filtro_min: number;
  caudal_filtro_max: number;
  largo_acuario_min_cm: number;
  area_seca_min_cm2: number;
  uvb_watts: number;
  temperatura_agua: string;
  temperatura_basking: string;
  largo_adulto_estimado_cm: number;
  resumen: string;
}

// Tamaño adulto típico por especie y sexo (en cm de largo de caparazón)
// Fuente: Tortoise Trust, Melissa Kaplan's Herp Care Collection
const ESPECIE_DATA: Record<string, { factorVolumen: number; adultoHembra: number; adultoMacho: number }> = {
  trachemys_scripta:  { factorVolumen: 0.75, adultoHembra: 30, adultoMacho: 20 },
  trachemys_dorbignyi: { factorVolumen: 0.65, adultoHembra: 25, adultoMacho: 18 },
  pseudemys_concinna:  { factorVolumen: 0.85, adultoHembra: 40, adultoMacho: 30 },
  pseudemys_nelsoni:   { factorVolumen: 0.85, adultoHembra: 38, adultoMacho: 28 },
};

// Potencia UVB orientativa según volumen de acuario
function calcUVBWatts(litros: number): number {
  if (litros < 100) return 13;
  if (litros < 200) return 24;
  if (litros < 400) return 36;
  return 54;
}

export function compute(i: Inputs): Outputs {
  const largo = Number(i.largo_caparazon_cm) || 0;
  const cantidad = Math.max(1, Math.floor(Number(i.cantidad_tortugas) || 1));
  const especie = i.especie || "trachemys_scripta";
  const sexo = i.sexo || "desconocido";

  if (largo <= 0) {
    return {
      litros_minimos: 0,
      caudal_filtro_min: 0,
      caudal_filtro_max: 0,
      largo_acuario_min_cm: 0,
      area_seca_min_cm2: 0,
      uvb_watts: 0,
      temperatura_agua: "24–28 °C",
      temperatura_basking: "32–38 °C",
      largo_adulto_estimado_cm: 0,
      resumen: "Ingresá un largo de caparazón válido (en cm).",
    };
  }

  const data = ESPECIE_DATA[especie] ?? ESPECIE_DATA["trachemys_scripta"];

  // Tamaño adulto estimado según sexo
  let largoAdulto: number;
  if (sexo === "hembra") {
    largoAdulto = data.adultoHembra;
  } else if (sexo === "macho") {
    largoAdulto = data.adultoMacho;
  } else {
    // Desconocido: promedio ponderado (más tortugas resultan ser hembras en cautiverio por compra indiscriminada)
    largoAdulto = Math.round((data.adultoHembra * 0.6 + data.adultoMacho * 0.4));
  }

  // Usamos el mayor entre el largo actual y el adulto estimado para
  // calcular el acuario con proyección de crecimiento (recomendado comprar a futuro)
  // Pero el volumen inmediato se basa en el largo actual
  const largoCalculo = largo;

  // Volumen mínimo: largo^2 * factor, con mínimo absoluto de 80 L
  const litrosPorTortuga = Math.pow(largoCalculo, 2) * data.factorVolumen;
  const MINIMO_ABSOLUTO = 80; // litros
  const litrosPorTortugaFinal = Math.max(litrosPorTortuga, MINIMO_ABSOLUTO);

  // Tortugas adicionales suman 50% del espacio base cada una
  const litrosTotales = Math.ceil(litrosPorTortugaFinal * (1 + 0.5 * (cantidad - 1)));

  // Filtración: 4–5× el volumen/hora
  const caudalMin = Math.ceil(litrosTotales * 4);
  const caudalMax = Math.ceil(litrosTotales * 5);

  // Largo mínimo del acuario: 5× el largo del caparazón, mínimo 60 cm
  const largoAcuarioMin = Math.max(60, Math.ceil(largo * 5));

  // Área seca: 1.5 × área estimada del caparazón
  // Ancho estimado del caparazón ≈ largo × 0.75 (ratio oval típico)
  const anchoEstimado = largo * 0.75;
  const areaSeca = Math.ceil(largo * anchoEstimado * 1.5);

  // UVB
  const uvbWatts = calcUVBWatts(litrosTotales);

  // Temperatura (fija para estas especies)
  const tempAgua = "24–28 °C";
  const tempBasking = "32–38 °C";

  // Resumen textual
  const especieLabel: Record<string, string> = {
    trachemys_scripta: "Trachemys scripta",
    trachemys_dorbignyi: "Trachemys dorbignyi",
    pseudemys_concinna: "Pseudemys concinna",
    pseudemys_nelsoni: "Pseudemys nelsoni",
  };
  const nombreEspecie = especieLabel[especie] ?? especie;
  const resumen =
    `${nombreEspecie} de ${largo} cm (${cantidad} individuo${cantidad > 1 ? "s" : ""}): ` +
    `acuario mínimo ${litrosTotales} L (largo ≥ ${largoAcuarioMin} cm), ` +
    `filtro ${caudalMin}–${caudalMax} L/h, ` +
    `basking ≥ ${areaSeca} cm², ` +
    `UVB ${uvbWatts} W. ` +
    `Tamaño adulto estimado: ${largoAdulto} cm.`;

  return {
    litros_minimos: litrosTotales,
    caudal_filtro_min: caudalMin,
    caudal_filtro_max: caudalMax,
    largo_acuario_min_cm: largoAcuarioMin,
    area_seca_min_cm2: areaSeca,
    uvb_watts: uvbWatts,
    temperatura_agua: tempAgua,
    temperatura_basking: tempBasking,
    largo_adulto_estimado_cm: largoAdulto,
    resumen,
  };
}
