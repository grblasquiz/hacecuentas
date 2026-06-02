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
  _insight?: any;
  _chart?: any;
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

  const ccR = Math.round(cc);
  return {
    cc: ccR,
    litros: Number(litros.toFixed(2)),
    detalle: detalleStr,
    _insight: {
      title: 'Tu cilindrada en contexto',
      text: `**${ccR} cc** equivalen a **${litros.toFixed(2)} litros** de cilindrada: se clasifica como ${categoria.toLowerCase()}.`,
      tone: 'neutral',
      icon: '🏎️',
    },
    _chart: {
      type: 'scale',
      marker: ccR,
      markerLabel: `${litros.toFixed(1)} L`,
      min: 0,
      segments: [
        { nombre: 'City car', max: 1000, color: '#22c55e', colorDark: '#16a34a' },
        { nombre: 'Mediano-chico', max: 1600, color: '#84cc16', colorDark: '#65a30d' },
        { nombre: 'Mediano', max: 2000, color: '#f59e0b', colorDark: '#d97706' },
        { nombre: 'Grande', max: 3000, color: '#f97316', colorDark: '#ea580c' },
        { nombre: 'Muy grande', max: Math.max(4000, ccR + 200), color: '#ef4444', colorDark: '#dc2626' },
      ],
      ariaLabel: `Cilindrada de ${ccR} cc (${litros.toFixed(2)} litros) ubicada en la categoría ${categoria}.`,
    },
  };
}
