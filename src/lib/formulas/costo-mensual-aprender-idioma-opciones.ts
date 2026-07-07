export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function costoMensualAprenderIdiomaOpciones(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const m=String(i.metodo||'app');
  const c:Record<string,[string,string,string,string]>={
    app:  ['$0-20',    'Baja (motivación sí)', 'Low (motivation matters)', 'Baixa (motivação importa)'],
    online:['$100-300','Alta 1:1',             'High 1:1',                'Alta 1:1'],
    academia:['$80-200','Media',               'Medium',                  'Média'],
    inmersion:['$1500-3000','Altísima',         'Very high',              'Altíssima'],
  };
  const [co,efEs,efEn,efPt]=c[m]||c.app;
  const ef = __lang === 'en' ? efEn : __lang === 'pt' ? efPt : efEs;
  const resumen = __lang === 'en'
    ? `${m}: ${co}/month, effectiveness ${ef}.`
    : __lang === 'pt'
    ? `${m}: ${co}/mês, efetividade ${ef}.`
    : `${m}: ${co}/mes, efectividad ${ef}.`;

  // Insight por método elegido
  const insightByMethod: Record<string, { tone: string; es: string; en: string; pt: string }> = {
    app: {
      tone: 'neutral',
      es: `Una **app** es lo más barato (**${co}/mes**), pero su efectividad depende casi 100% de tu constancia: sin práctica diaria, el avance es lento. Ideal para complementar, no como único recurso.`,
      en: `An **app** is the cheapest option (**${co}/month**), but its effectiveness depends almost entirely on your consistency: without daily practice, progress is slow. Best as a complement, not your only resource.`,
      pt: `Um **app** é o mais barato (**${co}/mês**), mas sua eficácia depende quase 100% da sua constância: sem prática diária, o avanço é lento. Ideal para complementar, não como único recurso.`,
    },
    online: {
      tone: 'good',
      es: `Las **clases online 1:1** (**${co}/mes**) son de las más efectivas: tenés feedback personalizado y hablás desde el día uno. Es el mejor equilibrio entre precio y resultado si querés avanzar rápido.`,
      en: `**One-on-one online classes** (**${co}/month**) are among the most effective: you get personalized feedback and speak from day one. The best balance of price and results if you want to progress fast.`,
      pt: `As **aulas online 1:1** (**${co}/mês**) estão entre as mais eficazes: você tem feedback personalizado e fala desde o primeiro dia. É o melhor equilíbrio entre preço e resultado se quer avançar rápido.`,
    },
    academia: {
      tone: 'neutral',
      es: `Una **academia** (**${co}/mes**) ofrece estructura y un grupo, con efectividad media: avanzás al ritmo de la clase. Buena opción si te cuesta la autodisciplina y preferís un plan armado.`,
      en: `A **language school** (**${co}/month**) gives you structure and a group, with medium effectiveness: you progress at the class pace. A good option if self-discipline is hard and you prefer a ready-made plan.`,
      pt: `Uma **academia** (**${co}/mês**) oferece estrutura e um grupo, com eficácia média: você avança no ritmo da turma. Boa opção se a autodisciplina é difícil e prefere um plano pronto.`,
    },
    inmersion: {
      tone: 'warn',
      es: `La **inmersión** es la forma más rápida de aprender, pero también la más cara (**${co}/mes**). Reservala para dar un salto grande en poco tiempo; para el día a día, combinala con opciones más económicas.`,
      en: `**Immersion** is the fastest way to learn, but also the most expensive (**${co}/month**). Save it for a big leap in a short time; for everyday learning, pair it with cheaper options.`,
      pt: `A **imersão** é a forma mais rápida de aprender, mas também a mais cara (**${co}/mês**). Reserve-a para dar um grande salto em pouco tempo; para o dia a dia, combine com opções mais econômicas.`,
    },
  };
  const ins = insightByMethod[m] || insightByMethod.app;
  const _insight = {
    title: __lang === 'en' ? 'Cost vs. effectiveness' : __lang === 'pt' ? 'Custo vs. eficácia' : 'Costo vs. efectividad',
    text: __lang === 'en' ? ins.en : __lang === 'pt' ? ins.pt : ins.es,
    tone: ins.tone,
    icon: '🗣️',
  };

  return { mensual:co, efectividad:ef, resumen, _insight };
}
