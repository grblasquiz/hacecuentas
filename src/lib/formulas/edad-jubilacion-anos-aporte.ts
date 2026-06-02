/** Años y meses que faltan para jubilarte (30 años aporte + 60/65 años edad — ANSES Argentina) */
export interface Inputs {
  edadActual: number;
  sexo: string;
  anosAportados: number;
  mesesAportados?: number;
}
export interface Outputs {
  edadMinima: number;
  aportesRequeridos: number;
  anosFaltaEdad: number;
  anosFaltaAporte: number;
  anoJubilacion: number;
  faltaResumen: string;
  cumpleEdad: boolean;
  cumpleAportes: boolean;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function edadJubilacionAnosAporte(i: Inputs): Outputs {
  const edad = Number(i.edadActual);
  const sexo = String(i.sexo || 'f');
  const anosAp = Number(i.anosAportados);
  const mesesAp = Number(i.mesesAportados) || 0;

  if (!edad || edad < 15 || edad > 90) throw new Error('Ingresá una edad válida');
  if (anosAp < 0 || anosAp > 70) throw new Error('Los años aportados deben estar entre 0 y 70');
  if (mesesAp < 0 || mesesAp >= 12) throw new Error('Los meses aportados deben estar entre 0 y 11');

  const edadMinima = sexo === 'f' ? 60 : 65;
  const aportesRequeridos = 30;

  const aportesActuales = anosAp + mesesAp / 12;
  const anosFaltaEdad = Math.max(0, edadMinima - edad);
  const anosFaltaAporte = Math.max(0, aportesRequeridos - aportesActuales);

  const cumpleEdad = edad >= edadMinima;
  const cumpleAportes = aportesActuales >= aportesRequeridos;

  // El año de jubilación es cuando cumplas ambos
  const anoActual = new Date().getFullYear();
  const anosFaltan = Math.max(anosFaltaEdad, anosFaltaAporte);
  const anoJubilacion = anoActual + Math.ceil(anosFaltan);

  let faltaResumen = '';
  if (cumpleEdad && cumpleAportes) {
    faltaResumen = 'Cumplís los dos requisitos. Podés iniciar tu trámite en ANSES.';
  } else if (cumpleEdad && !cumpleAportes) {
    faltaResumen = `Tenés la edad pero te faltan ${anosFaltaAporte.toFixed(1)} años de aportes. Podés usar Moratoria Previsional.`;
  } else if (!cumpleEdad && cumpleAportes) {
    faltaResumen = `Tenés los aportes pero te faltan ${anosFaltaEdad.toFixed(1)} años de edad.`;
  } else {
    faltaResumen = `Te faltan ${anosFaltaEdad.toFixed(1)} años de edad y ${anosFaltaAporte.toFixed(1)} años de aportes.`;
  }

  const aportesRedondeados = Number(aportesActuales.toFixed(1));
  const _insight = {
    title: 'Tu camino a la jubilación',
    text: cumpleEdad && cumpleAportes
      ? `Ya cumplís los **${edadMinima} años** de edad y los **30 años** de aportes: podés iniciar el trámite en ANSES ahora mismo.`
      : (cumpleEdad
          ? `Tenés la edad (**${edad}** ≥ **${edadMinima}**) pero te faltan **${anosFaltaAporte.toFixed(1)} años** de aportes para llegar a los 30. La Moratoria Previsional puede cubrir ese hueco; sin ella, recién accederías cerca de **${anoJubilacion}**.`
          : (cumpleAportes
              ? `Ya tenés los **30 años** de aportes, pero te faltan **${anosFaltaEdad.toFixed(1)} años** de edad: podrías jubilarte alrededor de **${anoJubilacion}**.`
              : `Te faltan **${anosFaltaEdad.toFixed(1)} años** de edad y **${anosFaltaAporte.toFixed(1)} años** de aportes. Cumpliendo ambos, te jubilarías aproximadamente en **${anoJubilacion}**.`)),
    tone: (cumpleEdad && cumpleAportes ? 'good' : 'warn') as 'good' | 'warn',
    icon: '👵',
  };

  const _chart = {
    type: 'scale' as const,
    marker: aportesRedondeados,
    markerLabel: `${aportesRedondeados} años aportados`,
    min: 0,
    unit: '',
    segments: [
      { nombre: 'Inicial', max: 10, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Medio', max: 20, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Casi', max: 30, color: '#fef9c3', colorDark: '#854d0e' },
      { nombre: 'Completo', max: Math.max(35, Math.ceil(aportesActuales) + 2), color: '#bbf7d0', colorDark: '#166534' },
    ],
    ariaLabel: `Escala de avance de aportes jubilatorios: ${aportesRedondeados} de 30 años requeridos.`,
  };

  return {
    edadMinima,
    aportesRequeridos,
    anosFaltaEdad: Number(anosFaltaEdad.toFixed(1)),
    anosFaltaAporte: Number(anosFaltaAporte.toFixed(1)),
    anoJubilacion,
    faltaResumen,
    cumpleEdad,
    cumpleAportes,
    resumen: `Podés jubilarte aproximadamente en ${anoJubilacion}. ${faltaResumen}`,
    _insight,
    _chart,
  };
}
