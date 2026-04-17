/**
 * Calculadora de Gaseosa por Invitado - Cumple Infantil.
 */
export interface GaseosaPorInvitadoCumpleInfantilInputs { invitados:number; ninos:number; horas:number; }
export interface GaseosaPorInvitadoCumpleInfantilOutputs { litrosGaseosa:number; botellas225:number; botellas15:number; litrosCola:number; litrosSabores:number; }
export function gaseosaPorInvitadoCumpleInfantil(inputs: GaseosaPorInvitadoCumpleInfantilInputs): GaseosaPorInvitadoCumpleInfantilOutputs {
  const invitados = Number(inputs.invitados);
  const ninos = Number(inputs.ninos);
  const horas = Number(inputs.horas);
  if (!invitados || invitados <= 0) throw new Error('Ingresá invitados válidos');
  if (ninos < 0 || ninos > invitados) throw new Error('Cantidad de niños inválida');
  if (!horas || horas <= 0) throw new Error('Ingresá duración válida');
  const adultos = invitados - ninos;
  let litrosNinos = ninos * 0.7;
  let litrosAdultos = adultos * 0.4;
  if (horas >= 5) { litrosNinos *= 1.2; litrosAdultos *= 1.2; }
  else if (horas <= 2) { litrosNinos *= 0.7; litrosAdultos *= 0.7; }
  const litrosGaseosa = (litrosNinos + litrosAdultos) * 1.1;
  const botellas225 = Math.ceil(litrosGaseosa / 2.25);
  const botellas15 = Math.ceil(litrosGaseosa / 1.5);
  const litrosCola = litrosGaseosa * 0.5;
  const litrosSabores = litrosGaseosa * 0.5;
  return {
    litrosGaseosa: Number(litrosGaseosa.toFixed(1)),
    botellas225, botellas15,
    litrosCola: Number(litrosCola.toFixed(1)),
    litrosSabores: Number(litrosSabores.toFixed(1)),
  };
}
