/**
 * Calculadora de Escala Suficiente
 */
export interface EscalaSuficienteTiempoInputs {
  duracionEscala: number;
  tipoConexion: string;
  aeropuertoComplejo: string;
}
export interface EscalaSuficienteTiempoOutputs {
  semaforo: string;
  margenMinutos: number;
  consejo: string;
}
export function escalaSuficienteTiempo(i: EscalaSuficienteTiempoInputs): EscalaSuficienteTiempoOutputs {
  const dur = Number(i.duracionEscala);
  if (!dur || dur <= 0) throw new Error("Ingresá duración válida");
  const tipo = String(i.tipoConexion || "internacional");
  const complejo = String(i.aeropuertoComplejo || "no") === "si";
  let minimo = 45;
  if (tipo === "internacional") minimo = 90;
  if (tipo === "mixto") minimo = 120;
  if (complejo) minimo += 20;
  const margen = dur - minimo;
  let semaforo = "Verde - Cómodo";
  let consejo = "Tenés tiempo de sobra.";
  if (margen < 0) { semaforo = "Rojo - Riesgoso"; consejo = "No alcanza el mínimo. Buscá otra opción."; }
  else if (margen < 30) { semaforo = "Amarillo - Ajustado"; consejo = "Justo. Si hay retraso, podés perder conexión."; }
  return { semaforo, margenMinutos: margen, consejo };
}
