/** Annual table derived from the shared 2026 LFT inputs; rerun when reviewing those inputs. */
import fs from 'node:fs/promises';
import { MEXICO_2026, diasVacacionesLFT, factorIntegracion } from '../../src/lib/data/mexico-2026.ts';
const data=Array.from({length:50},(_,i)=>({
  anios_servicio:i+1,
  vacaciones_dias:diasVacacionesLFT(i+1),
  aguinaldo_dias:MEXICO_2026.lft.aguinaldoDiasMinimo,
  prima_vacacional_pct:MEXICO_2026.lft.primaVacacional*100,
  factor:factorIntegracion(i+1).toFixed(4),
}));
const fields=Object.keys(data[0]);
const dir='public/datasets';await fs.mkdir(dir,{recursive:true});
await fs.writeFile(`${dir}/factor-integracion-imss-2026.csv`,fields.join(',')+'\n'+data.map(row=>fields.map(k=>row[k as keyof typeof row]).join(',')).join('\n')+'\n');
await fs.writeFile(`${dir}/factor-integracion-imss-2026.json`,JSON.stringify({
  name:'Factor de integración 2026 por antigüedad — prestaciones mínimas LFT',
  description:'Tabla de cálculo de Hacé Cuentas: vacaciones mínimas por años cumplidos, 15 días de aguinaldo y prima vacacional de 25%. Factor redondeado a cuatro decimales. No incluye otros conceptos variables del SBC.',
  creator:'Hacé Cuentas',creatorUrl:'https://hacecuentas.com',license:'https://creativecommons.org/licenses/by/4.0/',
  source:'Ley Federal del Trabajo, artículos 76, 80 y 87; Ley del Seguro Social, artículo 27',
  sourceUrl:'https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf',
  reviewedAt:'2026-11-05',fields,rowCount:data.length,data,
},null,2)+'\n');
console.log(`Generated ${data.length} annual LFT factor rows`);
