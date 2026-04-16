/** Piedra de nacimiento por mes */
export interface Inputs { mes: string; }
export interface Outputs { piedra: string; color: string; significado: string; propiedades: string; }

const PIEDRAS: Record<string, { piedra: string; color: string; sig: string; prop: string }> = {
  '1': { piedra: 'Granate', color: 'Rojo oscuro', sig: 'Protección y amistad', prop: 'Se cree que protege en viajes, fortalece la amistad y equilibra la energía emocional.' },
  '2': { piedra: 'Amatista', color: 'Púrpura', sig: 'Sabiduría y serenidad', prop: 'Asociada a la calma mental, la intuición y la protección contra energías negativas.' },
  '3': { piedra: 'Aguamarina', color: 'Azul claro', sig: 'Calma y coraje', prop: 'Conectada con el mar, favorece la comunicación clara y el coraje interior.' },
  '4': { piedra: 'Diamante', color: 'Transparente/blanco', sig: 'Fortaleza y amor eterno', prop: 'Símbolo de pureza, invencibilidad y compromiso eterno.' },
  '5': { piedra: 'Esmeralda', color: 'Verde', sig: 'Renacimiento y fertilidad', prop: 'Asociada a la abundancia, el amor incondicional y la renovación.' },
  '6': { piedra: 'Perla / Alejandrita', color: 'Blanco / multicolor', sig: 'Pureza y equilibrio', prop: 'Representa la pureza, la sabiduría ganada con experiencia y el equilibrio emocional.' },
  '7': { piedra: 'Rubí', color: 'Rojo intenso', sig: 'Pasión y vitalidad', prop: 'Piedra del corazón, asociada a la pasión, el coraje y la energía vital.' },
  '8': { piedra: 'Peridoto', color: 'Verde oliva', sig: 'Fuerza y protección', prop: 'Asociado a la luz, la fuerza interior y la protección contra pesadillas.' },
  '9': { piedra: 'Zafiro', color: 'Azul', sig: 'Sabiduría y nobleza', prop: 'Piedra de la realeza, promueve la sabiduría, la lealtad y la verdad.' },
  '10': { piedra: 'Ópalo / Turmalina', color: 'Multicolor / rosa', sig: 'Creatividad y esperanza', prop: 'Estimula la creatividad, la imaginación y la esperanza. Cada ópalo es único.' },
  '11': { piedra: 'Topacio / Citrino', color: 'Amarillo / naranja', sig: 'Abundancia y energía', prop: 'Atrae prosperidad, fortalece la confianza y canaliza energía positiva.' },
  '12': { piedra: 'Tanzanita / Turquesa', color: 'Azul / turquesa', sig: 'Transformación y suerte', prop: 'Favorece la transformación personal, la buena suerte y la comunicación espiritual.' },
};

export function piedraNacimiento(i: Inputs): Outputs {
  const mes = String(i.mes);
  const data = PIEDRAS[mes];
  if (!data) throw new Error('Seleccioná un mes válido');
  return { piedra: data.piedra, color: data.color, significado: data.sig, propiedades: data.prop };
}
