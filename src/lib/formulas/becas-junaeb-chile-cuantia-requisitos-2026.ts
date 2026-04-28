export interface Inputs {
  nivel_educativo: 'basica' | 'media' | 'superior_pregrado' | 'tecnica';
  promedio_ponderado: number;
  es_indigena: 'si' | 'no';
  rsh_familiar: number;
  tiene_licencia: 'si' | 'no';
}

export interface Outputs {
  beca_aplicable: string;
  monto_mensual: number;
  monto_anual: number;
  requisitos_clave: string;
  estado_elegibilidad: 'Elegible' | 'No elegible' | 'Condicionado';
}

export function compute(i: Inputs): Outputs {
  // Cuantías Junaeb 2026 en CLP (fuente: Junaeb bases 2026)
  const CUANTIA_INDIGENA = 95000; // Beca Indígena básica/media
  const CUANTIA_PRESIDENTE = 180000; // Beca Presidente República media/superior
  const CUANTIA_BICENTENARIO = 120000; // Beca Bicentenario superior pregrado
  const CUANTIA_PRACTICA_TECNICA = 105000; // Beca Práctica Técnica
  
  const RSH_MAXIMO = 650000; // RSH máximo aproximado 2026 en CLP
  const PROMEDIO_MINIMO = 4.0;
  const PROMEDIO_PRESIDENTE = 5.5;
  const PROMEDIO_BICENTENARIO = 4.5;
  const MESES_PAGO_ANUAL = 10; // Feb-Nov (sin dic/ene)
  
  // Validación de elegibilidad base
  if (i.promedio_ponderado < PROMEDIO_MINIMO) {
    return {
      beca_aplicable: 'No elegible',
      monto_mensual: 0,
      monto_anual: 0,
      requisitos_clave: `Promedio ${i.promedio_ponderado} < mínimo requerido ${PROMEDIO_MINIMO}. No cumples requisito base.`,
      estado_elegibilidad: 'No elegible'
    };
  }
  
  if (i.rsh_familiar > RSH_MAXIMO) {
    return {
      beca_aplicable: 'No elegible',
      monto_mensual: 0,
      monto_anual: 0,
      requisitos_clave: `RSH $${i.rsh_familiar.toLocaleString('es-CL')} excede límite $${RSH_MAXIMO.toLocaleString('es-CL')}. No cumples requisito de ingresos.`,
      estado_elegibilidad: 'No elegible'
    };
  }
  
  let beca_seleccionada = '';
  let monto = 0;
  let requisitos = '';
  
  // Lógica de asignación de becas (en orden de prelación)
  if (i.es_indigena === 'si' && (i.nivel_educativo === 'basica' || i.nivel_educativo === 'media')) {
    beca_seleccionada = 'Beca Indígena';
    monto = CUANTIA_INDIGENA;
    requisitos = `Promedio ${i.promedio_ponderado} ≥ ${PROMEDIO_MINIMO} ✓, RSH $${i.rsh_familiar.toLocaleString('es-CL')} ≤ ${RSH_MAXIMO.toLocaleString('es-CL')} ✓, Filiación indígena acreditada ✓`;
  }
  
  // Verifica si también aplica Beca Presidente (acumulable)
  if (i.promedio_ponderado >= PROMEDIO_PRESIDENTE && 
      (i.nivel_educativo === 'media' || i.nivel_educativo === 'superior_pregrado')) {
    const beca_presidente = 'Beca Presidente República';
    const monto_presidente = CUANTIA_PRESIDENTE;
    
    if (monto_presidente > monto) {
      beca_seleccionada = beca_presidente;
      monto = monto_presidente;
      requisitos = `Promedio ${i.promedio_ponderado} ≥ ${PROMEDIO_PRESIDENTE} ✓, RSH $${i.rsh_familiar.toLocaleString('es-CL')} ≤ ${RSH_MAXIMO.toLocaleString('es-CL')} ✓, Nivel ${i.nivel_educativo} ✓`;
    }
  }
  
  // Beca Bicentenario (superior pregrado)
  if (i.nivel_educativo === 'superior_pregrado' && i.promedio_ponderado >= PROMEDIO_BICENTENARIO && monto === 0) {
    beca_seleccionada = 'Beca Bicentenario';
    monto = CUANTIA_BICENTENARIO;
    requisitos = `Promedio ${i.promedio_ponderado} ≥ ${PROMEDIO_BICENTENARIO} ✓, Pregrado acreditado ✓, RSH $${i.rsh_familiar.toLocaleString('es-CL')} ≤ ${RSH_MAXIMO.toLocaleString('es-CL')} ✓`;
  }
  
  // Beca Práctica Técnica (técnicos)
  if (i.nivel_educativo === 'tecnica' && i.tiene_licencia === 'si' && monto === 0) {
    beca_seleccionada = 'Beca Práctica Técnica';
    monto = CUANTIA_PRACTICA_TECNICA;
    requisitos = `Promedio ${i.promedio_ponderado} ≥ ${PROMEDIO_MINIMO} ✓, Licencia técnica ✓, RSH $${i.rsh_familiar.toLocaleString('es-CL')} ≤ ${RSH_MAXIMO.toLocaleString('es-CL')} ✓`;
  }
  
  if (monto === 0) {
    return {
      beca_aplicable: 'Condicionado',
      monto_mensual: 0,
      monto_anual: 0,
      requisitos_clave: `Promedio ${i.promedio_ponderado} cumple mínimo, pero no calificas para modalidades específicas. Revisa requisitos detallados con tu establecimiento.`,
      estado_elegibilidad: 'Condicionado'
    };
  }
  
  const monto_anual = monto * MESES_PAGO_ANUAL;
  
  return {
    beca_aplicable: beca_seleccionada,
    monto_mensual: monto,
    monto_anual: monto_anual,
    requisitos_clave: requisitos,
    estado_elegibilidad: 'Elegible'
  };
}
