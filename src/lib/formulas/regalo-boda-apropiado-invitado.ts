/**
 * Calculadora de Regalo de Boda Apropiado por Invitado.
 */
export interface RegaloBodaApropiadoInvitadoInputs { relacionConNovios:string; nivelEvento:string; sueldoInvitado:number; }
export interface RegaloBodaApropiadoInvitadoOutputs { regaloSugerido:number; porcentajeSueldo:number; ideas:string; consejo:string; }
export function regaloBodaApropiadoInvitado(inputs: RegaloBodaApropiadoInvitadoInputs): RegaloBodaApropiadoInvitadoOutputs {
  const relacion = (inputs as RegaloBodaApropiadoInvitadoInputs).relacionConNovios;
  const nivel = (inputs as RegaloBodaApropiadoInvitadoInputs).nivelEvento;
  const sueldo = Number((inputs as RegaloBodaApropiadoInvitadoInputs).sueldoInvitado);
  if (!sueldo || sueldo <= 0) throw new Error('Ingresá sueldo');
  const base: Record<string, Record<string, number>> = {
    familiaCercana: { basico: 600, medio: 900, premium: 2000 },
    familiaLejana: { basico: 300, medio: 400, premium: 600 },
    amigoIntimo: { basico: 275, medio: 400, premium: 750 },
    amigo: { basico: 160, medio: 225, premium: 375 },
    conocido: { basico: 100, medio: 140, premium: 225 },
  };
  let regaloSugerido = base[relacion]?.[nivel] || 200;
  if (sueldo < 1000) regaloSugerido = Math.min(regaloSugerido, sueldo * 0.3);
  if (sueldo > 5000) regaloSugerido = Math.min(regaloSugerido * 1.2, sueldo * 0.2);
  regaloSugerido = Math.round(regaloSugerido);
  const porcentajeSueldo = Number(((regaloSugerido / sueldo) * 100).toFixed(1));
  let ideas = '';
  if (regaloSugerido < 200) ideas = 'Gift card supermercado/electro, vinos premium, velas aromáticas';
  else if (regaloSugerido < 500) ideas = 'Cafetera premium, sábanas buenas, gift card hotel, lista de bodas';
  else if (regaloSugerido < 1000) ideas = 'Gift card hotel para luna de miel, electrodoméstico grande, contribución lista bodas';
  else ideas = 'Viaje fin de semana, contribución luna de miel, muebles, joyería';
  const consejo = porcentajeSueldo > 30 ? 'Regalo excede 30% del sueldo: ajustá hacia abajo' : 'Regalo balanceado respecto a tu sueldo';
  return { regaloSugerido, porcentajeSueldo, ideas, consejo };
}
