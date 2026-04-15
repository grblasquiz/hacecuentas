/** Cálculo de tiempo de transferencia de archivos por red LAN */
export interface Inputs { tamanoGb: number; velocidadRed?: string; eficiencia?: number; }
export interface Outputs { tiempoSegundos: number; tiempoMinutos: number; tiempoHoras: number; velocidadMBs: number; detalle: string; }

const velocidades: Record<string, { mbps: number; nombre: string; efDefault: number }> = {
  fast_ethernet: { mbps: 100, nombre: 'Fast Ethernet (100 Mbps)', efDefault: 88 },
  gigabit: { mbps: 1000, nombre: 'Gigabit Ethernet (1 Gbps)', efDefault: 88 },
  '2.5g': { mbps: 2500, nombre: '2.5G Ethernet', efDefault: 88 },
  '10g': { mbps: 10000, nombre: '10G Ethernet', efDefault: 90 },
  wifi5: { mbps: 300, nombre: 'WiFi 5 (AC)', efDefault: 60 },
  wifi6: { mbps: 600, nombre: 'WiFi 6 (AX)', efDefault: 65 },
};

export function transferenciaArchivoRedLanTiempo(i: Inputs): Outputs {
  const tamano = Number(i.tamanoGb);
  const tipo = String(i.velocidadRed || 'gigabit');

  if (!tamano || tamano <= 0) throw new Error('Ingresá el tamaño del archivo en GB');

  const red = velocidades[tipo] || velocidades.gigabit;
  const eficiencia = Number(i.eficiencia || red.efDefault) / 100;

  if (eficiencia <= 0 || eficiencia > 1) throw new Error('La eficiencia debe estar entre 10 y 100');

  const velocidadRealMbps = red.mbps * eficiencia;
  const velocidadMBs = velocidadRealMbps / 8;
  const tamanoMb = tamano * 1024;
  const tiempoSegundos = tamanoMb / velocidadMBs;
  const tiempoMinutos = tiempoSegundos / 60;
  const tiempoHoras = tiempoMinutos / 60;

  let tiempoTexto: string;
  if (tiempoSegundos < 60) tiempoTexto = `${tiempoSegundos.toFixed(1)} segundos`;
  else if (tiempoMinutos < 60) tiempoTexto = `${tiempoMinutos.toFixed(1)} minutos`;
  else tiempoTexto = `${tiempoHoras.toFixed(2)} horas`;

  return {
    tiempoSegundos: Number(tiempoSegundos.toFixed(1)),
    tiempoMinutos: Number(tiempoMinutos.toFixed(2)),
    tiempoHoras: Number(tiempoHoras.toFixed(3)),
    velocidadMBs: Number(velocidadMBs.toFixed(1)),
    detalle: `${tamano} GB por ${red.nombre} (${(eficiencia * 100).toFixed(0)}% eficiencia): ~${tiempoTexto}. Velocidad real: ${velocidadMBs.toFixed(1)} MB/s.`,
  };
}
