/** Conversor de tazas/cucharadas a gramos y viceversa (cocina) */
export interface Inputs {
  ingrediente: string;
  cantidad: number;
  unidadOrigen: string;
  unidadDestino: string;
}
export interface Outputs {
  resultado: number;
  densidad: number;
  ingrediente: string;
  resumen: string;
}

// Gramos por taza (taza estándar 240 ml)
const DENSIDADES: Record<string, number> = {
  harina_000: 130,
  harina_0000: 125,
  harina_integral: 140,
  azucar_blanca: 200,
  azucar_negra: 220,
  azucar_impalpable: 115,
  arroz_crudo: 200,
  arroz_cocido: 175,
  avena: 85,
  polenta: 170,
  fecula: 120,
  cacao_en_polvo: 100,
  leche: 245,
  leche_en_polvo: 125,
  agua: 240,
  manteca: 227,
  aceite: 218,
  miel: 340,
  dulce_de_leche: 300,
  crema: 240,
  yogur: 245,
  huevo_entero_batido: 243,
  sal_fina: 290,
  sal_gruesa: 270,
  bicarbonato: 220,
  polvo_hornear: 192,
  levadura_seca: 150,
  chocolate_chips: 170,
  pasas_uva: 165,
  nueces_picadas: 120,
  queso_rallado: 100,
  galletas_molidas: 120,
  pan_rallado: 120,
};

// Conversión de volúmenes a ml
const ML: Record<string, number> = {
  taza: 240,
  media_taza: 120,
  cuarto_taza: 60,
  tbsp: 15, // cucharada sopera
  tsp: 5,   // cucharadita
  tbsp_us: 14.79,
  tsp_us: 4.93,
  ml: 1,
};

export function tazasGramos(i: Inputs): Outputs {
  const ing = String(i.ingrediente);
  const c = Number(i.cantidad);
  const uo = String(i.unidadOrigen);
  const ud = String(i.unidadDestino);
  if (!c || c <= 0) throw new Error('Ingresá la cantidad');

  const densidad = DENSIDADES[ing] || 0;
  if (!densidad) throw new Error('Ingrediente no encontrado');

  // Convertir a gramos primero
  let gramos = 0;
  if (uo === 'g') gramos = c;
  else if (uo === 'kg') gramos = c * 1000;
  else if (ML[uo]) {
    const ml = c * ML[uo];
    gramos = (ml * densidad) / 240;
  } else throw new Error('Unidad origen no válida');

  // De gramos a destino
  let resultado = 0;
  if (ud === 'g') resultado = gramos;
  else if (ud === 'kg') resultado = gramos / 1000;
  else if (ML[ud]) {
    const ml = (gramos * 240) / densidad;
    resultado = ml / ML[ud];
  } else throw new Error('Unidad destino no válida');

  const resumen = `${c} ${uo} de ${ing.replace(/_/g, ' ')} = ${resultado.toFixed(2)} ${ud}`;

  return {
    resultado: Number(resultado.toFixed(2)),
    densidad,
    ingrediente: ing.replace(/_/g, ' '),
    resumen,
  };
}
