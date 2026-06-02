/** Yeast pitch rate */
export interface Inputs { volumenCerveza: number; og: number; tipo: string; formaLevadura: string; }
export interface Outputs { celulasTotal: number; gramosSeca: number; packsLiquida: number; comentario: string; _insight?: any; }

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

  const tipoLabel = tipo === 'lager' ? 'lager' : tipo === 'hybrid' ? 'híbrida' : 'ale';
  const insightTone = og > 1.080 ? 'warn' : tipo === 'lager' ? 'neutral' : 'good';
  const insightText = og > 1.080
    ? `Con OG **${og.toFixed(3)}** es una cerveza fuerte: necesitás **${totalB.toFixed(0)} mil millones** de células (${gramosSeca.toFixed(1)} g de seca o ${packs.toFixed(2)} packs). Hacé un **starter** para que la levadura no se estrese.`
    : tipo === 'lager'
    ? `Una **lager** a OG ${og.toFixed(3)} pide ${totalB.toFixed(0)} mil millones de células: **${gramosSeca.toFixed(1)} g** de seca o **${packs.toFixed(2)} packs** líquidos. Casi el doble que una ale equivalente.`
    : `Pitch estándar para una **${tipoLabel}** a OG ${og.toFixed(3)}: **${totalB.toFixed(0)} mil millones** de células, equivalente a **${gramosSeca.toFixed(1)} g** de levadura seca o ${packs.toFixed(2)} packs líquidos.`;

  return {
    celulasTotal: Number(totalB.toFixed(0)),
    gramosSeca: Number(gramosSeca.toFixed(1)),
    packsLiquida: Number(packs.toFixed(2)),
    comentario: com,
    _insight: {
      title: 'Tu pitch rate',
      text: insightText,
      tone: insightTone,
      icon: '🍺',
    },
  };
}
