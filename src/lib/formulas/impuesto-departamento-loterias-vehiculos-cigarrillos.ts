export interface Inputs {
  tipo_impuesto: 'vehiculo' | 'loteria' | 'cigarrillos' | 'licores';
  departamento: string;
  valor_base: number;
  valor_avaluo?: number;
  cantidad_unidades?: number;
  year_vehiculo?: number;
}

export interface Outputs {
  impuesto_total: number;
  tasa_efectiva: number;
  desglose: string;
  comparativa_min: number;
  comparativa_max: number;
  diferencia_porcentual: number;
  plazo_pago: string;
  observaciones: string;
}

// Tarifas departamentales 2026 (fuente: DIAN, Gobernaciones)
const TARIFAS_REGISTRO: Record<string, number> = {
  bogota: 0.105,
  antioquia: 0.10,
  valle: 0.12,
  atlantico: 0.11,
  bolivar: 0.09,
  cauca: 0.09,
  cesar: 0.095,
  cordoba: 0.095,
  cundinamarca: 0.105,
  guajira: 0.085,
  huila: 0.09,
  magdalena: 0.09,
  meta: 0.10,
  narino: 0.08,
  norte_santander: 0.095,
  putumayo: 0.085,
  quindio: 0.105,
  risaralda: 0.105,
  santander: 0.10,
  sucre: 0.095,
  tolima: 0.10,
  vaupes: 0.085,
  vichada: 0.085,
  amazonas: 0.085,
  arauca: 0.09,
  caqueta: 0.09,
  casanare: 0.095,
  choco: 0.085,
  guainia: 0.085,
  guaviare: 0.085,
  san_andres: 0.10,
  boyaca: 0.10
};

const TARIFAS_RODAMIENTO: Record<string, number> = {
  bogota: 0.025,
  antioquia: 0.02,
  valle: 0.025,
  atlantico: 0.02,
  bolivar: 0.015,
  cauca: 0.015,
  cesar: 0.018,
  cordoba: 0.018,
  cundinamarca: 0.025,
  guajira: 0.015,
  huila: 0.015,
  magdalena: 0.015,
  meta: 0.02,
  narino: 0.015,
  norte_santander: 0.018,
  putumayo: 0.015,
  quindio: 0.025,
  risaralda: 0.025,
  santander: 0.02,
  sucre: 0.018,
  tolima: 0.02,
  vaupes: 0.015,
  vichada: 0.015,
  amazonas: 0.015,
  arauca: 0.015,
  caqueta: 0.015,
  casanare: 0.018,
  choco: 0.015,
  guainia: 0.015,
  guaviare: 0.015,
  san_andres: 0.02,
  boyaca: 0.02
};

const TARIFAS_LOTERIA: Record<string, number> = {
  bogota: 0.19,
  antioquia: 0.18,
  valle: 0.18,
  atlantico: 0.17,
  bolivar: 0.16,
  cauca: 0.165,
  cesar: 0.17,
  cordoba: 0.165,
  cundinamarca: 0.19,
  guajira: 0.16,
  huila: 0.165,
  magdalena: 0.165,
  meta: 0.18,
  narino: 0.165,
  norte_santander: 0.17,
  putumayo: 0.16,
  quindio: 0.19,
  risaralda: 0.19,
  santander: 0.18,
  sucre: 0.17,
  tolima: 0.18,
  vaupes: 0.16,
  vichada: 0.16,
  amazonas: 0.16,
  arauca: 0.165,
  caqueta: 0.165,
  casanare: 0.17,
  choco: 0.16,
  guainia: 0.16,
  guaviare: 0.16,
  san_andres: 0.18,
  boyaca: 0.18
};

