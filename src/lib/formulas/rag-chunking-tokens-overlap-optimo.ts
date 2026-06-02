/** Tamaño óptimo de chunk y overlap para RAG según largo de doc y modelo embedding */
export interface Inputs { tokensDocumento: number; chunkSizeTokens: number; overlapPct: number; tokensMaxEmbedding: number; }
export interface Outputs { cantidadChunks: number; overlapTokens: number; tokensTotalesEmbedeados: number; eficienciaPct: number; explicacion: string; _insight?: any; _chart?: any; }
export function ragChunkingTokensOverlapOptimo(i: Inputs): Outputs {
  const tokDoc = Number(i.tokensDocumento);
  const chunk = Number(i.chunkSizeTokens);
  const overlapP = Number(i.overlapPct) / 100;
  const tokMax = Number(i.tokensMaxEmbedding);
  if (!tokDoc || tokDoc <= 0) throw new Error('Ingresá tokens del documento');
  if (!chunk || chunk <= 0) throw new Error('Ingresá chunk size');
  if (chunk > tokMax) throw new Error(`Chunk excede el límite del modelo (${tokMax})`);
  const overlapTok = chunk * overlapP;
  const stride = chunk - overlapTok;
  const cantChunks = stride > 0 ? Math.ceil(tokDoc / stride) : 1;
  const tokTotales = cantChunks * chunk;
  const eficiencia = (tokDoc / tokTotales) * 100;

  const redundantes = Math.max(0, Math.round(tokTotales - tokDoc));
  let insightTone: string, insightText: string;
  if (eficiencia >= 85) {
    insightTone = 'good';
    insightText = `Buena configuración: con **${(overlapP * 100).toFixed(0)}% de overlap** solo re-embedeás un **${(100 - eficiencia).toFixed(0)}%** extra. Generás **${cantChunks} chunks** y la eficiencia del **${eficiencia.toFixed(0)}%** mantiene el costo de embeddings ajustado.`;
  } else if (eficiencia >= 60) {
    insightTone = 'neutral';
    insightText = `Eficiencia del **${eficiencia.toFixed(0)}%**: el **${(overlapP * 100).toFixed(0)}% de overlap** agrega **${redundantes.toLocaleString('en-US')} tokens** redundantes sobre los ${tokDoc.toLocaleString('en-US')} del doc. Es un compromiso razonable entre contexto y costo.`;
  } else {
    insightTone = 'warn';
    insightText = `Eficiencia baja (**${eficiencia.toFixed(0)}%**): embedeás **${tokTotales.toLocaleString('en-US')} tokens** para un doc de solo ${tokDoc.toLocaleString('en-US')}. El **${(overlapP * 100).toFixed(0)}% de overlap** o un chunk chico te están inflando el costo: bajá el overlap o agrandá el chunk.`;
  }

  const insight = {
    title: `${cantChunks} chunks · eficiencia ${eficiencia.toFixed(0)}%`,
    text: insightText,
    tone: insightTone,
    icon: '🧩',
  };

  const tokDocRound = Math.round(tokDoc);
  const chart = redundantes > 0
    ? {
        type: 'doughnut' as const,
        slices: [
          { label: 'Tokens del doc', value: tokDocRound },
          { label: 'Redundantes (overlap)', value: redundantes },
        ],
        centerValue: (tokDocRound + redundantes).toLocaleString('en-US'),
        centerLabel: 'Tokens embedeados',
        ariaLabel: 'Composición de los tokens embedeados: tokens útiles del documento más tokens redundantes generados por el overlap.',
      }
    : undefined;

  return {
    cantidadChunks: Number(cantChunks.toFixed(0)),
    overlapTokens: Number(overlapTok.toFixed(0)),
    tokensTotalesEmbedeados: Number(tokTotales.toFixed(0)),
    eficienciaPct: Number(eficiencia.toFixed(2)),
    explicacion: `Doc de ${tokDoc.toLocaleString('en-US')} tokens en chunks de ${chunk} con ${(overlapP * 100).toFixed(0)}% overlap (${overlapTok.toFixed(0)} tok). Total ${cantChunks} chunks, ${tokTotales.toLocaleString('en-US')} tokens embedeados (eficiencia ${eficiencia.toFixed(0)}%).`,
    _insight: insight,
    _chart: chart,
  };
}
