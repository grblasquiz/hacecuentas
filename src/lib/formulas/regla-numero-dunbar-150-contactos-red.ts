export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }

export function reglaNumeroDunbar150ContactosRed(i: Inputs): Outputs {
  // Cantidad de contactos activos reales del usuario.
  const raw = i.contactos;
  const contactos = (raw === '' || raw === null || raw === undefined)
    ? NaN
    : Math.max(0, Math.round(Number(raw)));

  if (!Number.isFinite(contactos)) {
    throw new Error('Ingresá tu cantidad de contactos activos para ubicarte en las capas de Dunbar.');
  }

  const fmt = (n: number) => new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(Math.round(n));

  // Capas de Dunbar (límite superior de cada círculo concéntrico).
  const capas = [
    { nombre: 'Círculo íntimo', max: 5, desc: 'apoyo emocional diario; a quienes llamás a las 3 de la mañana' },
    { nombre: 'Grupo de confianza', max: 15, desc: 'cercanos que vendrían a ayudarte en una crisis real' },
    { nombre: 'Amigos activos', max: 50, desc: 'contacto frecuente y recíproco' },
    { nombre: 'Red estable (Dunbar)', max: 150, desc: 'conocidos de confianza; el límite cognitivo clásico' },
    { nombre: 'Conocidos', max: 500, desc: 'caras conocidas, sin relación activa' },
  ];

  // Capa donde cae el usuario.
  let capa = capas.find(c => contactos <= c.max);
  let capaNombre: string;
  let capaDesc: string;
  if (!capa) {
    capaNombre = 'Más allá de Dunbar (500+)';
    capaDesc = 'superás el círculo de 500: a este volumen la mayoría son contactos que reconocés pero no relaciones que sostenés';
  } else {
    capaNombre = `${capa.nombre} (hasta ${capa.max})`;
    capaDesc = capa.desc;
  }

  // Relación con el límite cognitivo de 150.
  const LIMITE = 150;
  const diferencia = contactos - LIMITE; // >0 excede, <0 falta
  const pctLimite = Math.round((contactos / LIMITE) * 100);

  let relacionLimite: string;
  let tone: 'good' | 'neutral' | 'warn';
  if (diferencia > 0) {
    relacionLimite = `Excedés el límite de Dunbar en ${fmt(diferencia)} contactos (${pctLimite}% de 150)`;
    tone = 'warn';
  } else if (diferencia === 0) {
    relacionLimite = `Estás justo en el límite de Dunbar: 150 contactos (100%)`;
    tone = 'neutral';
  } else {
    relacionLimite = `Te faltan ${fmt(-diferencia)} contactos para llegar a 150 (${pctLimite}% del límite)`;
    tone = pctLimite >= 60 ? 'good' : 'neutral';
  }

  // Interpretación según zona de saturación.
  let interpretacion: string;
  if (contactos > LIMITE) {
    interpretacion = `Con ${fmt(contactos)} contactos activos superás el techo de ~150 relaciones estables que el cerebro humano puede sostener. Por encima de ese umbral aparece la "deuda social cognitiva": para mantener vínculos nuevos, el cerebro empieza a degradar los existentes, y la calidad de tus relaciones más cercanas suele resentirse.`;
  } else if (pctLimite >= 90) {
    interpretacion = `Con ${fmt(contactos)} contactos estás cerca del techo de 150: tu red está casi al máximo de su capacidad cognitiva, pero todavía es sostenible. Priorizá la frecuencia de contacto en tus círculos íntimos para que no se diluyan.`;
  } else if (pctLimite >= 60) {
    interpretacion = `Con ${fmt(contactos)} contactos estás en la zona óptima de bienestar social (60-90% del límite): red activa y saludable, con margen para nuevos vínculos sin sobrecarga.`;
  } else {
    interpretacion = `Con ${fmt(contactos)} contactos activos estás por debajo del 60% del límite de Dunbar. Tu red tiene mucho margen; si sentís que falta densidad, conviene invertir en ampliar el círculo de 15-50 con interacción recíproca real.`;
  }

  const resumen = `${fmt(contactos)} contactos activos te ubican en "${capaNombre}". ${relacionLimite}.`;

  // Gráfico de escala: dónde cae el usuario respecto de las capas de Dunbar.
  const topeEscala = Math.max(500, Math.ceil((contactos + 1) / 50) * 50);
  const chart = {
    type: 'scale' as const,
    marker: contactos,
    markerLabel: `${fmt(contactos)} contactos`,
    min: 0,
    unit: ' contactos',
    segments: [
      { nombre: 'Íntimos (5)', max: 5, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Confianza (15)', max: 15, color: '#bfdbfe', colorDark: '#1e40af' },
      { nombre: 'Amigos (50)', max: 50, color: '#fef9c3', colorDark: '#854d0e' },
      { nombre: 'Red estable (150)', max: 150, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Conocidos (500+)', max: topeEscala, color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: 'Escala de las capas de Dunbar: círculo íntimo de 5, grupo de confianza de 15, amigos activos de 50, red estable de 150 y conocidos de 500, con tu cantidad de contactos marcada.',
  };

  const _insight = {
    title: 'Tu lugar en las capas de Dunbar',
    text: `Tenés **${fmt(contactos)} contactos activos** → caés en **${capaNombre}** (${capaDesc}). ${diferencia > 0 ? `Estás **${fmt(diferencia)} por encima** del límite de ~150 relaciones estables.` : diferencia === 0 ? `Estás **justo en el límite** de ~150 relaciones estables.` : `Te faltan **${fmt(-diferencia)}** para el límite de ~150.`}`,
    tone,
    icon: '🧠',
  };

  return {
    capa: capaNombre,
    resumen,
    relacionLimite,
    interpretacion,
    _insight,
    _chart: chart,
  };
}
