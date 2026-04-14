// Finanzas
import { sueldoAR } from './sueldo-ar';
import { dolarAR } from './dolar-ar';
import { aguinaldo } from './aguinaldo';
import { prestamoCuota } from './prestamo-cuota';
import { vacaciones } from './vacaciones';
import { monotributo } from './monotributo';
import { interesCompuesto } from './interes-compuesto';
import { indemnizacion } from './indemnizacion';
import { horasExtra } from './horas-extra';
import { gananciasRG830 } from './ganancias-rg830';
import { gananciasSueldo } from './ganancias-sueldo';
import { plazoFijo } from './plazo-fijo';
import { alquilerIcl } from './alquiler-icl';
import { ahorroMeta } from './ahorro-meta';
import { cuota12 } from './cuota-12';
import { impuestoDebitosCreditos } from './impuesto-debitos-creditos';
import { ingresosBrutos } from './ingresos-brutos';
import { bienesPersonales } from './bienes-personales';
import { tirVan } from './tir-van';
import { rentabilidadAlquiler } from './rentabilidad-alquiler';
import { creditoUva } from './credito-uva';
import { inflacionIpc } from './inflacion-ipc';
import { jubilacionMinima } from './jubilacion-minima';
import { netoABruto } from './neto-a-bruto';
import { salarioMinimo } from './salario-minimo';
import { sueldoHora } from './sueldo-hora';

// Negocios
import { margenGanancia } from './margen-ganancia';
import { precioIva } from './precio-iva';
import { breakEven } from './break-even';
import { descuento } from './descuento';
import { comisionVenta } from './comision-venta';
import { costoLaboral } from './costo-laboral';
import { monotributoVsInscripto } from './monotributo-vs-inscripto';
import { dso } from './dso';
import { rotacionInventario } from './rotacion-inventario';
import { facturacionMinima } from './facturacion-minima';

// Salud
import { imc } from './imc';
import { pesoIdeal } from './peso-ideal';
import { grasaCorporal } from './grasa-corporal';
import { bmr } from './bmr';
import { caloriasTDEE } from './calorias-tdee';
import { aguaDiaria } from './agua-diaria';
import { proteinaDiaria } from './proteina-diaria';
import { macros } from './macros';
import { frecuenciaCardiaca } from './frecuencia-cardiaca';
import { embarazo } from './embarazo';
import { ovulacion } from './ovulacion';
import { fechaParto } from './fecha-parto';
import { alcoholSangre } from './alcohol-sangre';
import { percentilPediatrico } from './percentil-pediatrico';

// Marketing
import { marketingCtr } from './marketing-ctr';
import { marketingCpc } from './marketing-cpc';
import { marketingCpm } from './marketing-cpm';
import { marketingRoas } from './marketing-roas';
import { marketingConversion } from './marketing-conversion';
import { marketingCac } from './marketing-cac';
import { cpa } from './cpa';
import { churn } from './churn';
import { mrr } from './mrr';
import { nps } from './nps';
import { openRate } from './open-rate';
import { engagement } from './engagement';

// Deportes
import { paceRunning } from './pace-running';
import { prediccionMaraton } from './prediccion-maraton';
import { rm } from './rm';
import { caloriasDeporte } from './calorias-deporte';
import { vo2Max } from './vo2-max';
import { ritmoCiclismo } from './ritmo-ciclismo';

// Viajes
import { viajeCombustible } from './viaje-combustible';
import { viajePresupuesto } from './viaje-presupuesto';
import { viajeDividir } from './viaje-dividir';
import { cambioMoneda } from './cambio-moneda';
import { propina } from './propina';
import { propinaViaje } from './propina-viaje';
import { jetLag } from './jet-lag';
import { presupuestoViaje } from './presupuesto-viaje';
import { equipajeVuelo } from './equipaje-vuelo';

// Vida
import { diasEntreFechas } from './dias-entre-fechas';
import { edad } from './edad';
import { porcentaje } from './porcentaje';
import { descensoFutbol } from './descenso-futbol';
import { cuentaRegresiva } from './cuenta-regresiva';
import { queDia } from './que-dia';
import { reglaTres } from './regla-tres';
import { areaPerimetro } from './area-perimetro';
import { conversorUnidades } from './conversor-unidades';
import { consumoElectrico } from './consumo-electrico';

// Mascotas
import { edadPerro } from './edad-perro';
import { edadGato } from './edad-gato';
import { pesoIdealPerro } from './peso-ideal-perro';
import { dosisMascota } from './dosis-mascota';

// Matemática
import { promedioMediana } from './promedio-mediana';
import { pitagoras } from './pitagoras';
import { ecuacionCuadratica } from './ecuacion-cuadratica';
import { factorialCalc } from './factorial';
import { interesSimple } from './interes-simple';
import { mcdMcm } from './mcd-mcm';

