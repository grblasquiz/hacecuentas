/** Negroni */
export interface Inputs { personas: number; tragosPorPersona: number; mlginPorTrago: number; mlcampariPorTrago: number; mlvermouthrossoPorTrago: number; }
export interface Outputs { totalTragos: number; totalgin: string; totalcampari: string; totalvermouthrosso: string; listaCompras: string; }

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

  return {
    totalTragos: tot,
    totalgin: fmt(tGin),
    totalcampari: fmt(tCam),
    totalvermouthrosso: fmt(tVer),
    listaCompras: lista,
  };
}
