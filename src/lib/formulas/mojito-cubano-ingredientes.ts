/** Mojito */
export interface Inputs { personas: number; tragosPorPersona: number; mlronblancoPorTrago: number; mlazucarPorTrago: number; mljugodelimaPorTrago: number; mlsodaPorTrago: number; mlhojasdementaPorTrago: number; }
export interface Outputs { totalTragos: number; totalronblanco: string; totalazucar: string; totaljugodelima: string; totalsoda: string; totalhojasdementa: string; listaCompras: string; _insight?: any; _chart?: any; }

export function mojitoCubanoIngredientes(i: Inputs): Outputs {
  const p = Number(i.personas);
  const t = Number(i.tragosPorPersona);
  const r = Number(i.mlronblancoPorTrago);
  const a = Number(i.mlazucarPorTrago);
  const l = Number(i.mljugodelimaPorTrago);
  const s = Number(i.mlsodaPorTrago);
  const m = Number(i.mlhojasdementaPorTrago);
  if (!p || p <= 0) throw new Error('Ingresá personas');
  if (!t || t <= 0) throw new Error('Ingresá tragos por persona');

  const tot = p * t;
  const limones = Math.ceil((l * tot) / 30);
  const fmt = (ml: number) => `${ml}ml`;
  const lista = `Ron blanco: ${Math.ceil(r * tot * 1.15)}ml (${Math.ceil(r * tot * 1.15 / 750)} botellas) | Azúcar: ${Math.ceil(a * tot * 1.1)}g | Limas: ${limones} | Soda: ${Math.ceil(s * tot * 1.15)}ml | Menta: ${Math.ceil(m * tot / 8)} atados grandes | Hielo: ${(p * 0.8).toFixed(1)}kg`;

  // Compra real de ron (con 15% de margen) y botellas, para el insight
  const ronCompraMl = Math.ceil(r * tot * 1.15);
  const botellas = Math.ceil(ronCompraMl / 750);
  const hieloKg = (p * 0.8).toFixed(1);
  const _insight = {
    title: `Para ${tot} mojitos`,
    text: `Necesitás **${botellas} ${botellas === 1 ? 'botella' : 'botellas'}** de ron (${ronCompraMl}ml con margen), **${limones} limas** y unos **${hieloKg}kg de hielo**. Salen **${tot} tragos** para ${p} ${p === 1 ? 'persona' : 'personas'}.`,
    tone: 'neutral',
    icon: '🍹',
  };

  // Gráfico: perfil líquido del trago (ron + lima + soda), suma = volumen líquido total
  const totalLiquidoMl = r * tot + l * tot + s * tot;
  let _chart: any;
  if (totalLiquidoMl > 0) {
    _chart = {
      type: 'doughnut',
      slices: [
        { label: 'Ron blanco', value: r * tot },
        { label: 'Jugo de lima', value: l * tot },
        { label: 'Soda', value: s * tot },
      ].filter(s => s.value > 0),
      suffix: 'ml',
      centerValue: `${totalLiquidoMl}ml`,
      centerLabel: 'Líquido total',
      ariaLabel: 'Proporción de ron, jugo de lima y soda en la preparación',
    };
  }

  return {
    totalTragos: tot,
    totalronblanco: fmt(r * tot),
    totalazucar: `${a * tot} g`,
    totaljugodelima: fmt(l * tot),
    totalsoda: fmt(s * tot),
    totalhojasdementa: `${m * tot} hojas (${Math.ceil(m * tot / 8)} atados)`,
    listaCompras: lista,
    _insight,
    _chart,
  };
}
