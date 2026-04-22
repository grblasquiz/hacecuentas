/**
 * Sueldo docente CABA (ADEMYS/UTE) — escalafón GCBA, antigüedad escalonada.
 * Cargos: maestro sección primaria, maestro secundaria (15 horas cátedra), profesor especial.
 * Antigüedad: 10% (>=2 años), 15% (>=5), 20% (>=7), 25% (>=10), 30% (>=12), 40% (>=15), 50% (>=18), 60% (>=22), 70% (>=24).
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

const PUNTO_INDICE_2026 = 3200; // ARS por punto índice (valor referencial abril 2026)

const PUNTOS_POR_CARGO: Record<string, number> = {
  maestroPrimaria: 185,
  maestroSecundaria15: 250,
  profesorEspecial: 170,
  preceptor: 160,
  directorPrimaria: 320,
};

function antiguedadPct(anios: number): number {
  if (anios >= 24) return 70;
  if (anios >= 22) return 60;
  if (anios >= 18) return 50;
  if (anios >= 15) return 40;
  if (anios >= 12) return 30;
  if (anios >= 10) return 25;
  if (anios >= 7) return 20;
  if (anios >= 5) return 15;
  if (anios >= 2) return 10;
  return 0;
}

export function sueldoDocenteAdemysCaba(i: Inputs): Outputs {
  const cargo = String(i.cargo || 'maestroPrimaria');
  const antig = Math.max(0, Number(i.antiguedadAnios) || 0);

  const puntos = PUNTOS_POR_CARGO[cargo] ?? PUNTOS_POR_CARGO.maestroPrimaria;
  const basico = puntos * PUNTO_INDICE_2026;
  const pctAnt = antiguedadPct(antig);
  const antiguedad = basico * pctAnt / 100;
  const material = 25000; // material didáctico fijo mensual
  const presentismo = basico * 0.10;
  const bruto = basico + antiguedad + material + presentismo;
  const aportes = bruto * 0.17;
  const neto = bruto - aportes;

  const fmt = (n: number) => `$${Math.round(n).toLocaleString('es-AR')}`;
  return {
    sueldoBruto: fmt(bruto),
    sueldoNeto: fmt(neto),
    basico: fmt(basico),
    antiguedad: `${fmt(antiguedad)} (${pctAnt}%)`,
    presentismoYMaterial: fmt(presentismo + material),
    aportes: fmt(aportes),
    cargo,
  };
}
