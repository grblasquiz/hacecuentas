export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function bajaAutoDesarmeChatarraFinVida(i: Inputs): Outputs {
  const m=String(i.motivo||'dest');
  const c: Record<string,number> = { dest:60000, expo:85000, chat:45000 };
  const monto = c[m] || 60000;
  const labels: Record<string,string> = { dest:'desarme', expo:'exportación', chat:'chatarrización' };
  const motivoTxt = labels[m] || 'desarme';
  return {
    costo:'$'+monto.toLocaleString('es-AR'),
    beneficio:'Cese patente + responsabilidad civil',
    resumen:`Baja ${m}: $${monto.toLocaleString('es-AR')}.`,
    _insight: {
      title: 'Qué te deja la baja',
      text: `La baja por **${motivoTxt}** cuesta unos **$${monto.toLocaleString('es-AR')}**. A cambio cesan la **patente** y tu **responsabilidad civil** sobre el vehículo: dejás de pagar impuesto y respondés por multas o siniestros futuros.`,
      tone: 'good',
      icon: '🚗',
    },
  };
}
