/** Resistencia necesaria para proteger un LED */
export interface Inputs { voltajeFuente: number; caidaLed: number; corrienteLedMa: number; }
export interface Outputs { resistenciaOhm: number; resistenciaComercial: number; potenciaResistenciaMw: number; detalle: string; _insight?: any; _chart?: any; }

const E24 = [10,11,12,13,15,16,18,20,22,24,27,30,33,36,39,43,47,51,56,62,68,75,82,91,100,110,120,130,150,160,180,200,220,240,270,300,330,360,390,430,470,510,560,620,680,750,820,910,1000,1100,1200,1500,1800,2200,2700,3300,3900,4700,5600,6800,8200,10000];

function comercialMasCercano(valor: number): number {
  let mejor = E24[0];
  let menorDif = Infinity;
  for (const e of E24) {
    if (e >= valor && (e - valor) < menorDif) {
      menorDif = e - valor;
      mejor = e;
    }
  }
  if (menorDif === Infinity) mejor = E24[E24.length - 1];
  return mejor;
}

export function resistenciaLedVoltajeCaida(i: Inputs): Outputs {
  const vFuente = Number(i.voltajeFuente);
  const vLed = Number(i.caidaLed);
  const mA = Number(i.corrienteLedMa);

  if (!vFuente || vFuente <= 0) throw new Error('Ingresá el voltaje de la fuente');
  if (!vLed || vLed <= 0) throw new Error('Ingresá la caída de tensión del LED');
  if (!mA || mA <= 0) throw new Error('Ingresá la corriente del LED en mA');
  if (vFuente <= vLed) throw new Error('El voltaje de la fuente debe ser mayor que la caída del LED');

  const corrienteA = mA / 1000;
  const vResistencia = vFuente - vLed;
  const resistencia = vResistencia / corrienteA;
  const comercial = comercialMasCercano(resistencia);
  const potenciaMw = (corrienteA * corrienteA * resistencia) * 1000;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

  const sizeLabel = potenciaMw <= 125 ? '1/8 W' : potenciaMw <= 250 ? '1/4 W' : potenciaMw <= 500 ? '1/2 W' : potenciaMw <= 1000 ? '1 W' : '2 W o más';
  const tone = potenciaMw > 250 ? 'warn' : 'good';
  const gaugeMax = Math.max(1100, potenciaMw * 1.25);
  return {
    resistenciaOhm: Number(resistencia.toFixed(1)),
    resistenciaComercial: comercial,
    potenciaResistenciaMw: Number(potenciaMw.toFixed(1)),
    detalle: `R = (${fmt.format(vFuente)}V - ${fmt.format(vLed)}V) / ${fmt.format(mA)}mA = ${fmt.format(resistencia)} Ω → valor comercial: ${fmt.format(comercial)} Ω. Potencia: ${fmt.format(potenciaMw)} mW.`,
    _insight: {
      title: 'Resistencia limitadora',
      text: `Necesitás **${fmt.format(resistencia)} Ω** (comercial **${fmt.format(comercial)} Ω**) para limitar el LED a **${fmt.format(mA)} mA**. Disipa **${fmt.format(potenciaMw)} mW**, así que con una resistencia de **${sizeLabel}** alcanza.`,
      tone,
      icon: '💡',
    },
    _chart: {
      type: 'scale',
      marker: Number(potenciaMw.toFixed(1)),
      markerLabel: `${fmt.format(potenciaMw)} mW`,
      min: 0,
      segments: [
        { nombre: '1/8 W', max: 125, color: '#22c55e', colorDark: '#16a34a' },
        { nombre: '1/4 W', max: 250, color: '#84cc16', colorDark: '#65a30d' },
        { nombre: '1/2 W', max: 500, color: '#eab308', colorDark: '#ca8a04' },
        { nombre: '1 W', max: 1000, color: '#f97316', colorDark: '#ea580c' },
        { nombre: '+2 W', max: Number(gaugeMax.toFixed(0)), color: '#ef4444', colorDark: '#dc2626' },
      ],
      ariaLabel: `La resistencia disipa ${fmt.format(potenciaMw)} mW; tamaño recomendado ${sizeLabel}`,
    },
  };
}
