export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function huellaCarbonoRopaArmarioAnual(i: Inputs): Outputs {
  const r = Number(i.remeras) || 0; const p = Number(i.pantalones) || 0;
  const z = Number(i.zapatos) || 0; const a = Number(i.abrigos) || 0;
  const co2 = r * 7 + p * 11 + z * 14 + a * 20;
  const co2R = r * 7; const co2P = p * 11; const co2Z = z * 14; const co2A = a * 20;
  // Auto destacado: la prenda que más pesa en la huella
  const partes = [
    { label: 'Remeras', value: co2R },
    { label: 'Pantalones', value: co2P },
    { label: 'Zapatos', value: co2Z },
    { label: 'Abrigos', value: co2A },
  ].filter(s => s.value > 0);
  const mayor = partes.slice().sort((x, y) => y.value - x.value)[0];
  const fmt = (n: number) => new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(n);
  const tone = co2 >= 200 ? 'warn' : 'good';
  const _insight = {
    title: 'Tu armario en CO₂',
    text: co2 <= 0
      ? 'Cargá las prendas que comprás al año para estimar la **huella de carbono** de tu ropa.'
      : `Tu ropa nueva del año suma **${fmt(co2)} kg de CO₂**${mayor ? `, donde **${mayor.label.toLowerCase()}** son lo que más pesa (**${fmt(mayor.value)} kg**)` : ''}. Comprar menos y elegir calidad puede bajarlo hasta **-60%**.`,
    tone,
    icon: '👕',
  };
  const out: Outputs = { kgCo2: co2.toFixed(0) + ' kg', resumen: `${co2.toFixed(0)} kg CO₂/año en ropa. Regla: comprar menos + calidad = -60%.`, _insight };
  if (partes.length >= 2) {
    out._chart = {
      type: 'doughnut',
      slices: partes,
      prefix: '',
      centerValue: fmt(co2) + ' kg',
      centerLabel: 'CO₂/año',
      ariaLabel: `Distribución de la huella de carbono anual de la ropa por tipo de prenda. Total ${fmt(co2)} kg de CO₂.`,
    };
  }
  return out;
}
