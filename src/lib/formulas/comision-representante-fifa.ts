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
  _insight?: any;
  _chart?: any;
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

  const usd = (n: number) => 'USD ' + Math.round(n).toLocaleString('en-US');
  let insightText = '';
  if (servicio === 'dual') {
    insightText = `Con doble representación el agente cobra **${usd(total)}**: ${usd(comisionJugador)} del jugador (${capJugador*100}%) más ${usd(comisionClubComp)} del club comprador (3%). FIFA topea esta combinación en 6% del salario del contrato.`;
  } else if (servicio === 'jugador') {
    insightText = `El agente cobra **${usd(comisionJugador)}** del jugador: ${capJugador*100}% sobre el salario bruto de todo el contrato (${usd(salarioTotal)} en ${anios} año${anios>1?'s':''}).${salario > UMBRAL_BAJO_USD ? ' Como el salario anual supera los USD 200k, el cap baja de 5% a 3%.' : ''}`;
  } else if (servicio === 'club-comprador') {
    insightText = `El club comprador paga **${usd(comisionClubComp)}** al agente: el 3% sobre el salario bruto del contrato (${usd(salarioTotal)} en ${anios} año${anios>1?'s':''}).`;
  } else {
    insightText = `El club vendedor paga **${usd(comisionClubVend)}** al agente: el tope FIFA del 10% sobre un transfer fee de ${usd(transfer)}.`;
  }
  const _insight = {
    title: 'Lo que se lleva el agente',
    text: insightText,
    tone: 'neutral',
    icon: '⚽',
  };

  const out: Outputs = {
    comisionJugador: Math.round(comisionJugador),
    comisionClubComprador: Math.round(comisionClubComp),
    comisionClubVendedor: Math.round(comisionClubVend),
    comisionTotal: Math.round(total),
    reglaFIFA: regla,
    mensaje: `Comisión total agente: USD ${Math.round(total).toLocaleString('en-US')}. Jugador: ${Math.round(comisionJugador).toLocaleString('en-US')}, club comprador: ${Math.round(comisionClubComp).toLocaleString('en-US')}, club vendedor: ${Math.round(comisionClubVend).toLocaleString('en-US')}.`,
    _insight,
  };

  if (servicio === 'dual' && comisionJugador > 0 && comisionClubComp > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Paga el jugador', value: Math.round(comisionJugador) },
        { label: 'Paga el club comprador', value: Math.round(comisionClubComp) },
      ],
      prefix: 'USD ',
      centerValue: 'USD ' + Math.round(total).toLocaleString('en-US'),
      centerLabel: 'Comisión total',
      ariaLabel: `Reparto de la comisión del agente en doble representación: jugador ${usd(comisionJugador)}, club comprador ${usd(comisionClubComp)}.`,
    };
  }

  return out;
}
