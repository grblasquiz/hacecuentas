export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function wattsCiclismoFtpUmbralTest(i: Inputs): Outputs {
  const f=Number(i.ftp)||0;
  const insight = {
    title: 'Tus zonas de potencia',
    text: `Con una **FTP de ${Math.round(f)} W**, tu zona de resistencia base (Z2) va de **${Math.round(f*0.55)} a ${Math.round(f*0.75)} W** y la de umbral (Z4) ronda **${Math.round(f*0.90)}-${Math.round(f*1.05)} W**. Entrená la mayor parte del volumen en Z2 y reservá el umbral para series cortas.`,
    tone: 'neutral',
    icon: '🚴',
  };
  return { zona1:`<${Math.round(f*0.55)} W`, zona2:`${Math.round(f*0.55)}-${Math.round(f*0.75)} W`, zona3:`${Math.round(f*0.75)}-${Math.round(f*0.90)} W`, zona4:`${Math.round(f*0.90)}-${Math.round(f*1.05)} W (umbral)`, _insight: insight };
}
