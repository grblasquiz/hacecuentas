/**
 * Calculadora Moratoria Previsional 27.705 — Comprar años de aportes (Argentina)
 *
 * Marco legal:
 *   - Ley 27.705 (29/03/2023) — Plan de Pago de Deuda Previsional
 *   - Reglamentación: Resolución ANSES 174/2023 y Decreto 173/2023
 *
 * Mecánica:
 *   - Permite comprar hasta 30 años de aportes faltantes (meses desde los 18 años hacia atrás)
 *   - Cuota mensual = 29% × MOPRE × meses comprados, dividido en hasta 120 cuotas
 *   - La cuota se descuenta del haber jubilatorio cada mes
 *   - Edad mínima: 60 mujer / 65 hombre
 *   - El plan es opcional y compatible con cualquier monto de aportes previos
 *
 * MOPRE (Módulo Previsional): valor fijado periódicamente por ANSES.
 * En la práctica, MOPRE ≈ AMPO ≈ valor referencial de cotización mínima.
 */

export interface ComprarAnosAportesMoratoriaInputs {
  edadActual: number;
  sexoLegal: 'M' | 'F' | string;
  aniosAportesActuales: number;
  haberMinimoEstimado: number;
  mopreVigente: number; // valor MOPRE actual en pesos
}

export interface ComprarAnosAportesMoratoriaOutputs {
  aniosAComprar: number;
  mesesAComprar: number;
  deudaTotal: number;
  cuotaMensual: number;
  cantidadCuotas: number;
  haberNetoTrasDescuento: number;
  porcentajeDescuento: number;
  mensaje: string;
  edadMinimaLegal: number;
  cumpleEdad: boolean;
  recomendacion: string;
}

export function comprarAnosAportesMoratoria(
  inputs: ComprarAnosAportesMoratoriaInputs,
): ComprarAnosAportesMoratoriaOutputs {
  const edad = Math.max(0, Math.floor(Number(inputs.edadActual) || 0));
  const sexo = String(inputs.sexoLegal || '').toUpperCase().charAt(0);
  const aportes = Math.max(0, Number(inputs.aniosAportesActuales) || 0);
  const haberMinimo = Math.max(0, Number(inputs.haberMinimoEstimado) || 0);
  const mopre = Math.max(0, Number(inputs.mopreVigente) || 0);

  if (!edad || edad <= 0) {
    throw new Error('Ingresá la edad actual');
  }
  if (!haberMinimo || haberMinimo <= 0) {
    throw new Error('Ingresá el haber mínimo jubilatorio estimado');
  }
  if (!mopre || mopre <= 0) {
    throw new Error('Ingresá el valor MOPRE vigente (consultá ANSES)');
  }
  if (sexo !== 'M' && sexo !== 'F') {
    throw new Error('Ingresá el sexo legal (M o F)');
  }

  const edadMinimaLegal = sexo === 'F' ? 60 : 65;
  const cumpleEdad = edad >= edadMinimaLegal;

  // Años a comprar: hasta 30 años totales, limitado por años ya aportados
  const aniosAComprarRaw = Math.max(0, 30 - aportes);
  const aniosAComprar = Math.min(30, aniosAComprarRaw);
  const mesesAComprar = aniosAComprar * 12;

  // Deuda total: 29% × MOPRE × meses
  // Fuente: Ley 27.705 art. 8 — cuota mensual fijada como porcentaje del MOPRE
  const deudaTotal = 0.29 * mopre * mesesAComprar;

  // Cuotas: hasta 120 cuotas (10 años) según art. 9 Ley 27.705
  const cantidadCuotas = 120;
  const cuotaMensual = cantidadCuotas > 0 ? deudaTotal / cantidadCuotas : 0;

  const haberNetoTrasDescuento = Math.max(0, haberMinimo - cuotaMensual);
  const porcentajeDescuento = haberMinimo > 0 ? Math.round((cuotaMensual / haberMinimo) * 100) : 0;

  let mensaje = '';
  let recomendacion = '';

  if (!cumpleEdad) {
    const faltan = edadMinimaLegal - edad;
    mensaje = `Te faltan ${faltan} año${faltan === 1 ? '' : 's'} para alcanzar la edad mínima (${edadMinimaLegal} años para ${sexo === 'F' ? 'mujeres' : 'hombres'}). La moratoria no se puede iniciar antes, pero podés ir preparando documentación.`;
  } else if (aportes >= 30) {
    mensaje = 'Ya tenés 30 o más años de aportes: no necesitás moratoria. Tramitá directamente la jubilación ordinaria que paga el haber pleno según tu sueldo histórico.';
  } else if (aniosAComprar > 0) {
    mensaje = `Necesitás comprar ${aniosAComprar} años (${mesesAComprar} meses) de aportes faltantes. La deuda total estimada es de $${Math.round(deudaTotal).toLocaleString('es-AR')}, que se descuenta en ${cantidadCuotas} cuotas mensuales de aproximadamente $${Math.round(cuotaMensual).toLocaleString('es-AR')}.`;
  }

  // Recomendación: comparar vs PUAM
  const importePuam = haberMinimo * 0.8;
  if (cumpleEdad) {
    if (haberNetoTrasDescuento > importePuam) {
      const diferencia = haberNetoTrasDescuento - importePuam;
      recomendacion = `**Conviene moratoria**: el haber neto tras descuento ($${Math.round(haberNetoTrasDescuento).toLocaleString('es-AR')}) supera a la PUAM ($${Math.round(importePuam).toLocaleString('es-AR')}) en $${Math.round(diferencia).toLocaleString('es-AR')} por mes. Además, la moratoria abre derecho a pensión por fallecimiento para tu cónyuge.`;
    } else {
      const diferencia = importePuam - haberNetoTrasDescuento;
      recomendacion = `**Evaluá la PUAM**: el haber neto tras descuento ($${Math.round(haberNetoTrasDescuento).toLocaleString('es-AR')}) queda por debajo de la PUAM ($${Math.round(importePuam).toLocaleString('es-AR')}) por $${Math.round(diferencia).toLocaleString('es-AR')}. Salvo que valores el derecho a pensión derivada (que la PUAM no genera), la PUAM puede convenirte.`;
    }
  } else {
    recomendacion = `Aún no llegás a la edad mínima. Mientras esperás, juntá certificaciones de servicios para validar los años ya aportados (Form. PS 6.2 en ANSES).`;
  }

  return {
    aniosAComprar,
    mesesAComprar,
    deudaTotal: Math.round(deudaTotal),
    cuotaMensual: Math.round(cuotaMensual),
    cantidadCuotas,
    haberNetoTrasDescuento: Math.round(haberNetoTrasDescuento),
    porcentajeDescuento,
    mensaje,
    edadMinimaLegal,
    cumpleEdad,
    recomendacion,
  };
}
