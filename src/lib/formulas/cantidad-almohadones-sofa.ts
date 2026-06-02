export interface Inputs { largoSofaCm: number; estilo?: string; }
export interface Outputs { cantidad: number; distribucion: string; colores: string; regla: string; _insight?: any; }
export function cantidadAlmohadonesSofa(i: Inputs): Outputs {
  const largo = Number(i.largoSofaCm); if (!largo) throw new Error('Ingresá el largo del sofá');
  const estilo = String(i.estilo || 'moderno');
  const cuerpos = largo <= 160 ? 2 : largo <= 230 ? 3 : 4;
  let cant = 0; let dist = ''; let colores = ''; let regla = '';
  if (estilo === 'minimalista') { cant = cuerpos; dist = `${cant} almohadones de 45×45 cm`; colores = '1-2 colores neutros: blanco, gris, negro'; regla = 'Menos es más: 1 almohadón por asiento en colores neutros.'; }
  else if (estilo === 'moderno') { cant = cuerpos + 2; dist = `${Math.ceil(cant*0.5)} de 50×50 cm + ${Math.floor(cant*0.5)} de 30×50 cm`; colores = '2-3 colores: base neutra + 1 color acento'; regla = 'Número impar (3 o 5) queda mejor visualmente. Mezclá 2 tamaños.'; }
  else if (estilo === 'clasico') { cant = cuerpos + 3; dist = `${Math.ceil(cant*0.4)} de 50×50 + ${Math.ceil(cant*0.3)} de 45×45 + ${Math.floor(cant*0.3)} de 30×30 (lumbar)`; colores = '3-4 colores coordinados: base + complementario + acento + metálico'; regla = 'Simétrico: espejá la distribución en ambos lados del sofá.'; }
  else { cant = cuerpos + 4; dist = `Mezcla libre: ${cant} almohadones de distintos tamaños (30-60 cm)`; colores = '4-5 colores y texturas: liso + estampado + tejido + terciopelo'; regla = 'Todo vale: mezclá texturas, tamaños y estampas. Más es más.'; }
  const estiloNombre: Record<string, string> = { minimalista: 'minimalista', moderno: 'moderno', clasico: 'clásico' };
  const estiloLabel = estiloNombre[estilo] || 'ecléctico';
  const _insight = {
    title: 'Cuántos almohadones poné',
    text: `Tu sofá de **${largo} cm** (${cuerpos} cuerpos) en estilo **${estiloLabel}** pide **${cant} almohadones**. ${cant % 2 === 1 ? 'Al ser número **impar**, ya queda equilibrado a la vista.' : 'Para que no se vea tan rígido, jugá con **dos tamaños distintos** y evitá alinearlos en simetría perfecta.'}`,
    tone: 'neutral',
    icon: '🛋️'
  };
  return { cantidad: cant, distribucion: dist, colores, regla, _insight };
}