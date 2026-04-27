export interface Inputs {
  mateadores: number;
  matesPorPersona: number;
  tipoCebado: string;
}

export interface Outputs {
  gramosPorDia: number;
  duracion500g: string;
  duracion1kg: string;
  desglose: string;
}

export function compute(i: Inputs): Outputs {
  const mateadores = Math.round(Number(i.mateadores) || 0);
  const matesPorPersona = Math.round(Number(i.matesPorPersona) || 0);
  const tipoCebado = i.tipoCebado === "frio" ? "frio" : "caliente";

  if (mateadores <= 0 || matesPorPersona <= 0) {
    return {
      gramosPorDia: 0,
      duracion500g: "Ingresá valores válidos",
      duracion1kg: "Ingresá valores válidos",
      desglose: "Completá todos los campos para obtener el resultado.",
    };
  }

  // Gramos consumidos por cada mate individual cebado (fuente: INYM, estimaciones de consumo promedio)
  // Caliente: ~0.27g por cebada individual
  // Frío (tereré): ~0.20g por cebada individual (extracción más lenta)
  const GRAMOS_POR_MATE_CALIENTE = 0.27;
  const GRAMOS_POR_MATE_FRIO = 0.20;

  const gramosPorMate =
    tipoCebado === "frio" ? GRAMOS_POR_MATE_FRIO : GRAMOS_POR_MATE_CALIENTE;

  const totalMatesDia = mateadores * matesPorPersona;
  const gramosPorDia = totalMatesDia * gramosPorMate;

  // Duración de paquetes
  const PAQUETE_500G = 500;
  const PAQUETE_1KG = 1000;

  const diasPaquete500 = PAQUETE_500G / gramosPorDia;
  const diasPaquete1kg = PAQUETE_1KG / gramosPorDia;

  function formatearDuracion(dias: number): string {
    if (dias >= 365) {
      const anios = Math.floor(dias / 365);
      const diasRestantes = Math.round(dias % 365);
      if (diasRestantes === 0) return `${anios} año${anios > 1 ? "s" : ""}`;
      return `${anios} año${anios > 1 ? "s" : ""} y ${diasRestantes} día${diasRestantes !== 1 ? "s" : ""}`;
    }
    if (dias >= 30) {
      const meses = Math.floor(dias / 30);
      const diasRestantes = Math.round(dias % 30);
      if (diasRestantes === 0) return `${meses} mes${meses > 1 ? "es" : ""}`;
      return `${meses} mes${meses > 1 ? "es" : ""} y ${diasRestantes} día${diasRestantes !== 1 ? "s" : ""}`;
    }
    const diasRedondeados = Math.round(dias);
    return `${diasRedondeados} día${diasRedondeados !== 1 ? "s" : ""}`;
  }

  const tipoCebadoLabel =
    tipoCebado === "frio" ? "frío (tereré)" : "caliente";

  const desglose =
    `${mateadores} mateador${mateadores !== 1 ? "es" : ""} × ${matesPorPersona} mates/persona × ${gramosPorMate}g/mate (${tipoCebadoLabel}) = ${gramosPorDia.toFixed(1)}g/día. ` +
    `Total mates en la jornada: ${totalMatesDia}.`;

  return {
    gramosPorDia: Math.round(gramosPorDia * 10) / 10,
    duracion500g: formatearDuracion(diasPaquete500),
    duracion1kg: formatearDuracion(diasPaquete1kg),
    desglose,
  };
}
