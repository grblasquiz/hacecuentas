/**
 * Calculadora de resistencia limitadora para LED
 *
 * Fórmula base: R = (V_fuente − V_LED_total) / I_LED
 *   - En serie: V_LED_total = Vf × cantidad | I_total = I_LED
 *   - En paralelo: V_LED_total = Vf | I_total = I_LED × cantidad (requiere R por rama)
 *
 * Potencia: P = (V_fuente − V_LED_total) × I_LED
 * Valor comercial: se redondea al valor E12 inmediatamente superior para proteger el LED.
 */

export interface ResistenciaLedInputs {
  vFuente: number; // V
  vLed: number; // V (caída directa del LED)
  iLed: number; // mA (corriente nominal)
  cantidad: number;
  conexion: 'serie' | 'paralelo';
}

export interface ResistenciaLedOutputs {
  resistenciaExacta: number;
  resistenciaE12: string;
  potenciaDisipada: number;
  potenciaResistencia: string;
  voltajeTotal: number;
  corrienteTotal: number;
  resumen: string;
  advertencia: string;
  _insight?: any;
  _chart?: any;
}

// Valores E12 base (multiplicados por 10^n para cubrir todo el rango)
const E12 = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82];

function nextE12(value: number): number {
  if (value <= 0) return 10;
  // Encontrar el exponente decimal
  const exp = Math.floor(Math.log10(value));
  const base = value / Math.pow(10, exp);
  // Buscar el siguiente valor E12 >= base
  for (const v of E12) {
    if (v >= base) return v * Math.pow(10, exp);
  }
  // Si base > 82, pasar al siguiente orden
  return 10 * Math.pow(10, exp + 1);
}

function formatResistance(ohms: number): string {
  if (ohms >= 1e6) return `${(ohms / 1e6).toFixed(2)} MΩ`;
  if (ohms >= 1e3) return `${(ohms / 1e3).toFixed(2)} kΩ`;
  return `${ohms.toFixed(1)} Ω`;
}

