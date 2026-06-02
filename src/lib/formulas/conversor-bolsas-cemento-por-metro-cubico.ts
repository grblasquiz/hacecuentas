/** Conversor: metro cúbico ↔ bolsa de cemento */
export interface Inputs { valor: number | string; direccion?: string; ingrediente?: string; }
export interface Outputs { resultado: string; resumen: string; _insight?: any; }

export function conversorBolsasCementoPorMetroCubico(i: Inputs): Outputs {
  const v = Number(i.valor);
  if (isNaN(v)) return { resultado: '—', resumen: 'Ingresá un valor numérico.' };
  const d = String(i.direccion || 'ida');
  const factor = 7.0;
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {
    r = v * factor;
    fromLabel = 'metros cúbicos'; toLabel = 'bolsas de cemento';
  } else {
    r = v / factor;
    fromLabel = 'bolsas de cemento'; toLabel = 'metros cúbicos';
  }
  const rFmt = r.toFixed(4).replace(/\.?0+$/, '');
  const _insight = d === 'ida'
    ? {
        title: 'Cuántas bolsas comprar',
        text: `Para **${v} m³** de hormigón vas a necesitar unas **${rFmt} bolsas** de 50 kg (aprox. **${Math.ceil(r)} bolsas** enteras al redondear). Es una estimación de dosificación estándar (~7 bolsas/m³): según la resistencia que busques el cemento puede variar, así que sumá un 5-10% de margen por desperdicio.`,
        tone: 'neutral',
        icon: '🧱',
      }
    : {
        title: 'A cuánto hormigón rinde',
        text: `**${v} bolsas** de cemento de 50 kg rinden aproximadamente **${rFmt} m³** de hormigón (dosificación estándar de ~7 bolsas/m³). Es una guía: la mezcla real depende de la proporción de arena, piedra y agua, y de la resistencia que necesites.`,
        tone: 'neutral',
        icon: '🧱',
      };

  return {
    resultado: r.toFixed(6).replace(/\.?0+$/, '') + ' ' + 'bolsas'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toLabel + '.',
    _insight
  };
}
