export interface Inputs {
  rsh_tramo: string; // '40', '61', '81'
  consumo_kwh: number;
  distribuidora: string;
  numero_integrantes: number;
  tiene_adulto_mayor: string; // 'si' | 'no'
}

export interface Outputs {
  bono_mensual_estimado: number;
  tarifa_subsidiada_kwh: number;
  descuento_total_factura: number;
  porcentaje_descuento: number;
  requisitos_cumplidos: string;
  ahorro_anual: number;
  proximo_paso: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile - Bono Eléctrico SII
  const BONO_MAX_RANGO_40_80 = 11000; // CLP máximo/mes RSH 40-80%
  const BONO_MAX_RANGO_81_PLUS = 14000; // CLP máximo/mes RSH >80% (vulnerable)
  const LIMITE_CONSUMO_NORMAL = 500; // kWh/mes límite estándar
  const LIMITE_CONSUMO_VULNERABLE = 600; // kWh/mes RSH >80%
  const TARIFA_NORMAL_EMEL = 150; // CLP/kWh aprox 2026 (zona RM)
  const TARIFA_NORMAL_FRONTEL = 165; // CLP/kWh norte (Arica-Antof)
  const TARIFA_NORMAL_CONAFE = 145; // CLP/kWh zona V-Tarapacá
  const TARIFA_NORMAL_SAESA = 155; // CLP/kWh Araucanía-Los Lagos
  const TARIFA_NORMAL_HIDROAYSÉN = 170; // CLP/kWh Aysén-Magallanes
  const TASA_SUBSIDIO = 0.50; // 50% descuento tarifa base (varía ±5% por distribuidora)
  const IPC_ANUAL = 1.042; // IPC proyectado 2026 vs 2025
  const DEUDA_MAX_PERMITIDA = 20000; // CLP máx deuda sin suspensión
  const PORCENTAJE_DESCUENTO_MÁXIMO = 0.30; // 30% máx sobre consumo normal

  // Validación RSH
  const rsh_num = parseInt(i.rsh_tramo);
  let es_elegible = false;
  let bono_máximo = 0;
  let consumo_límite = LIMITE_CONSUMO_NORMAL;

  if (rsh_num >= 40 && rsh_num <= 80) {
    es_elegible = true;
    bono_máximo = BONO_MAX_RANGO_40_80;
    consumo_límite = LIMITE_CONSUMO_NORMAL;
  } else if (rsh_num > 80) {
    es_elegible = false; // RSH >80% no aplica bono estándar (requiere análisis especial)
    bono_máximo = 0;
  }

  // Obtener tarifa normal según distribuidora (base para cálculo subsidiada)
  let tarifa_normal = TARIFA_NORMAL_EMEL;
  switch (i.distribuidora) {
    case 'frontel':
      tarifa_normal = TARIFA_NORMAL_FRONTEL;
      break;
    case 'emel':
      tarifa_normal = TARIFA_NORMAL_EMEL;
      break;
    case 'conafe':
      tarifa_normal = TARIFA_NORMAL_CONAFE;
      break;
    case 'saesa':
      tarifa_normal = TARIFA_NORMAL_SAESA;
      break;
    case 'hidroaysén':
      tarifa_normal = TARIFA_NORMAL_HIDROAYSÉN;
      break;
    default:
      tarifa_normal = TARIFA_NORMAL_EMEL;
  }

  // Tarifa subsidiada = tarifa normal × (1 - subsidio)
  const tarifa_subsidiada = tarifa_normal * (1 - TASA_SUBSIDIO);

  // Cálculo bono mensual
  let bono_mensual_estimado = 0;
  let descuento_total = 0;

  if (es_elegible && i.consumo_kwh > 0) {
    // Descuento por consumo real
    descuento_total = i.consumo_kwh * tarifa_subsidiada;

    // Aplicar límite de consumo
    if (i.consumo_kwh > consumo_límite) {
      // Reduce bono si supera límite
      const factor_reducción = consumo_límite / i.consumo_kwh;
      descuento_total = descuento_total * factor_reducción;
    }

    // Aplicar tope máximo bono
    bono_mensual_estimado = Math.min(descuento_total, bono_máximo);
  }

  // Porcentaje descuento sobre tarifa normal
  const costo_sin_subsidio = i.consumo_kwh * tarifa_normal;
  const porcentaje_descuento =
    costo_sin_subsidio > 0 ? (bono_mensual_estimado / costo_sin_subsidio) * 100 : 0;

  // Ahorro anual
  const ahorro_anual = bono_mensual_estimado * 12 * IPC_ANUAL;

  // Validar requisitos cumplidos
  let requisitos_txt = "";
  const requisitos_lista = [];

  if (es_elegible) {
    requisitos_lista.push("✓ RSH en tramo 40-80% (elegible)");
  } else {
    requisitos_lista.push("✗ RSH >80% (requiere revisión especial)");
  }

  if (i.consumo_kwh <= consumo_límite) {
    requisitos_lista.push("✓ Consumo dentro de límite (" + consumo_límite + " kWh)");
  } else {
    requisitos_lista.push(
      "⚠ Consumo alto (" + i.consumo_kwh + " kWh > " + consumo_límite + " kWh): bono reducido"
    );
  }

  if (i.numero_integrantes >= 2 && i.numero_integrantes <= 8) {
    requisitos_lista.push("✓ Composición familiar válida (" + i.numero_integrantes + " personas)");
  } else if (i.numero_integrantes === 1) {
    requisitos_lista.push("⚠ Hogar unipersonal: requiere validación adicional SII");
  } else {
    requisitos_lista.push("✗ Composición familiar fuera de rango típico");
  }

  if (i.tiene_adulto_mayor === "si") {
    requisitos_lista.push("✓ Adulto mayor (prioridad alta en bono)");
  }

  requisitos_txt = requisitos_lista.join("\n");

  // Próximo paso
  let proximo_paso = "";
  if (es_elegible && bono_mensual_estimado > 0) {
    proximo_paso =
      "Dirígete a oficina de " +
      i.distribuidora +
      " con cédula RUT, comprobante domicilio <3 meses y estado de cuenta. " +
      "Tramitación: ~10 días hábiles. Una vez aprobado, descuento aparece en próxima factura.";
  } else if (!es_elegible) {
    proximo_paso =
      "Tu RSH es >80% (muy vulnerable). Consulta en MIDES si aplicas a programa especial " +
      "o complementario. Teléfono: 1800-221-0330. Requiere evaluación socioeconómica adicional.";
  } else {
    proximo_paso =
      "Verifica tu RSH en mevsfocalizacion.ministeriodesarrollosocial.gob.cl. " +
      "Si aún no apareces registrado, contacta a tu municipalidad.";
  }

  return {
    bono_mensual_estimado: Math.round(bono_mensual_estimado),
    tarifa_subsidiada_kwh: Math.round(tarifa_subsidiada * 100) / 100,
    descuento_total_factura: Math.round(bono_mensual_estimado),
    porcentaje_descuento: Math.round(porcentaje_descuento * 100) / 100,
    requisitos_cumplidos: requisitos_txt,
    ahorro_anual: Math.round(ahorro_anual),
    proximo_paso: proximo_paso
  };
}
