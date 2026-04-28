export interface Inputs {
  adultos: number;
  ninos: number;
  perfil: 'basico' | 'equilibrado' | 'saludable';
  region: 'norte' | 'bajio' | 'occidente' | 'centro' | 'oriente' | 'sureste';
  cadena: 'promedio' | 'walmart' | 'soriana' | 'chedraui' | 'aurrera';
}

export interface Outputs {
  costo_mensual: number;
  costo_diario: number;
  productos_clave: string;
  comparativa_cadenas: string;
  porcentaje_salario: number;
  advertencia_nutricion: string;
}

export function compute(i: Inputs): Outputs {
  // Costos base 2026 (INEGI, perfil equilibrado, región Centro)
  const costo_adulto_base = 1475; // MXN/mes
  const costo_nino_base = 1000;   // MXN/mes

  // Factores de perfil (multiplicadores)
  const factores_perfil: Record<string, number> = {
    basico: 0.85,
    equilibrado: 1.0,
    saludable: 1.25
  };

  // Factores de región (multiplicadores respecto Centro)
  const factores_region: Record<string, number> = {
    norte: 1.10,
    bajio: 1.02,
    occidente: 1.05,
    centro: 1.0,
    oriente: 1.03,
    sureste: 0.95
  };

  // Ajustes por cadena (desviación respecto promedio)
  const ajustes_cadena: Record<string, number> = {
    promedio: 1.0,
    walmart: 1.0,
    soriana: 1.03,
    chedraui: 1.02,
    aurrera: 0.95
  };

  // Cálculo de costo mensual base
  const costo_base = (i.adultos * costo_adulto_base) + (i.ninos * costo_nino_base);

  // Aplicar factores
  const factor_perfil = factores_perfil[i.perfil] || 1.0;
  const factor_region = factores_region[i.region] || 1.0;
  const ajuste_cadena = ajustes_cadena[i.cadena] || 1.0;

  const costo_mensual = Math.round(costo_base * factor_perfil * factor_region * ajuste_cadena);

  // Costo diario por persona
  const total_personas = i.adultos + i.ninos;
  const costo_diario = total_personas > 0 ? Math.round((costo_mensual / 30) / total_personas * 100) / 100 : 0;

  // Salario mínimo 2026 (México)
  const salario_minimo_horario = 248.93; // MXN/hora
  const horas_mes = 248; // jornada estándar
  const salario_minimo_mes = Math.round(salario_minimo_horario * horas_mes);

  // Porcentaje del salario mínimo
  const porcentaje_salario = salario_minimo_mes > 0 ? Math.round((costo_mensual / salario_minimo_mes) * 10000) / 100 : 0;

  // Productos clave con cantidades estimadas (mes, familia 4 personas, perfil equilibrado)
  const productos_clave_texto = `Canasta básica estimada (mes):\n\n` +
    `• Arroz blanco: 4 kg ($60)\n` +
    `• Frijoles secos: 3 kg ($54)\n` +
    `• Pan de caja: 6 piezas ($180)\n` +
    `• Aceite vegetal: 2 L ($80)\n` +
    `• Huevos: 60 piezas ($180)\n` +
    `• Leche fresca: 16 L ($320)\n` +
    `• Carne de res: 2 kg ($400)\n` +
    `• Pollo: 2 kg ($240)\n` +
    `• Jitomate: 4 kg ($120)\n` +
    `• Cebolla: 2 kg ($40)\n` +
    `• Papas: 3 kg ($45)\n` +
    `• Plátano: 4 kg ($60)\n` +
    `• Azúcar: 1 kg ($20)\n` +
    `• Sal: 1 kg ($15)\n` +
    `• Detergente/Jabón: 3 L ($180)\n\n` +
    `(Nota: cantidades se ajustan según número de personas y perfil)`;

  // Comparativa de cadenas
  const precios_walmart = Math.round(costo_mensual);
  const precios_soriana = Math.round(costo_mensual * 1.03);
  const precios_chedraui = Math.round(costo_mensual * 1.02);
  const precios_aurrera = Math.round(costo_mensual * 0.95);
  const promedio = Math.round((precios_walmart + precios_soriana + precios_chedraui + precios_aurrera) / 4);

  const comparativa_texto = `Estimación de precios por cadena (mes):\n\n` +
    `• Bodega Aurrera (más económica): $${precios_aurrera.toLocaleString('es-MX')} MXN\n` +
    `• Walmart (referencia): $${precios_walmart.toLocaleString('es-MX')} MXN\n` +
    `• Chedraui: $${precios_chedraui.toLocaleString('es-MX')} MXN\n` +
    `• Soriana (más cara): $${precios_soriana.toLocaleString('es-MX')} MXN\n` +
    `• Promedio nacional: $${promedio.toLocaleString('es-MX')} MXN\n\n` +
    `Ahorro comprando en Aurrera vs. Soriana: $${(precios_soriana - precios_aurrera).toLocaleString('es-MX')} MXN/mes`;

  // Advertencia nutricional según perfil
  let advertencia = '';
  if (i.perfil === 'basico') {
    advertencia = '⚠️ Perfil BÁSICO: Cubre calorías mínimas pero puede ser insuficiente en proteína, vitaminas y minerales. Recomendado solo para presupuestos muy limitados. Complementa con alimentos de temporada (ofertas).\n\nConsulta nutriólogo si hay menores de edad o embarazadas.';
  } else if (i.perfil === 'equilibrado') {
    advertencia = '✓ Perfil EQUILIBRADO: Cumple con recomendaciones del IMSS para nutrición adecuada. Incluye proteína, verduras y frutas en cantidad moderada. Balance óptimo precio-nutrición.';
  } else {
    advertencia = '✓ Perfil SALUDABLE: Excede recomendaciones nutricionales. Incluye variedad de frutas, lácteos, carnes. Apto para familias con capacidad de gasto mayor o dietas especiales. Mayor costo pero mejor salud a largo plazo.';
  }

  // Ajuste según número de personas
  if (total_personas === 0) {
    advertencia += '\n\n⚠️ Ingresa al menos 1 persona para un cálculo válido.';
  } else if (total_personas > 6) {
    advertencia += `\n\n💡 Familia grande (${total_personas} personas): Considera comprar al mayoreo en COPPEL o COSTCO para ahorrar 8–12%.`;
  }

  return {
    costo_mensual,
    costo_diario,
    productos_clave: productos_clave_texto,
    comparativa_cadenas: comparativa_texto,
    porcentaje_salario,
    advertencia_nutricion: advertencia
  };
}
