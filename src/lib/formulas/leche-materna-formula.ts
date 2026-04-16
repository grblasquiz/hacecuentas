/** Cantidad de leche materna o fórmula por edad y peso */
export interface Inputs { edadBebeSemanas: string; pesoBebe: number; tipoAlimentacion?: string; }
export interface Outputs { mlPorToma: string; tomasPorDia: string; totalDiario: string; nota: string; }

export function lecheMaterna(i: Inputs): Outputs {
  const edadSem = Number(i.edadBebeSemanas) || 0;
  const peso = Number(i.pesoBebe);
  const tipo = String(i.tipoAlimentacion || 'formula');
  if (!peso || peso < 2) throw new Error('Ingresá el peso del bebé');

  let mlToma = 0, tomas = 0, nota = '';
  if (edadSem <= 1) { mlToma = 45; tomas = 10; }
  else if (edadSem <= 3) { mlToma = 75; tomas = 9; }
  else if (edadSem <= 7) { mlToma = 105; tomas = 8; }
  else if (edadSem <= 11) { mlToma = 135; tomas = 7; }
  else if (edadSem <= 15) { mlToma = 165; tomas = 6; }
  else if (edadSem <= 23) { mlToma = 180; tomas = 5; }
  else if (edadSem <= 35) { mlToma = 210; tomas = 4; nota = 'A partir de los 6 meses se complementa con alimentos sólidos.'; }
  else { mlToma = 210; tomas = 3; nota = 'La leche complementa los sólidos, ya no es el alimento principal.'; }

  // Ajustar por peso si usa fórmula
  if (tipo === 'formula') {
    const totalPorPeso = peso * 150;
    const mlPorPeso = Math.round(totalPorPeso / tomas);
    mlToma = Math.round((mlToma + mlPorPeso) / 2); // promedio de ambos métodos
  }

  const totalDiario = mlToma * tomas;

  if (tipo === 'materna') {
    nota = (nota ? nota + ' ' : '') + 'Con lactancia materna exclusiva, el bebé regula la cantidad. Estos valores son orientativos.';
  }

  return {
    mlPorToma: `${mlToma} ml por toma (aproximado)`,
    tomasPorDia: `${tomas} tomas por día`,
    totalDiario: `${totalDiario} ml/día (${Math.round(totalDiario / 30)} onzas)`,
    nota: nota || 'Consultá con tu pediatra para ajustar según tu bebé.',
  };
}
