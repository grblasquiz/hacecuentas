export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: any; }

/**
 * Homemade Bonbon Chocolate Calculator
 *
 * Real formula:
 *   coberturaNetaPorBombon = peso_por_bombon * (1 - filling_pct / 100)
 *   chocolateBruto         = (coberturaNetaPorBombon * cantidad) / (1 - merma_pct / 100)
 *
 * Sources:
 *   - INTI – Fichas técnicas de confitería y chocolate (inti.gob.ar)
 *   - Código Alimentario Argentino, Capítulo X, Art. 784 (cobertura ≥31% manteca de cacao)
 *   - Valrhona & Cacao Barry professional tempering guides (industry standard waste 5–10%)
 */
export function kilosChocolateCaseroBombonesReceta(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';

  const cantidad = Math.max(0, Number(i.cantidad) || 0);   // number of bonbons
  const peso     = Math.max(0, Number(i.peso)     || 0);   // g per bonbon (total weight)
  const relleno  = Math.min(100, Math.max(0, Number(i.relleno) !== Number(i.relleno) ? 0 : Number(i.relleno) || 0));  // % filling (0 = solid)
  const merma    = Math.min(30,  Math.max(0, Number(i.merma)   !== Number(i.merma)   ? 6 : Number(i.merma)   || 6));  // % tempering waste

  // Chocolate shell fraction of each bonbon's weight (1.0 = solid, 0.55 when 45% is filling)
  const coberturaFraction = 1 - relleno / 100;

  // Net chocolate weight needed per bonbon (shell/coating only)
  const coberturaNetaPorBombon = peso * coberturaFraction;

  // Total net chocolate for all bonbons
  const chocolateNeto = coberturaNetaPorBombon * cantidad;

  // Gross chocolate to weigh before tempering — divides by (1 - waste_fraction)
  // so that after losing `merma`% you still have enough for all shells
  const chocolateBruto = merma < 100 && chocolateNeto > 0
    ? chocolateNeto / (1 - merma / 100)
    : 0;

  // Total filling weight
  const rellenoTotal = peso * (relleno / 100) * cantidad;

  // Purchase recommendation: round up to nearest 50 g
  const compraRecomendada = chocolateBruto > 0 ? Math.ceil(chocolateBruto / 50) * 50 : 0;

  // How many 1 kg blocks to buy
  const bloques1kg = chocolateBruto > 0 ? Math.ceil(chocolateBruto / 1000) : 0;

  const fmt     = (n: number) => n.toFixed(0);
  const fmtDec  = (n: number) => n.toFixed(1);
  const empty   = cantidad === 0 || peso === 0;

  // Build text per language
  const blockInfo = (lang: 'es' | 'en' | 'pt'): string => {
    if (lang === 'en') {
      return bloques1kg > 0
        ? `${bloques1kg} × 1 kg block${bloques1kg !== 1 ? 's' : ''}`
        : '';
    } else if (lang === 'pt') {
      return bloques1kg > 0
        ? `${bloques1kg} tablete${bloques1kg !== 1 ? 's' : ''} de 1 kg`
        : '';
    } else {
      return bloques1kg > 0
        ? `${bloques1kg} bloque${bloques1kg !== 1 ? 's' : ''} de 1 kg`
        : '';
    }
  };

  const fillingNote = (lang: 'es' | 'en' | 'pt'): string => {
    if (rellenoTotal === 0) return '';
    if (lang === 'en') return ` Filling: ~${fmt(rellenoTotal)} g total (ganache, caramel, praline, etc.).`;
    if (lang === 'pt') return ` Recheio total: ~${fmt(rellenoTotal)} g (ganache, brigadeiro, etc.).`;
    return ` Relleno total: ~${fmt(rellenoTotal)} g (ganache, dulce de leche, praliné, etc.).`;
  };

  let resumen: string;
  let insight: { title: string; text: string; tone: string; icon: string };

  if (__lang === 'en') {
    resumen = empty
      ? 'Enter the number of bonbons and weight per bonbon to get your chocolate amount.'
      : `For **${cantidad} bonbons** of **${peso} g** each (${relleno}% filling, ${merma}% tempering waste): weigh out **${fmt(chocolateBruto)} g** of couverture before tempering — buy approximately **${compraRecomendada} g** (${blockInfo('en')}).${fillingNote('en')}`;
    insight = {
      title: 'Couverture to Buy',
      text: !empty
        ? `Weigh out **${fmt(chocolateBruto)} g** → buy **${compraRecomendada} g** (rounded up to nearest 50 g). Shell per bonbon: **${fmtDec(coberturaNetaPorBombon)} g**. Includes ${merma}% tempering waste.`
        : 'Enter values to calculate.',
      tone: 'positive',
      icon: '🍫',
    };
  } else if (__lang === 'pt') {
    resumen = empty
      ? 'Informe a quantidade de bombons e o peso por bombom para calcular o chocolate necessário.'
      : `Para **${cantidad} bombons** de **${peso} g** cada (${relleno}% de recheio, ${merma}% de perda na temperagem): pese **${fmt(chocolateBruto)} g** de cobertura antes de temperar — compre aproximadamente **${compraRecomendada} g** (${blockInfo('pt')}).${fillingNote('pt')}`;
    insight = {
      title: 'Cobertura a Comprar',
      text: !empty
        ? `Pese **${fmt(chocolateBruto)} g** antes de temperar → compre **${compraRecomendada} g** (arredondado para múltiplo de 50 g). Casca por bombom: **${fmtDec(coberturaNetaPorBombon)} g**. Perda de ${merma}% na temperagem incluída.`
        : 'Informe os valores para calcular.',
      tone: 'positive',
      icon: '🍫',
    };
  } else {
    resumen = empty
      ? 'Ingresá la cantidad de bombones y el peso por pieza para calcular el chocolate necesario.'
      : `Para **${cantidad} bombones** de **${peso} g** c/u (${relleno}% de relleno, ${merma}% de merma): pesá **${fmt(chocolateBruto)} g** de cobertura antes de templar — comprá aproximadamente **${compraRecomendada} g** (${blockInfo('es')}).${fillingNote('es')}`;
    insight = {
      title: 'Cobertura a comprar',
      text: !empty
        ? `Pesá **${fmt(chocolateBruto)} g** antes de templar → comprá **${compraRecomendada} g** (redondeado al múltiplo de 50 g más cercano). Cobertura por bombón: **${fmtDec(coberturaNetaPorBombon)} g**. Incluye ${merma}% de merma.`
        : 'Ingresá los valores para calcular.',
      tone: 'positive',
      icon: '🍫',
    };
  }

  return {
    resultado: chocolateBruto > 0 ? fmt(chocolateBruto) : '0',
    resumen,
    _insight: insight,
  };
}
