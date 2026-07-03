/** Esmalte para pintar rejas y estructuras metálicas según su tipo y superficie. */
export interface Inputs {
  largo_reja_m?: number | string;
  alto_m?: number | string;
  tipo_reja?: string;
  manos?: number | string;
  __country?: string;
}

export interface Outputs {
  pintura_litros: number;
  area_pintar: number;
  latas_1l: number;
  resumen: string;
  _insight?: any;
}

export function pinturaRejasMetalLitros(i: Inputs): Outputs {
  const largo = Math.max(0, Number(i.largo_reja_m) || 0);
  const alto = Math.max(0, Number(i.alto_m) || 0);
  const tipo = String(i.tipo_reja || 'barrotes');
  const manos = Math.max(1, Math.floor(Number(i.manos) || 1));

  const factorMap: Record<string, number> = { barrotes: 1.6, tejido: 2.2, macizo: 2.0 };
  const factor = factorMap[tipo] ?? 1.6;

  const areaFrontal = largo * alto;
  // Redondeo a 4 decimales para limpiar el error de coma flotante antes de aplicar Math.ceil.
  const areaMetal = Math.round(areaFrontal * factor * manos * 10000) / 10000;
  const area_pintar = areaMetal > 0 ? Math.ceil(areaMetal * 100) / 100 : 0;
  // Rinde 12 m²/L de esmalte sintético.
  const litrosBruto = Math.round((area_pintar / 12) * 10000) / 10000;
  const pintura_litros = area_pintar > 0 ? Math.ceil(litrosBruto * 100) / 100 : 0;
  const latas_1l = pintura_litros > 0 ? Math.ceil(pintura_litros) : 0;

  const tipoTxt =
    tipo === 'tejido' ? 'tejido / romboidal' : tipo === 'macizo' ? 'chapa / macizo' : 'barrotes';

  const resumen = pintura_litros > 0
    ? `Para una reja de ${tipoTxt} de ${largo} × ${alto} m a ${manos} mano(s) hay que cubrir ${area_pintar} m² de metal: ${pintura_litros} L de esmalte, o sea ${latas_1l} lata(s) de 1 L.`
    : 'Cargá el largo y el alto de la reja para calcular la pintura.';

  const out: Outputs = { pintura_litros, area_pintar, latas_1l, resumen };

  if (pintura_litros > 0) {
    out._insight = {
      title: 'Cuánto esmalte comprar',
      text: `Necesitás **${pintura_litros} L** de esmalte (**${latas_1l} lata(s)** de 1 L) para cubrir **${area_pintar} m²** de superficie metálica a ${manos} mano(s). Las rejas tienen mucho más metal que su frente aparente, por eso se aplica un factor según el tipo.`,
      tone: 'neutral',
      icon: '🎨',
    };
  }

  return out;
}
