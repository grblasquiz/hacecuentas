/**
 * Calculadora de Anillo de Compromiso - Precio por Sueldo.
 */
export interface AnilloCompromisoPrecioSueldoInputs { sueldoMensual:number; regla:string; }
export interface AnilloCompromisoPrecioSueldoOutputs { precioAnillo:number; diamanteEstimadoQuilates:number; sugerencias:string; consejo:string; _insight?: any; }
export function anilloCompromisoPrecioSueldo(inputs: AnilloCompromisoPrecioSueldoInputs): AnilloCompromisoPrecioSueldoOutputs {
  const sueldo = Number(inputs.sueldoMensual);
  const regla = inputs.regla;
  if (!sueldo || sueldo <= 0) throw new Error('Ingresá sueldo');
  let meses = 2;
  if (regla === '1mes') meses = 1;
  else if (regla === '3meses') meses = 3;
  const precioAnillo = sueldo * meses;
  let diamanteEstimadoQuilates = 0;
  if (precioAnillo < 1000) diamanteEstimadoQuilates = 0.2;
  else if (precioAnillo < 2000) diamanteEstimadoQuilates = 0.35;
  else if (precioAnillo < 3500) diamanteEstimadoQuilates = 0.55;
  else if (precioAnillo < 6000) diamanteEstimadoQuilates = 0.85;
  else if (precioAnillo < 10000) diamanteEstimadoQuilates = 1.3;
  else diamanteEstimadoQuilates = 2;
  let sugerencias = '';
  if (precioAnillo < 1500) sugerencias = 'Moissanita 1ct, diamante lab-grown 0.5ct, o diamante natural 0.25ct con halo';
  else if (precioAnillo < 3500) sugerencias = 'Diamante natural 0.5ct solitario, lab-grown 1ct con halo, moissanita 2ct';
  else if (precioAnillo < 7000) sugerencias = 'Diamante natural 0.7-1ct solitario o trilogía, lab-grown 2ct';
  else sugerencias = 'Diamante natural 1-2ct con diseño premium, oro blanco 18k o platino';
  const consejo = meses >= 2 ? 'Considerá lab-grown o moissanita para ahorrar 40-60% con calidad visual similar' : 'Enfocate en calidad del diamante (VS claridad, G-H color) más que en quilates';
  const tono = meses >= 3 ? 'warn' : meses === 1 ? 'good' : 'neutral';
  const notaRegla = meses >= 3
    ? `equivale a **${meses} sueldos** completos: la "regla de 3 meses" es una invención publicitaria de los 80, no una obligación.`
    : meses === 1
    ? `un solo sueldo es un presupuesto prudente; nadie debería endeudarse por un anillo.`
    : `el clásico de **${meses} sueldos**, aunque es sólo una guía de marketing, no una regla real.`;

  return {
    precioAnillo,
    diamanteEstimadoQuilates: Number(diamanteEstimadoQuilates.toFixed(2)),
    sugerencias,
    consejo,
    _insight: {
      title: 'Tu presupuesto para el anillo',
      text: `Con un sueldo de **$${sueldo.toLocaleString('es-AR')}**, tu presupuesto sale **$${precioAnillo.toLocaleString('es-AR')}** (~**${diamanteEstimadoQuilates.toFixed(2)} ct** de diamante natural). Eso ${notaRegla} Con lab-grown o moissanita lográs el mismo brillo gastando 40-60% menos.`,
      tone: tono,
      icon: '💍',
    },
  };
}