// Construcción
import { ladrillosM2 } from './ladrillos-m2';
import { cementoM3 } from './cemento-m3';
import { pinturaM2 } from './pintura-m2';
import { pisosCeramicos } from './pisos-ceramicos';
import { costoM2Construccion } from './costo-m2-construccion';

// Cocina
import { tazasGramos } from './tazas-gramos';
import { multiplicarReceta } from './multiplicar-receta';
import { tiempoCoccion } from './tiempo-coccion';

export const formulas = {
  // Finanzas
  'sueldo-ar': sueldoAR,
  'dolar-ar': dolarAR,
  aguinaldo,
  'prestamo-cuota': prestamoCuota,
  vacaciones,
  monotributo,
  'interes-compuesto': interesCompuesto,
  indemnizacion,
  'horas-extra': horasExtra,
  'ganancias-rg830': gananciasRG830,
  'ganancias-sueldo': gananciasSueldo,
  'plazo-fijo': plazoFijo,
  'alquiler-icl': alquilerIcl,
  'ahorro-meta': ahorroMeta,
  'cuota-12': cuota12,
  'impuesto-debitos-creditos': impuestoDebitosCreditos,
  'ingresos-brutos': ingresosBrutos,
  'bienes-personales': bienesPersonales,
  'tir-van': tirVan,
  'rentabilidad-alquiler': rentabilidadAlquiler,
  'credito-uva': creditoUva,
  'inflacion-ipc': inflacionIpc,
  'jubilacion-minima': jubilacionMinima,
  'neto-a-bruto': netoABruto,
  'salario-minimo': salarioMinimo,
  'sueldo-hora': sueldoHora,

  // Negocios
  'margen-ganancia': margenGanancia,
  'precio-iva': precioIva,
  'break-even': breakEven,
  descuento,
  'comision-venta': comisionVenta,
  'costo-laboral': costoLaboral,
  'monotributo-vs-inscripto': monotributoVsInscripto,
  dso,
  'rotacion-inventario': rotacionInventario,
  'facturacion-minima': facturacionMinima,

  // Salud
  imc,
  'peso-ideal': pesoIdeal,
  'grasa-corporal': grasaCorporal,
  bmr,
  'calorias-tdee': caloriasTDEE,
  'agua-diaria': aguaDiaria,
  'proteina-diaria': proteinaDiaria,
  macros,
  'frecuencia-cardiaca': frecuenciaCardiaca,
  embarazo,
  ovulacion,
  'fecha-parto': fechaParto,
  'alcohol-sangre': alcoholSangre,
  'percentil-pediatrico': percentilPediatrico,

  // Marketing
  'marketing-ctr': marketingCtr,
  'marketing-cpc': marketingCpc,
  'marketing-cpm': marketingCpm,
  'marketing-roas': marketingRoas,
  'marketing-conversion': marketingConversion,
  'marketing-cac': marketingCac,
  cpa,
  churn,
  mrr,
  nps,
  'open-rate': openRate,
  engagement,

  // Deportes
  'pace-running': paceRunning,
  'prediccion-maraton': prediccionMaraton,
  rm,
  'calorias-deporte': caloriasDeporte,
  'vo2-max': vo2Max,
  'ritmo-ciclismo': ritmoCiclismo,

  // Viajes
  'viaje-combustible': viajeCombustible,
  'viaje-presupuesto': viajePresupuesto,
  'viaje-dividir': viajeDividir,
  'cambio-moneda': cambioMoneda,
  propina,
  'propina-viaje': propinaViaje,
  'jet-lag': jetLag,
  'presupuesto-viaje': presupuestoViaje,
  'equipaje-vuelo': equipajeVuelo,

  // Vida
  'dias-entre-fechas': diasEntreFechas,
  edad,
  porcentaje,
  'descenso-futbol': descensoFutbol,
  'cuenta-regresiva': cuentaRegresiva,
  'que-dia': queDia,
  'regla-tres': reglaTres,
  'area-perimetro': areaPerimetro,
  'conversor-unidades': conversorUnidades,
  'consumo-electrico': consumoElectrico,

  // Mascotas
  'edad-perro': edadPerro,
  'edad-gato': edadGato,
  'peso-ideal-perro': pesoIdealPerro,
  'dosis-mascota': dosisMascota,

  // Matemática
  'promedio-mediana': promedioMediana,
  pitagoras,
  'ecuacion-cuadratica': ecuacionCuadratica,
  factorial: factorialCalc,
  'interes-simple': interesSimple,
  'mcd-mcm': mcdMcm,

  // Construcción
  'ladrillos-m2': ladrillosM2,
  'cemento-m3': cementoM3,
  'pintura-m2': pinturaM2,
  'pisos-ceramicos': pisosCeramicos,
  'costo-m2-construccion': costoM2Construccion,

  // Cocina
  'tazas-gramos': tazasGramos,
  'multiplicar-receta': multiplicarReceta,
  'tiempo-coccion': tiempoCoccion,
};

export type FormulaId = keyof typeof formulas;
