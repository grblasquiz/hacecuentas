export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function huellaCarbonoTrabajoRemotoVsOficina(i: Inputs): Outputs {
  const km = Number(i.kmCommute) || 0; const d = Number(i.diasMes) || 12;
  const factor = i.autoPublico === 'auto' ? 0.2 : 0.07;
  const commuteDia = km * factor; const extraCasa = 3;
  const ahorroMes = (commuteDia - extraCasa) * d;
  const ahorroAño = ahorroMes * 12;
  const fmt1 = (n: number) => new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 }).format(n);
  const positivo = ahorroMes > 0;
  const tone = ahorroMes > 0 ? 'good' : ahorroMes < 0 ? 'warn' : 'neutral';
  const _insight = {
    title: positivo ? 'Trabajar desde casa rinde' : 'El home office no compensa acá',
    text: km <= 0
      ? 'Cargá los **km de tu viaje** al trabajo para comparar la huella de carbono del **home office vs la oficina**.'
      : positivo
        ? `Evitar tu viaje **${i.autoPublico === 'auto' ? 'en auto' : 'en transporte público'}** ahorra **${fmt1(ahorroMes)} kg de CO₂/mes** (~**${fmt1(ahorroAño)} kg/año**), incluso descontando el extra de energía en casa.`
        : `Tu viaje es tan corto que el extra de **energía en casa (3 kg/día)** lo supera: trabajar remoto suma **${fmt1(Math.abs(ahorroMes))} kg de CO₂/mes** en vez de ahorrar.`,
    tone,
    icon: positivo ? '🏠' : '🏢',
  };
  return { kgAhorradoMes: ahorroMes.toFixed(1) + ' kg', kgAhorradoAño: (ahorroMes * 12).toFixed(0) + ' kg', resumen: `Ahorro ${ahorroMes.toFixed(1)} kg/mes (${(ahorroMes*12/1000).toFixed(1)} t/año).`, _insight };
}
