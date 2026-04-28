export interface Inputs {
  retiros_mes: number;
  monto_retiro: number;
  transferencias_mes: number;
  transacciones_pos: number;
  consultas_saldo: number;
}

export interface Outputs {
  gasto_bancolombia: number;
  gasto_davivienda: number;
  gasto_bbva: number;
  gasto_banco_bogota: number;
  gasto_nu: number;
  gasto_lulo: number;
  gasto_rappipay: number;
  gasto_daviplata: number;
  mejor_opcion: string;
  ahorro_mejor: number;
  ahorro_anual: number;
}

export function compute(i: Inputs): Outputs {
  // Validación
  const retiros = Math.max(0, i.retiros_mes || 0);
  const transferencias = Math.max(0, i.transferencias_mes || 0);
  const consultas = Math.max(0, i.consultas_saldo || 0);

  // Tarifas 2026 Colombia - Fuente: Superfinanciera + sitios oficiales bancos
  const TARIFA_BANCOLOMBIA = {
    cuota_manejo: 14900,
    retiro_cajero: 1650,
    transferencia_propia: 400,
    consultas_gratis: 4
  };

  const TARIFA_DAVIVIENDA = {
    cuota_manejo: 19000,
    retiro_cajero: 1900,
    transferencia_propia: 500,
    consultas_gratis: 6
  };

  const TARIFA_BBVA = {
    cuota_manejo: 18000,
    retiro_cajero: 1800,
    transferencia_propia: 0,
    consultas_gratis: 999
  };

  const TARIFA_BANCO_BOGOTA = {
    cuota_manejo: 16500,
    retiro_cajero: 1650,
    transferencia_propia: 600,
    consultas_gratis: 999
  };

  // Bancos digitales: sin comisiones
  const TARIFA_DIGITAL = {
    cuota_manejo: 0,
    retiro_cajero: 0,
    transferencia_propia: 0,
    consultas_gratis: 999
  };

  // Función auxiliar para calcular gasto
  function calcularGasto(
    cuota: number,
    retiro_costo: number,
    transf_costo: number,
    consultas_gratis: number
  ): number {
    const gasto_retiros = retiros * retiro_costo;
    const gasto_transferencias = transferencias * transf_costo;
    const consultas_excedentes = Math.max(0, consultas - consultas_gratis);
    const gasto_consultas = consultas_excedentes * 0; // Consultas no cobran después de gratis en mayoría
    return cuota + gasto_retiros + gasto_transferencias + gasto_consultas;
  }

  // Cálculos por entidad
  const gasto_bancolombia = calcularGasto(
    TARIFA_BANCOLOMBIA.cuota_manejo,
    TARIFA_BANCOLOMBIA.retiro_cajero,
    TARIFA_BANCOLOMBIA.transferencia_propia,
    TARIFA_BANCOLOMBIA.consultas_gratis
  );

  const gasto_davivienda = calcularGasto(
    TARIFA_DAVIVIENDA.cuota_manejo,
    TARIFA_DAVIVIENDA.retiro_cajero,
    TARIFA_DAVIVIENDA.transferencia_propia,
    TARIFA_DAVIVIENDA.consultas_gratis
  );

  const gasto_bbva = calcularGasto(
    TARIFA_BBVA.cuota_manejo,
    TARIFA_BBVA.retiro_cajero,
    TARIFA_BBVA.transferencia_propia,
    TARIFA_BBVA.consultas_gratis
  );

  const gasto_banco_bogota = calcularGasto(
    TARIFA_BANCO_BOGOTA.cuota_manejo,
    TARIFA_BANCO_BOGOTA.retiro_cajero,
    TARIFA_BANCO_BOGOTA.transferencia_propia,
    TARIFA_BANCO_BOGOTA.consultas_gratis
  );

  const gasto_nu = calcularGasto(
    TARIFA_DIGITAL.cuota_manejo,
    TARIFA_DIGITAL.retiro_cajero,
    TARIFA_DIGITAL.transferencia_propia,
    TARIFA_DIGITAL.consultas_gratis
  );

  const gasto_lulo = calcularGasto(
    TARIFA_DIGITAL.cuota_manejo,
    TARIFA_DIGITAL.retiro_cajero,
    TARIFA_DIGITAL.transferencia_propia,
    TARIFA_DIGITAL.consultas_gratis
  );

  const gasto_rappipay = calcularGasto(
    TARIFA_DIGITAL.cuota_manejo,
    TARIFA_DIGITAL.retiro_cajero,
    TARIFA_DIGITAL.transferencia_propia,
    TARIFA_DIGITAL.consultas_gratis
  );

  const gasto_daviplata = calcularGasto(
    TARIFA_DIGITAL.cuota_manejo,
    TARIFA_DIGITAL.retiro_cajero,
    TARIFA_DIGITAL.transferencia_propia,
    TARIFA_DIGITAL.consultas_gratis
  );

  // Encontrar mejor opción
  const gastos = {
    Bancolombia: gasto_bancolombia,
    Davivienda: gasto_davivienda,
    BBVA: gasto_bbva,
    "Banco Bogotá": gasto_banco_bogota,
    Nú: gasto_nu,
    "Lulo Bank": gasto_lulo,
    RappiPay: gasto_rappipay,
    Daviplata: gasto_daviplata
  };

  const menor = Math.min(...Object.values(gastos));
  const mayor = Math.max(...Object.values(gastos));
  const mejor_opcion_key = Object.keys(gastos).find(k => gastos[k as keyof typeof gastos] === menor) || "Nú";
  const ahorro_mejor = mayor - menor;
  const ahorro_anual = ahorro_mejor * 12;

  return {
    gasto_bancolombia: Math.round(gasto_bancolombia),
    gasto_davivienda: Math.round(gasto_davivienda),
    gasto_bbva: Math.round(gasto_bbva),
    gasto_banco_bogota: Math.round(gasto_banco_bogota),
    gasto_nu: Math.round(gasto_nu),
    gasto_lulo: Math.round(gasto_lulo),
    gasto_rappipay: Math.round(gasto_rappipay),
    gasto_daviplata: Math.round(gasto_daviplata),
    mejor_opcion: mejor_opcion_key,
    ahorro_mejor: Math.round(ahorro_mejor),
    ahorro_anual: Math.round(ahorro_anual)
  };
}
