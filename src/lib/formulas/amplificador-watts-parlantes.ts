export interface AmplificadorWattsParlantesInputs { potenciaAmp: number; impedanciaParlante: number; cantidadParlantes: number; conexion: string; __lang?: string; }
export interface AmplificadorWattsParlantesOutputs { impedanciaTotal: string; wattsPorParlante: string; compatible: string; resumen: string; _insight?: any; _chart?: any; }
export function amplificadorWattsParlantes(i: AmplificadorWattsParlantesInputs): AmplificadorWattsParlantesOutputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorCampos: 'Completá campos',
      compatibleSi: 'Sí (seguro para mayoría amp)',
      compatiblePremium: 'Solo amp premium',
      compatibleNo: 'NO — peligroso',
      speakers: 'parlantes',
      total: 'total',
      perSpeaker: 'por parlante',
      insTitleOk: 'Carga segura para tu amplificador',
      insTitleWarn: 'Impedancia baja: cuidado con el amp',
      insTitleDanger: 'Carga peligrosa: riesgo de daño',
      insOk: (z: string, w: string) => `La impedancia total de **${z} Ω** está dentro del rango seguro (≥4 Ω) para casi cualquier amplificador, entregando **${w} W** por parlante. Conexión estándar sin sobrecalentar la etapa de potencia.`,
      insWarn: (z: string, w: string) => `Con **${z} Ω** totales (entre 2 y 4 Ω) solo amplificadores que toleran cargas bajas mantienen la estabilidad. Cada parlante recibe **${w} W**; verificá en la ficha del amp que soporte 2 Ω antes de subir volumen.`,
      insDanger: (z: string, w: string) => `**${z} Ω** totales caen por debajo de 2 Ω: la mayoría de los amplificadores entra en protección o se daña por exceso de corriente. Cada parlante tomaría **${w} W**. Pasá a conexión en serie o reducí la cantidad de parlantes.`,
      zoneDanger: 'Peligroso',
      zonePremium: 'Solo premium',
      zoneSafe: 'Seguro',
      chartAria: (z: string) => `Impedancia total de ${z} ohmios ubicada en la escala de seguridad del amplificador.`,
    },
    en: {
      errorCampos: 'Fill in all fields',
      compatibleSi: 'Yes (safe for most amps)',
      compatiblePremium: 'Premium amp only',
      compatibleNo: 'NO — dangerous',
      speakers: 'speakers',
      total: 'total',
      perSpeaker: 'per speaker',
      insTitleOk: 'Safe load for your amplifier',
      insTitleWarn: 'Low impedance: handle the amp with care',
      insTitleDanger: 'Dangerous load: risk of damage',
      insOk: (z: string, w: string) => `The total impedance of **${z} Ω** sits in the safe range (≥4 Ω) for nearly any amplifier, delivering **${w} W** per speaker. A standard hookup that won't overheat the power stage.`,
      insWarn: (z: string, w: string) => `At **${z} Ω** total (between 2 and 4 Ω) only amplifiers rated for low loads stay stable. Each speaker gets **${w} W**; check the amp's spec sheet for 2 Ω support before turning it up.`,
      insDanger: (z: string, w: string) => `**${z} Ω** total drops below 2 Ω: most amplifiers will go into protection or fail from excess current. Each speaker would draw **${w} W**. Switch to a series connection or use fewer speakers.`,
      zoneDanger: 'Dangerous',
      zonePremium: 'Premium only',
      zoneSafe: 'Safe',
      chartAria: (z: string) => `Total impedance of ${z} ohms placed on the amplifier safety scale.`,
    },
  } as const)[__lang];
  const p = Number(i.potenciaAmp); const z = Number(i.impedanciaParlante); const n = Number(i.cantidadParlantes);
  if (!p || !z || !n) throw new Error(T.errorCampos);
  const zTotal = i.conexion === 'serie' ? z * n : z / n;
  const wPorParlante = p / n;
  const compatible = zTotal >= 4 ? T.compatibleSi : zTotal >= 2 ? T.compatiblePremium : T.compatibleNo;
  const zStr = zTotal.toFixed(1);
  const wStr = wPorParlante.toFixed(0);
  const tone = zTotal >= 4 ? 'good' : zTotal >= 2 ? 'warn' : 'warn';
  const insTitle = zTotal >= 4 ? T.insTitleOk : zTotal >= 2 ? T.insTitleWarn : T.insTitleDanger;
  const insText = zTotal >= 4 ? T.insOk(zStr, wStr) : zTotal >= 2 ? T.insWarn(zStr, wStr) : T.insDanger(zStr, wStr);
  const safeMax = Math.max(8, Math.ceil(zTotal) + 1);
  return { impedanciaTotal: zTotal.toFixed(2) + ' Ω', wattsPorParlante: wPorParlante.toFixed(0) + ' W', compatible,
    resumen: `${n} ${T.speakers} ${z}Ω en ${i.conexion}: ${zTotal.toFixed(1)} Ω ${T.total}. ${wPorParlante.toFixed(0)}W ${T.perSpeaker}. ${compatible}.`,
    _insight: { title: insTitle, text: insText, tone, icon: '🔊' },
    _chart: {
      type: 'scale',
      marker: Number(zTotal.toFixed(2)),
      markerLabel: zStr + ' Ω',
      min: 0,
      segments: [
        { nombre: T.zoneDanger, max: 2, color: '#ef4444', colorDark: '#dc2626' },
        { nombre: T.zonePremium, max: 4, color: '#f59e0b', colorDark: '#d97706' },
        { nombre: T.zoneSafe, max: safeMax, color: '#22c55e', colorDark: '#16a34a' },
      ],
      ariaLabel: T.chartAria(zStr),
    },
  };
}
