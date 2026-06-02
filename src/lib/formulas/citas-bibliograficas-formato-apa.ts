/** Calculadora de cantidad de citas bibliográficas necesarias */

export interface Inputs {
  paginasTrabajo: number;
  factorCitas: number;
  porcentajePrimarias: number;
}

export interface Outputs {
  fuentesTotales: number;
  fuentesPrimarias: number;
  fuentesSecundarias: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function citasBibliograficasFormatoApa(i: Inputs): Outputs {
  const paginas = Number(i.paginasTrabajo);
  const factor = Number(i.factorCitas);
  const pctPrimarias = Number(i.porcentajePrimarias);

  if (isNaN(paginas) || paginas < 1) {
    throw new Error('Ingresá la cantidad de páginas del trabajo (mínimo 1)');
  }
  if (isNaN(factor) || factor < 0.5 || factor > 3) {
    throw new Error('El factor de citas debe estar entre 0,5 y 3');
  }
  if (isNaN(pctPrimarias) || pctPrimarias < 0 || pctPrimarias > 100) {
    throw new Error('El porcentaje de fuentes primarias debe estar entre 0% y 100%');
  }

  const totales = Math.round(paginas * factor);
  const primarias = Math.round(totales * (pctPrimarias / 100));
  const secundarias = totales - primarias;

  // Proporción real de primarias (puede diferir del % pedido por redondeo)
  const pctPrimReal = totales > 0 ? (primarias / totales) * 100 : 0;
  const primOk = pctPrimReal >= 40;
  const _insight = {
    title: 'Bibliografía sugerida',
    text: `Un trabajo de **${paginas} página${paginas !== 1 ? 's' : ''}** pide alrededor de **${totales} fuente${totales !== 1 ? 's' : ''}**: **${primarias} primaria${primarias !== 1 ? 's' : ''}** (${Math.round(pctPrimReal)}%) y **${secundarias} secundaria${secundarias !== 1 ? 's' : ''}**. ${primOk ? 'Buen apoyo en fuentes primarias: aporta rigor y evita la dependencia de interpretaciones de terceros.' : 'El peso de fuentes primarias es bajo; sumá más datos originales (estudios, documentos, datos crudos) para reforzar el rigor.'}`,
    tone: primOk ? 'good' : 'warn',
    icon: '📚',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Primarias', value: primarias },
      { label: 'Secundarias', value: secundarias },
    ],
    prefix: '',
    centerValue: `${totales}`,
    centerLabel: 'Fuentes',
    ariaLabel: `Total de ${totales} fuentes: ${primarias} primarias y ${secundarias} secundarias.`,
  };

  return {
    fuentesTotales: totales,
    fuentesPrimarias: primarias,
    fuentesSecundarias: secundarias,
    detalle: `Para un trabajo de ${paginas} páginas: ${totales} fuentes recomendadas (${primarias} primarias + ${secundarias} secundarias)`,
    _insight,
    _chart,
  };
}
