export const footballMarkets = [
  { key:'mx', path:'/mx/futbol-mexicano-hoy', locale:'es-MX', tz:'America/Mexico_City', country:'México', adjective:'mexicano', leagues:['Liga MX','Liga de Expansión'], codes:['mex.1','mex.2'] },
  { key:'co', path:'/co/futbol-colombiano-hoy', locale:'es-CO', tz:'America/Bogota', country:'Colombia', adjective:'colombiano', leagues:['Primera A','Primera B'], codes:['col.1','col.2'] },
  { key:'cl', path:'/cl/futbol-chileno-hoy', locale:'es-CL', tz:'America/Santiago', country:'Chile', adjective:'chileno', leagues:['Primera División','Ascenso'], codes:['chi.1','chi.2'] },
  { key:'pe', path:'/pe/futbol-peruano-hoy', locale:'es-PE', tz:'America/Lima', country:'Perú', adjective:'peruano', leagues:['Liga 1','Liga 2'], codes:['per.1','per.2'] },
  { key:'ec', path:'/ec/futbol-ecuatoriano-hoy', locale:'es-EC', tz:'America/Guayaquil', country:'Ecuador', adjective:'ecuatoriano', leagues:['Serie A','Serie B'], codes:['ecu.1','ecu.2'] },
  { key:'ve', path:'/ve/futbol-venezolano-hoy', locale:'es-VE', tz:'America/Caracas', country:'Venezuela', adjective:'venezolano', leagues:['Primera División','Segunda División'], codes:['ven.1','ven.2'] },
  { key:'py', path:'/py/futbol-paraguayo-hoy', locale:'es-PY', tz:'America/Asuncion', country:'Paraguay', adjective:'paraguayo', leagues:['Primera División','Intermedia'], codes:['par.1','par.2'] },
  { key:'uy', path:'/uy/futbol-uruguayo-hoy', locale:'es-UY', tz:'America/Montevideo', country:'Uruguay', adjective:'uruguayo', leagues:['Primera División','Segunda División'], codes:['uru.1','uru.2'] },
  { key:'do', path:'/do/futbol-dominicano-hoy', locale:'es-DO', tz:'America/Santo_Domingo', country:'República Dominicana', adjective:'dominicano', leagues:['Liga Dominicana'], codes:[] },
  { key:'es', path:'/es/futbol-espanol-hoy', locale:'es-ES', tz:'Europe/Madrid', country:'España', adjective:'español', leagues:['LaLiga','Segunda División'], codes:['esp.1','esp.2'] },
  { key:'pt', path:'/pt/futebol-brasileiro-hoje', locale:'pt-BR', tz:'America/Sao_Paulo', country:'Brasil', adjective:'brasileiro', leagues:['Série A','Série B'], codes:['bra.1','bra.2'], pt:true },
  { key:'pt-pt', path:'/pt-pt/futebol-portugues-hoje', locale:'pt-PT', tz:'Europe/Lisbon', country:'Portugal', adjective:'português', leagues:['Primeira Liga'], codes:['por.1'], pt:true },
  { key:'en', path:'/en/football-today', locale:'en-GB', tz:'Europe/London', country:'England', adjective:'English', leagues:['Premier League','Championship'], codes:['eng.1','eng.2'], en:true },
] as const;

export const footballHreflang = [
  { lang:'es-AR', href:'https://hacecuentas.com/futbol-argentino-hoy' },
  ...footballMarkets.map(m => ({ lang:m.locale, href:`https://hacecuentas.com${m.path}` })),
  { lang:'x-default', href:'https://hacecuentas.com/futbol-hoy' },
];
