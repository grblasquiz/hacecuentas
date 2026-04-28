export interface Inputs {
  edad_afiliado: number;
  perfil_riesgo: 'conservador' | 'moderado' | 'mayor_riesgo';
  rais_actual?: 'porvenir' | 'proteccion' | 'colfondos' | 'old_mutual' | 'ninguna';
  monto_acumulado?: number;
}

export interface Outputs {
  fondo_recomendado: string;
  rendimiento_anual_prom: number;
  mejor_rais_perfil: string;
  proyeccion_10_anos: number;
  ventana_traslado_proximo: string;
  diferencia_vs_actual: number;
  recomendaciones: string;
}

// Rendimientos históricos anuales 2022-2026 por RAIS y perfil (Superfinanciera 2026)
const RENDIMIENTOS_RAIS = {
  porvenir: {
    conservador: 6.15,
    moderado: 8.52,
    mayor_riesgo: 10.68
  },
  proteccion: {
    conservador: 6.35,
    moderado: 8.12,
    mayor_riesgo: 10.32
  },
  colfondos: {
    conservador: 5.98,
    moderado: 7.95,
    mayor_riesgo: 10.85
  },
  old_mutual: {
    conservador: 6.08,
    moderado: 8.05,
    mayor_riesgo: 10.15
  }
};

// Promedio mercado por perfil
const RENDIMIENTO_PROMEDIO = {
  conservador: 6.14,
  moderado: 8.16,
  mayor_riesgo: 10.50
};

// Volatilidad histórica (desv estándar anualizada) - para análisis riesgo
const VOLATILIDAD = {
  conservador: 3.1,
  moderado: 8.5,
  mayor_riesgo: 14.2
};

export function compute(i: Inputs): Outputs {
  // 1. Determinar fondo recomendado por edad (override si usuario selecciona otro)
  let fondo_recomendado_por_edad = 'moderado';
  if (i.edad_afiliado < 36) {
    fondo_recomendado_por_edad = 'mayor_riesgo';
  } else if (i.edad_afiliado > 55) {
    fondo_recomendado_por_edad = 'conservador';
  }
  
  // Usar perfil seleccionado por usuario (prevalece sobre edad)
  const perfil = i.perfil_riesgo;
  const fondo_recomendado = `${perfil.charAt(0).toUpperCase()}${perfil.slice(1).replace('_', ' ')} (por perfil seleccionado)`;
  
  // 2. Rendimiento anual promedio del perfil
  const rendimiento_anual_prom = RENDIMIENTO_PROMEDIO[perfil];
  
  // 3. Mejor RAIS en el perfil seleccionado
  let mejor_rais_perfil = 'Porvenir';
  let mejor_rendimiento = RENDIMIENTOS_RAIS.porvenir[perfil];
  
  Object.entries(RENDIMIENTOS_RAIS).forEach(([rais, rendimientos]) => {
    if (rendimientos[perfil] > mejor_rendimiento) {
      mejor_rendimiento = rendimientos[perfil];
      mejor_rais_perfil = rais.charAt(0).toUpperCase() + rais.slice(1);
    }
  });
  
  // 4. Proyección a 10 años (monto acumulado × (1 + rendimiento)^10)
  const monto = i.monto_acumulado || 5000000; // Default $5M
  const factor_10anos = Math.pow(1 + rendimiento_anual_prom / 100, 10);
  const proyeccion_10_anos = Math.round(monto * factor_10anos);
  
  // 5. Ventana de traslado próxima
  const hoy = new Date();
  const mes_actual = hoy.getMonth();
  const ano_actual = hoy.getFullYear();
  
  let ventana_ano = ano_actual;
  if (mes_actual >= 10) { // Nov o Dic -> próxima ventana es dic-ene siguiente
    ventana_ano = ano_actual + 1;
  }
  
  const ventana_traslado_proximo = `1 de diciembre de ${ventana_ano} al 31 de enero de ${ventana_ano + 1} (sin comisión)`;
  
  // 6. Diferencia rendimiento vs RAIS actual
  let diferencia_vs_actual = 0;
  if (i.rais_actual && i.rais_actual !== 'ninguna') {
    const rendimiento_actual = RENDIMIENTOS_RAIS[i.rais_actual]?.[perfil] || RENDIMIENTO_PROMEDIO[perfil];
    diferencia_vs_actual = rendimiento_anual_prom - rendimiento_actual;
  }
  
  // 7. Recomendaciones de acción
  let recomendaciones = '';
  
  if (i.edad_afiliado < 35 && perfil !== 'mayor_riesgo') {
    recomendaciones += '⚠️ A tu edad, mayor riesgo es más rentable (10,5% vs 8,2% moderado). Considera cambiar si tolerancia al riesgo lo permite.\n';
  }
  
  if (i.edad_afiliado > 55 && perfil !== 'conservador') {
    recomendaciones += '⚠️ Próximo a jubilación: conservador reduce volatilidad y protege patrimonio. Migra gradualmente.\n';
  }
  
  if (diferencia_vs_actual > 0.3) {
    const comision_traslado = Math.round(monto * 0.015); // 1,5% estimada
    const beneficio_10anos = Math.round(
      monto * (Math.pow(1 + mejor_rendimiento / 100, 10) - Math.pow(1 + (mejor_rendimiento - diferencia_vs_actual) / 100, 10))
    );
    recomendaciones += `✓ ${mejor_rais_perfil} supera +${diferencia_vs_actual.toFixed(2)}% anual. Comisión traslado: ~$${comision_traslado.toLocaleString('es-CO')}. Beneficio 10 años: ~$${beneficio_10anos.toLocaleString('es-CO')}. Evalúa en ventana sin comisión.\n`;
  } else if (diferencia_vs_actual < -0.2) {
    recomendaciones += `ℹ️ Cambio a otra RAIS no justificado (diferencia ${diferencia_vs_actual.toFixed(2)}% anual). Mantén en RAIS actual.\n`;
  } else {
    recomendaciones += `ℹ️ Rendimiento similar en tu perfil. Evaluá servicio, atención y preferencia personal.\n`;
  }
  
  if (!i.monto_acumulado) {
    recomendaciones += '💡 Ingresá tu saldo actual para proyecciones precisas.\n';
  }
  
  recomendaciones += `📊 Volatilidad histórica ${perfil}: ${VOLATILIDAD[perfil]}%. Prepárate para fluctuaciones de ±20-30% en años bajistas (mayor riesgo).`;
  
  return {
    fondo_recomendado,
    rendimiento_anual_prom: parseFloat(rendimiento_anual_prom.toFixed(2)),
    mejor_rais_perfil,
    proyeccion_10_anos,
    ventana_traslado_proximo,
    diferencia_vs_actual: parseFloat(diferencia_vs_actual.toFixed(2)),
    recomendaciones: recomendaciones.trim()
  };
}