const IMPUESTO_CIGARRILLOS: Record<string, number> = {
  bogota: 400,
  antioquia: 350,
  valle: 380,
  atlantico: 320,
  bolivar: 280,
  cauca: 300,
  cesar: 310,
  cordoba: 300,
  cundinamarca: 400,
  guajira: 250,
  huila: 290,
  magdalena: 290,
  meta: 340,
  narino: 270,
  norte_santander: 310,
  putumayo: 260,
  quindio: 400,
  risaralda: 400,
  santander: 350,
  sucre: 300,
  tolima: 340,
  vaupes: 250,
  vichada: 250,
  amazonas: 250,
  arauca: 280,
  caqueta: 290,
  casanare: 310,
  choco: 260,
  guainia: 250,
  guaviare: 260,
  san_andres: 350,
  boyaca: 350
};

const TARIFAS_LICORES: Record<string, number> = {
  bogota: 0.14,
  antioquia: 0.12,
  valle: 0.13,
  atlantico: 0.11,
  bolivar: 0.10,
  cauca: 0.10,
  cesar: 0.105,
  cordoba: 0.10,
  cundinamarca: 0.14,
  guajira: 0.095,
  huila: 0.10,
  magdalena: 0.10,
  meta: 0.115,
  narino: 0.10,
  norte_santander: 0.105,
  putumayo: 0.095,
  quindio: 0.14,
  risaralda: 0.14,
  santander: 0.12,
  sucre: 0.105,
  tolima: 0.115,
  vaupes: 0.095,
  vichada: 0.095,
  amazonas: 0.095,
  arauca: 0.10,
  caqueta: 0.10,
  casanare: 0.105,
  choco: 0.095,
  guainia: 0.095,
  guaviare: 0.095,
  san_andres: 0.12,
  boyaca: 0.12
};

