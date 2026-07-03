/**
 * Planificador de comida para invitados (Fase Etapa 4).
 * Calcula la cantidad del plato principal según el tipo de comida elegido, más
 * bebida, agua, hielo, postre y tiempo de preparación. Usa parámetros/estado
 * (NO una URL por cantidad de invitados).
 * Referencias: raciones estándar de catering casero argentino.
 */
export interface Inputs {
  adultos: number;
  ninos: number;
  tipo_comida: string; // pizza|empanadas|hamburguesas|pastas|tacos|sushi|picada|sandwiches
  apetito: string; // liviano|normal|abundante
  incluye_postre?: string; // si|no
}
export interface Outputs {
  plato_principal: string;
  bebida_litros: number;
  agua_litros: number;
  hielo_kg: number;
  postre_porciones: number;
  tiempo_prep_min: number;
  lista_compras: string;
  resumen: string;
  _insight?: any;
}

export function comidaParaInvitados(i: Inputs): Outputs {
  const adultos = Math.max(0, Math.floor(Number(i.adultos) || 0));
  const ninos = Math.max(0, Math.floor(Number(i.ninos) || 0));
  const total = adultos + ninos;
  const conPostre = (i.incluye_postre ?? "si") !== "no";
  const APET: Record<string, number> = { liviano: 0.85, normal: 1, abundante: 1.2 };
  const k = APET[i.apetito] ?? 1;

  if (total === 0) {
    return { plato_principal: "Ingresá al menos un invitado.", bebida_litros: 0, agua_litros: 0, hielo_kg: 0, postre_porciones: 0, tiempo_prep_min: 0, lista_compras: "", resumen: "Ingresá al menos un invitado." };
  }

  // Cantidad del plato principal según tipo (ración adulto, niño = ~65%).
  let principal = "";
  const A = (n: number) => Math.round((adultos + ninos * 0.65) * n * k);
  switch (i.tipo_comida) {
    case "pizza": {
      const porc = A(3); // porciones (slices)
      const pizzas = Math.max(1, Math.ceil(porc / 8));
      principal = `${pizzas} pizza${pizzas !== 1 ? "s" : ""} grandes (${porc} porciones)`;
      break;
    }
    case "empanadas": {
      const u = A(6);
      principal = `${u} empanadas (${(u / 12).toFixed(1)} docenas)`;
      break;
    }
    case "hamburguesas": {
      const u = Math.max(1, Math.ceil((adultos * 1.5 + ninos * 1) * k));
      principal = `${u} hamburguesas + ${u} panes`;
      break;
    }
    case "pastas": {
      const g = Math.round((adultos * 120 + ninos * 70) * k);
      principal = `${g} g de pasta seca (${(g / 1000).toFixed(2)} kg) + salsa`;
      break;
    }
    case "tacos": {
      const u = A(3.5);
      principal = `${u} tacos (~${Math.ceil(u / 12)} paquetes de tortillas)`;
      break;
    }
    case "sushi": {
      const p = A(10);
      principal = `${p} piezas de sushi (${Math.ceil(p / 8)} rolls aprox.)`;
      break;
    }
    case "picada": {
      const g = Math.round((adultos * 200 + ninos * 100) * k);
      principal = `${g} g de fiambres y quesos (${(g / 1000).toFixed(2)} kg) para picar`;
      break;
    }
    case "sandwiches": {
      const u = A(3);
      principal = `${u} sándwiches (triples/miga)`;
      break;
    }
    default: {
      const u = A(3);
      principal = `${u} porciones del plato principal`;
    }
  }

  // Universales.
  const bebida_litros = parseFloat((adultos * 0.75 + ninos * 0.4).toFixed(1));
  const agua_litros = parseFloat((total * 0.5).toFixed(1));
  const hielo_kg = Math.max(2, Math.round(total * 0.4));
  const postre_porciones = conPostre ? Math.ceil(total * 1.1) : 0;
  // Tiempo de prep aproximado: base 30 min + 3 min por invitado, ajustado por plato.
  const prepFactor: Record<string, number> = { pizza: 1.2, empanadas: 1.5, hamburguesas: 0.9, pastas: 0.8, tacos: 1, sushi: 1.6, picada: 0.5, sandwiches: 0.6 };
  const tiempo_prep_min = Math.round((30 + total * 3) * (prepFactor[i.tipo_comida] ?? 1));

  const lc = [
    principal,
    `Bebida: ${bebida_litros} L`,
    `Agua: ${agua_litros} L`,
    `Hielo: ${hielo_kg} kg`,
  ];
  if (conPostre) lc.push(`Postre: ${postre_porciones} porciones`);
  const lista_compras = lc.join(" · ");

  const resumen = `Para ${total} invitado${total !== 1 ? "s" : ""} (${adultos} adulto${adultos !== 1 ? "s" : ""}${ninos > 0 ? ` + ${ninos} niño${ninos !== 1 ? "s" : ""}` : ""}), apetito ${i.apetito || "normal"}: ${principal}, ${bebida_litros} L de bebida, ${agua_litros} L de agua y ${hielo_kg} kg de hielo.`;

  const _insight = {
    title: "Cuánto preparar",
    text: `Para **${total} invitados** calculá **${principal}**. Sumá **${bebida_litros} L** de bebida, **${agua_litros} L** de agua y **${hielo_kg} kg** de hielo. Comprá siempre un 10% de más por si cae alguien sin avisar.`,
    tone: "neutral",
    icon: "🍽️",
  };

  return { plato_principal: principal, bebida_litros, agua_litros, hielo_kg, postre_porciones, tiempo_prep_min, lista_compras, resumen, _insight };
}
