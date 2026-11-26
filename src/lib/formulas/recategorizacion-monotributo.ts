import { CATEGORIAS, PARAMS_FISICOS, PRECIO_UNITARIO_MAX_BIENES, TOPES } from '../data/monotributo-2026.ts';

type Valores = {
  ingresos: number;
  alquiler: number;
  superficie: number;
  energia: number;
  precio: number;
};

export function recategorizacionMonotributo(valores: Valores) {
  const parametros = [
    { label: 'Ingresos brutos', value: valores.ingresos, tope: TOPES },
    { label: 'Alquiler devengado', value: valores.alquiler, tope: Object.fromEntries(CATEGORIAS.map(cat => [cat, PARAMS_FISICOS[cat].alquiler])) },
    { label: 'Superficie afectada', value: valores.superficie, tope: Object.fromEntries(CATEGORIAS.map(cat => [cat, PARAMS_FISICOS[cat].superficie])) },
    { label: 'Energía eléctrica', value: valores.energia, tope: Object.fromEntries(CATEGORIAS.map(cat => [cat, PARAMS_FISICOS[cat].energia])) },
  ].map(parametro => ({
    label: parametro.label,
    categoria: CATEGORIAS.find(cat => parametro.value <= parametro.tope[cat]) ?? null,
  }));
  const precioExcedido = valores.precio > PRECIO_UNITARIO_MAX_BIENES;
  const categoria = precioExcedido || parametros.some(parametro => parametro.categoria === null)
    ? null
    : CATEGORIAS.find(cat => parametros.every(parametro => CATEGORIAS.indexOf(parametro.categoria!) <= CATEGORIAS.indexOf(cat))) ?? null;
  return { parametros, categoria, precioExcedido, margenIngresos: categoria ? Math.round((TOPES[categoria] - valores.ingresos) * 100) / 100 : null };
}
