/**
 * Calculadora de Gaseosa por Invitado - Cumple Infantil.
 */
export interface GaseosaPorInvitadoCumpleInfantilInputs { invitados:number; ninos:number; horas:number; }
export interface GaseosaPorInvitadoCumpleInfantilOutputs { litrosGaseosa:number; botellas225:number; botellas15:number; litrosCola:number; litrosSabores:number; _insight?:any; _chart?:any; }
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
  const litrosTot = Number(litrosGaseosa.toFixed(1));
  const cola1 = Number(litrosCola.toFixed(1));
  const sabores1 = Number(litrosSabores.toFixed(1));
  const _insight = {
    title: 'Gaseosa para el cumple',
    text: `Para ${invitados} invitados (${ninos} niños) durante ${horas} h necesitás **${litrosTot} litros** de gaseosa, o sea **${botellas225} botellas de 2,25 L**. Conviene mitad cola y mitad sabores para que no quede nadie afuera.`,
    tone: 'neutral',
    icon: '🥤',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Cola', value: cola1 },
      { label: 'Sabores', value: sabores1 },
    ],
    prefix: '',
    centerValue: `${litrosTot} L`,
    centerLabel: 'gaseosa total',
    ariaLabel: `Reparto de ${litrosTot} litros de gaseosa: ${cola1} L de cola y ${sabores1} L de sabores`,
  };
  return {
    litrosGaseosa: litrosTot,
    botellas225, botellas15,
    litrosCola: cola1,
    litrosSabores: sabores1,
    _insight,
    _chart,
  };
}
