/** Calcula diámetro total de neumáticos y compara medidas equivalentes */
export interface Inputs {
  ancho1: number;
  perfil1: number;
  rin1: number;
  ancho2?: number;
  perfil2?: number;
  rin2?: number;
}
export interface Outputs {
  diametroTotal1: number;
  diametroTotal2: number;
  diferenciaPorcentaje: number;
  detalle: string;
}

function calcDiametro(ancho: number, perfil: number, rin: number): number {
  const alturaFlanco = ancho * (perfil / 100);
  return alturaFlanco * 2 + rin * 25.4;
}

export function neumaticosMedidaEquivalente(i: Inputs): Outputs {
  const ancho1 = Number(i.ancho1);
  const perfil1 = Number(i.perfil1);
  const rin1 = Number(i.rin1);

  if (!ancho1 || ancho1 < 100 || ancho1 > 400) throw new Error('El ancho del neumático debe estar entre 100 y 400 mm');
  if (!perfil1 || perfil1 < 20 || perfil1 > 90) throw new Error('El perfil debe estar entre 20 y 90');
  if (!rin1 || rin1 < 12 || rin1 > 24) throw new Error('El rin debe estar entre 12 y 24 pulgadas');

  const d1 = calcDiametro(ancho1, perfil1, rin1);

  const ancho2 = Number(i.ancho2) || 0;
  const perfil2 = Number(i.perfil2) || 0;
  const rin2 = Number(i.rin2) || 0;

  let d2 = 0;
  let diferencia = 0;

  if (ancho2 > 0 && perfil2 > 0 && rin2 > 0) {
    d2 = calcDiametro(ancho2, perfil2, rin2);
    diferencia = ((d2 - d1) / d1) * 100;
  }

  let detalleStr = `Neumático ${ancho1}/${perfil1} R${rin1}: diámetro total ${d1.toFixed(1)} mm (flanco: ${(ancho1 * perfil1 / 100).toFixed(1)} mm).`;

  if (d2 > 0) {
    const compatibilidad = Math.abs(diferencia) <= 1.5 ? 'Excelente compatibilidad' :
      Math.abs(diferencia) <= 3 ? 'Compatible (dentro del 3%)' :
      'Fuera de tolerancia (>3%), no recomendado';
    detalleStr += ` Alternativo ${ancho2}/${perfil2} R${rin2}: ${d2.toFixed(1)} mm. Diferencia: ${diferencia > 0 ? '+' : ''}${diferencia.toFixed(1)}%. ${compatibilidad}.`;
  }

  return {
    diametroTotal1: Number(d1.toFixed(1)),
    diametroTotal2: Number(d2.toFixed(1)),
    diferenciaPorcentaje: Number(diferencia.toFixed(1)),
    detalle: detalleStr,
  };
}
