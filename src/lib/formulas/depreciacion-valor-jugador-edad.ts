/** Depreciación del valor de mercado de un jugador según edad */
export interface Inputs {
  valorActualEur: number;
  edadActual: number;
  edadObjetivo: number;
  posicion: 'arquero' | 'defensor' | 'mediocampista' | 'delantero';
}
export interface Outputs {
  valorProyectado: number;
  depreciacionTotal: number;
  depreciacionAnualPromedio: number;
  curvaAplicada: string;
  picoEdad: [number, number];
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

// Curva de valor por posición: edad donde el jugador alcanza el pico y a qué ritmo baja
const CURVA: Record<string, { pico: [number, number]; postPico: number; joven: number }> = {
  arquero:       { pico: [28, 32], postPico: 0.08, joven: 0.08 }, // arqueros duran más
  defensor:      { pico: [27, 30], postPico: 0.12, joven: 0.10 },
  mediocampista: { pico: [26, 29], postPico: 0.13, joven: 0.12 },
  delantero:     { pico: [25, 28], postPico: 0.15, joven: 0.12 }, // delanteros caen más rápido
};

function factorEdad(edad: number, posicion: string): number {
  const c = CURVA[posicion];
  if (!c) return 1;
  const [picoMin, picoMax] = c.pico;
  if (edad < picoMin) {
    // años antes del pico: crece (factor >1 acumulado)
    const dif = picoMin - edad;
    return Math.max(0.3, 1 - dif * c.joven); // no usar para proyección hacia joven-joven
  }
  if (edad <= picoMax) return 1; // en pico
  const anosPostPico = edad - picoMax;
  return Math.max(0.05, Math.pow(1 - c.postPico, anosPostPico));
}

export function depreciacionValorJugadorEdad(i: Inputs): Outputs {
  const valor = Math.max(0, Number(i.valorActualEur) || 0);
  const edadA = Math.max(15, Math.min(45, Number(i.edadActual)));
  const edadB = Math.max(15, Math.min(45, Number(i.edadObjetivo)));
  const pos = i.posicion;
  const curva = CURVA[pos];
  if (!curva) throw new Error('Posición inválida.');

  const factorA = factorEdad(edadA, pos);
  const factorB = factorEdad(edadB, pos);
  const valorProyectado = valor * (factorB / factorA);
  const depreciacion = valor - valorProyectado;
  const anos = Math.max(1, Math.abs(edadB - edadA));
  const deprAnual = depreciacion / anos;

  const fmtEur = (n: number) => '€' + Math.round(n).toLocaleString('es-AR');
  const pierde = depreciacion > 0;
  const pctCambio = valor > 0 ? Math.abs(depreciacion / valor) * 100 : 0;

  const _insight = {
    title: pierde ? `De los ${edadA} a los ${edadB}: el valor cae` : `De los ${edadA} a los ${edadB}: el valor sube`,
    text: pierde
      ? `Pasando de **${edadA}** a **${edadB}** años, un ${pos} pierde unos **${fmtEur(depreciacion)}** (**${pctCambio.toFixed(0)}%**), quedando en **${fmtEur(valorProyectado)}**. La caída se acelera tras el pico de ${curva.pico[0]}–${curva.pico[1]} años (${Math.round(curva.postPico*100)}%/año).`
      : `Pasando de **${edadA}** a **${edadB}** años, este ${pos} todavía no llegó a su pico (${curva.pico[0]}–${curva.pico[1]} años): el valor sube hacia **${fmtEur(valorProyectado)}**, unos **${fmtEur(Math.abs(depreciacion))}** más (**${pctCambio.toFixed(0)}%**).`,
    tone: pierde ? 'warn' : 'good',
    icon: '⚽',
  };

  const _chart = pierde
    ? {
        type: 'doughnut',
        slices: [
          { label: `Valor a los ${edadB}`, value: Math.round(valorProyectado) },
          { label: 'Pérdida por edad', value: Math.round(depreciacion) },
        ],
        prefix: '€',
        centerValue: fmtEur(valor),
        centerLabel: `Valor a los ${edadA}`,
        ariaLabel: `De ${fmtEur(valor)} a los ${edadA} años, quedan ${fmtEur(valorProyectado)} a los ${edadB} y se pierden ${fmtEur(depreciacion)} por edad.`,
      }
    : undefined;

  return {
    valorProyectado: Math.round(valorProyectado),
    depreciacionTotal: Math.round(depreciacion),
    depreciacionAnualPromedio: Math.round(deprAnual),
    curvaAplicada: `Curva ${pos}: pico ${curva.pico[0]}–${curva.pico[1]} años, caída ${Math.round(curva.postPico*100)}%/año post-pico.`,
    picoEdad: curva.pico,
    mensaje: `Valor proyectado a los ${edadB} años: €${Math.round(valorProyectado).toLocaleString('es-AR')}. Depreciación total: €${Math.round(depreciacion).toLocaleString('es-AR')}.`,
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
