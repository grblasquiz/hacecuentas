/** Convierte cilindrada entre cc y litros, calcula desde dimensiones del motor */
export interface Inputs {
  valorCc: number;
  cilindros?: number;
  diametroPiston?: number;
  carreraPiston?: number;
}
export interface Outputs {
  cc: number;
  litros: number;
  detalle: string;
}

export function cilindradaMotorCcLitros(i: Inputs): Outputs {
  let cc: number;
  const cilindros = Number(i.cilindros) || 0;
  const diametro = Number(i.diametroPiston) || 0;
  const carrera = Number(i.carreraPiston) || 0;

  // Si hay datos de dimensiones, calcular cilindrada
  if (cilindros > 0 && diametro > 0 && carrera > 0) {
    // Diámetro y carrera en mm, convertir a cm para obtener cc
    const dCm = diametro / 10;
    const cCm = carrera / 10;
    cc = Math.PI * Math.pow(dCm / 2, 2) * cCm * cilindros;
  } else {
    cc = Number(i.valorCc);
  }

  if (!cc || cc <= 0) throw new Error('Ingresá la cilindrada en cc o las dimensiones del motor');
  if (cc < 50 || cc > 10000) throw new Error('La cilindrada debe estar entre 50 y 10.000 cc');

  const litros = cc / 1000;

  let categoria = '';
  if (cc <= 1000) categoria = 'Motor pequeño (city car)';
  else if (cc <= 1600) categoria = 'Motor mediano-chico';
  else if (cc <= 2000) categoria = 'Motor mediano';
  else if (cc <= 3000) categoria = 'Motor grande';
  else categoria = 'Motor muy grande (deportivo/utilitario)';

  let detalleStr = `${Math.round(cc)} cc = ${litros.toFixed(2)} litros. ${categoria}.`;
  if (cilindros > 0 && diametro > 0 && carrera > 0) {
    detalleStr += ` Calculado: ${cilindros} cilindros × ${diametro}mm diámetro × ${carrera}mm carrera.`;
  }

  return {
    cc: Math.round(cc),
    litros: Number(litros.toFixed(2)),
    detalle: detalleStr,
  };
}
