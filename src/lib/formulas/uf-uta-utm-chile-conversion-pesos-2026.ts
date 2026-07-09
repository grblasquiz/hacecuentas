// Datos en vivo desde mindicador.cl (refrescados por el cron diario fetch-chile.mjs).
// Si el JSON no tiene valor, cae al fallback hardcodeado (último valor verificado).
import clLive from "../../data/live/chile.json";

export interface Inputs {
  tipo_conversion: string;
  monto: number;
  fecha?: string;
}

export interface Outputs {
  resultado_conversion: number;
  valor_unitario: number;
  tipo_unidad: string;
  fecha_vigencia: string;
  reajuste_ipc: number;
  _insight?: any;
}

export function compute(i: Inputs): Outputs {
  // Valores UF, UTM, UTA — live (mindicador.cl) con fallback al último verificado.
  const ufVigente = (clLive as any)?.uf?.valor ?? 40844.79;
  const utmVigente = (clLive as any)?.utm?.valor ?? 71649;
  const utaVigente = (clLive as any)?.uta?.valor ?? 859788;
  const fechaUf = (clLive as any)?.uf?.fecha ?? '2026-07-09T04:00:00.000Z';
  const fechaUtm = (clLive as any)?.utm?.fecha ?? '2026-07-01T04:00:00.000Z';
  const fechaUta = (clLive as any)?.uta?.fecha ?? fechaUtm;

  let resultado_conversion = 0;
  let valor_unitario = 0;
  let tipo_unidad = "";
  let fecha_vigencia = "";

  const fechaCl = (iso: string) => new Intl.DateTimeFormat('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Santiago',
  }).format(new Date(iso));
  const vigencia = (unidad: string, valor: number, fecha: string) =>
    `${unidad} vigente al ${fechaCl(fecha)}: $${valor.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  switch (i.tipo_conversion) {
    case "pesos_a_uf":
      valor_unitario = ufVigente;
      resultado_conversion = i.monto / ufVigente;
      tipo_unidad = "UF";
      fecha_vigencia = vigencia('UF', ufVigente, fechaUf);
      break;

    case "uf_a_pesos":
      valor_unitario = ufVigente;
      resultado_conversion = i.monto * ufVigente;
      tipo_unidad = "Pesos CLP";
      fecha_vigencia = vigencia('UF', ufVigente, fechaUf);
      break;

    case "pesos_a_utm":
      valor_unitario = utmVigente;
      resultado_conversion = i.monto / utmVigente;
      tipo_unidad = "UTM";
      fecha_vigencia = vigencia('UTM', utmVigente, fechaUtm);
      break;

    case "utm_a_pesos":
      valor_unitario = utmVigente;
      resultado_conversion = i.monto * utmVigente;
      tipo_unidad = "Pesos CLP";
      fecha_vigencia = vigencia('UTM', utmVigente, fechaUtm);
      break;

    case "pesos_a_uta":
      valor_unitario = utaVigente;
      resultado_conversion = i.monto / utaVigente;
      tipo_unidad = "UTA";
      fecha_vigencia = vigencia('UTA', utaVigente, fechaUta);
      break;

    case "uta_a_pesos":
      valor_unitario = utaVigente;
      resultado_conversion = i.monto * utaVigente;
      tipo_unidad = "Pesos CLP";
      fecha_vigencia = vigencia('UTA', utaVigente, fechaUta);
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

  const resultadoRedondeado = Math.round(resultado_conversion * 100) / 100;
  const valorRedondeado = Math.round(valor_unitario * 100) / 100;
  const haciaPesos = tipo_unidad === 'Pesos CLP';
  const fmtCl = (n: number) => n.toLocaleString('es-CL', { maximumFractionDigits: 2 });
  const unidadOrigen = i.tipo_conversion.split('_')[0].toUpperCase();
  const insight = {
    title: haciaPesos ? `Cuánto valen tus ${unidadOrigen}` : `Cuántas ${tipo_unidad} son`,
    text: haciaPesos
      ? `**${fmtCl(Number(i.monto) || 0)} ${unidadOrigen}** equivalen a **$${fmtCl(resultadoRedondeado)} CLP**, con la ${unidadOrigen} valuada en **$${fmtCl(valorRedondeado)}** según el último dato disponible.`
      : `**$${fmtCl(Number(i.monto) || 0)} CLP** equivalen a **${fmtCl(resultadoRedondeado)} ${tipo_unidad}**, tomando cada ${tipo_unidad} a **$${fmtCl(valorRedondeado)}** según el último dato disponible.`,
    tone: 'neutral' as const,
    icon: '🇨🇱',
  };

  return {
    resultado_conversion: resultadoRedondeado,
    valor_unitario: valorRedondeado,
    tipo_unidad,
    fecha_vigencia,
    reajuste_ipc: 0,
    _insight: insight
  };
}
