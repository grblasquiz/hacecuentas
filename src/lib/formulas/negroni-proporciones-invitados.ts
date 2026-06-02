/** Negroni */
export interface Inputs { personas: number; tragosPorPersona: number; mlginPorTrago: number; mlcampariPorTrago: number; mlvermouthrossoPorTrago: number; }
export interface Outputs { totalTragos: number; totalgin: string; totalcampari: string; totalvermouthrosso: string; listaCompras: string; _insight?: any; _chart?: any; }

export function negroniProporcionesInvitados(i: Inputs): Outputs {
  const p = Number(i.personas);
  const t = Number(i.tragosPorPersona);
  const gin = Number(i.mlginPorTrago);
  const cam = Number(i.mlcampariPorTrago);
  const ver = Number(i.mlvermouthrossoPorTrago);
  if (!p || p <= 0) throw new Error('Ingresá personas');
  if (!t || t <= 0) throw new Error('Ingresá tragos por persona');

  const tot = p * t;
  const tGin = gin * tot;
  const tCam = cam * tot;
  const tVer = ver * tot;
  const fmt = (ml: number) => `${ml}ml (${(ml / 1000).toFixed(2)}L, ${Math.ceil(ml / 750)} botellas 750ml)`;
  const lista = `Gin: ${fmt(Math.ceil(tGin * 1.15))} | Campari: ${fmt(Math.ceil(tCam * 1.15))} | Vermouth: ${fmt(Math.ceil(tVer * 1.15))} | Naranja: ${Math.ceil(tot / 4)} unidades | Hielo: ${(p * 0.5).toFixed(1)} kg`;

  const totalMl = tGin + tCam + tVer;
  const litros = (totalMl / 1000).toFixed(1);
  const insight = {
    title: 'Lo que vas a necesitar',
    text: `Para **${p}** personas (${tot} tragos) salen **${litros} L** de alcohol: **${tGin}ml** de gin, **${tCam}ml** de Campari y **${tVer}ml** de vermouth. Comprá un 15% extra por las dudas y tené listos **${(p * 0.5).toFixed(1)} kg** de hielo.`,
    tone: 'neutral',
    icon: '🍸',
  };
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Gin', value: tGin },
      { label: 'Campari', value: tCam },
      { label: 'Vermouth rosso', value: tVer },
    ],
    prefix: '',
    centerValue: `${totalMl}ml`,
    centerLabel: 'alcohol total',
    ariaLabel: 'Proporción de gin, Campari y vermouth en la receta',
  };

  return {
    totalTragos: tot,
    totalgin: fmt(tGin),
    totalcampari: fmt(tCam),
    totalvermouthrosso: fmt(tVer),
    listaCompras: lista,
    _insight: insight,
    _chart: chart,
  };
}
