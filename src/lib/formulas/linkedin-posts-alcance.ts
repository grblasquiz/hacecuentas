/** LinkedIn Posts Alcance */
export interface Inputs { conexiones: number; engagementRate: number; tipoPost: string; }
export interface Outputs { alcanceEstimado: string; multiplicador: string; interaccionesEstimadas: string; recomendacion: string; _insight?: any; }

export function linkedinPostsAlcance(i: Inputs): Outputs {
  const c = Number(i.conexiones);
  const er = Number(i.engagementRate);
  const tp = String(i.tipoPost);
  if (c <= 0 || er <= 0) throw new Error('Valores inválidos');
  const multByTipo: Record<string, number> = {
    'Texto plano': 1.0,
    'Imagen': 1.2,
    'Documento / carrousel': 1.6,
    'Video nativo': 1.5,
    'Poll': 1.8,
    'Artículo largo': 0.6,
  };
  const mult = multByTipo[tp] || 1;
  const base = c * (er / 100) * 100;
  const reach = base * mult;
  const interacciones = Math.round(reach * (er / 100));
  const tip = tp === 'Artículo largo' ? 'Artículos rinden menos en feed pero mejor para SEO y personal brand' : tp === 'Poll' ? 'Polls tienen 80% más reach — usá para preguntas provocativas' : 'Gancho en primeras 200 caracteres + cero links externos en el post';
  const reachR = Math.round(reach);
  let tone: 'good' | 'warn' | 'neutral' = 'neutral';
  let efecto = `mantiene tu alcance base (${mult.toFixed(1)}x)`;
  if (mult > 1) { tone = 'good'; efecto = `amplifica tu alcance **${mult.toFixed(1)}x**`; }
  else if (mult < 1) { tone = 'warn'; efecto = `reduce tu alcance a **${mult.toFixed(1)}x** del base`; }
  const _insight = {
    title: `~${reachR.toLocaleString('es-AR')} impresiones estimadas`,
    text: `Un posteo tipo **${tp}** con ${c.toLocaleString('es-AR')} conexiones y ${er}% de engagement ${efecto}: alrededor de **${reachR.toLocaleString('es-AR')} impresiones** y **${interacciones.toLocaleString('es-AR')} interacciones**.`,
    tone,
    icon: '📊',
  };
  return {
    alcanceEstimado: `${Math.round(reach).toLocaleString('es-AR')} impresiones`,
    multiplicador: `${mult.toFixed(1)}x tu base (${tp})`,
    interaccionesEstimadas: `${interacciones.toLocaleString('es-AR')} interacciones (likes + coms + shares)`,
    recomendacion: tip,
    _insight,
  };
}
