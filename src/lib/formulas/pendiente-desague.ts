/** Pendiente mínima para desagüe pluvial/sanitario/pileta */
export interface PendienteDesagueInputs {
  longitudTubo: number;
  tipoDesague?: string;
  diametroCm: number;
}
export interface PendienteDesagueOutputs {
  pendienteMinima: number;
  caida: number;
  alturaDiferencia: number;
  detalle: string;
  _insight?: any;
}

export function pendienteDesague(inputs: PendienteDesagueInputs): PendienteDesagueOutputs {
  const longitud = Number(inputs.longitudTubo);
  const tipo = String(inputs.tipoDesague || 'sanitario');
  const diametro = Number(inputs.diametroCm);

  if (!longitud || longitud <= 0) throw new Error('Ingresá la longitud del caño en metros');
  if (!diametro || diametro <= 0) throw new Error('Ingresá el diámetro del caño en cm');

  let pendiente: number;

  if (tipo === 'pluvial') {
    pendiente = diametro >= 10 ? 1 : 2;
  } else if (tipo === 'pileta') {
    pendiente = diametro >= 6 ? 2 : 3;
  } else {
    // sanitario
    if (diametro >= 10) pendiente = 1;
    else if (diametro >= 6) pendiente = 2;
    else pendiente = 3;
  }

  const caida = Number((longitud * pendiente).toFixed(1));
  const alturaDif = caida; // son equivalentes

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  return {
    pendienteMinima: pendiente,
    caida,
    alturaDiferencia: alturaDif,
    detalle: `Desagüe ${tipo} de ${fmt.format(longitud)} m con caño de ${fmt.format(diametro)} cm → pendiente mínima ${pendiente}%, caída total ${fmt.format(caida)} cm.`,
    _insight: {
      title: 'Pendiente y caída del caño',
      text: `Para un desagüe ${tipo} con caño de ${fmt.format(diametro)} cm, la pendiente mínima es **${pendiente}%**: en ${fmt.format(longitud)} m el extremo de salida tiene que quedar **${fmt.format(caida)} cm** más bajo que el de entrada. Con menos caída el agua no corre y con mucho más el líquido se adelanta a los sólidos.`,
      tone: 'neutral',
      icon: '📐',
    },
  };
}