export function resistenciaLedSerieParalelo(i: ResistenciaLedInputs): ResistenciaLedOutputs {
  const vFuente = Number(i.vFuente);
  const vLed = Number(i.vLed);
  const iLedA = Number(i.iLed) / 1000; // mA → A
  const cantidad = Number(i.cantidad) || 1;
  const conexion = i.conexion || 'serie';

  if (!vFuente || vFuente <= 0) throw new Error('Ingresá el voltaje de fuente');
  if (!vLed || vLed <= 0) throw new Error('Ingresá la caída del LED (Vf)');
  if (!iLedA || iLedA <= 0) throw new Error('Ingresá la corriente del LED (mA)');
  if (cantidad < 1) throw new Error('Cantidad de LEDs debe ser ≥ 1');

  let vLedTotal: number;
  let iTotal: number;
  let resumen: string;
  let advertencia = '';

  if (conexion === 'serie') {
    vLedTotal = vLed * cantidad;
    iTotal = iLedA;
    if (vLedTotal >= vFuente) {
      throw new Error(
        `El voltaje total de los LEDs en serie (${vLedTotal.toFixed(1)} V) supera la fuente (${vFuente} V). Reducí la cantidad o usá una fuente mayor.`,
      );
    }
  } else {
    // paralelo → cada LED necesita su propia R (asumimos misma R por rama)
    vLedTotal = vLed;
    iTotal = iLedA * cantidad;
    if (vLedTotal >= vFuente) {
      throw new Error(
        `La caída del LED (${vLed} V) supera la fuente (${vFuente} V). Usá una fuente de mayor voltaje.`,
      );
    }
  }

  const vR = vFuente - vLedTotal;
  // En paralelo: R se calcula por rama individual con iLedA, no iTotal
  const iRama = conexion === 'serie' ? iLedA : iLedA;
  const R = vR / iRama;
  const P = vR * iRama;

  const rE12 = nextE12(R);

  // Potencia recomendada (2× la disipada, con margen)
  const pRecommended = P * 2;
  let pResistenciaClass: string;
  if (pRecommended <= 0.125) pResistenciaClass = '1/8 W (0.125 W)';
  else if (pRecommended <= 0.25) pResistenciaClass = '1/4 W (0.25 W) — la más común';
  else if (pRecommended <= 0.5) pResistenciaClass = '1/2 W (0.5 W)';
  else if (pRecommended <= 1) pResistenciaClass = '1 W';
  else if (pRecommended <= 2) pResistenciaClass = '2 W';
  else pResistenciaClass = `${Math.ceil(pRecommended)} W (considerar driver activo)`;

  // Advertencias contextuales
  if (P > 0.25) {
    advertencia += 'La resistencia disipa más de ¼ W — necesitás una resistencia de mayor tamaño (½ W o más). ';
  }
  if (P > 1) {
    advertencia += 'Potencia alta (>1 W): considerá usar un driver lineal (LM317) o switching para más eficiencia. ';
  }
  if (conexion === 'paralelo' && cantidad > 1) {
    advertencia += 'En paralelo: usá UNA resistencia por rama (no una resistencia común para todos los LEDs). ';
  }
  if (vFuente - vLedTotal < 0.5) {
    advertencia +=
      'Muy poco margen entre fuente y LEDs (<0.5 V). El LED puede funcionar tenue o no encender por pequeñas variaciones. ';
  }

  if (conexion === 'serie') {
    resumen = `${cantidad} LED${cantidad > 1 ? 's' : ''} en serie con R = ${formatResistance(
      R,
    )} (comercial ${formatResistance(rE12)}). Consumo total: ${iLedA * 1000} mA × ${vFuente} V = ${(
      iLedA * vFuente
    ).toFixed(3)} W.`;
  } else {
    resumen = `${cantidad} rama${cantidad > 1 ? 's' : ''} en paralelo — cada una con su propia R = ${formatResistance(
      R,
    )} (comercial ${formatResistance(rE12)}). Corriente total: ${(iTotal * 1000).toFixed(1)} mA.`;
  }

  const pMw = P * 1000;
  const insightTone = P > 0.25 ? 'warn' : 'good';
  const insightText = conexion === 'serie'
    ? `Con la fuente de **${vFuente} V** y ${cantidad} LED${cantidad > 1 ? 's' : ''} en serie necesitás **${formatResistance(rE12)}** (exacto ${formatResistance(R)}). La resistencia disipa **${pMw.toFixed(0)} mW**, así que alcanza una de **${pResistenciaClass.split('—')[0].trim()}**.`
    : `Cada una de las ${cantidad} rama${cantidad > 1 ? 's' : ''} en paralelo lleva su propia **${formatResistance(rE12)}** (exacto ${formatResistance(R)}). Cada resistencia disipa **${pMw.toFixed(0)} mW** → tamaño **${pResistenciaClass.split('—')[0].trim()}**.`;
  // Gauge: zonas de tamaño físico de resistencia según potencia disipada (mW)
  const gaugeMax = Math.max(1100, pMw * 1.25);
  return {
    resistenciaExacta: Number(R.toFixed(1)),
    resistenciaE12: formatResistance(rE12),
    potenciaDisipada: Number(P.toFixed(3)),
    potenciaResistencia: pResistenciaClass,
    voltajeTotal: Number(vLedTotal.toFixed(2)),
    corrienteTotal: Number(iTotal.toFixed(3)),
    resumen,
    advertencia: advertencia.trim() || 'Sin advertencias — configuración segura.',
    _insight: {
      title: 'Resistencia y potencia',
      text: insightText,
      tone: insightTone,
      icon: '💡',
    },
    _chart: {
      type: 'scale',
      marker: Number(pMw.toFixed(1)),
      markerLabel: `${pMw.toFixed(0)} mW`,
      min: 0,
      segments: [
        { nombre: '1/8 W', max: 125, color: '#22c55e', colorDark: '#16a34a' },
        { nombre: '1/4 W', max: 250, color: '#84cc16', colorDark: '#65a30d' },
        { nombre: '1/2 W', max: 500, color: '#eab308', colorDark: '#ca8a04' },
        { nombre: '1 W', max: 1000, color: '#f97316', colorDark: '#ea580c' },
        { nombre: '+2 W / driver', max: Number(gaugeMax.toFixed(0)), color: '#ef4444', colorDark: '#dc2626' },
      ],
      ariaLabel: `La resistencia disipa ${pMw.toFixed(0)} mW; tamaño recomendado ${pResistenciaClass.split('—')[0].trim()}`,
    },
  };
}
