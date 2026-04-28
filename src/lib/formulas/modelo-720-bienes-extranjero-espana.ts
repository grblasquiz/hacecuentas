export interface Inputs {
  cuentas_bancarias_valor: number;
  valores_mobiliarios_valor: number;
  inmuebles_valor: number;
  seguros_vida_valor: number;
  prestamos_concedidos_valor: number;
  derechos_usufructo_valor: number;
  otras_cuentas_valor: number;
  tiene_declaracion_previa: boolean;
  meses_sin_declarar: number;
}

export interface Outputs {
  obligacion_modelo_720: string;
  valor_total_bienes: number;
  categorias_obligatorias: string[];
  casillas_modelo_720: string;
  sancion_minima: number;
  sancion_estimada: number;
  intereses_mora: number;
  total_accesorios: number;
  plazo_presentacion: string;
  excepciones_aplicables: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes normativa 2026 España - AEAT/TJUE
  const UMBRAL_CATEGORIA = 50_000; // € - Ley 19/1991
  const SANCION_MINIMA = 1_500; // € - TJUE C-595/20 (nov 2022)
  const SANCION_MAXIMA_OMISION = 3_000; // € - Omisión total reincidencia
  const TASA_INTERES_MORA = 0.015; // 1.5% anual - Ley 58/2003 Código Tributario
  const MESES_ANNO = 12;

  // Asegurar valores válidos
  const cuentas = Math.max(0, i.cuentas_bancarias_valor || 0);
  const valores = Math.max(0, i.valores_mobiliarios_valor || 0);
  const inmuebles = Math.max(0, i.inmuebles_valor || 0);
  const seguros = Math.max(0, i.seguros_vida_valor || 0);
  const prestamos = Math.max(0, i.prestamos_concedidos_valor || 0);
  const derechos = Math.max(0, i.derechos_usufructo_valor || 0);
  const otras = Math.max(0, i.otras_cuentas_valor || 0);

  // Cálculo de valor total
  const valorTotal = cuentas + valores + inmuebles + seguros + prestamos + derechos + otras;

  // Determinación de obligación por categoría
  const categorias: { nombre: string; valor: number; obligatorio: boolean }[] = [
    { nombre: 'Cuentas bancarias en extranjero', valor: cuentas, obligatorio: cuentas > UMBRAL_CATEGORIA },
    { nombre: 'Valores mobiliarios', valor: valores, obligatorio: valores > UMBRAL_CATEGORIA },
    { nombre: 'Inmuebles en el extranjero', valor: inmuebles, obligatorio: inmuebles > UMBRAL_CATEGORIA },
    { nombre: 'Pólizas de seguros de vida', valor: seguros, obligatorio: seguros > UMBRAL_CATEGORIA },
    { nombre: 'Préstamos concedidos en el extranjero', valor: prestamos, obligatorio: prestamos > UMBRAL_CATEGORIA },
    { nombre: 'Derechos de usufructo/uso/habitación', valor: derechos, obligatorio: derechos > UMBRAL_CATEGORIA },
    { nombre: 'Otras cuentas (criptomonedas, digitales)', valor: otras, obligatorio: otras > UMBRAL_CATEGORIA }
  ];

  const categoriasObligatorias = categorias
    .filter(c => c.obligatorio)
    .map(c => `${c.nombre} (${c.valor.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })})`);

  const esObligatorio = categoriasObligatorias.length > 0;

  // Determinación de obligación y texto
  const textoObligacion = esObligatorio
    ? 'SÍ. Estás obligado a presentar el Modelo 720 (máx. 31 de marzo)'
    : 'NO. Ninguna categoría supera 50.000€. No obligatorio presentar.'

