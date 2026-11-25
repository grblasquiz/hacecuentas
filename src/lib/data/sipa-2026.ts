/** Bases publicadas por ANSES. Cada fila conserva su período y fuente. */
export const SIPA_PERIODS = {
 nov:{since:'2026-11-01',cap:4861685.38,label:'Noviembre 2026',change:'+1,93%',rule:'Res. 304/2026',source:'https://www.argentina.gob.ar/node/82813'},
 oct:{since:'2026-10-01',cap:4769631.49,label:'Octubre 2026',change:'+1,66%',rule:'Res. 284/2026',source:'https://www.argentina.gob.ar/normativa/nacional/norma-430390/texto'},
 sep:{since:'2026-09-01',cap:4691748.47,label:'Septiembre 2026',change:'+2,11%',rule:'Res. 257/2026',source:'https://www.argentina.gob.ar/normativa/nacional/norma-429456/texto'},
 ago:{since:'2026-08-01',cap:4594798.23,label:'Agosto 2026',change:'+1,89%',rule:'Res. 232/2026',source:'https://www.argentina.gob.ar/normativa/nacional/norma-428341/texto'},
} as const;
export const SIPA_CURRENT = 'nov' as const;
export const SIPA_LAST_REVIEWED = '2026-11-25';
