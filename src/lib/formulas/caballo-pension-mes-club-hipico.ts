/** Pensión mensual de caballo en club hípico según servicio y zona */
export interface Inputs { tipoPension: string; zona: string; incluyeHerrador: boolean; incluyeVeterinario: boolean; }
export interface Outputs { pensionMensual: number; extrasMensuales: number; totalMensual: number; totalAnual: number; explicacion: string; }
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
  return {
    pensionMensual: Number(pension.toFixed(0)),
    extrasMensuales: Number(extras.toFixed(0)),
    totalMensual: Number(total.toFixed(0)),
    totalAnual: Number((total * 12).toFixed(0)),
    explicacion: `Pensión ${tipo} en ${zona}: $${pension.toLocaleString('es-AR')} ARS/mes + extras $${extras.toLocaleString('es-AR')}. Total anual: $${(total * 12).toLocaleString('es-AR')}.`,
  };
}
