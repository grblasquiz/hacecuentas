export interface Inputs {
  saldo: number;
  plazo_meses: number;
  tramo_ahorro: "19" | "21" | "23" | "27" | "28";
  cumple_requisitos_openbank: boolean;
  cumple_requisitos_ing: boolean;
  cumple_requisitos_bbva: boolean;
  cumple_requisitos_sabadell: boolean;
}

export interface Outputs {
  resultado_trade_republic: number;
  resultado_myinvestor: number;
  resultado_ing: number;
  resultado_openbank: number;
  resultado_bbva: number;
  resultado_sabadell: number;
  mejor_opcion: string;
  diferencia_mejor_peor: number;
  retencion_aplicada: number;
  ajuste_irpf_final: number;
}

export function compute(i: Inputs): Outputs {
  // --- Constantes 2026 (fuente: webs oficiales entidades, abril 2026) ---
  const RETENCION_CUENTA = 0.19; // Retención IRPF a cuenta (art. 101 Ley 35/2006)

  // TIN anuales por entidad
  const TIN_TRADE_REPUBLIC = 0.035;  // 3,50% — sin requisitos, hasta 50.000 €
  const TIN_MYINVESTOR = 0.03;       // 3,00% — sin requisitos, hasta 50.000 €
  const TIN_ING = 0.025;             // 2,50% — con nómina ≥700 €/mes, hasta 30.000 €
  const TIN_OPENBANK_BONIF = 0.02;   // 2,00% — primeros 6 meses, hasta 30.000 €
  const TIN_OPENBANK_STD = 0.001;    // 0,10% — tras período bonificado
  const TIN_BBVA = 0.02;             // 2,00% — con nómina + 3 recibos, hasta 10.000 €
  const TIN_SABADELL_BONIF = 0.02;   // 2,00% — primeros 6 meses, hasta 30.000 €
  const TIN_SABADELL_STD = 0.001;    // 0,10% — tras período bonificado

  // Límites máximos remunerados por entidad (€)
  const LIMITE_TRADE_REPUBLIC = 50000;
  const LIMITE_MYINVESTOR = 50000;
  const LIMITE_ING = 30000;
  const LIMITE_OPENBANK = 30000;
  const LIMITE_BBVA = 10000;
  const LIMITE_SABADELL = 30000;

  // Meses bonificados para cuentas con período promocional
  const MESES_BONIF_OPENBANK = 6;
  const MESES_BONIF_SABADELL = 6;

  // Tipos IRPF base del ahorro 2026 (fuente: AEAT / Ley 35/2006 art. 66)
  const TIPO_AHORRO: Record<string, number> = {
    "19": 0.19,
    "21": 0.21,
    "23": 0.23,
    "27": 0.27,
    "28": 0.28
  };

  // --- Validaciones y sanitización ---
  const saldo = Math.max(0, i.saldo || 0);
  const plazo = Math.max(1, Math.min(60, Math.round(i.plazo_meses || 12)));
  const tipoAhorro = TIPO_AHORRO[i.tramo_ahorro] ?? 0.19;

  // --- Función auxiliar: calcula interés bruto dado saldo efectivo, TIN y plazo en meses ---
  function interesBruto(saldoEfectivo: number, tin: number, meses: number): number {
    return saldoEfectivo * tin * (meses / 12);
  }

  // --- Función auxiliar: interés neto tras retención del 19% ---
  function interesNeto(bruto: number): number {
    return bruto * (1 - RETENCION_CUENTA);
  }

  // --- Función auxiliar: para cuentas con período bonificado ---
  // Aplica TIN bonificado hasta min(plazo, mesesBonif) y TIN estándar para el resto
  function interesBrutoBonificado(
    saldoEfectivo: number,
    tinBonif: number,
    tinStd: number,
    mesesBonif: number,
    plazoTotal: number
  ): number {
    const mesesConBonif = Math.min(plazoTotal, mesesBonif);
    const mesesSinBonif = Math.max(0, plazoTotal - mesesBonif);
    return (
      interesBruto(saldoEfectivo, tinBonif, mesesConBonif) +
      interesBruto(saldoEfectivo, tinStd, mesesSinBonif)
    );
  }

  // --- Cálculos por entidad ---

  // Trade Republic: 3,50% TIN, hasta 50.000 €, sin requisitos
  const saldoTR = Math.min(saldo, LIMITE_TRADE_REPUBLIC);
  const brutoTR = interesBruto(saldoTR, TIN_TRADE_REPUBLIC, plazo);
  const netoTR = interesNeto(brutoTR);

  // MyInvestor: 3,00% TIN, hasta 50.000 €, sin requisitos
  const saldoMI = Math.min(saldo, LIMITE_MYINVESTOR);
  const brutoMI = interesBruto(saldoMI, TIN_MYINVESTOR, plazo);
  const netoMI = interesNeto(brutoMI);

  // ING Naranja: 2,50% TIN, hasta 30.000 €, con requisito nómina
  const saldoING = i.cumple_requisitos_ing ? Math.min(saldo, LIMITE_ING) : 0;
  const brutoING = interesBruto(saldoING, TIN_ING, plazo);
  const netoING = i.cumple_requisitos_ing ? interesNeto(brutoING) : 0;

  // Openbank Welcome: 2,00% TIN primeros 6 meses, 0,10% después; hasta 30.000 €
  const saldoOB = Math.min(saldo, LIMITE_OPENBANK);
  const brutoOB = interesBrutoBonificado(
    saldoOB,
    TIN_OPENBANK_BONIF,
    TIN_OPENBANK_STD,
    MESES_BONIF_OPENBANK,
    plazo
  );
  const netoOB = interesNeto(brutoOB);

  // BBVA Conexión: 2,00% TIN, hasta 10.000 €, con requisito nómina + recibos
  const saldoBBVA = i.cumple_requisitos_bbva ? Math.min(saldo, LIMITE_BBVA) : 0;
  const brutoBBVA = interesBruto(saldoBBVA, TIN_BBVA, plazo);
  const netoBBVA = i.cumple_requisitos_bbva ? interesNeto(brutoBBVA) : 0;

  // Sabadell Online: 2,00% TIN primeros 6 meses, 0,10% después; hasta 30.000 €, con nómina
  const saldoSAB = i.cumple_requisitos_sabadell ? Math.min(saldo, LIMITE_SABADELL) : 0;
  const brutoSAB = i.cumple_requisitos_sabadell
    ? interesBrutoBonificado(
        saldoSAB,
        TIN_SABADELL_BONIF,
        TIN_SABADELL_STD,
        MESES_BONIF_SABADELL,
        plazo
      )
    : 0;
  const netoSAB = i.cumple_requisitos_sabadell ? interesNeto(brutoSAB) : 0;

  // --- Determinar mejor opción ---
  const opciones: { nombre: string; neto: number; bruto: number }[] = [
    { nombre: "Trade Republic (3,50% TAE)", neto: netoTR, bruto: brutoTR },
    { nombre: "MyInvestor (3,00% TAE)", neto: netoMI, bruto: brutoMI },
    {
      nombre: i.cumple_requisitos_ing
        ? "ING Naranja (2,50% TAE)"
        : "ING Naranja (no aplica: requiere nómina ≥700 €/mes)",
      neto: netoING,
      bruto: brutoING
    },
    { nombre: "Openbank Welcome (2,00% TAE bonificado)", neto: netoOB, bruto: brutoOB },
    {
      nombre: i.cumple_requisitos_bbva
        ? "BBVA Conexión (2,00% TAE)"
        : "BBVA Conexión (no aplica: requiere nómina + recibos)",
      neto: netoBBVA,
      bruto: brutoBBVA
    },
    {
      nombre: i.cumple_requisitos_sabadell
        ? "Sabadell Online (2,00% TAE bonificado)"
        : "Sabadell Online (no aplica: requiere nómina + cliente nuevo)",
      neto: netoSAB,
      bruto: brutoSAB
    }
  ];

  const opcionesValidas = opciones.filter((o) => o.neto > 0);

  let mejorOpcionTexto = "Sin datos suficientes";
  let netoBrutoMejor = brutoTR; // para ajuste IRPF, usar siempre Trade Republic como referencia

  if (opcionesValidas.length === 0) {
    // Trade Republic siempre disponible aunque neto sea 0 con saldo 0
    mejorOpcionTexto = "Trade Republic (3,50% TAE) — sin requisitos";
    netoBrutoMejor = brutoTR;
  } else {
    const mejor = opcionesValidas.reduce((prev, curr) =>
      curr.neto > prev.neto ? curr : prev
    );
    mejorOpcionTexto = mejor.nombre;
    netoBrutoMejor = mejor.bruto;
  }

  // Diferencia entre mejor y peor opción disponible
  const netosDisponibles = opcionesValidas.map((o) => o.neto);
  let diferenciaMejorPeor = 0;
  if (netosDisponibles.length > 1) {
    const maxNeto = Math.max(...netosDisponibles);
    const minNeto = Math.min(...netosDisponibles);
    diferenciaMejorPeor = maxNeto - minNeto;
  } else if (netosDisponibles.length === 1) {
    diferenciaMejorPeor = netosDisponibles[0];
  }

  // --- Ajuste fiscal final (diferencia entre tramo real y retención del 19%) ---
  // Positivo = pagar más en Renta; Negativo = devolución
  const ajusteIRPF = netoBrutoMejor * (tipoAhorro - RETENCION_CUENTA);

  // --- Redondeo a 2 decimales ---
  function r2(n: number): number {
    return Math.round(n * 100) / 100;
  }

  return {
    resultado_trade_republic: r2(netoTR),
    resultado_myinvestor: r2(netoMI),
    resultado_ing: r2(netoING),
    resultado_openbank: r2(netoOB),
    resultado_bbva: r2(netoBBVA),
    resultado_sabadell: r2(netoSAB),
    mejor_opcion: mejorOpcionTexto,
    diferencia_mejor_peor: r2(diferenciaMejorPeor),
    retencion_aplicada: 19,
    ajuste_irpf_final: r2(ajusteIRPF)
  };
}
