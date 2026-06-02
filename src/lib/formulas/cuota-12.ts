/** CFT implícito en "12 cuotas sin interés" */
export interface Inputs { precioContado: number; precio12Cuotas: number; cuotas?: number; }
export interface Outputs {
  cuotaMensual: number;
  sobreprecio: number;
  sobreprecioPorcentual: number;
  cftAnual: number;
  tasaMensualImplicita: number;
  convieneContado: boolean;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

export function cuota12(i: Inputs): Outputs {
  const contado = Number(i.precioContado);
  const total12 = Number(i.precio12Cuotas);
  const n = Number(i.cuotas) || 12;
  if (!contado || contado <= 0) throw new Error('Ingresá el precio al contado');
  if (!total12 || total12 <= 0) throw new Error('Ingresá el precio financiado');
  if (n < 1) throw new Error('Cuotas inválidas');

  const cuotaMensual = total12 / n;
  const sobreprecio = total12 - contado;
  const sobrePorcentual = (sobreprecio / contado) * 100;

  // TIR del flujo: pagaste "contado" como VAN, recibís cuotas mensuales en lugar de pagarlas
  // Para cuotas iguales: contado = cuota × [1 − (1+i)^-n] / i → se resuelve por iteración
  let tasa = 0;
  if (sobreprecio > 0) {
    let lo = 0;
    let hi = 1; // hasta 100% mensual
    for (let iter = 0; iter < 80; iter++) {
      const mid = (lo + hi) / 2;
      const van = cuotaMensual * (1 - Math.pow(1 + mid, -n)) / (mid || 1e-12);
      if (van > contado) lo = mid; else hi = mid;
    }
    tasa = (lo + hi) / 2;
  }

  const cftAnual = (Math.pow(1 + tasa, 12) - 1) * 100;
  const conviene = sobreprecio > 0;
  const mensaje = !conviene
    ? 'Es realmente sin interés — las 12 cuotas no tienen recargo.'
    : `Las cuotas te cobran un ${sobrePorcentual.toFixed(1)}% más que el contado. Equivale a una tasa mensual del ${(tasa * 100).toFixed(2)}%.`;

  const fmt = (x: number) => '$' + Math.round(x).toLocaleString('es-AR');
  const _insight = conviene
    ? {
        title: 'Tienen recargo',
        text: `No son gratis: pagás **${fmt(sobreprecio)}** más que al contado (**${sobrePorcentual.toFixed(1)}%**), un CFT anual del **${cftAnual.toFixed(1)}%**. Si tenés la plata, conviene el contado.`,
        tone: 'warn',
        icon: '💳',
      }
    : {
        title: 'Sin interés real',
        text: `Las ${n} cuotas no tienen recargo: pagás lo mismo que al contado (**${fmt(total12)}**). Financiarlo no te cuesta nada — conviene aprovecharlo.`,
        tone: 'good',
        icon: '✅',
      };

  const out: Outputs = {
    cuotaMensual: Math.round(cuotaMensual),
    sobreprecio: Math.round(sobreprecio),
    sobreprecioPorcentual: Number(sobrePorcentual.toFixed(2)),
    cftAnual: Number(cftAnual.toFixed(2)),
    tasaMensualImplicita: Number((tasa * 100).toFixed(2)),
    convieneContado: conviene,
    mensaje,
    _insight,
  };

  // Donut: el precio financiado = precio contado + sobreprecio (recargo)
  if (sobreprecio > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Precio contado', value: Math.round(contado) },
        { label: 'Recargo financiero', value: Math.round(sobreprecio) },
      ],
      prefix: '$',
      centerValue: fmt(total12),
      centerLabel: 'Total en cuotas',
      ariaLabel: `El total financiado de ${fmt(total12)} se compone de ${fmt(contado)} de precio al contado y ${fmt(sobreprecio)} de recargo`,
    };
  }

  return out;
}
