/**
 * Calculadora de escalera de madera por huella y contrahuella
 */

export interface Inputs {
  alturaTotal: number; escalones: number; huellaDeseada: number;
}

export interface Outputs {
  contrahuella: string; huellaReal: string; blondel: string; largoEscalera: string; inclinacion: string;
  _insight?: any; _chart?: any;
}

export function escaleraMaderaHuellaContrahuella(inputs: Inputs): Outputs {
  const at = Number(inputs.alturaTotal);
  const e = Math.round(Number(inputs.escalones));
  const hd = Number(inputs.huellaDeseada);
  if (!at || !e || !hd) throw new Error('Completá los campos');
  const ch = at / e;
  const blondelSum = 2 * ch + hd;
  const largo = hd * (e - 1);
  const incl = Math.atan(ch / hd) * (180 / Math.PI);
  let eval_ = '';
  if (blondelSum >= 63 && blondelSum <= 65) eval_ = '✅ Blondel ideal';
  else if (blondelSum >= 60 && blondelSum <= 67) eval_ = '⚠️ Funcional pero no óptima';
  else eval_ = '❌ Incómoda (ajustar)';

  const ideal = blondelSum >= 63 && blondelSum <= 65;
  const funcional = blondelSum >= 60 && blondelSum <= 67;
  let insightText: string;
  let insightTone: 'good' | 'warn' | 'neutral';
  if (ideal) {
    insightText = `Con contrahuella de **${ch.toFixed(1)} cm** y huella de **${hd.toFixed(1)} cm**, la fórmula de Blondel da **${blondelSum.toFixed(1)} cm**: dentro del rango ideal (63-65). Pisada cómoda y segura a **${incl.toFixed(1)}°** de inclinación.`;
    insightTone = 'good';
  } else if (funcional) {
    const ajuste = blondelSum < 63 ? 'subir un poco la huella o la contrahuella' : 'bajar un poco la huella o la contrahuella';
    insightText = `El Blondel da **${blondelSum.toFixed(1)} cm**: funcional pero fuera del óptimo (63-65). Es usable, pero para afinar la comodidad conviene **${ajuste}** y acercarte a 64 cm.`;
    insightTone = 'neutral';
  } else {
    const problema = blondelSum < 60 ? 'escalera muy estirada (peldaños largos y bajos)' : 'escalera muy empinada (peldaños cortos y altos)';
    insightText = `El Blondel da **${blondelSum.toFixed(1)} cm**, fuera del rango seguro (60-67): ${problema}. A **${incl.toFixed(1)}°** resulta incómoda; ajustá huella o cantidad de escalones antes de construir.`;
    insightTone = 'warn';
  }

  return {
    contrahuella: `${ch.toFixed(1)} cm`,
    huellaReal: `${hd.toFixed(1)} cm`,
    blondel: `${blondelSum.toFixed(1)} cm — ${eval_}`,
    largoEscalera: `${largo.toFixed(0)} cm horizontal`,
    inclinacion: `${incl.toFixed(1)}°`,
    _insight: {
      title: 'Comodidad de la escalera (Blondel)',
      text: insightText,
      tone: insightTone,
      icon: '🪜',
    },
    _chart: {
      type: 'scale',
      marker: Number(blondelSum.toFixed(1)),
      markerLabel: `${blondelSum.toFixed(1)} cm`,
      min: Math.min(50, Math.floor(blondelSum) - 2),
      segments: [
        { nombre: 'Estirada', max: 60, color: '#f59e0b', colorDark: '#d97706' },
        { nombre: 'Funcional', max: 63, color: '#84cc16', colorDark: '#65a30d' },
        { nombre: 'Ideal', max: 65, color: '#22c55e', colorDark: '#16a34a' },
        { nombre: 'Funcional', max: 67, color: '#84cc16', colorDark: '#65a30d' },
        { nombre: 'Empinada', max: Math.max(73, Math.ceil(blondelSum) + 2), color: '#ef4444', colorDark: '#dc2626' },
      ],
      ariaLabel: `Fórmula de Blondel: ${blondelSum.toFixed(1)} cm dentro de las zonas de comodidad de la escalera`,
    },
  };
}
