export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; }
export function pinturaMueblesBarnizLataCobertura(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  // Inputs
  const superficie = Number(i.superficie) || 0;       // m² total surface
  const manos = Number(i.manos) || 1;                 // number of coats
  const rendimiento = Number(i.rendimiento) || 12;    // m²/L coverage rate
  const litros_lata = Number(i.litros_lata) || 1;     // liters per can

  // Validation
  if (superficie <= 0 || manos <= 0 || rendimiento <= 0 || litros_lata <= 0) {
    const errMsg = __lang === 'en'
      ? 'Enter all values greater than zero.'
      : 'Ingresá todos los valores mayores que cero.';
    return { resultado: '—', litros_totales: '—', resumen: errMsg, _insight: null };
  }

  // Core formula:
  // Total liters needed = (superficie × manos) ÷ rendimiento
  // Cans needed = ceil(total_liters / litros_lata)
  const litrosTotales = (superficie * manos) / rendimiento;
  const latasExactas = litrosTotales / litros_lata;
  const latasNecesarias = Math.ceil(latasExactas);

  // 10% waste margin suggestion
  const litrosConMargen = litrosTotales * 1.10;
  const latasConMargen = Math.ceil(litrosConMargen / litros_lata);

  const litrosTotalesStr = litrosTotales.toFixed(2);
  const latasStr = latasNecesarias.toString();

  const resumenText = __lang === 'en'
    ? `You need ${litrosTotalesStr} L total (${latasNecesarias} can${latasNecesarias !== 1 ? 's' : ''} × ${litros_lata} L). With a 10% waste margin: ${Math.ceil(litrosConMargen * 100) / 100} L → ${latasConMargen} can${latasConMargen !== 1 ? 's' : ''}.`
    : `Necesitás ${litrosTotalesStr} L en total (${latasNecesarias} lata${latasNecesarias !== 1 ? 's' : ''} de ${litros_lata} L). Con margen del 10% por desperdicio: ${Math.ceil(litrosConMargen * 100) / 100} L → ${latasConMargen} lata${latasConMargen !== 1 ? 's' : ''}.`;

  const _insight = {
    title: __lang === 'en' ? 'Cans to buy' : 'Latas a comprar',
    text: __lang === 'en'
      ? `**${latasNecesarias} can${latasNecesarias !== 1 ? 's' : ''}** of ${litros_lata} L (${litrosTotalesStr} L needed for ${superficie} m² × ${manos} coat${manos !== 1 ? 's' : ''} at ${rendimiento} m²/L). Always buy **${latasConMargen} can${latasConMargen !== 1 ? 's' : ''}** to cover end grain, edges and touch-ups (10% buffer).`
      : `**${latasNecesarias} lata${latasNecesarias !== 1 ? 's' : ''}** de ${litros_lata} L (${litrosTotalesStr} L para ${superficie} m² × ${manos} mano${manos !== 1 ? 's' : ''} a ${rendimiento} m²/L). Comprá siempre **${latasConMargen} lata${latasConMargen !== 1 ? 's' : ''}** para contemplar cantos, molduras y retoques (margen del 10%).`,
    tone: 'neutral' as const,
    icon: '🪑',
  };

  return {
    resultado: latasStr,
    litros_totales: litrosTotalesStr,
    resumen: resumenText,
    _insight,
  };
}
