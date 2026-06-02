/**
 * Conversor de UMA (Unidad de Medida y Actualización) a pesos mexicanos
 * Valores 2026 (proyección INEGI/DOF)
 */

export interface Inputs {
  cantidadUma: number;
  tipoUma?: 'diaria' | 'mensual' | 'anual';
  // retro-compat
  tipo?: 'diaria' | 'mensual' | 'anual';
}

export interface Outputs {
  valorPesos: number;
  valorUnitario: number;
  equivalenciaDiaria: number;
  equivalenciaMensual: number;
  detalle: string;
  mensaje: string;
  _insight?: any;
}

const UMA_2026 = {
  diaria: 113.14,
  mensual: 3439.46,
  anual: 41273.52,
};

export function umaConversion(i: Inputs): Outputs {
  const cantidad = Number(i.cantidadUma);
  const tipo = (i.tipoUma ?? i.tipo ?? 'diaria') as 'diaria' | 'mensual' | 'anual';

  if (!cantidad || cantidad <= 0) throw new Error('Ingresá la cantidad de UMA');
  if (!['diaria', 'mensual', 'anual'].includes(tipo)) {
    throw new Error('Tipo debe ser diaria, mensual o anual');
  }

  const valorUnitario = UMA_2026[tipo];
  const valorPesos = cantidad * valorUnitario;

  // Equivalencias (convertir a UMA diaria y mensual)
  // 1 UMA anual = 365 UMA diaria; 1 UMA mensual = 30.4 UMA diaria (aprox)
  const factoresDia: Record<string, number> = { diaria: 1, mensual: 30.4, anual: 365 };
  const equivalenciaDiaria = cantidad * factoresDia[tipo];
  const equivalenciaMensual = equivalenciaDiaria / 30.4;

  const fmtMx = (n: number) => n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const insight = {
    title: 'Cuánto valen tus UMA en pesos',
    text: `**${cantidad} UMA ${tipo}** equivalen a **$${fmtMx(valorPesos)} MXN** (valor 2026 de **$${fmtMx(valorUnitario)}** por UMA ${tipo}). La UMA reemplazó al salario mínimo como referencia para multas, créditos Infonavit y trámites; la actualiza el INEGI cada febrero según inflación.`,
    tone: 'neutral' as const,
    icon: '📐',
  };

  return {
    valorPesos: Number(valorPesos.toFixed(2)),
    valorUnitario: Number(valorUnitario.toFixed(2)),
    equivalenciaDiaria: Number(equivalenciaDiaria.toFixed(2)),
    equivalenciaMensual: Number(equivalenciaMensual.toFixed(2)),
    detalle: `${cantidad} UMA ${tipo} × $${valorUnitario} = $${valorPesos.toFixed(2)}`,
    mensaje: `${cantidad} UMA ${tipo} equivalen a $${valorPesos.toFixed(2)} pesos (valor 2026).`,
    _insight: insight,
  };
}
