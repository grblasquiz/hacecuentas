export interface Inputs {
  precio_venta: number;
  monto_hipoteca: number;
  tipo_banco: 'privado' | 'estatal' | 'cooperativa';
}

export interface Outputs {
  arancel_notaria: number;
  arancel_conservador: number;
  impuesto_timbre: number;
  comisiones_banco: number;
  otros_gastos: number;
  total_gastos: number;
  porcentaje_precio: number;
  costo_efectivo: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile - SII/Superintendencia Notariado
  // Arancel notaría según SII 2026
  let arancel_notaria = 0;
  if (i.precio_venta <= 5_000_000) {
    arancel_notaria = 200_000;
  } else if (i.precio_venta <= 25_000_000) {
    arancel_notaria = 300_000;
  } else if (i.precio_venta <= 100_000_000) {
    arancel_notaria = 350_000 + (i.precio_venta - 25_000_000) * 0.001; // $1 por $1000 adicional
  } else {
    arancel_notaria = 425_000 + (i.precio_venta - 100_000_000) * 0.0005; // $0.50 por $1000 adicional
  }

  // Arancel Conservador Bienes Raíces - tramos SII 2026
  let arancel_conservador = 0;
  if (i.precio_venta <= 5_000_000) {
    arancel_conservador = 75_000;
  } else if (i.precio_venta <= 25_000_000) {
    arancel_conservador = 100_000 + (i.precio_venta - 5_000_000) * 0.004;
  } else if (i.precio_venta <= 100_000_000) {
    arancel_conservador = 180_000 + (i.precio_venta - 25_000_000) * 0.003;
  } else {
    arancel_conservador = 405_000 + (i.precio_venta - 100_000_000) * 0.0015;
  }

  // Impuesto timbre DFL 215 - 0.8% sobre hipoteca
  const impuesto_timbre = i.monto_hipoteca * 0.008;

  // Comisiones bancarias según tipo institución
  let tasa_comision = 0.003; // 0.3% default
  if (i.tipo_banco === 'estatal') {
    tasa_comision = 0.0025; // 0.25% bancos estatales (BCI, Santander estatal)
  } else if (i.tipo_banco === 'privado') {
    tasa_comision = 0.004; // 0.4% bancos privados
  } else if (i.tipo_banco === 'cooperativa') {
    tasa_comision = 0.005; // 0.5% cooperativas
  }
  const comisiones_banco = i.monto_hipoteca * tasa_comision;

  // Otros gastos: tasación ($400K-$600K) + seguros iniciales ($200K-$300K)
  // Estimado según precio venta
  let otros_gastos = 0;
  if (i.precio_venta <= 25_000_000) {
    otros_gastos = 500_000;
  } else if (i.precio_venta <= 100_000_000) {
    otros_gastos = 650_000;
  } else {
    otros_gastos = 850_000;
  }

  // Total gastos
  const total_gastos = arancel_notaria + arancel_conservador + impuesto_timbre + comisiones_banco + otros_gastos;

  // Porcentaje sobre precio venta
  const porcentaje_precio = (total_gastos / i.precio_venta) * 100;

  // Costo efectivo total
  const costo_efectivo = i.precio_venta + total_gastos;

  return {
    arancel_notaria: Math.round(arancel_notaria),
    arancel_conservador: Math.round(arancel_conservador),
    impuesto_timbre: Math.round(impuesto_timbre),
    comisiones_banco: Math.round(comisiones_banco),
    otros_gastos: Math.round(otros_gastos),
    total_gastos: Math.round(total_gastos),
    porcentaje_precio: Math.round(porcentaje_precio * 100) / 100,
    costo_efectivo: Math.round(costo_efectivo)
  };
}
