export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function zonasPotenciaCiclismoWattsKg(i: Inputs): Outputs {
  const ftp = Number(i.ftp) || 0; const peso = Number(i.peso) || 70;
  const z = (p: number) => Math.round(ftp * p);
  const zonasDetalle = `Z1 <${z(0.55)} | Z2 ${z(0.55)}-${z(0.75)} | Z3 ${z(0.76)}-${z(0.9)} | Z4 ${z(0.91)}-${z(1.05)} | Z5 ${z(1.06)}-${z(1.2)} | Z6 >${z(1.2)}`;
  const wkg = ftp / peso;
  // Nivel orientativo según W/kg en FTP (referencia tipo Coggan)
  let nivel: string;
  if (wkg < 2.0) nivel = 'principiante'; else if (wkg < 2.75) nivel = 'recreativo';
  else if (wkg < 3.25) nivel = 'amateur (Cat 5-4)'; else if (wkg < 3.75) nivel = 'entrenado (Cat 3)';
  else if (wkg < 4.25) nivel = 'muy bueno (Cat 2)'; else if (wkg < 5.0) nivel = 'competitivo (Cat 1)';
  else nivel = 'élite / pro';
  const tone = wkg >= 3.75 ? 'good' : wkg < 2.0 ? 'warn' : 'neutral';
  const insight = {
    title: 'Tu relación potencia/peso',
    text: `Con **${ftp} W** de FTP y **${peso} kg** rendís **${wkg.toFixed(2)} W/kg**, nivel **${nivel}**. Esta relación define tu rendimiento en subidas; bajar peso o subir FTP la mejora. Tus 6 zonas Coggan se calculan sobre el FTP.`,
    tone: tone as any,
    icon: '🚴',
  };
  const chart = {
    type: 'scale' as const,
    marker: Number(wkg.toFixed(2)),
    markerLabel: wkg.toFixed(2) + ' W/kg',
    unit: ' W/kg',
    min: 1,
    segments: [
      { nombre: 'Principiante', max: 2.0, color: '#fecaca', colorDark: '#7f1d1d' },
      { nombre: 'Recreativo', max: 2.75, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Amateur (Cat 5-4)', max: 3.25, color: '#fde68a', colorDark: '#854d0e' },
      { nombre: 'Entrenado (Cat 3)', max: 3.75, color: '#d9f99d', colorDark: '#3f6212' },
      { nombre: 'Muy bueno (Cat 2)', max: 4.25, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Competitivo (Cat 1)', max: 5.0, color: '#bfdbfe', colorDark: '#1e40af' },
      { nombre: 'Élite / pro', max: Math.max(6.0, wkg + 0.2), color: '#ddd6fe', colorDark: '#5b21b6' },
    ],
    ariaLabel: `${wkg.toFixed(2)} W/kg corresponde a nivel ${nivel} en la escala de potencia/peso del ciclismo.`,
  };
  return { zonas: `FTP ${ftp} W · 6 zonas`, zonasDetalle, ftpWKg: wkg.toFixed(2) + ' W/kg', resumen: `FTP ${ftp}W = ${wkg.toFixed(1)} W/kg. Zonas Coggan calculadas.`, _insight: insight, _chart: chart };
}
