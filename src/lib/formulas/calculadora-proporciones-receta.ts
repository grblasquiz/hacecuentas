/**
 * Calculadora de Proporciones de Receta — Ajustar a X porciones
 */
export interface ProporcionesRecetaInputs { porcionesOriginal: number; porcionesDeseadas: number; ingrediente1: string; cantidad1: number; ingrediente2: string; cantidad2: number; ingrediente3: string; cantidad3: number; ingrediente4: string; cantidad4: number; ingrediente5: string; cantidad5: number; }
export interface ProporcionesRecetaOutputs { factor: string; recetaAjustada: string; resumen: string; }

export function calculadoraProporcionesReceta(inputs: ProporcionesRecetaInputs): ProporcionesRecetaOutputs {
  const original = Number(inputs.porcionesOriginal);
  const deseadas = Number(inputs.porcionesDeseadas);

  if (!original || original <= 0) throw new Error('Ingresá las porciones originales de la receta');
  if (!deseadas || deseadas <= 0) throw new Error('Ingresá las porciones deseadas');

  const factor = deseadas / original;

  const ingredientes: { nombre: string; cantidadOriginal: number; cantidadAjustada: number }[] = [];

  for (let i = 1; i <= 5; i++) {
    const nombre = (inputs[`ingrediente${i}` as keyof ProporcionesRecetaInputs] as string || '').trim();
    const cantidad = Number(inputs[`cantidad${i}` as keyof ProporcionesRecetaInputs]) || 0;
    if (nombre && cantidad > 0) {
      ingredientes.push({
        nombre,
        cantidadOriginal: cantidad,
        cantidadAjustada: Math.round(cantidad * factor * 100) / 100,
      });
    }
  }

  if (ingredientes.length === 0) throw new Error('Ingresá al menos un ingrediente con su cantidad');

  const lineas = ingredientes.map(
    ing => `• ${ing.nombre}: ${ing.cantidadOriginal} → **${ing.cantidadAjustada}**`
  );

  const factorStr = factor === 1 ? '1 (sin cambio)' :
    factor > 1 ? `×${factor.toLocaleString('es-AR', { maximumFractionDigits: 2 })} (multiplicar)` :
    `×${factor.toLocaleString('es-AR', { maximumFractionDigits: 2 })} (reducir)`;

  const recetaAjustada = lineas.join('\n');

  const resumen = `Receta original: ${original} porciones → Ajustada: ${deseadas} porciones (factor ${factorStr})`;

  return { factor: factorStr, recetaAjustada, resumen };
}
