/**
 * Tarifa de taxi Bogotá 2026 — Decreto Distrital 042 de 2026 (en firme 12-feb-2026).
 * Taxímetro por unidades: 1 unidad = 100 m de recorrido o 24 s de espera.
 * Unidad $159 (básico) / $172 (factor de excelencia). Banderazo 28 unidades. Carrera mínima $8.000/$8.600.
 * Recargos fijos: nocturno-dominical-festivo (20:00–05:00), aeropuerto El Dorado/Puente Aéreo, puerta a puerta.
 * Tabla importada de la data país (NO hardcodear).
 */
import { TAXI_BOGOTA_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  km: number;
  minutos_espera: number;
  nivel: 'basico' | 'experiencial';
  nocturno_dominical: 'si' | 'no';
  aeropuerto: 'si' | 'no';
  puerta_puerta: 'si' | 'no';
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const T = TAXI_BOGOTA_2026;
  const km = Number(i.km);
  if (!Number.isFinite(km) || km <= 0) throw new Error('Ingresa los kilómetros del recorrido');
  const minEspera = Math.max(0, Number(i.minutos_espera) || 0);
  const nivel: 'basico' | 'experiencial' = i.nivel === 'experiencial' ? 'experiencial' : 'basico';

  const unidad = T.unidadPesos[nivel];
  const banderazo = T.banderazoPesos[nivel];
  const minima = T.carreraMinimaPesos[nivel];

  // Unidades por distancia (1 unidad cada 100 m) y por espera (1 unidad por cada 24 s completos).
  const unidadesDistancia = Math.round((km * 1000) / T.metrosPorUnidad);
  const unidadesEspera = Math.floor((minEspera * 60) / T.segundosEsperaPorUnidad);

  const pesosDistancia = unidadesDistancia * unidad;
  const pesosEspera = unidadesEspera * unidad;

  const subtotal = banderazo + pesosDistancia + pesosEspera;
  const carreraBase = Math.max(subtotal, minima);
  const aplicoMinima = subtotal < minima;

  const recNocturno = i.nocturno_dominical === 'si' ? T.recargoNocturnoDominicalPesos[nivel] : 0;
  const recAeropuerto = i.aeropuerto === 'si' ? T.recargoAeropuertoPesos[nivel] : 0;
  const recPuerta = i.puerta_puerta === 'si' ? T.recargoPuertaAPuertaPesos[nivel] : 0;
  const recargos = recNocturno + recAeropuerto + recPuerta;

  const total = carreraBase + recargos;

  const partes: string[] = [
    `banderazo ${fmtCOP(banderazo)} (${T.banderazoUnidades} unidades)`,
    `${unidadesDistancia} unidades de recorrido × ${fmtCOP(unidad)} = ${fmtCOP(pesosDistancia)}`,
  ];
  if (unidadesEspera > 0) partes.push(`${unidadesEspera} unidades de espera × ${fmtCOP(unidad)} = ${fmtCOP(pesosEspera)}`);
  if (aplicoMinima) partes.push(`subtotal ${fmtCOP(subtotal)} < carrera mínima → se cobra ${fmtCOP(minima)}`);
  if (recNocturno) partes.push(`recargo nocturno/dominical/festivo ${fmtCOP(recNocturno)}`);
  if (recAeropuerto) partes.push(`recargo aeropuerto ${fmtCOP(recAeropuerto)}`);
  if (recPuerta) partes.push(`puerta a puerta ${fmtCOP(recPuerta)}`);

  const _insight = {
    title: `Tu carrera cuesta aprox. ${fmtCOP(total)}`,
    text: `Recorrido de **${km} km**${minEspera ? ` con ${minEspera} min de espera` : ''} en taxi ${nivel === 'basico' ? 'básico' : 'con factor de excelencia'}: carrera base **${fmtCOP(carreraBase)}**${recargos ? ` + recargos **${fmtCOP(recargos)}**` : ''} = **${fmtCOP(total)}**. ${aplicoMinima ? `Aplicó la carrera mínima de ${fmtCOP(minima)} del ${T.decreto}.` : `Según el ${T.decreto}, la unidad vale ${fmtCOP(unidad)} por cada 100 m o 24 s de espera.`}`,
    tone: 'neutral',
    icon: '🚕',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Carrera (banderazo + unidades)', value: carreraBase },
      ...(recargos ? [{ label: 'Recargos fijos', value: recargos }] : []),
    ],
    prefix: '$',
    centerValue: fmtCOP(total),
    ariaLabel: `Total estimado de la carrera ${fmtCOP(total)}: base ${fmtCOP(carreraBase)} y recargos ${fmtCOP(recargos)}.`,
  };

  return {
    total_estimado: fmtCOP(total),
    carrera_base: fmtCOP(carreraBase) + (aplicoMinima ? ' (carrera mínima)' : ''),
    recargos_fijos: fmtCOP(recargos),
    unidades_taximetro: `${T.banderazoUnidades + unidadesDistancia + unidadesEspera} unidades`,
    detalle: partes.join(' · '),
    _insight,
    _chart,
  };
}
