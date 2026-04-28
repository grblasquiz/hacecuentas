export interface Inputs {
  nivel_estudios: 'maestria_nacional' | 'maestria_extranjero' | 'doctorado_nacional' | 'doctorado_extranjero' | 'especialidad_medica';
  duracion_meses: number;
  pais_destino: 'mexico' | 'usa_canada' | 'europa_oecd' | 'latinoamerica' | 'otros';
  categoria_pnpc: 'consolidado' | 'competencia' | 'desarrollo' | 'no_evaluado';
}

export interface Outputs {
  monto_mensual_pesos: number;
  monto_anual_pesos: number;
  monto_total_beca: number;
  categoria_apoyo: string;
  requisitos_clave: string;
  variacion_nota: string;
}

export function compute(i: Inputs): Outputs {
  // Montos base 2026 Conahcyt por nivel de estudios (nacional)
  // Fuente: Conahcyt convocatorias 2026
  const montosBase: Record<string, number> = {
    'maestria_nacional': 15000,
    'maestria_extranjero': 15000,
    'doctorado_nacional': 22000,
    'doctorado_extranjero': 22000,
    'especialidad_medica': 18000,
  };

  // Factores de ajuste por país de destino
  // Incrementos típicos sobre monto base
  const ajustePais: Record<string, number> = {
    'mexico': 1.0,
    'usa_canada': 1.25,      // +25% promedio
    'europa_oecd': 1.20,     // +20% promedio
    'latinoamerica': 1.10,   // +10% promedio
    'otros': 1.15,           // +15% promedio
  };

  // Factores PNPC: multiplicador sobre monto ajustado
  // Fuente: Catálogo PNPC Conahcyt
  const factorPNPC: Record<string, number> = {
    'consolidado': 1.0,      // 100% del máximo
    'competencia': 0.93,     // 93% del máximo
    'desarrollo': 0.85,      // 85% del máximo
    'no_evaluado': 0.70,     // 70% (requiere inclusión)
  };

  // Obtener monto base según nivel
  const montoBase = montosBase[i.nivel_estudios] || 15000;

  // Aplicar ajuste por país
  const multiplicadorPais = ajustePais[i.pais_destino] || 1.0;
  const montoAjustado = montoBase * multiplicadorPais;

  // Aplicar factor PNPC
  const factorPN = factorPNPC[i.categoria_pnpc] || 0.70;
  const montoMensual = Math.round(montoAjustado * factorPN);

  // Cálculos derivados
  const montoAnual = montoMensual * 12;
  const montoTotal = montoMensual * Math.max(1, i.duracion_meses || 24);

  // Determinar categoría de apoyo
  let categoriaApoyo = 'Maestría nacional';
  if (i.nivel_estudios === 'doctorado_nacional' || i.nivel_estudios === 'doctorado_extranjero') {
    categoriaApoyo = 'Doctorado';
  } else if (i.nivel_estudios === 'especialidad_medica') {
    categoriaApoyo = 'Especialidad médica';
  } else if (i.nivel_estudios === 'maestria_extranjero') {
    categoriaApoyo = 'Maestría en extranjero';
  }

  if (i.pais_destino !== 'mexico') {
    categoriaApoyo += ' (extranjero)';
  }

  // Requisitos clave según categoría PNPC
  let requisitosClave = 'CVU activo, inscripción en programa reconocido';
  if (i.categoria_pnpc === 'no_evaluado') {
    requisitosClave += ', solicitud de inclusión a PNPC obligatoria';
  }

  // Nota sobre variación
  let variacionNota = 'Monto sujeto a cambios en convocatoria anual.';
  if (i.pais_destino === 'usa_canada' || i.pais_destino === 'europa_oecd') {
    variacionNota += ' Extranjero puede incluir apoyo adicional por costo de vida.';
  }
  if (i.duracion_meses > 48) {
    variacionNota += ' Duración > 4 años requiere evaluación especial Conahcyt.';
  }

  return {
    monto_mensual_pesos: montoMensual,
    monto_anual_pesos: montoAnual,
    monto_total_beca: montoTotal,
    categoria_apoyo: categoriaApoyo,
    requisitos_clave: requisitosClave,
    variacion_nota: variacionNota,
  };
}
