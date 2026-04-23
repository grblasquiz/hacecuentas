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

  return {
    clausulaMin: Math.round(clausulaMin),
    clausulaMax: Math.round(clausulaMax),
    clausulaRecomendada: Math.round(clausulaRec),
    multiplicador: `${fila.min}× a ${fila.max}× (ajustado por ${anos} año(s) restante(s): ×${factorAnos})`,
    nivelLabel: fila.label,
    mensaje: `Cláusula recomendada: €${Math.round(clausulaRec).toLocaleString('es-AR')} (rango €${Math.round(clausulaMin).toLocaleString('es-AR')}-€${Math.round(clausulaMax).toLocaleString('es-AR')}).`,
  };
}
