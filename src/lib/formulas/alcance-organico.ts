/** Alcance orgánico vs pago en redes sociales */
export interface AlcanceOrganicoInputs {
  seguidores: number;
  alcanceOrganico: number;
  inversionPaga?: number;
  cpmPago?: number;
}
export interface AlcanceOrganicoOutputs {
  tasaAlcanceOrganico: number;
  impresionesOrganicas: number;
  impresionespagas: number;
  alcanceTotal: number;
  detalle: string;
}

export function alcanceOrganico(inputs: AlcanceOrganicoInputs): AlcanceOrganicoOutputs {
  const seguidores = Number(inputs.seguidores);
  const orgAlcance = Number(inputs.alcanceOrganico);
  const inversion = Number(inputs.inversionPaga || 0);
  const cpm = Number(inputs.cpmPago || 0);

  if (!seguidores || seguidores <= 0) throw new Error('Ingresá la cantidad de seguidores');
  if (orgAlcance < 0) throw new Error('El alcance orgánico no puede ser negativo');

  const tasaOrg = Number(((orgAlcance / seguidores) * 100).toFixed(1));
  const impOrganicas = Math.round(orgAlcance * 1.3); // factor frecuencia
  const impPagas = cpm > 0 && inversion > 0 ? Math.round((inversion / cpm) * 1000) : 0;
  const alcanceTotal = orgAlcance + impPagas;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  let evaluacion = '';
  if (tasaOrg >= 25) evaluacion = 'Excelente alcance orgánico';
  else if (tasaOrg >= 15) evaluacion = 'Buen alcance orgánico';
  else if (tasaOrg >= 8) evaluacion = 'Alcance promedio';
  else if (tasaOrg >= 3) evaluacion = 'Alcance bajo — considerá más inversión paga';
  else evaluacion = 'Alcance muy bajo — revisá contenido y frecuencia';

  return {
    tasaAlcanceOrganico: tasaOrg,
    impresionesOrganicas: impOrganicas,
    impresionespagas: impPagas,
    alcanceTotal,
    detalle: `Tasa de alcance orgánico: ${fmt.format(tasaOrg)}% (${evaluacion}). ~${fmt.format(impOrganicas)} impresiones orgánicas + ${fmt.format(impPagas)} impresiones pagas = alcance total ~${fmt.format(alcanceTotal)}.`,
  };
}
