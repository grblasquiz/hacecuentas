// Mapa de dynamic imports de TODAS las fórmulas (~3.400 entradas).
// Vive en su PROPIO chunk: inline en el <script> de Calculator.astro inflaba
// el bundle principal de ~48KB a 664KB raw (144KB br). Calculator lo trae con
// un import() eager apenas arranca, así el chunk baja en paralelo mientras el
// usuario completa el form, sin bloquear el ateo de handlers.
//
// OJO: import.meta.glob es de Vite (no corre bajo tsx/node). Las KEYS del mapa
// son relativas a ESTE archivo: './formulas/<formulaId>.ts'.
export const formulaLoaders = import.meta.glob<any>('./formulas/*.ts');
