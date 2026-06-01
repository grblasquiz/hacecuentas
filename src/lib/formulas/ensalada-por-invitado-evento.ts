/**
 * Calculadora de Ensalada por Invitado - Evento.
 */
export interface EnsaladaPorInvitadoEventoInputs { invitados:number; rol:string; }
export interface EnsaladaPorInvitadoEventoOutputs { kgEnsalada:number; kgLechuga:number; kgTomate:number; kgCebolla:number; gramosPorPersona:number; _chart?: any; }
export function ensaladaPorInvitadoEvento(inputs: EnsaladaPorInvitadoEventoInputs): EnsaladaPorInvitadoEventoOutputs {
  const inv = Number(inputs.invitados);
  const rol = inputs.rol;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let gramos = 150;
  if (rol === 'principal') gramos = 300;
  else if (rol === 'entrada') gramos = 100;
  const kgEnsalada = (inv * gramos) / 1000;
  const kgLechuga = Number((kgEnsalada * 0.5).toFixed(2));
  const kgTomate = Number((kgEnsalada * 0.3).toFixed(2));
  const kgCebolla = Number((kgEnsalada * 0.15).toFixed(2));
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Lechuga', value: kgLechuga },
      { label: 'Tomate', value: kgTomate },
      { label: 'Cebolla', value: kgCebolla },
    ],
    prefix: '',
    centerValue: Number(kgEnsalada.toFixed(2)).toLocaleString('es-AR') + ' kg',
    centerLabel: 'Ensalada total',
    ariaLabel: 'Composición de la ensalada por ingrediente: lechuga, tomate y cebolla.',
  };
  return {
    kgEnsalada: Number(kgEnsalada.toFixed(2)),
    kgLechuga,
    kgTomate,
    kgCebolla,
    gramosPorPersona: gramos,
    _chart: chart,
  };
}
