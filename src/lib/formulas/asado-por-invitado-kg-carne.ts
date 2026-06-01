/**
 * Calculadora de Asado por Invitado - Kg de Carne.
 * Base: 500g varón, 300g mujer, 150g niño.
 */
export interface AsadoPorInvitadoKgCarneInputs { invitados:number; mujeres:number; ninos:number; cortes:string; }
export interface AsadoPorInvitadoKgCarneOutputs { kgCarne:number; kgAsado:number; kgVacio:number; kgChorizo:number; gramosPorPersona:number; _chart?:any; }
export function asadoPorInvitadoKgCarne(inputs: AsadoPorInvitadoKgCarneInputs): AsadoPorInvitadoKgCarneOutputs {
  const total = Number(inputs.invitados);
  const mujeres = Number(inputs.mujeres);
  const ninos = Number(inputs.ninos);
  const cortes = inputs.cortes;
  if (!total || total <= 0) throw new Error('Ingresá invitados');
  if (mujeres + ninos > total) throw new Error('Mujeres + niños > total');
  const hombres = total - mujeres - ninos;
  const kgBase = (hombres * 0.5 + mujeres * 0.3 + ninos * 0.15);
  const kgCarne = kgBase * 1.1;
  let pctAsado = 0.4, pctVacio = 0.4, pctChori = 0.2;
  if (cortes === '2') { pctAsado = 0.6; pctVacio = 0; pctChori = 0.4; }
  else if (cortes === '4') { pctAsado = 0.3; pctVacio = 0.5; pctChori = 0.2; }
  const kgAsado = Number((kgCarne * pctAsado).toFixed(2));
  const kgVacio = Number((kgCarne * pctVacio).toFixed(2));
  const kgChorizo = Number((kgCarne * pctChori).toFixed(2));
  const kgCarneRedondeado = Number(kgCarne.toFixed(2));

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Asado / costillar', value: kgAsado },
      { label: 'Vacío', value: kgVacio },
      { label: 'Chorizo', value: kgChorizo },
    ],
    prefix: '',
    centerValue: kgCarneRedondeado.toLocaleString('es-AR') + ' kg',
    centerLabel: 'Total carne',
    ariaLabel: 'Composición de la carne del asado por tipo de corte',
  };

  return {
    kgCarne: kgCarneRedondeado,
    kgAsado,
    kgVacio,
    kgChorizo,
    gramosPorPersona: Math.round((kgCarne * 1000) / total),
    _chart: chart,
  };
}
