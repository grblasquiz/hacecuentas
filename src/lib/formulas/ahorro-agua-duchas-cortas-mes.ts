export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function ahorroAguaDuchasCortasMes(i: Inputs): Outputs {
  const ma = Number(i.minAntes) || 0; const md = Number(i.minDespues) || 0;
  const lm = Number(i.lMin) || 10; const p = Number(i.personas) || 1;
  const L = (ma - md) * lm * 30 * p;
  const m3 = L * 12 / 1000;

  const minRec = ma - md;
  const Lfmt = L.toLocaleString('es-AR', { maximumFractionDigits: 0 });
  const m3fmt = m3.toFixed(1);
  const _insight = minRec <= 0
    ? {
        title: 'Sin ahorro de agua',
        text: `Con esos minutos no se ahorra agua: la ducha "después" tiene que ser **más corta** que la de antes para reducir el consumo.`,
        tone: 'warn',
        icon: '🚿',
      }
    : {
        title: 'Cuánta agua ahorrás',
        text: `Recortando **${minRec} min** por ducha (${p === 1 ? '1 persona' : p + ' personas'}) ahorrás **${Lfmt} L/mes**, unos **${m3fmt} m³ al año**. Es agua que también dejás de calentar, así que baja la factura de gas o electricidad además de la de agua.`,
        tone: 'good',
        icon: '💧',
      };

  return { litrosMes: L.toFixed(0) + ' L', m3Año: m3.toFixed(2) + ' m³', resumen: `Ahorro ${L.toFixed(0)} L/mes (${m3.toFixed(1)} m³/año) reduciendo ${ma-md} min/ducha.`, _insight };
}
