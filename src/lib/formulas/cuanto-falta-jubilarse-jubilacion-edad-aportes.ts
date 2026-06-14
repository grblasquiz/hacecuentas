/** Cuánto falta para jubilarte en Argentina: requisitos edad (65 varón / 60 mujer) + 30 años de aportes (Ley 24.241). */
export interface Inputs {
  edadActual: number;
  sexo: string;
  anosAportados: number;
}
export interface Outputs {
  anosFaltan: number;
  limitante: string;
  edadMinima: number;
  anosFaltaEdad: number;
  anosFaltaAporte: number;
  anoJubilacion: number;
  cumpleEdad: boolean;
  cumpleAportes: boolean;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function cuantoFaltaJubilarseJubilacionEdadAportes(i: Inputs): Outputs {
  const edad = Number(i.edadActual);
  const sexo = String(i.sexo || 'f').toLowerCase();
  const anosAp = Number(i.anosAportados);

  if (!Number.isFinite(edad) || edad < 15 || edad > 90) throw new Error('Ingresá una edad válida (entre 15 y 90)');
  if (!Number.isFinite(anosAp) || anosAp < 0 || anosAp > 70) throw new Error('Los años de aportes deben estar entre 0 y 70');

  const edadMinima = sexo === 'm' ? 65 : 60;
  const aportesRequeridos = 30;

  const anosFaltaEdad = Math.max(0, edadMinima - edad);
  const anosFaltaAporte = Math.max(0, aportesRequeridos - anosAp);

  const cumpleEdad = edad >= edadMinima;
  const cumpleAportes = anosAp >= aportesRequeridos;

  // Te jubilás cuando se cumplen AMBOS requisitos → faltan = max de los dos (aprox).
  const anosFaltan = Math.max(anosFaltaEdad, anosFaltaAporte);
  const anoActual = new Date().getFullYear();
  const anoJubilacion = anoActual + Math.ceil(anosFaltan);

  // Cuál es el factor limitante (el que tarda más en cumplirse).
  let limitante: string;
  if (cumpleEdad && cumpleAportes) {
    limitante = 'Ya cumplís ambos requisitos';
  } else if (anosFaltaAporte > anosFaltaEdad) {
    limitante = 'Aportes (te falta completar los 30 años)';
  } else if (anosFaltaEdad > anosFaltaAporte) {
    limitante = 'Edad (todavía no llegás a la edad mínima)';
  } else {
    limitante = 'Edad y aportes (te faltan al mismo tiempo)';
  }

  const fmt = (n: number) => Number(n.toFixed(1));

  let resumen: string;
  if (cumpleEdad && cumpleAportes) {
    resumen = 'No te falta nada: cumplís edad y 30 años de aportes. Podés iniciar el trámite en ANSES.';
  } else if (cumpleEdad && !cumpleAportes) {
    resumen = `Tenés la edad, pero te faltan ${fmt(anosFaltaAporte)} años de aportes (limitante: aportes). Si seguís aportando llegarías cerca de ${anoJubilacion}; con Moratoria podrías acceder antes.`;
  } else if (!cumpleEdad && cumpleAportes) {
    resumen = `Ya tenés los 30 años de aportes, pero te faltan ${fmt(anosFaltaEdad)} años de edad (limitante: edad). Te jubilarías alrededor de ${anoJubilacion}.`;
  } else {
    resumen = `Te faltan ${fmt(anosFaltan)} años para jubilarte (limitante: ${anosFaltaAporte >= anosFaltaEdad ? 'aportes' : 'edad'}). Cumpliendo ambos requisitos, sería aproximadamente en ${anoJubilacion}.`;
  }

  const _insight = {
    title: 'Cuánto te falta para jubilarte',
    text: cumpleEdad && cumpleAportes
      ? `Ya cumplís los **${edadMinima} años** de edad y los **30 años** de aportes: no te falta nada, podés iniciar el trámite en ANSES.`
      : `Te faltan aproximadamente **${fmt(anosFaltan)} años** (te jubilarías cerca de **${anoJubilacion}**). El factor que manda es **${anosFaltaAporte >= anosFaltaEdad ? 'los aportes' : 'la edad'}**: por edad faltan **${fmt(anosFaltaEdad)}** y por aportes **${fmt(anosFaltaAporte)}**, y te jubilás cuando se cumple el mayor de los dos.`,
    tone: (cumpleEdad && cumpleAportes ? 'good' : 'warn') as 'good' | 'warn',
    icon: '👵',
  };

  // Escala: avance combinado hacia el retiro (0 = recién empezás, 100% = cumplís ambos).
  const avanceEdad = edadMinima > 0 ? Math.min(1, edad / edadMinima) : 1;
  const avanceAporte = Math.min(1, anosAp / aportesRequeridos);
  const avance = Number((Math.min(avanceEdad, avanceAporte) * 100).toFixed(0));
  const _chart = {
    type: 'scale' as const,
    marker: avance,
    markerLabel: `${avance}% del camino`,
    min: 0,
    unit: '%',
    segments: [
      { nombre: 'Lejos', max: 50, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'A mitad', max: 80, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Cerca', max: 99, color: '#fef9c3', colorDark: '#854d0e' },
      { nombre: 'Listo', max: 100, color: '#bbf7d0', colorDark: '#166534' },
    ],
    ariaLabel: `Avance hacia la jubilación: ${avance}% (limitante: ${anosFaltaAporte >= anosFaltaEdad ? 'aportes' : 'edad'}).`,
  };

  return {
    anosFaltan: fmt(anosFaltan),
    limitante,
    edadMinima,
    anosFaltaEdad: fmt(anosFaltaEdad),
    anosFaltaAporte: fmt(anosFaltaAporte),
    anoJubilacion,
    cumpleEdad,
    cumpleAportes,
    resumen,
    _insight,
    _chart,
  };
}
