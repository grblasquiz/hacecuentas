/** Peso de caño estructural por metro lineal */
export interface CanoEstructuralInputs {
  tipoCano?: string;
  medidaExteriorMm: number;
  ladoMenorMm?: number;
  espesorMm: number;
  largoMl?: number;
  cantidad?: number;
}
export interface CanoEstructuralOutputs {
  pesoMl: number;
  pesoBarra: number;
  pesoTotal: number;
  detalle: string;
}

const DENSIDAD_ACERO = 7850; // kg/m³

export function canoEstructuralPesoMl(inputs: CanoEstructuralInputs): CanoEstructuralOutputs {
  const tipo = String(inputs.tipoCano || 'redondo');
  const medida = Number(inputs.medidaExteriorMm);
  const ladoMenor = Number(inputs.ladoMenorMm) || 0;
  const espesor = Number(inputs.espesorMm);
  const largo = Number(inputs.largoMl) || 6;
  const cantidad = Number(inputs.cantidad) || 1;

  if (!medida || medida <= 0) throw new Error('Ingresá la medida exterior en mm');
  if (!espesor || espesor <= 0) throw new Error('Ingresá el espesor de pared en mm');
  if (espesor >= medida / 2) throw new Error('El espesor no puede ser mayor o igual a la mitad de la medida');
  if (largo <= 0) throw new Error('El largo debe ser mayor a 0');
  if (cantidad < 1) throw new Error('La cantidad debe ser al menos 1');

  let pesoMl: number;
  let descripcion: string;

  if (tipo === 'redondo') {
    // Peso = π × D × e × densidad / 10^6
    pesoMl = Math.PI * medida * espesor * DENSIDAD_ACERO / 1_000_000;
    descripcion = `Caño redondo Ø${medida} mm × ${espesor} mm`;
  } else {
    // Cuadrado/rectangular
    const ladoA = medida;
    const ladoB = ladoMenor > 0 ? ladoMenor : medida;
    // Peso = (2×(A+B) - 4×e) × e × densidad / 10^6
    pesoMl = (2 * (ladoA + ladoB) - 4 * espesor) * espesor * DENSIDAD_ACERO / 1_000_000;
    descripcion = ladoMenor > 0
      ? `Caño rectangular ${ladoA}×${ladoB} mm × ${espesor} mm`
      : `Caño cuadrado ${ladoA}×${ladoA} mm × ${espesor} mm`;
  }

  pesoMl = Number(pesoMl.toFixed(2));
  const pesoBarra = Number((pesoMl * largo).toFixed(2));
  const pesoTotal = Number((pesoBarra * cantidad).toFixed(2));

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  return {
    pesoMl,
    pesoBarra,
    pesoTotal,
    detalle: `${descripcion}: ${fmt.format(pesoMl)} kg/m × ${fmt.format(largo)} m = ${fmt.format(pesoBarra)} kg/barra. ${cantidad} barra${cantidad > 1 ? 's' : ''} = ${fmt.format(pesoTotal)} kg total.`,
  };
}
