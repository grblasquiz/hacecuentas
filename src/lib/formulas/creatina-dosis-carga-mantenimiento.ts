/** Calculadora de dosis de creatina */
export interface Inputs {
  peso: number;
  protocolo: string;
}
export interface Outputs {
  dosisMantenimiento: number;
  dosisCargaDiaria: number;
  dosisCargaPorToma: number;
  diasCarga: number;
  poteDuracion: number;
  mensaje: string;
}

export function creatinaDosisarga(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const protocolo = String(i.protocolo || 'carga');
  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');

  // ISSN guidelines: carga 0.3 g/kg/día por 5-7 días, mantenimiento 0.03-0.1 g/kg/día
  const dosisCargaDiaria = Number((peso * 0.3).toFixed(1));
  const dosisCargaPorToma = Number((dosisCargaDiaria / 4).toFixed(1));
  const diasCarga = protocolo === 'carga' ? 5 : 0;

  // Mantenimiento: 0.07 g/kg pero mínimo 3g, máximo 10g
  let dosisMantenimiento = Number((peso * 0.07).toFixed(1));
  if (dosisMantenimiento < 3) dosisMantenimiento = 3;
  if (dosisMantenimiento > 10) dosisMantenimiento = 10;

  const poteDuracion = Math.floor(300 / dosisMantenimiento);

  let mensaje: string;
  if (protocolo === 'carga') {
    mensaje = `Carga: \${dosisCargaDiaria}g/día (\${dosisCargaPorToma}g x 4 tomas) durante 5 días. Después mantenimiento: \${dosisMantenimiento}g/día.`;
  } else {
    mensaje = `Directo a mantenimiento: \${dosisMantenimiento}g/día. Saturación completa en ~28 días.`;
  }

  return { dosisMantenimiento, dosisCargaDiaria, dosisCargaPorToma, diasCarga, poteDuracion, mensaje };
}