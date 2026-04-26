/** Conversión grados de escalada deportiva: francés ↔ YDS ↔ UIAA. */
export interface Inputs { sistemaOrigen: 'frances' | 'yds' | 'uiaa'; gradoOrigen: string; }
export interface Outputs { gradoFrances: string; gradoYds: string; gradoUiaa: string; nivel: string; explicacion: string; }
export function escaladaGradoFrancesYdsConversion(i: Inputs): Outputs {
  // Tabla canónica de conversión (UIAA - Francés - YDS)
  const tabla: Array<{ frances: string; yds: string; uiaa: string; nivel: string }> = [
    { frances: '4a', yds: '5.5', uiaa: 'IV', nivel: 'principiante' },
    { frances: '4b', yds: '5.6', uiaa: 'IV+', nivel: 'principiante' },
    { frances: '4c', yds: '5.7', uiaa: 'V-', nivel: 'principiante' },
    { frances: '5a', yds: '5.8', uiaa: 'V', nivel: 'iniciado' },
    { frances: '5b', yds: '5.9', uiaa: 'V+', nivel: 'iniciado' },
    { frances: '5c', yds: '5.10a', uiaa: 'VI-', nivel: 'iniciado' },
    { frances: '6a', yds: '5.10b', uiaa: 'VI', nivel: 'intermedio' },
    { frances: '6a+', yds: '5.10c', uiaa: 'VI+', nivel: 'intermedio' },
    { frances: '6b', yds: '5.10d', uiaa: 'VII-', nivel: 'intermedio' },
    { frances: '6b+', yds: '5.11a', uiaa: 'VII', nivel: 'intermedio' },
    { frances: '6c', yds: '5.11b', uiaa: 'VII+', nivel: 'avanzado' },
    { frances: '6c+', yds: '5.11c', uiaa: 'VIII-', nivel: 'avanzado' },
    { frances: '7a', yds: '5.11d', uiaa: 'VIII-', nivel: 'avanzado' },
    { frances: '7a+', yds: '5.12a', uiaa: 'VIII', nivel: 'avanzado' },
    { frances: '7b', yds: '5.12b', uiaa: 'VIII+', nivel: 'experto' },
    { frances: '7b+', yds: '5.12c', uiaa: 'IX-', nivel: 'experto' },
    { frances: '7c', yds: '5.12d', uiaa: 'IX', nivel: 'experto' },
    { frances: '7c+', yds: '5.13a', uiaa: 'IX+', nivel: 'experto' },
    { frances: '8a', yds: '5.13b', uiaa: 'X-', nivel: 'élite' },
    { frances: '8a+', yds: '5.13c', uiaa: 'X', nivel: 'élite' },
    { frances: '8b', yds: '5.13d', uiaa: 'X+', nivel: 'élite' },
    { frances: '8b+', yds: '5.14a', uiaa: 'XI-', nivel: 'élite' },
    { frances: '8c', yds: '5.14b', uiaa: 'XI', nivel: 'élite' },
    { frances: '8c+', yds: '5.14c', uiaa: 'XI+', nivel: 'élite' },
    { frances: '9a', yds: '5.14d', uiaa: 'XII-', nivel: 'mundial' },
    { frances: '9a+', yds: '5.15a', uiaa: 'XII', nivel: 'mundial' },
    { frances: '9b', yds: '5.15b', uiaa: 'XII+', nivel: 'mundial' },
    { frances: '9b+', yds: '5.15c', uiaa: 'XIII-', nivel: 'mundial' },
    { frances: '9c', yds: '5.15d', uiaa: 'XIII', nivel: 'mundial' },
  ];
  const g = String(i.gradoOrigen).trim().toLowerCase();
  const fila = tabla.find(f => {
    if (i.sistemaOrigen === 'frances') return f.frances.toLowerCase() === g;
    if (i.sistemaOrigen === 'yds') return f.yds.toLowerCase() === g;
    return f.uiaa.toLowerCase() === g;
  });
  if (!fila) throw new Error(`Grado ${i.gradoOrigen} no encontrado en sistema ${i.sistemaOrigen}`);
  return {
    gradoFrances: fila.frances,
    gradoYds: fila.yds,
    gradoUiaa: fila.uiaa,
    nivel: fila.nivel,
    explicacion: `${i.gradoOrigen} (${i.sistemaOrigen}) equivale a ${fila.frances} francés / ${fila.yds} YDS / ${fila.uiaa} UIAA. Nivel: ${fila.nivel}.`,
  };
}