  // Cálculo de casillas del Modelo 720
  let casillasTexto = 'N/A';
  if (esObligatorio) {
    const casillas: string[] = [];
    if (cuentas > UMBRAL_CATEGORIA) casillas.push('Bloque 3, casillas 12-20 (cuentas bancarias)');
    if (valores > UMBRAL_CATEGORIA) casillas.push('Bloque 4, casillas 21-30 (valores mobiliarios)');
    if (inmuebles > UMBRAL_CATEGORIA) casillas.push('Bloque 5, casillas 31-40 (inmuebles)');
    if (seguros > UMBRAL_CATEGORIA) casillas.push('Bloque 6, casillas 41-50 (seguros de vida)');
    if (prestamos > UMBRAL_CATEGORIA) casillas.push('Bloque 7, casillas 51-60 (préstamos)');
    if (derechos > UMBRAL_CATEGORIA) casillas.push('Bloque 8, casillas 61-70 (otros derechos)');
    if (otras > UMBRAL_CATEGORIA) casillas.push('Bloque 8, casillas 61-70 (otras cuentas)');
    casillasTexto = casillas.join('; ') + '. Más: Bloque 1 (identificación fiscal) y Bloque 2 (datos personales)';
  }

  // Cálculo de sanciones (escenario omisión total, sin presentación voluntaria)
  let sancionEstimada = 0;
  let mesesIncumplimiento = Math.max(3, Math.min(120, i.meses_sin_declarar || 12));

  if (esObligatorio) {
    // Aplicar sanción mínima (TJUE C-595/20)
    sancionEstimada = SANCION_MINIMA;

    // Si hay reincidencia (declaración previa omitida), aumentar a máxima
    if (i.tiene_declaracion_previa) {
      sancionEstimada = SANCION_MAXIMA_OMISION;
    }

    // Ajuste por período: sanción puede escalar hasta 3.000€ según meses sin declarar
    if (mesesIncumplimiento > 12) {
      // Máximo a 3 años (36 meses de inactividad declarativa)
      const factor = Math.min(36, mesesIncumplimiento) / 12;
      sancionEstimada = Math.min(SANCION_MAXIMA_OMISION, SANCION_MINIMA + (SANCION_MAXIMA_OMISION - SANCION_MINIMA) * (factor - 1));
    }
  }

  // Intereses de mora (1.5% anual sobre valor de bienes declarables)
  // Solo si la omisión ha durado meses sin declarar
  const interesesMora = esObligatorio
    ? (valorTotal * TASA_INTERES_MORA * mesesIncumplimiento) / MESES_ANNO
    : 0;

  // Total accesorios (sanción + intereses)
  const totalAccesorios = sancionEstimada + Math.round(interesesMora);

  // Plazo de presentación
  const plazo = esObligatorio
    ? 'Del 1 de enero al 31 de marzo del año siguiente (prórroga máximo 10 días solicitada antes del vencimiento)'
    : 'No aplicable (sin obligación)';

  // Excepciones y observaciones
  let excepciones = '';
  if (esObligatorio) {
    const listExcepciones: string[] = [];
    listExcepciones.push('Rectificación voluntaria: si presentas Modelo 720-R antes de notificación AEAT, sanción se reduce 50%');
    if (i.tiene_declaracion_previa) {
      listExcepciones.push('Advertencia: tienes declaración previa. Reincidencia → sanción máxima 3.000€');
    }
    listExcepciones.push('Herencia: plazo de 3 meses desde aceptación para rectificar');
    listExcepciones.push('No residente fiscal: exención si pierdes residencia española');
    excepciones = listExcepciones.join('. ');
  } else {
    excepciones = 'Obligación no aplicable. Monitorea el valor de bienes: si superan 50.000€ en alguna categoría, deberás presentar Modelo 720.';
  }

  return {
    obligacion_modelo_720: textoObligacion,
    valor_total_bienes: valorTotal,
    categorias_obligatorias: categoriasObligatorias.length > 0 ? categoriasObligatorias : ['Ninguna categoría supera el umbral'],
    casillas_modelo_720: casillasTexto,
    sancion_minima: esObligatorio ? SANCION_MINIMA : 0,
    sancion_estimada: Math.round(sancionEstimada),
    intereses_mora: Math.round(interesesMora),
    total_accesorios: Math.round(totalAccesorios),
    plazo_presentacion: plazo,
    excepciones_aplicables: excepciones
  };
}
