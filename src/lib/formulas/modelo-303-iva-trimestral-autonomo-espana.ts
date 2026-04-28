export interface Inputs {
  trimestre: string; // '1' | '2' | '3' | '4'
  base_imponible_21: number;
  base_imponible_10: number;
  base_imponible_4: number;
  iva_soportado_deducible: number;
  cuotas_compensar_trimestres_anteriores: number;
  solicita_devolucion: string; // 'si' | 'no'
}

export interface Outputs {
  cuota_repercutida_21: number;       // casilla 02
  cuota_repercutida_10: number;       // casilla 04
  cuota_repercutida_4: number;        // casilla 06
  total_iva_repercutido: number;      // casilla 27
  total_iva_soportado: number;        // casilla 45
  diferencia_iva: number;             // casilla 46
  resultado_liquidacion: number;      // casilla 69
  resultado_final: number;            // casilla 71
  tipo_resultado: string;
  fecha_limite: string;
  aviso: string;
}

export function compute(i: Inputs): Outputs {
  // Tipos de IVA vigentes 2026 — Art. 90-91 Ley 37/1992
  const TIPO_GENERAL = 0.21;
  const TIPO_REDUCIDO = 0.10;
  const TIPO_SUPERREDUCIDO = 0.04;

  // Plazos de presentación Modelo 303 — AEAT 2026
  const PLAZOS: Record<string, string> = {
    '1': '20 de abril de 2026 (1.er trimestre: enero–marzo)',
    '2': '20 de julio de 2026 (2.º trimestre: abril–junio)',
    '3': '20 de octubre de 2026 (3.er trimestre: julio–septiembre)',
    '4': '30 de enero de 2027 (4.º trimestre: octubre–diciembre)'
  };

  // Sanitizar entradas — valores mínimos 0
  const base21 = Math.max(0, i.base_imponible_21 || 0);
  const base10 = Math.max(0, i.base_imponible_10 || 0);
  const base4 = Math.max(0, i.base_imponible_4 || 0);
  const ivaSoportado = Math.max(0, i.iva_soportado_deducible || 0);
  const compensarPrevio = Math.max(0, i.cuotas_compensar_trimestres_anteriores || 0);
  const trimestre = i.trimestre || '1';
  const solicitaDevolucion = i.solicita_devolucion === 'si';

  // --- Casillas IVA repercutido ---
  // Casilla 02: cuota IVA repercutido tipo general 21%
  const cuota_repercutida_21 = redondear2(base21 * TIPO_GENERAL);

  // Casilla 04: cuota IVA repercutido tipo reducido 10%
  const cuota_repercutida_10 = redondear2(base10 * TIPO_REDUCIDO);

  // Casilla 06: cuota IVA repercutido tipo superreducido 4%
  const cuota_repercutida_4 = redondear2(base4 * TIPO_SUPERREDUCIDO);

  // Casilla 27: total cuotas IVA repercutido
  const total_iva_repercutido = redondear2(
    cuota_repercutida_21 + cuota_repercutida_10 + cuota_repercutida_4
  );

  // Casilla 45: total IVA soportado deducible (introducido directamente por el usuario)
  const total_iva_soportado = redondear2(ivaSoportado);

  // Casilla 46: diferencia entre IVA repercutido y soportado
  const diferencia_iva = redondear2(total_iva_repercutido - total_iva_soportado);

  // Casilla 69: resultado de la liquidación (diferencia menos cuotas a compensar de trimestres anteriores)
  const resultado_liquidacion = redondear2(diferencia_iva - compensarPrevio);

  // Casilla 71: resultado final
  // En T1, T2, T3: si es negativo → a compensar (no se puede pedir devolución)
  // En T4: si es negativo y se solicita devolución → a devolver (casilla 111)
  let resultado_final = resultado_liquidacion;

  // --- Determinación del tipo de resultado y avisos ---
  let tipo_resultado = '';
  let aviso = '';
  const fecha_limite = PLAZOS[trimestre] || PLAZOS['1'];

  if (resultado_final > 0) {
    tipo_resultado = '⬆️ A INGRESAR — debes pagar este importe a Hacienda';
    aviso = `Ingresa ${formatEur(resultado_final)} mediante domiciliación bancaria o pago en la Sede Electrónica de la AEAT antes del ${fecha_limite}.`;
  } else if (resultado_final === 0) {
    tipo_resultado = '🟰 SIN ACTIVIDAD / RESULTADO CERO';
    aviso = 'El resultado es cero. Debes presentar igualmente el Modelo 303 con resultado cero.';
  } else {
    // Resultado negativo
    if (trimestre === '4' && solicitaDevolucion) {
      tipo_resultado = '⬇️ A DEVOLVER — puedes solicitar devolución (casilla 111)';
      aviso = `Hacienda te devolverá ${formatEur(Math.abs(resultado_final))}. El plazo legal de resolución es de 6 meses desde el fin del período de presentación voluntaria.`;
    } else if (trimestre === '4' && !solicitaDevolucion) {
      tipo_resultado = '⏩ A COMPENSAR en el ejercicio siguiente';
      aviso = `El saldo negativo de ${formatEur(Math.abs(resultado_final))} se trasladará como cuota a compensar (casilla 67) en el 1.er trimestre del siguiente ejercicio.`;
    } else {
      tipo_resultado = '⏩ A COMPENSAR en el trimestre siguiente';
      aviso = `El saldo negativo de ${formatEur(Math.abs(resultado_final))} se trasladará a la casilla 67 del próximo Modelo 303. En T1, T2 y T3 no es posible solicitar devolución.`;
    }
  }

  return {
    cuota_repercutida_21,
    cuota_repercutida_10,
    cuota_repercutida_4,
    total_iva_repercutido,
    total_iva_soportado,
    diferencia_iva,
    resultado_liquidacion,
    resultado_final,
    tipo_resultado,
    fecha_limite,
    aviso
  };
}

// Redondea a 2 decimales (centavos de euro)
function redondear2(n: number): number {
  return Math.round(n * 100) / 100;
}

// Formatea número como euros (ej: 1.470,00€)
function formatEur(n: number): string {
  return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '€';
}
