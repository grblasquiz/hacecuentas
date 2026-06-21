export interface Inputs {
  saldo_cesantias: number;
  fondo_origen: 'porvenir' | 'proteccion' | 'colfondos' | 'oldmutual';
  fondo_destino: 'porvenir' | 'proteccion' | 'colfondos' | 'oldmutual';
  años_proyeccion: number;
}

export interface Outputs {
  rentabilidad_origen: number;
  rentabilidad_destino: number;
  diferencia_rentabilidad: number;
  comision_origen: number;
  comision_destino: number;
  rentabilidad_neta_origen: number;
  rentabilidad_neta_destino: number;
  valor_futuro_origen: number;
  valor_futuro_destino: number;
  diferencia_valor_futuro: number;
  costo_traslado: number;
  valor_neto_traslado: number;
  dias_traslado: number;
  recomendacion: string;
  _insight?: any;
}

// Rentabilidad nominal portafolio corto plazo, fondos de cesantías
// Fuente: Superfinanciera Colombia, corte 31-mar-2026 (Carta Circular 31/2026)
const fondosData: Record<string, { rentabilidad: number; comision: number }> = {
  porvenir: { rentabilidad: 9.84, comision: 0.48 },     // Superfinanciera 31-mar-2026
  proteccion: { rentabilidad: 10.55, comision: 0.50 },  // Superfinanciera 31-mar-2026
  colfondos: { rentabilidad: 8.40, comision: 0.45 },    // Superfinanciera 31-mar-2026
  oldmutual: { rentabilidad: 8.64, comision: 0.52 }     // Skandia (ex Old Mutual), Superfinanciera 31-mar-2026
};

