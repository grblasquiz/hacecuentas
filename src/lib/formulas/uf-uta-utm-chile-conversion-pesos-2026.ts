export interface Inputs {
  tipo_conversion: string;
  monto: number;
  fecha: string;
}

export interface Outputs {
  resultado_conversion: number;
  valor_unitario: number;
  tipo_unidad: string;
  fecha_vigencia: string;
  reajuste_ipc: number;
}

export function compute(i: Inputs): Outputs {
  // Valores UF, UTM, UTA 2026 - Banco Central y SII
  // Datos vigentes al 28.04.2026
  const UF_28_04_2026 = 32456.84; // UF Banco Central 28.04.2026
  const UTM_ABRIL_2026 = 67891.43; // UTM SII abril 2026
  const UTA_2026 = 814697.16; // UTA SII 2026 (12 × UTM promedio)
  const IPC_REAJUSTE_12M = 3.85; // Reajuste IPC acumulado últimos 12 meses (% aprox.)

  let resultado_conversion = 0;
  let valor_unitario = 0;
  let tipo_unidad = "";
  let fecha_vigencia = "";

  // Parsear fecha para validar
  const fechaObj = new Date(i.fecha);
  const hoy = new Date();
  const diferenciaDias = Math.floor((hoy.getTime() - fechaObj.getTime()) / (1000 * 60 * 60 * 24));

  // Validar que la fecha no sea futura
  if (fechaObj > hoy) {
    return {
      resultado_conversion: 0,
      valor_unitario: 0,
      tipo_unidad: "Error: Fecha no puede ser futura",
      fecha_vigencia: "",
      reajuste_ipc: 0
    };
  }

  // Simulación de variación de UF según días (aproximado)
  // La UF sube ~0.015% diario en promedio (reajuste anual ~3.85% / 252 días)
  const dias_desde_referencia = Math.max(0, diferenciaDias);
  const variacion_uf_diaria = 0.00015; // Aproximación simplificada
  const uf_ajustada = UF_28_04_2026 * Math.pow(1 + variacion_uf_diaria, dias_desde_referencia);
  const utm_vigente = UTM_ABRIL_2026; // UTM se mantiene mensualmente
  const uta_vigente = UTA_2026;

  switch (i.tipo_conversion) {
    case "pesos_a_uf":
      valor_unitario = uf_ajustada;
      resultado_conversion = i.monto / uf_ajustada;
      tipo_unidad = "UF";
      fecha_vigencia = `${i.fecha} (valor UF: $${uf_ajustada.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")})`;
      break;

    case "uf_a_pesos":
      valor_unitario = uf_ajustada;
      resultado_conversion = i.monto * uf_ajustada;
      tipo_unidad = "Pesos CLP";
      fecha_vigencia = `${i.fecha} (valor UF: $${uf_ajustada.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")})`;
      break;

    case "pesos_a_utm":
      valor_unitario = utm_vigente;
      resultado_conversion = i.monto / utm_vigente;
      tipo_unidad = "UTM";
      fecha_vigencia = `Vigencia abril 2026 (valor UTM: $${utm_vigente.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")})`;
      break;

    case "utm_a_pesos":
      valor_unitario = utm_vigente;
      resultado_conversion = i.monto * utm_vigente;
      tipo_unidad = "Pesos CLP";
      fecha_vigencia = `Vigencia abril 2026 (valor UTM: $${utm_vigente.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")})`;
      break;

    case "pesos_a_uta":
      valor_unitario = uta_vigente;
      resultado_conversion = i.monto / uta_vigente;
      tipo_unidad = "UTA";
      fecha_vigencia = `Vigencia 2026 (valor UTA: $${uta_vigente.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")})`;
      break;

    case "uta_a_pesos":
      valor_unitario = uta_vigente;
      resultado_conversion = i.monto * uta_vigente;
      tipo_unidad = "Pesos CLP";
      fecha_vigencia = `Vigencia 2026 (valor UTA: $${uta_vigente.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")})`;
      break;

    default:
      return {
        resultado_conversion: 0,
        valor_unitario: 0,
        tipo_unidad: "Error: Tipo de conversión no válido",
        fecha_vigencia: "",
        reajuste_ipc: 0
      };
  }

  return {
    resultado_conversion: Math.round(resultado_conversion * 100) / 100,
    valor_unitario: Math.round(valor_unitario * 100) / 100,
    tipo_unidad,
    fecha_vigencia,
    reajuste_ipc: IPC_REAJUSTE_12M
  };
}
