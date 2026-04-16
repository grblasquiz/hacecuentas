/** Talla de zapato del bebé por medida del pie o edad */
export interface Inputs { medidasPie?: number; edadBebeMeses?: number; }
export interface Outputs { tallaArgentina: string; tallaEuropea: string; tallaUSA: string; recomendacion: string; }

const tablaPie: { cm: number; ar: number; eu: number; us: number }[] = [
  { cm: 8, ar: 15, eu: 15, us: 0.5 }, { cm: 8.5, ar: 15, eu: 15, us: 0.5 },
  { cm: 9, ar: 16, eu: 16, us: 1 }, { cm: 9.5, ar: 16, eu: 16, us: 1.5 },
  { cm: 10, ar: 17, eu: 17, us: 2 }, { cm: 10.5, ar: 17, eu: 17, us: 2.5 },
  { cm: 11, ar: 18, eu: 18, us: 3 }, { cm: 11.5, ar: 18, eu: 18, us: 3.5 },
  { cm: 12, ar: 19, eu: 19, us: 4 }, { cm: 12.5, ar: 20, eu: 20, us: 4.5 },
  { cm: 13, ar: 21, eu: 21, us: 5 }, { cm: 13.5, ar: 21, eu: 21, us: 5.5 },
  { cm: 14, ar: 22, eu: 22, us: 6 }, { cm: 14.5, ar: 23, eu: 23, us: 6.5 },
  { cm: 15, ar: 24, eu: 24, us: 7 }, { cm: 15.5, ar: 24, eu: 24, us: 7.5 },
  { cm: 16, ar: 25, eu: 25, us: 8 }, { cm: 17, ar: 27, eu: 27, us: 9 },
  { cm: 18, ar: 28, eu: 28, us: 10 }, { cm: 19, ar: 30, eu: 30, us: 11.5 },
  { cm: 20, ar: 31, eu: 31, us: 12.5 }, { cm: 21, ar: 33, eu: 33, us: 1 },
  { cm: 22, ar: 34, eu: 34, us: 2 },
];

const edadACm: Record<number, number> = {
  0: 8, 3: 9, 6: 10, 9: 11, 12: 12, 15: 13, 18: 13.5, 24: 14.5,
  30: 15.5, 36: 16, 42: 17, 48: 18,
};

export function tallaZapatoBebe(i: Inputs): Outputs {
  let cm = Number(i.medidasPie) || 0;
  const edad = Number(i.edadBebeMeses) || 0;

  if (!cm && edad >= 0) {
    const edades = Object.keys(edadACm).map(Number).sort((a, b) => a - b);
    let closest = edades[0];
    for (const e of edades) { if (e <= edad) closest = e; }
    cm = edadACm[closest];
  }

  if (!cm || cm < 7 || cm > 22) throw new Error('Ingresá la medida del pie (7-22 cm) o la edad del bebé');

  let best = tablaPie[0];
  for (const t of tablaPie) { if (t.cm <= cm) best = t; }

  return {
    tallaArgentina: `${best.ar}`,
    tallaEuropea: `${best.eu}`,
    tallaUSA: `${best.us}`,
    recomendacion: `Para pie de ${cm} cm: talla ${best.ar} (AR/EU). Recordá dejar 1-1,5 cm extra entre el dedo y la punta del zapato.`,
  };
}