export function compute(i: Inputs): Outputs {
  // Validar inputs
  if (i.saldo_cesantias <= 0) {
    return {
      rentabilidad_origen: 0,
      rentabilidad_destino: 0,
      diferencia_rentabilidad: 0,
      comision_origen: 0,
      comision_destino: 0,
      rentabilidad_neta_origen: 0,
      rentabilidad_neta_destino: 0,
      valor_futuro_origen: 0,
      valor_futuro_destino: 0,
      diferencia_valor_futuro: 0,
      costo_traslado: 0,
      valor_neto_traslado: 0,
      dias_traslado: 0,
      recomendacion: "Error: ingresa saldo mayor a $0"
    };
  }

  if (i.años_proyeccion < 1 || i.años_proyeccion > 10) {
    return {
      rentabilidad_origen: 0,
      rentabilidad_destino: 0,
      diferencia_rentabilidad: 0,
      comision_origen: 0,
      comision_destino: 0,
      rentabilidad_neta_origen: 0,
      rentabilidad_neta_destino: 0,
      valor_futuro_origen: 0,
      valor_futuro_destino: 0,
      diferencia_valor_futuro: 0,
      costo_traslado: 0,
      valor_neto_traslado: 0,
      dias_traslado: 0,
      recomendacion: "Error: años debe estar entre 1 y 10"
    };
  }

  const datosOrigen = fondosData[i.fondo_origen];
  const datosDestino = fondosData[i.fondo_destino];

  if (!datosOrigen || !datosDestino) {
    return {
      rentabilidad_origen: 0,
      rentabilidad_destino: 0,
      diferencia_rentabilidad: 0,
      comision_origen: 0,
      comision_destino: 0,
      rentabilidad_neta_origen: 0,
      rentabilidad_neta_destino: 0,
      valor_futuro_origen: 0,
      valor_futuro_destino: 0,
      diferencia_valor_futuro: 0,
      costo_traslado: 0,
      valor_neto_traslado: 0,
      dias_traslado: 0,
      recomendacion: "Error: fondo no válido"
    };
  }

  // Obtener datos históricos
  const rentabilidad_origen = datosOrigen.rentabilidad;
  const rentabilidad_destino = datosDestino.rentabilidad;
  const comision_origen = datosOrigen.comision;
  const comision_destino = datosDestino.comision;

  // Calcular rentabilidades netas (rendimiento - comisión)
  const rentabilidad_neta_origen = rentabilidad_origen - comision_origen;
  const rentabilidad_neta_destino = rentabilidad_destino - comision_destino;

  // Diferencia de rentabilidad anual
  const diferencia_rentabilidad = rentabilidad_neta_destino - rentabilidad_neta_origen;

  // Tasas en formato decimal para cálculo
  const tasa_neta_origen = rentabilidad_neta_origen / 100;
  const tasa_neta_destino = rentabilidad_neta_destino / 100;

  // Valor futuro fondo origen: Saldo × (1 + tasa)^años
  const valor_futuro_origen = i.saldo_cesantias * Math.pow(1 + tasa_neta_origen, i.años_proyeccion);

  // Valor futuro fondo destino: Saldo × (1 + tasa)^años
  const valor_futuro_destino = i.saldo_cesantias * Math.pow(1 + tasa_neta_destino, i.años_proyeccion);

  // Diferencia valor futuro (destino - origen)
  const diferencia_valor_futuro = valor_futuro_destino - valor_futuro_origen;

  // Costo traslado estimado: 0,15% por días transito en transito (12 días promedio)
  // Cálculo: saldo × 0,15% = pérdida de rentabilidad en transito
  const costo_traslado = i.saldo_cesantias * 0.0015;  // 0.15% según Superfinanciera

  // Valor neto después traslado (saldo menos costo transito)
  const valor_neto_traslado = i.saldo_cesantias - costo_traslado;

  // Días hábiles estimados traslado según resolución Superfinanciera
  const dias_traslado = 12;  // Promedio 8-15 días hábiles

  // Generar recomendación
  let recomendacion = "";

  if (i.fondo_origen === i.fondo_destino) {
    recomendacion = "Selecciona fondos origen y destino diferentes para comparar.";
  } else if (diferencia_valor_futuro > 0) {
    const ahorro_anual = (diferencia_valor_futuro / i.años_proyeccion);
    recomendacion = `Trasladar a ${i.fondo_destino.charAt(0).toUpperCase() + i.fondo_destino.slice(1)} es recomendable. Estimarías ganancia de $${Math.round(diferencia_valor_futuro).toLocaleString('es-CO')} en ${i.años_proyeccion} años (~$${Math.round(ahorro_anual).toLocaleString('es-CO')}/año). Requisitos: sin deuda con administrador, un traslado cada 2 años.`;
  } else if (diferencia_valor_futuro < 0) {
    const perdida_anual = Math.abs(diferencia_valor_futuro / i.años_proyeccion);
    recomendacion = `Permanecer en ${i.fondo_origen.charAt(0).toUpperCase() + i.fondo_origen.slice(1)} es más ventajoso. Trasladar costaría ~$${Math.round(Math.abs(diferencia_valor_futuro)).toLocaleString('es-CO')} en ${i.años_proyeccion} años (~$${Math.round(perdida_anual).toLocaleString('es-CO')}/año menos).`;
  } else {
    recomendacion = "Ambos fondos tienen rentabilidad similar. La decisión depende de otros factores: servicio al cliente, acceso digital, comisiones específicas.";
  }

  const fmtCo = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  let _insight: any;
  if (i.fondo_origen === i.fondo_destino) {
    _insight = {
      title: 'Compará dos fondos distintos',
      text: `Elegiste **${cap(i.fondo_origen)}** como origen y destino. Seleccioná un fondo destino diferente para ver la diferencia de rentabilidad neta y el valor futuro proyectado.`,
      tone: 'neutral',
      icon: '🔁',
    };
  } else if (diferencia_valor_futuro > 0) {
    _insight = {
      title: 'Trasladarte conviene',
      text: `**${cap(i.fondo_destino)}** rinde **${diferencia_rentabilidad.toFixed(2).replace('.', ',')}%** neto más por año que **${cap(i.fondo_origen)}**. En ${i.años_proyeccion} años eso son **${fmtCo(diferencia_valor_futuro)}** extra. Ojo: el traslado cuesta ~**${fmtCo(costo_traslado)}** y tarda **${dias_traslado} días** hábiles; solo podés trasladarte una vez cada 2 años.`,
      tone: 'good',
      icon: '📈',
    };
  } else if (diferencia_valor_futuro < 0) {
    _insight = {
      title: 'Mejor quedarte donde estás',
      text: `**${cap(i.fondo_origen)}** rinde más neto que **${cap(i.fondo_destino)}**: trasladarte te costaría **${fmtCo(Math.abs(diferencia_valor_futuro))}** menos en ${i.años_proyeccion} años, más ~**${fmtCo(costo_traslado)}** del traslado. No conviene mover el saldo.`,
      tone: 'warn',
      icon: '⚠️',
    };
  } else {
    _insight = {
      title: 'Rentabilidad pareja',
      text: `Ambos fondos rinden prácticamente igual en neto. La decisión pasa por otros factores: servicio, app, atención. No esperes diferencia de plata trasladándote.`,
      tone: 'neutral',
      icon: '⚖️',
    };
  }

  return {
    rentabilidad_origen: Math.round(rentabilidad_origen * 100) / 100,
    rentabilidad_destino: Math.round(rentabilidad_destino * 100) / 100,
    diferencia_rentabilidad: Math.round(diferencia_rentabilidad * 100) / 100,
    comision_origen: Math.round(comision_origen * 100) / 100,
    comision_destino: Math.round(comision_destino * 100) / 100,
    rentabilidad_neta_origen: Math.round(rentabilidad_neta_origen * 100) / 100,
    rentabilidad_neta_destino: Math.round(rentabilidad_neta_destino * 100) / 100,
    valor_futuro_origen: Math.round(valor_futuro_origen),
    valor_futuro_destino: Math.round(valor_futuro_destino),
    diferencia_valor_futuro: Math.round(diferencia_valor_futuro),
    costo_traslado: Math.round(costo_traslado),
    valor_neto_traslado: Math.round(valor_neto_traslado),
    dias_traslado: dias_traslado,
    recomendacion: recomendacion,
    _insight
  };
}
