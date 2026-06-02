/** Cláusula de rescisión estimada en base a valor de mercado Transfermarkt */
export interface Inputs {
  valorMercadoEur: number;
  nivel: 'estandar' | 'titular-clave' | 'estrella' | 'galactico';
  anosRestantes?: number;
}
export interface Outputs {
  clausulaMin: number;
  clausulaMax: number;
  clausulaRecomendada: number;
  multiplicador: string;
  nivelLabel: string;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

const NIVELES: Record<string, { label: string; min: number; max: number }> = {
  'estandar':        { label: 'Estándar (rotación)',       min: 1.2, max: 1.8 },
  'titular-clave':   { label: 'Titular clave',             min: 1.5, max: 2.5 },
  'estrella':        { label: 'Estrella del equipo',       min: 2.0, max: 3.0 },
  'galactico':       { label: 'Galáctico / intransferible', min: 3.0, max: 5.0 },
};

export function clausulaRescisionValor(i: Inputs): Outputs {
  const valor = Math.max(0, Number(i.valorMercadoEur) || 0);
  const anos = Math.max(1, Number(i.anosRestantes) || 4);
  const fila = NIVELES[i.nivel];
  if (!fila) throw new Error('Nivel inválido.');

  // Ajuste por años restantes: menos años de contrato → cláusula más baja
  // Factor: >=4 años = 1.0x; 3 años = 0.9x; 2 años = 0.75x; 1 año = 0.55x
  const factorAnos = anos >= 4 ? 1 : anos === 3 ? 0.9 : anos === 2 ? 0.75 : 0.55;

  const clausulaMin = valor * fila.min * factorAnos;
  const clausulaMax = valor * fila.max * factorAnos;
  const clausulaRec = (clausulaMin + clausulaMax) / 2;

  const cMin = Math.round(clausulaMin);
  const cMax = Math.round(clausulaMax);
  const cRec = Math.round(clausulaRec);
  const fmt = (n: number) => '€' + n.toLocaleString('es-AR');
  const sobreValor = valor > 0 ? Math.round((cRec / valor) * 10) / 10 : 0;

  return {
    clausulaMin: cMin,
    clausulaMax: cMax,
    clausulaRecomendada: cRec,
    multiplicador: `${fila.min}× a ${fila.max}× (ajustado por ${anos} año(s) restante(s): ×${factorAnos})`,
    nivelLabel: fila.label,
    mensaje: `Cláusula recomendada: €${cRec.toLocaleString('es-AR')} (rango €${cMin.toLocaleString('es-AR')}-€${cMax.toLocaleString('es-AR')}).`,
    _insight: {
      title: 'Cómo blindar al jugador',
      text: `Sobre un valor de mercado de **${fmt(valor)}**, la cláusula recomendada es **${fmt(cRec)}** (≈**${sobreValor}×** el valor) para el perfil "${fila.label}". ${factorAnos < 1 ? `Con solo **${anos} año(s)** de contrato restante el tope baja a ×${factorAnos}: conviene renovar antes de fijar una cláusula alta.` : `Con **${anos}+ años** de contrato podés sostener el multiplicador pleno sin castigo por tiempo.`}`,
      tone: factorAnos < 1 ? 'warn' : 'neutral',
      icon: '⚽',
    },
    _chart: {
      type: 'scale',
      marker: cRec,
      markerLabel: 'Recomendada',
      min: 0,
      segments: [
        { nombre: 'Piso negociable', max: cMin, color: '#fca5a5', colorDark: '#7f1d1d' },
        { nombre: 'Rango recomendado', max: cMax, color: '#86efac', colorDark: '#14532d' },
        { nombre: 'Techo / blindaje', max: Math.round(cMax * 1.15), color: '#93c5fd', colorDark: '#1e3a8a' },
      ],
      ariaLabel: `Cláusula recomendada ${fmt(cRec)} dentro del rango ${fmt(cMin)} a ${fmt(cMax)}`,
    },
  };
}
