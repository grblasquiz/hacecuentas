export interface Inputs {
  tipo_consulta: 'medico_general' | 'especialista' | 'urgencia';
  sistema_elegido: 'particular' | 'fonasa_mai' | 'fonasa_mle' | 'isapre';
  costo_particular: number; // En pesos chilenos
  bonificacion_fonasa: number; // Porcentaje: 50, 60, 70, 80
  valor_uf: number; // UF actual en pesos
  copago_isapre_uf: number; // En UF
  consultas_anuales: number;
  tiene_referencia_fonasa: 'si' | 'no';
}

export interface Outputs {
  costo_consulta_particular: number;
  costo_fonasa_mai: number;
  costo_fonasa_mle: number;
  costo_isapre: number;
  opcion_mas_economica: string;
  ahorro_vs_particular: number;
  gasto_anual_estimado: number;
  tiempo_espera_dias: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile (Fuente: SII, Fonasa, Superintendencia Salud, Banco Central)
  const COSTO_FONASA_MAI_SIN_REFERENCIA_MIN = 15000; // Pesos chilenos
  const COSTO_FONASA_MAI_SIN_REFERENCIA_MAX = 25000;
  const PROMEDIO_COSTO_MAI_SIN_REF = (COSTO_FONASA_MAI_SIN_REFERENCIA_MIN + COSTO_FONASA_MAI_SIN_REFERENCIA_MAX) / 2;

  // Tiempos espera (días) según sistema
  const ESPERA_DIAS = {
    particular: 1,
    fonasa_mai: 15,
    fonasa_mle: 6,
    isapre: 5
  };

  // Costo consulta particular (valor ingresado)
  const costoParticularFinal = i.costo_particular;

  // Fonasa MAI
  let costoFonasaMai = 0;
  if (i.tiene_referencia_fonasa === 'si') {
    costoFonasaMai = 0; // Gratuito con referencia válida (Fuente: Fonasa)
  } else {
    // Sin referencia, copago estimado
    costoFonasaMai = PROMEDIO_COSTO_MAI_SIN_REF;
  }

  // Fonasa MLE: Bonificación según tramo de ingreso
  const bonificacionPorcentaje = i.bonificacion_fonasa / 100; // Convertir a decimal
  const bonificacionMonto = costoParticularFinal * bonificacionPorcentaje; // Fuente: SII tramos 2026
  const costoFonasaMle = costoParticularFinal - bonificacionMonto;

  // Isapre: copago en UF convertido a pesos
  const costoIsapre = i.copago_isapre_uf * i.valor_uf; // Fuente: Banco Central UF, Superintendencia planes

  // Encontrar opción más económica
  const opciones = [
    { sistema: 'Médico particular', costo: costoParticularFinal },
    { sistema: 'Fonasa MAI', costo: costoFonasaMai },
    { sistema: 'Fonasa MLE', costo: costoFonasaMle },
    { sistema: 'Isapre', costo: costoIsapre }
  ];

  const opcionMasEconomica = opciones.reduce((min, actual) => 
    actual.costo < min.costo ? actual : min
  );

  // Ahorro vs particular (valor positivo = ahorras)
  const ahorroVsParticular = costoParticularFinal - opcionMasEconomica.costo;

  // Gasto anual del sistema elegido
  let costoAnoSistemaElegido = 0;
  switch (i.sistema_elegido) {
    case 'particular':
      costoAnoSistemaElegido = costoParticularFinal;
      break;
    case 'fonasa_mai':
      costoAnoSistemaElegido = costoFonasaMai;
      break;
    case 'fonasa_mle':
      costoAnoSistemaElegido = costoFonasaMle;
      break;
    case 'isapre':
      costoAnoSistemaElegido = costoIsapre;
      break;
  }
  const gastoAnualEstimado = costoAnoSistemaElegido * i.consultas_anuales;

  // Tiempo espera según sistema elegido
  const tiempoEsperaDias = ESPERA_DIAS[i.sistema_elegido];

  return {
    costo_consulta_particular: Math.round(costoParticularFinal),
    costo_fonasa_mai: Math.round(costoFonasaMai),
    costo_fonasa_mle: Math.round(costoFonasaMle),
    costo_isapre: Math.round(costoIsapre),
    opcion_mas_economica: opcionMasEconomica.sistema,
    ahorro_vs_particular: Math.round(ahorroVsParticular),
    gasto_anual_estimado: Math.round(gastoAnualEstimado),
    tiempo_espera_dias: tiempoEsperaDias
  };
}
