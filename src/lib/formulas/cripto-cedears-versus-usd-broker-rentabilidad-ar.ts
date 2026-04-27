export interface Inputs {
  capital_usd: number;
  activo: string;
  retorno_esperado_pct: number;
  broker_comision_pct: number;
  perfil_impositivo: string;
  incluir_bienes_personales: string;
}

export interface Outputs {
  ganancia_bruta_usd: number;
  costo_comision_usd: number;
  impuesto_ganancias_usd: number;
  impuesto_bp_usd: number;
  ganancia_neta_usd: number;
  rentabilidad_neta_pct: number;
  capital_final_usd: number;
  resumen_activo: string;
}

// Tasa cedular Ganancias art. 98 Ley 27.430 (vigente 2026)
const TASA_GANANCIAS_PERSONA_HUMANA = 0.15;
const TASA_GANANCIAS_EMPRESA = 0.35;
const TASA_GANANCIAS_EXENTO = 0.0;

// Bienes Personales alícuota activos financieros Ley 27.743 (2026)
const TASA_BIENES_PERSONALES = 0.005;

type ActivoInfo = {
  label: string;
  volatilidad: string;
  liquidez: string;
  tipo: string;
};

const ACTIVOS: Record<string, ActivoInfo> = {
  btc: {
    label: "Bitcoin (BTC)",
    volatilidad: "Muy alta (70-80% anual)",
    liquidez: "24/7 instantánea",
    tipo: "Cripto",
  },
  eth: {
    label: "Ethereum (ETH)",
    volatilidad: "Alta (65-75% anual)",
    liquidez: "24/7 instantánea",
    tipo: "Cripto",
  },
  aapl: {
    label: "CEDEAR AAPL (Apple)",
    volatilidad: "Media (20-30% anual)",
    liquidez: "Horario BYMA (10-17hs)",
    tipo: "CEDEAR",
  },
  msft: {
    label: "CEDEAR MSFT (Microsoft)",
    volatilidad: "Media (20-28% anual)",
    liquidez: "Horario BYMA (10-17hs)",
    tipo: "CEDEAR",
  },
  nvda: {
    label: "CEDEAR NVDA (NVIDIA)",
    volatilidad: "Muy alta (50-60% anual)",
    liquidez: "Horario BYMA (10-17hs)",
    tipo: "CEDEAR",
  },
  al30: {
    label: "Bono AL30 USD",
    volatilidad: "Baja-media (10-15% anual)",
    liquidez: "Mercado local / SENEBI",
    tipo: "Bono soberano AR",
  },
  treasury: {
    label: "Treasury ETF (TLT/IEF)",
    volatilidad: "Baja (8-12% anual)",
    liquidez: "Horario NYSE vía broker",
    tipo: "Renta fija EE.UU.",
  },
};

export function compute(i: Inputs): Outputs {
  const capital = Number(i.capital_usd) || 0;
  const retornoPct = Number(i.retorno_esperado_pct) || 0;
  const comisionPct = Number(i.broker_comision_pct) || 0;
  const perfilImpositivo = i.perfil_impositivo || "persona_humana";
  const incluirBP = i.incluir_bienes_personales === "si";
  const activoKey = i.activo || "btc";

  if (capital <= 0) {
    return {
      ganancia_bruta_usd: 0,
      costo_comision_usd: 0,
      impuesto_ganancias_usd: 0,
      impuesto_bp_usd: 0,
      ganancia_neta_usd: 0,
      rentabilidad_neta_pct: 0,
      capital_final_usd: 0,
      resumen_activo: "Ingresá un capital válido mayor a cero.",
    };
  }

  // Ganancia bruta sobre el capital
  const gananciaBruta = capital * (retornoPct / 100);

  // Comisión sobre el capital (entrada + salida simplificado en una tasa)
  const costoComision = capital * (comisionPct / 100);

  // Base imponible para Ganancias = ganancia bruta menos comisiones
  const baseImponible = gananciaBruta - costoComision;

  // Tasa de Ganancias según perfil
  let tasaGanancias: number;
  switch (perfilImpositivo) {
    case "empresa":
      tasaGanancias = TASA_GANANCIAS_EMPRESA;
      break;
    case "exento":
      tasaGanancias = TASA_GANANCIAS_EXENTO;
      break;
    case "persona_humana":
    default:
      tasaGanancias = TASA_GANANCIAS_PERSONA_HUMANA;
      break;
  }

  // Impuesto Ganancias: solo si la base imponible es positiva
  const impuestoGanancias = baseImponible > 0 ? baseImponible * tasaGanancias : 0;

  // Saldo antes de Bienes Personales
  const saldoAntesBP = capital + gananciaBruta - costoComision - impuestoGanancias;

  // Bienes Personales sobre saldo final (si aplica)
  const impuestoBP = incluirBP && saldoAntesBP > 0 ? saldoAntesBP * TASA_BIENES_PERSONALES : 0;

  // Ganancia neta = bruta − comisiones − ganancias − BP
  const gananciaNeta = gananciaBruta - costoComision - impuestoGanancias - impuestoBP;

  // Rentabilidad neta sobre capital original
  const rentabilidadNetaPct = (gananciaNeta / capital) * 100;

  // Capital final
  const capitalFinal = capital + gananciaNeta;

  // Resumen descriptivo del activo
  const info = ACTIVOS[activoKey] ?? {
    label: activoKey.toUpperCase(),
    volatilidad: "Desconocida",
    liquidez: "Desconocida",
    tipo: "Otro",
  };

  const perfilLabel =
    perfilImpositivo === "persona_humana"
      ? `Persona humana (${(tasaGanancias * 100).toFixed(0)}% cedular)`
      : perfilImpositivo === "empresa"
      ? `Empresa (${(tasaGanancias * 100).toFixed(0)}%)`
      : "Exento";

  const bpLabel = incluirBP
    ? `BP: ${(TASA_BIENES_PERSONALES * 100).toFixed(2)}% sobre saldo final`
    : "Bienes Personales: no aplicado";

  const resumen =
    `${info.label} | Tipo: ${info.tipo} | ` +
    `Volatilidad: ${info.volatilidad} | ` +
    `Liquidez: ${info.liquidez} | ` +
    `Impositivo: ${perfilLabel} | ` +
    bpLabel +
    (retornoPct < 0 ? " | ⚠️ Retorno negativo: se muestra pérdida estimada." : "");

  return {
    ganancia_bruta_usd: Math.round(gananciaBruta * 100) / 100,
    costo_comision_usd: Math.round(costoComision * 100) / 100,
    impuesto_ganancias_usd: Math.round(impuestoGanancias * 100) / 100,
    impuesto_bp_usd: Math.round(impuestoBP * 100) / 100,
    ganancia_neta_usd: Math.round(gananciaNeta * 100) / 100,
    rentabilidad_neta_pct: Math.round(rentabilidadNetaPct * 100) / 100,
    capital_final_usd: Math.round(capitalFinal * 100) / 100,
    resumen_activo: resumen,
  };
}
