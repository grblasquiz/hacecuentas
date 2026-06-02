/** Horas de vida restantes */
export interface Inputs { edad: number; sexo: string; pais: string; }
export interface Outputs { horasRestantes: number; diasRestantes: number; semanasRestantes: number; horasDespierto: number; mensaje: string; _insight?: any; _chart?: any; }

export function horasVidaRestantes(i: Inputs): Outputs {
  const edad = Number(i.edad);
  const sexo = String(i.sexo || 'masculino');
  const pais = String(i.pais || 'argentina');
  if (edad < 0) throw new Error('Ingresá una edad válida');

  const esperanza: Record<string, Record<string, number>> = {
    argentina: { masculino: 74, femenino: 80 },
    mexico: { masculino: 72, femenino: 78 },
    colombia: { masculino: 74, femenino: 80 },
    espana: { masculino: 80, femenino: 86 },
    eeuu: { masculino: 76, femenino: 81 },
    japon: { masculino: 81, femenino: 87 }
  };

  const ev = esperanza[pais]?.[sexo] || 77;
  const anosRestantes = Math.max(0, ev - edad);
  const diasRestantes = Math.round(anosRestantes * 365.25);
  const horasRestantes = diasRestantes * 24;
  const semanasRestantes = Math.round(diasRestantes / 7);
  const horasDespierto = Math.round(horasRestantes * 0.67); // ~16h awake per day

  let mensaje: string;
  let _insight: any;
  let _chart: any;
  if (anosRestantes <= 0) {
    mensaje = 'Según las estadísticas, ya superaste la esperanza de vida promedio. ¡Cada día extra es un regalo!';
    _insight = {
      title: 'Estás en tiempo de descuento',
      text: `Ya superaste la esperanza de vida promedio (**${ev} años**) para tu perfil. Las estadísticas no mandan: cada día que sigue es tuyo.`,
      tone: 'good',
      icon: '🎁',
    };
  } else {
    const horasDormido = horasRestantes - horasDespierto;
    const veranos = Math.round(anosRestantes);
    mensaje = `Te quedan ~${horasRestantes.toLocaleString()} horas de vida (${horasDespierto.toLocaleString()} despierto/a). Son ${semanasRestantes.toLocaleString()} semanas. ¿En qué las vas a usar?`;
    _insight = {
      title: 'Tu tiempo despierto, en perspectiva',
      text: `De las ~**${horasRestantes.toLocaleString()} h** que te quedan, sólo **${horasDespierto.toLocaleString()} h** las vivís despierto/a (el resto, durmiendo). Son **${semanasRestantes.toLocaleString()} semanas** o unos **${veranos} veranos** más: usalas en lo que importa.`,
      tone: 'neutral',
      icon: '⏳',
    };
    _chart = {
      type: 'doughnut',
      slices: [
        { label: 'Despierto/a', value: horasDespierto },
        { label: 'Durmiendo', value: horasDormido },
      ],
      prefix: '',
      centerValue: horasRestantes.toLocaleString(),
      centerLabel: 'horas de vida',
      ariaLabel: `De ${horasRestantes.toLocaleString()} horas restantes, ${horasDespierto.toLocaleString()} despierto y ${horasDormido.toLocaleString()} durmiendo`,
    };
  }

  return { horasRestantes, diasRestantes, semanasRestantes, horasDespierto, mensaje, _insight, _chart };
}