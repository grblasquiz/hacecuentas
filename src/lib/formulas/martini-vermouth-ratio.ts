/** Dry Martini */
export interface Inputs { personas: number; tragosPorPersona: number; mlginPorTrago: number; mlvermouthdryPorTrago: number; }
export interface Outputs { totalTragos: number; totalgin: string; totalvermouthdry: string; listaCompras: string; ratio: string; }

export function martiniVermouthRatio(i: Inputs): Outputs {
  const p = Number(i.personas);
  const t = Number(i.tragosPorPersona);
  const g = Number(i.mlginPorTrago);
  const v = Number(i.mlvermouthdryPorTrago);
  if (!p || p <= 0) throw new Error('Ingresá personas');
  if (!t || t <= 0) throw new Error('Ingresá tragos por persona');

  const tot = p * t;
  const ratio = v > 0 ? `${(g / v).toFixed(1)}:1 ${g/v > 8 ? '(very dry)' : g/v > 4 ? '(dry clásico)' : g/v > 2 ? '(wet)' : '(muy wet)'}` : 'Infinito (sin vermouth)';
  const fmt = (ml: number) => `${ml}ml`;
  const lista = `Gin: ${fmt(Math.ceil(g * tot * 1.15))} (${Math.ceil(g * tot * 1.15 / 750)} bot) | Vermouth dry: ${fmt(Math.ceil(v * tot * 1.15))} | Aceitunas verdes: ${tot} | Hielo: ${(p * 0.3).toFixed(1)}kg`;

  return {
    totalTragos: tot,
    totalgin: fmt(g * tot),
    totalvermouthdry: fmt(v * tot),
    listaCompras: lista,
    ratio,
  };
}
