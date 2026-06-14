/**
 * Calculadora de costo de adquisición por seguidor (CPF) con pauta paga.
 * CPF = inversión publicitaria / seguidores ganados.
 *
 * Benchmark ORIENTATIVO (campañas de follower growth en Meta/TikTok/IG):
 *   < $0,50  → muy bueno
 *   $0,50 – $2 → rango normal de mercado
 *   > $2 → alto (revisá creatividad, segmentación y oferta)
 *
 * Los benchmarks varían fuerte por país, nicho, plataforma y objetivo de campaña.
 */

export interface CostoAdquisicionSeguidorPagoPaidSocialInputs {
  inversion: number | string | null;
  seguidores_ganados: number | string | null;
}

export interface CostoAdquisicionSeguidorPagoPaidSocialOutputs {
  cpf: number; // costo por seguidor
  cpfTexto: string;
  benchmark: string;
  seguidoresPor100: number; // cuántos seguidores comprás con $100
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function costoAdquisicionSeguidorPagoPaidSocial(
  i: CostoAdquisicionSeguidorPagoPaidSocialInputs
): CostoAdquisicionSeguidorPagoPaidSocialOutputs {
  const inversion =
    i.inversion === '' || i.inversion == null ? 0 : Number(i.inversion);
  const seguidores =
    i.seguidores_ganados === '' || i.seguidores_ganados == null
      ? 0
      : Number(i.seguidores_ganados);

  if (!inversion || inversion <= 0)
    throw new Error('Ingresá cuánto invertiste en pauta');
  if (!seguidores || seguidores <= 0)
    throw new Error('Ingresá cuántos seguidores ganaste');

  const cpf = inversion / seguidores;
  const seguidoresPor100 = 100 / cpf;

  let benchmark: string;
  let tone: 'good' | 'warn' | 'neutral';
  if (cpf < 0.5) {
    benchmark = '🚀 Muy bueno — costo por seguidor bajo, escalá';
    tone = 'good';
  } else if (cpf <= 2) {
    benchmark = '✅ Normal — dentro del rango de mercado';
    tone = 'neutral';
  } else {
    benchmark = '⚠️ Alto — revisá creatividad, segmentación y oferta';
    tone = 'warn';
  }

  const fmtUsd = (n: number) =>
    `$${(Math.round(n * 100) / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  const cpfTexto = fmtUsd(cpf);

  let insightText: string;
  if (cpf < 0.5) {
    insightText = `Estás pagando **${cpfTexto}** por seguidor: con cada **$100** sumás **~${Math.round(
      seguidoresPor100
    )}** seguidores. Es un costo bajo (orientativo: bueno por debajo de $0,50), señal de que la creatividad y la segmentación funcionan. **Escalá** el presupuesto mientras el CPF se mantenga bajo.`;
  } else if (cpf <= 2) {
    insightText = `Tu costo por seguidor es **${cpfTexto}**: con $100 sumás **~${Math.round(
      seguidoresPor100
    )}** seguidores. Estás en el rango normal de mercado ($0,50–$2 orientativo). Para bajarlo, probá nuevas creatividades, audiencias lookalike y un gancho más fuerte en los primeros 3 segundos.`;
  } else {
    insightText = `**${cpfTexto}** por seguidor es alto (orientativo: caro por encima de $2). Con $100 apenas sumás **~${Math.round(
      seguidoresPor100
    )}** seguidores. Antes de seguir invirtiendo, revisá el hook del video, la segmentación y si la oferta/valor del perfil justifica seguirte. Comprar seguidores caros que no interactúan baja tu engagement rate.`;
  }

  const detalle = `${fmtUsd(inversion)} de pauta ÷ ${seguidores.toLocaleString(
    'es-AR'
  )} seguidores = ${cpfTexto} por seguidor. Equivale a ~${Math.round(
    seguidoresPor100
  )} seguidores por cada $100 invertidos.`;

  return {
    cpf: Math.round(cpf * 100) / 100,
    cpfTexto,
    benchmark,
    seguidoresPor100: Math.round(seguidoresPor100),
    detalle,
    _insight: {
      title: 'Tu costo por seguidor',
      text: insightText,
      tone,
      icon: '📈',
    },
    _chart: {
      type: 'scale',
      marker: Math.round(cpf * 100) / 100,
      markerLabel: cpfTexto,
      min: 0,
      segments: [
        { nombre: 'Muy bueno', max: 0.5, color: '#16a34a', colorDark: '#22c55e' },
        { nombre: 'Normal', max: 2, color: '#eab308', colorDark: '#facc15' },
        {
          nombre: 'Alto',
          max: Math.max(3, Math.ceil(cpf) + 1),
          color: '#dc2626',
          colorDark: '#ef4444',
        },
      ],
      ariaLabel: `Costo por seguidor de ${cpfTexto} ubicado en la escala de benchmark.`,
    },
  };
}
