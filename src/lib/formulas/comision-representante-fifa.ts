/** Comisión representante/agente FIFA — FIFA Agents Regulations 2023 */
export interface Inputs {
  salarioBrutoAnualUsd: number;
  transferFeeUsd?: number;
  aniosContrato?: number;
  servicio: 'jugador' | 'club-comprador' | 'club-vendedor' | 'dual';
}
export interface Outputs {
  comisionJugador: number;
  comisionClubComprador: number;
  comisionClubVendedor: number;
  comisionTotal: number;
  reglaFIFA: string;
  mensaje: string;
}

// FIFA Agents Regulations 2023 — caps
const CAP_JUGADOR_CONTRATADO = 0.03; // ≤200k USD año bruto → 5%; >200k → 3%
const CAP_JUGADOR_BAJO = 0.05;
const UMBRAL_BAJO_USD = 200_000;
const CAP_CLUB_COMPRADOR = 0.03;
const CAP_CLUB_VENDEDOR = 0.10; // 10% del transfer fee

export function comisionRepresentanteFifa(i: Inputs): Outputs {
  const salario = Math.max(0, Number(i.salarioBrutoAnualUsd) || 0);
  const transfer = Math.max(0, Number(i.transferFeeUsd) || 0);
  const anios = Math.max(1, Number(i.aniosContrato) || 1);
  const servicio = i.servicio;

  // Comisión al jugador: sobre salario bruto TOTAL del contrato (salario × años)
  const salarioTotal = salario * anios;
  const capJugador = salario <= UMBRAL_BAJO_USD ? CAP_JUGADOR_BAJO : CAP_JUGADOR_CONTRATADO;
  let comisionJugador = 0;
  let comisionClubComp = 0;
  let comisionClubVend = 0;

  if (servicio === 'jugador' || servicio === 'dual') {
    comisionJugador = salarioTotal * capJugador;
  }
  if (servicio === 'club-comprador' || servicio === 'dual') {
    comisionClubComp = salarioTotal * CAP_CLUB_COMPRADOR;
  }
  if (servicio === 'club-vendedor') {
    comisionClubVend = transfer * CAP_CLUB_VENDEDOR;
  }

  const total = comisionJugador + comisionClubComp + comisionClubVend;
  const regla = `FIFA Agents Regulations 2023: jugador hasta ${capJugador*100}% del salario bruto contrato (cap del salario <USD 200k: 5%); club comprador hasta 3%; club vendedor hasta 10% del transfer fee. Doble representación (jugador+comprador) permitida: 6% máx combinado.`;

  return {
    comisionJugador: Math.round(comisionJugador),
    comisionClubComprador: Math.round(comisionClubComp),
    comisionClubVendedor: Math.round(comisionClubVend),
    comisionTotal: Math.round(total),
    reglaFIFA: regla,
    mensaje: `Comisión total agente: USD ${Math.round(total).toLocaleString('en-US')}. Jugador: ${Math.round(comisionJugador).toLocaleString('en-US')}, club comprador: ${Math.round(comisionClubComp).toLocaleString('en-US')}, club vendedor: ${Math.round(comisionClubVend).toLocaleString('en-US')}.`,
  };
}
