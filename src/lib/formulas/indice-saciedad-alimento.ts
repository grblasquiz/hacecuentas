/**
 * Índice de saciedad Holt 1995.
 */

const SI_TABLE: Record<string, { si: number; nombre: string }> = {
  papa_hervida: { si: 323, nombre: 'Papa hervida' },
  pescado: { si: 225, nombre: 'Pescado blanco' },
  avena: { si: 209, nombre: 'Avena' },
  naranja: { si: 202, nombre: 'Naranja' },
  manzana: { si: 197, nombre: 'Manzana' },
  pasta_integral: { si: 188, nombre: 'Pasta integral' },
  carne: { si: 176, nombre: 'Carne magra' },
  huevo: { si: 150, nombre: 'Huevo' },
  queso: { si: 146, nombre: 'Queso' },
  arroz_blanco: { si: 138, nombre: 'Arroz blanco' },
  lenteja: { si: 133, nombre: 'Lenteja' },
  pan_integral: { si: 154, nombre: 'Pan integral' },
  pan_blanco: { si: 100, nombre: 'Pan blanco' },
  cereal_azucarado: { si: 118, nombre: 'Cereal azucarado' },
  yogur: { si: 88, nombre: 'Yogur' },
  banana: { si: 118, nombre: 'Banana' },
  papa_frita: { si: 116, nombre: 'Papas fritas' },
  galletita: { si: 120, nombre: 'Galletitas' },
  chocolate: { si: 70, nombre: 'Chocolate' },
  mani: { si: 84, nombre: 'Maní' },
  helado: { si: 96, nombre: 'Helado' },
  torta: { si: 65, nombre: 'Torta' },
  donut: { si: 68, nombre: 'Donut' },
  croissant: { si: 47, nombre: 'Croissant' },
};

export interface IndiceSaciedadAlimentoInputs {
  alimento: string;
}

export interface IndiceSaciedadAlimentoOutputs {
  si: number;
  clasificacion: string;
  comparacion: string;
  _chart?: any;
}

export function indiceSaciedadAlimento(inputs: IndiceSaciedadAlimentoInputs): IndiceSaciedadAlimentoOutputs {
  const data = SI_TABLE[inputs.alimento];
  if (!data) throw new Error('Seleccioná un alimento válido');
  let clasif = '';
  if (data.si >= 200) clasif = 'Muy saciante ✅';
  else if (data.si >= 130) clasif = 'Saciante';
  else if (data.si >= 100) clasif = 'Saciedad media';
  else clasif = 'Poco saciante ⚠️';
  const ratio = (data.si / 100).toFixed(1);
  const chart = {
    type: 'scale' as const,
    marker: data.si,
    markerLabel: 'IS: ' + data.si,
    min: 0,
    unit: '',
    segments: [
      { nombre: 'Poco saciante', max: 99, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Saciedad media', max: 129, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Saciante', max: 199, color: '#d9f99d', colorDark: '#3f6212' },
      { nombre: 'Muy saciante', max: Math.max(330, Math.ceil(data.si) + 10), color: '#bbf7d0', colorDark: '#166534' },
    ],
    ariaLabel: 'Escala de índice de saciedad Holt (pan blanco = 100): poco saciante menos de 100, muy saciante 200 o más',
  };
  return {
    si: data.si,
    clasificacion: clasif,
    comparacion: `Sacia ${ratio}× el pan blanco (referencia).`,
    _chart: chart,
  };
}