export function compute(i: Inputs): Outputs {
  const avaluo = i.valor_avaluo || i.valor_base;
  const cantidad = i.cantidad_unidades || 1;
  const year = i.year_vehiculo || 2024;
  const antigueadad = 2026 - year;

  let impuesto_total = 0;
  let tasa_efectiva = 0;
  let desglose = '';
  let observaciones = '';
  let plazo_pago = '';

  if (i.tipo_impuesto === 'vehiculo') {
    const tarifa_registro = TARIFAS_REGISTRO[i.departamento] || 0.10;
    const tarifa_rodamiento = TARIFAS_RODAMIENTO[i.departamento] || 0.02;
    
    const impuesto_registro = avaluo * tarifa_registro;
    let impuesto_rodamiento = avaluo * tarifa_rodamiento;

    // Reducción rodamiento para vehículos antiguos (>10 años)
    if (antigueadad > 10) {
      impuesto_rodamiento = impuesto_rodamiento * 0.75; // 25% descuento
      observaciones = `Vehículo antigüedad ${antigueadad} años: rodamiento con 25% descuento.`;
    }

    impuesto_total = impuesto_registro + impuesto_rodamiento;
    tasa_efectiva = (impuesto_total / avaluo) * 100;
    desglose = `Impuesto registro (${(tarifa_registro * 100).toFixed(1)}%): $${impuesto_registro.toLocaleString('es-CO', { maximumFractionDigits: 0 })}\nImpuesto rodamiento año 1 (${(tarifa_rodamiento * 100).toFixed(1)}%): $${impuesto_rodamiento.toLocaleString('es-CO', { maximumFractionDigits: 0 })}\nTotal año 1: $${impuesto_total.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
    plazo_pago = 'Registro: único al momento de compra/transferencia. Rodamiento: anual en mes de matrícula. Vencimiento: último día hábil del mes. Mora: 1.5% mensual.';
  } else if (i.tipo_impuesto === 'loteria') {
    const tarifa = TARIFAS_LOTERIA[i.departamento] || 0.18;
    impuesto_total = i.valor_base * tarifa;
    tasa_efectiva = tarifa * 100;
    desglose = `Impuesto loterías (${(tarifa * 100).toFixed(1)}%): $${impuesto_total.toLocaleString('es-CO', { maximumFractionDigits: 0 })}\nAplica sobre valor apuesta/premio.`;
    plazo_pago = 'Recaudación del operador de lotería. Vencimiento: mensual según resolución departamental.';
    observaciones = 'Impuesto indirecto pagado por operador, no por ganador. Afecta valor neto del premio.';
  } else if (i.tipo_impuesto === 'cigarrillos') {
    const impuesto_unitario = IMPUESTO_CIGARRILLOS[i.departamento] || 300;
    impuesto_total = impuesto_unitario * cantidad;
    tasa_efectiva = ((impuesto_total / i.valor_base) * 100) || 0;
    desglose = `Impuesto por unidad: $${impuesto_unitario.toLocaleString('es-CO')}\nCantidad: ${cantidad} cajetillas\nTotal impuesto departamental: $${impuesto_total.toLocaleString('es-CO', { maximumFractionDigits: 0 })}\nMás: IVA 19% (nacional) + impuestos municipales.`;
    plazo_pago = 'Recaudación al adquirir stock. Vencimiento: mensual/bimestral según departamento.';
    observaciones = 'Se suma a IVA nacional (19%) y gravamen municipal. Precio final cajetilla $1k-$1.2k en 2026.';
  } else if (i.tipo_impuesto === 'licores') {
    const tarifa = TARIFAS_LICORES[i.departamento] || 0.11;
    impuesto_total = i.valor_base * tarifa;
    tasa_efectiva = tarifa * 100;
    desglose = `Impuesto adicional licores (${(tarifa * 100).toFixed(1)}%): $${impuesto_total.toLocaleString('es-CO', { maximumFractionDigits: 0 })}\nAplica sobre valor venta distribuidor/comerciante.`;
    plazo_pago = 'Recaudación mensual al adquirir stock. Vencimiento: últimos 5 días de cada mes.';
    observaciones = 'Incluye cerveza, aguardiente, vino, licores destilados. Se suma a IVA 19% (nacional).';
  }

  // Comparativa mín-máx departamentos
  let tarifas_comparar: Record<string, number> = {};
  if (i.tipo_impuesto === 'vehiculo') {
    Object.keys(TARIFAS_REGISTRO).forEach(dpto => {
      tarifas_comparar[dpto] = (TARIFAS_REGISTRO[dpto] + TARIFAS_RODAMIENTO[dpto]) * avaluo;
    });
  } else if (i.tipo_impuesto === 'loteria') {
    Object.keys(TARIFAS_LOTERIA).forEach(dpto => {
      tarifas_comparar[dpto] = TARIFAS_LOTERIA[dpto] * i.valor_base;
    });
  } else if (i.tipo_impuesto === 'cigarrillos') {
    Object.keys(IMPUESTO_CIGARRILLOS).forEach(dpto => {
      tarifas_comparar[dpto] = IMPUESTO_CIGARRILLOS[dpto] * cantidad;
    });
  } else if (i.tipo_impuesto === 'licores') {
    Object.keys(TARIFAS_LICORES).forEach(dpto => {
      tarifas_comparar[dpto] = TARIFAS_LICORES[dpto] * i.valor_base;
    });
  }

  const valores_comparar = Object.values(tarifas_comparar);
  const comparativa_min = Math.min(...valores_comparar);
  const comparativa_max = Math.max(...valores_comparar);
  const diferencia_porcentual = comparativa_min > 0 ? ((comparativa_max - comparativa_min) / comparativa_min) * 100 : 0;

  return {
    impuesto_total: Math.round(impuesto_total),
    tasa_efectiva: parseFloat(tasa_efectiva.toFixed(2)),
    desglose,
    comparativa_min: Math.round(comparativa_min),
    comparativa_max: Math.round(comparativa_max),
    diferencia_porcentual: parseFloat(diferencia_porcentual.toFixed(1)),
    plazo_pago,
    observaciones
  };
}
