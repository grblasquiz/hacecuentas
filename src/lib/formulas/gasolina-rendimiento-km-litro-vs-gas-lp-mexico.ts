export interface Inputs {
  kilometros_anuales: number;
  rendimiento_gasolina_km_litro: number;
  rendimiento_glp_kg_consumo: number;
  precio_gasolina_litro: number;
  precio_glp_kg: number;
  costo_conversion_pesos: number;
  mantenimiento_anual_glp: number;
}

export interface Outputs {
  gasto_anual_gasolina: number;
  gasto_anual_glp: number;
  ahorro_anual_bruto: number;
  ahorro_mensual: number;
  payback_meses: number;
  litraje_anual_gasolina: number;
  consumo_anual_glp_kg: number;
  ahorro_5_años: number;
  nota_legal: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Validación básica
  if (i.kilometros_anuales <= 0 || i.rendimiento_gasolina_km_litro <= 0 || i.rendimiento_glp_kg_consumo <= 0) {
    return {
      gasto_anual_gasolina: 0,
      gasto_anual_glp: 0,
      ahorro_anual_bruto: 0,
      ahorro_mensual: 0,
      payback_meses: 0,
      litraje_anual_gasolina: 0,
      consumo_anual_glp_kg: 0,
      ahorro_5_años: 0,
      nota_legal: "Error: verificar valores entrada."
    };
  }

  // Cálculos consumo
  const litraje_anual_gasolina = i.kilometros_anuales / i.rendimiento_gasolina_km_litro;
  const consumo_anual_glp_kg = (i.kilometros_anuales / 100) * i.rendimiento_glp_kg_consumo;

  // Gastos anuales
  const gasto_anual_gasolina = litraje_anual_gasolina * i.precio_gasolina_litro;
  const gasto_combustible_glp = consumo_anual_glp_kg * i.precio_glp_kg;
  const gasto_anual_glp = gasto_combustible_glp + i.mantenimiento_anual_glp;

  // Ahorros
  const ahorro_anual_bruto = gasto_anual_gasolina - gasto_anual_glp;
  const ahorro_mensual = ahorro_anual_bruto / 12;

  // Payback (meses)
  let payback_meses = 0;
  if (ahorro_anual_bruto > 0) {
    payback_meses = (i.costo_conversion_pesos / ahorro_anual_bruto) * 12;
  } else {
    payback_meses = 999; // No rentable
  }

  // Ahorro acumulado 5 años (post-conversión)
  const ahorro_5_años = (ahorro_anual_bruto * 5) - i.costo_conversion_pesos;

  // Nota legal
  let nota_legal = "✓ Cálculo válido. ";
  if (payback_meses > 60) {
    nota_legal += "⚠️ Payback >60 meses: NO recomendado a menos que uso >20 años. ";
  }
  if (i.kilometros_anuales < 10000) {
    nota_legal += "⚠️ Uso bajo (<10K km/año): Conversión no rentable. ";
  }
  nota_legal += "⚠️ REQUIERE: (1) Vehículo pre-certificado SAT/FMVSS-313. (2) Taller registrado SAT. (3) Inspección anual obligatoria. (4) Verificar estaciones GLP cercanas (CDMX/Edomex sin holograma 0-1 en 2026). Consulta Sedema + SAT antes de invertir.";

  const paybackR = Math.round(payback_meses * 10) / 10;
  const ahorroMensualR = Math.round(ahorro_mensual * 100) / 100;
  const ahorro5R = Math.round(ahorro_5_años * 100) / 100;
  const fmt = (x: number) => '$' + Math.round(x).toLocaleString('es-MX');

  let _insight: any;
  if (ahorro_anual_bruto <= 0) {
    _insight = {
      title: 'Conversión a GLP no conviene',
      text: `Con tus números el GLP **no genera ahorro**: el combustible más el mantenimiento anual igualan o superan lo que gastás en gasolina. Convertir solo sumaría el costo de instalación sin recuperarlo.`,
      tone: 'warn',
      icon: '⛽',
    };
  } else if (paybackR > 60) {
    _insight = {
      title: 'Ahorro real, pero payback largo',
      text: `Ahorrás **${fmt(ahorro_mensual)}/mes**, pero recuperás la inversión recién en **${paybackR} meses** (más de 5 años). Solo conviene si vas a conservar el auto mucho tiempo.`,
      tone: 'warn',
      icon: '⏳',
    };
  } else {
    _insight = {
      title: 'Conversión a GLP conviene',
      text: `Ahorrás **${fmt(ahorro_mensual)}/mes** y recuperás la inversión en **${paybackR} meses**. A 5 años el ahorro neto acumulado es de **${fmt(ahorro5R)}**.`,
      tone: 'good',
      icon: '✅',
    };
  }

  const ret: Outputs = {
    gasto_anual_gasolina: Math.round(gasto_anual_gasolina * 100) / 100,
    gasto_anual_glp: Math.round(gasto_anual_glp * 100) / 100,
    ahorro_anual_bruto: Math.round(ahorro_anual_bruto * 100) / 100,
    ahorro_mensual: ahorroMensualR,
    payback_meses: paybackR,
    litraje_anual_gasolina: Math.round(litraje_anual_gasolina * 100) / 100,
    consumo_anual_glp_kg: Math.round(consumo_anual_glp_kg * 100) / 100,
    ahorro_5_años: ahorro5R,
    nota_legal: nota_legal,
    _insight,
  };

  // Gauge de payback solo cuando es rentable y acotado (zonas de recupero)
  if (ahorro_anual_bruto > 0 && paybackR < 120) {
    ret._chart = {
      type: 'scale',
      marker: paybackR,
      markerLabel: `${paybackR} meses`,
      min: 0,
      segments: [
        { nombre: 'Excelente', max: 18, color: '#16a34a', colorDark: '#22c55e' },
        { nombre: 'Bueno', max: 36, color: '#84cc16', colorDark: '#a3e635' },
        { nombre: 'Aceptable', max: 60, color: '#eab308', colorDark: '#facc15' },
        { nombre: 'Largo', max: 120, color: '#dc2626', colorDark: '#ef4444' },
      ],
      ariaLabel: `Recuperás la inversión en ${paybackR} meses, sobre una escala de 0 a 120 meses`,
    };
  }

  return ret;
}
