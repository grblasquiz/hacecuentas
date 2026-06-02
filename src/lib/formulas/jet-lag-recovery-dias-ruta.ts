/**
 * Calculadora de Jet Lag - Días de Recuperación
 * Regla Sleep Foundation: 1 día por zona al Este, 1 día cada 1.5 zonas al Oeste.
 */

export interface JetLagRecoveryDiasRutaInputs {
  zonasHorarias: number;
  direccion: string;
  edad: number;
}

export interface JetLagRecoveryDiasRutaOutputs {
  diasRecovery: number;
  severidad: string;
  recomendacion: string;
  _insight?: any;
  _chart?: any;
}

export function jetLagRecoveryDiasRuta(inputs: JetLagRecoveryDiasRutaInputs): JetLagRecoveryDiasRutaOutputs {
  const zonas = Number(inputs.zonasHorarias);
  const edad = Number(inputs.edad);
  const direccion = String(inputs.direccion || "este");

  if (!zonas || zonas <= 0) throw new Error("Ingresá zonas horarias válidas");
  if (!edad || edad <= 0) throw new Error("Ingresá una edad válida");

  let dias = direccion === "oeste" ? zonas / 1.5 : zonas;
  if (edad > 50) dias *= 1.2;
  dias = Math.round(dias * 10) / 10;

  let severidad = "Leve";
  if (zonas >= 5 && zonas < 8) severidad = "Moderado";
  else if (zonas >= 8) severidad = "Severo";

  let recomendacion = "Hidratación y buen sueño previo alcanzan.";
  if (severidad === "Moderado") recomendacion = "Ajustá horarios 2-3 días antes. Exposición a luz matinal.";
  if (severidad === "Severo") recomendacion = "Ajuste previo + melatonina + exposición lumínica estratégica. Consultá médico.";

  const edadNota = edad > 50 ? ' Sumamos un **20%** por tener más de 50 años (la recuperación se enlentece).' : '';
  const dirNota = direccion === 'oeste'
    ? 'Hacia el **oeste** se recupera más rápido (1 día cada 1,5 zonas).'
    : 'Hacia el **este** es 1 día por zona: cuesta más adelantar el reloj que atrasarlo.';
  const _insight = {
    title: `~${dias} ${dias === 1 ? 'día' : 'días'} de recuperación`,
    text: `Cruzando **${zonas} ${zonas === 1 ? 'zona horaria' : 'zonas horarias'}** vas a tardar unos **${dias} ${dias === 1 ? 'día' : 'días'}** en sentirte al 100%. ${dirNota}${edadNota}`,
    tone: severidad === 'Severo' ? 'warn' : severidad === 'Moderado' ? 'neutral' : 'good',
    icon: severidad === 'Severo' ? '😵' : severidad === 'Moderado' ? '😴' : '🙂',
  };

  const topMax = Math.max(12, Math.ceil(zonas) + 1);
  const _chart = {
    type: 'scale',
    marker: zonas,
    markerLabel: `${zonas} zonas`,
    min: 0,
    segments: [
      { nombre: 'Leve', max: 4, color: '#86efac', colorDark: '#22c55e' },
      { nombre: 'Moderado', max: 7, color: '#fde047', colorDark: '#eab308' },
      { nombre: 'Severo', max: topMax, color: '#fca5a5', colorDark: '#ef4444' },
    ],
    ariaLabel: `Severidad del jet lag: ${zonas} zonas horarias, nivel ${severidad}`,
  };

  return { diasRecovery: dias, severidad, recomendacion, _insight, _chart };
}
