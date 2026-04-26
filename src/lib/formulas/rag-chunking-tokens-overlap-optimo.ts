/** Tamaño óptimo de chunk y overlap para RAG según largo de doc y modelo embedding */
export interface Inputs { tokensDocumento: number; chunkSizeTokens: number; overlapPct: number; tokensMaxEmbedding: number; }
export interface Outputs { cantidadChunks: number; overlapTokens: number; tokensTotalesEmbedeados: number; eficienciaPct: number; explicacion: string; }
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
  return {
    cantidadChunks: Number(cantChunks.toFixed(0)),
    overlapTokens: Number(overlapTok.toFixed(0)),
    tokensTotalesEmbedeados: Number(tokTotales.toFixed(0)),
    eficienciaPct: Number(eficiencia.toFixed(2)),
    explicacion: `Doc de ${tokDoc.toLocaleString('en-US')} tokens en chunks de ${chunk} con ${(overlapP * 100).toFixed(0)}% overlap (${overlapTok.toFixed(0)} tok). Total ${cantChunks} chunks, ${tokTotales.toLocaleString('en-US')} tokens embedeados (eficiencia ${eficiencia.toFixed(0)}%).`,
  };
}
