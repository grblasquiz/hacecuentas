/** Pensión mensual de caballo en club hípico según servicio y zona */
export interface Inputs { tipoPension: string; zona: string; incluyeHerrador: boolean; incluyeVeterinario: boolean; }
export interface Outputs { pensionMensual: number; extrasMensuales: number; totalMensual: number; totalAnual: number; explicacion: string; _insight?: any; _chart?: any; }
export function caballoPensionMesClubHipico(i: Inputs): Outputs {
  const tipo = String(i.tipoPension || '').toLowerCase();
  const zona = String(i.zona || '').toLowerCase();
  const herrador = !!i.incluyeHerrador;
  const vet = !!i.incluyeVeterinario;
  // Pensión 2026 ARS — base por servicio
  const baseTipo: Record<string, number> = {
    'full': 580000, 'medio-pupilaje': 380000, 'pension-simple': 250000, 'box-paddock': 720000,
  };
  const multZona: Record<string, number> = {
    'pilar': 1.3, 'san-isidro': 1.4, 'canning': 1.1, 'la-plata': 0.85, 'lujan': 0.95, 'ezeiza': 0.9,
  };
  const base = baseTipo[tipo] ?? 380000;
  const mult = multZona[zona] ?? 1;
  const pension = base * mult;
  const extraHerrador = herrador ? 45000 : 0;
  const extraVet = vet ? 35000 : 0;
  const extras = extraHerrador + extraVet;
  const total = pension + extras;
  const totalAnual = total * 12;
  const insight = {
    title: 'Tu costo real de mantener el caballo',
    text: extras > 0
      ? `La pensión sale **$${pension.toLocaleString('es-AR')}/mes** y los extras (herrador/veterinario) suman **$${extras.toLocaleString('es-AR')}**, llevando el total a **$${total.toLocaleString('es-AR')}/mes**. En el año son **$${totalAnual.toLocaleString('es-AR')}** — presupuestá los extras, que pesan ${((extras / total) * 100).toFixed(0)}% del costo.`
      : `La pensión sola sale **$${total.toLocaleString('es-AR')}/mes**, o **$${totalAnual.toLocaleString('es-AR')}** al año. Sumale herrador y veterinario aparte: son gastos fijos que la pensión simple no cubre.`,
    tone: 'warn',
    icon: '🐴',
  };
  const slices = [{ label: 'Pensión', value: Number(pension.toFixed(0)) }];
  if (extraHerrador > 0) slices.push({ label: 'Herrador', value: extraHerrador });
  if (extraVet > 0) slices.push({ label: 'Veterinario', value: extraVet });
  const chart = {
    type: 'doughnut',
    slices,
    prefix: '$',
    centerValue: '$' + total.toLocaleString('es-AR'),
    centerLabel: 'Total mensual',
    ariaLabel: 'Composición del costo mensual de pensión del caballo',
  };
  return {
    pensionMensual: Number(pension.toFixed(0)),
    extrasMensuales: Number(extras.toFixed(0)),
    totalMensual: Number(total.toFixed(0)),
    totalAnual: Number(totalAnual.toFixed(0)),
    explicacion: `Pensión ${tipo} en ${zona}: $${pension.toLocaleString('es-AR')} ARS/mes + extras $${extras.toLocaleString('es-AR')}. Total anual: $${(total * 12).toLocaleString('es-AR')}.`,
    _insight: insight,
    _chart: chart,
  };
}
