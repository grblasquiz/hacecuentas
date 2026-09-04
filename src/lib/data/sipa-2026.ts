/** Bases publicadas por ANSES. Cada fila conserva su período y fuente. */
export const SIPA_PERIODS = {
 sep:{cap:4691748.47,label:'Septiembre 2026',change:'+2,11%',rule:'Res. 257/2026',source:'https://www.argentina.gob.ar/normativa/nacional/norma-429456/texto'},
 ago:{cap:4594798.23,label:'Agosto 2026',change:'+1,89%',rule:'Res. 232/2026',source:'https://www.argentina.gob.ar/normativa/nacional/norma-428341/texto'},
} as const;
export const SIPA_CURRENT = 'sep' as const;
export const SIPA_LAST_REVIEWED = '2026-09-04';
