/** Yeast pitch rate */
export interface Inputs { volumenCerveza: number; og: number; tipo: string; formaLevadura: string; }
export interface Outputs { celulasTotal: number; gramosSeca: number; packsLiquida: number; comentario: string; }

export function yeastPitchRateCerveza(i: Inputs): Outputs {
  const v = Number(i.volumenCerveza);
  const og = Number(i.og);
  const tipo = String(i.tipo || 'ale');
  if (!v || v <= 0) throw new Error('Ingresá volumen');
  if (!og || og < 1) throw new Error('Ingresá OG');

  const plato = (og - 1) * 1000 / 4;
  const tasa = tipo === 'lager' ? 1.5 : tipo === 'hybrid' ? 1.0 : 0.75;
  const celulasMml = tasa * plato;
  const totalB = (celulasMml * v * 1000) / 1000; // M * ml = billions

  const gramosSeca = totalB / 20;
  const packs = totalB / 100;

  let com = '';
  if (og > 1.080) com = 'Cerveza fuerte — considerá hacer starter o usar 2x packs para evitar stress.';
  else if (tipo === 'lager') com = 'Lager requiere el doble de células que ale. Hacer starter con líquida.';
  else com = 'Pitch rate estándar — rehidratá la seca en agua tibia 15 min.';

  return {
    celulasTotal: Number(totalB.toFixed(0)),
    gramosSeca: Number(gramosSeca.toFixed(1)),
    packsLiquida: Number(packs.toFixed(2)),
    comentario: com,
  };
}
