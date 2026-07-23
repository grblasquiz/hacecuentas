/** Gelatina sin sabor: gramos por litro según firmeza, sobres y hojas */
export interface Inputs {
  volumen?: number;
  firmeza?: string;
  __lang?: string;
}
export interface Outputs {
  gramos: number;
  sobres: number;
  hojas: number;
  dosis: number;
  aguaHidratacion: number;
  _insight?: any;
}

const DOSIS: Record<string, { gPorLitro: number; label: string }> = {
  blanda: { gPorLitro: 10, label: 'blanda (tipo natilla, se sirve en copa)' },
  estandar: { gPorLitro: 14, label: 'estándar (gelatina clásica de postre)' },
  firme: { gPorLitro: 20, label: 'firme para desmoldar (flanes, terrinas)' },
  'muy-firme': { gPorLitro: 28, label: 'muy firme (cortar en cubos, capas de torta)' },
};

const SOBRE_G = 7; // sobre estándar de gelatina sin sabor
const HOJA_G = 2; // hoja tipo "plata" ≈ 1.6-2 g

export function gelatinaSinSaborGramosPorLitro(i: Inputs): Outputs {
  const volumen = Number(i.volumen) || 0;
  const firmeza = String(i.firmeza || 'estandar');

  if (volumen <= 0) throw new Error('Ingresá un volumen de líquido mayor a 0 ml');
  const cfg = DOSIS[firmeza] || DOSIS['estandar'];

  const gramos = (volumen / 1000) * cfg.gPorLitro;
  const sobres = gramos / SOBRE_G;
  const hojas = gramos / HOJA_G;
  const aguaHidratacion = gramos * 5;

  const gramosR = Number(gramos.toFixed(1));

  return {
    gramos: gramosR,
    sobres: Number(sobres.toFixed(1)),
    hojas: Number(hojas.toFixed(1)),
    dosis: cfg.gPorLitro,
    aguaHidratacion: Number(aguaHidratacion.toFixed(0)),
    _insight: {
      title: 'Qué te dice el resultado',
      text: `Para ${volumen.toLocaleString('es-AR')} ml de líquido con firmeza ${cfg.label} necesitás **${gramosR.toLocaleString('es-AR')} g de gelatina sin sabor** (${Number(sobres.toFixed(1)).toLocaleString('es-AR')} ${sobres === 1 ? 'sobre' : 'sobres'} de 7 g o ${Number(hojas.toFixed(1)).toLocaleString('es-AR')} hojas de 2 g). Hidratala primero en ~${Number(aguaHidratacion.toFixed(0))} ml de líquido frío y nunca la hiervas.`,
      tone: 'neutral',
      icon: '🍮',
    },
  };
}
