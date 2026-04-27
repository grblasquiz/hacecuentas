export interface Inputs {
  invitados: number;
  rol: string;
  variedad: string;
  ninos: string;
  temperatura: string;
}

export interface Outputs {
  litrosTotales: number;
  litrosMinimo: number;
  litrosMaximo: number;
  mlPorPersona: number;
  distribucion: string;
  consejo: string;
}

export function compute(i: Inputs): Outputs {
  const invitados = Math.round(Number(i.invitados) || 0);

  if (invitados <= 0) {
    return {
      litrosTotales: 0,
      litrosMinimo: 0,
      litrosMaximo: 0,
      mlPorPersona: 0,
      distribucion: "Ingresá una cantidad válida de invitados.",
      consejo: "",
    };
  }

  // Porción base en ml según el rol del helado en el menú
  const PORCION_BASE: Record<string, number> = {
    postre_principal: 150,
    postre_secundario: 100,
    picoteo: 70,
  };

  // Factor de ajuste por temperatura
  const FACTOR_TEMPERATURA: Record<string, number> = {
    calor: 1.2,
    templado: 1.0,
    frio: 0.85,
  };

  // Factor de ajuste por presencia de niños
  const FACTOR_NINOS: Record<string, number> = {
    si: 1.1,
    no: 1.0,
  };

  const porcionBase = PORCION_BASE[i.rol] ?? 150;
  const factorTemp = FACTOR_TEMPERATURA[i.temperatura] ?? 1.0;
  const factorNinos = FACTOR_NINOS[i.ninos] ?? 1.0;

  const mlAjustados = porcionBase * factorTemp * factorNinos;
  const totalMl = invitados * mlAjustados;
  const litrosTotales = Math.round((totalMl / 1000) * 10) / 10;
  const litrosMinimo = Math.round(litrosTotales * 0.9 * 10) / 10;
  const litrosMaximo = Math.round(litrosTotales * 1.15 * 10) / 10;
  const mlPorPersona = Math.round(mlAjustados);

  // Distribución sugerida por tipo
  let distribucion = "";
  const totalRedondeado = litrosTotales;

  switch (i.variedad) {
    case "solo_crema": {
      distribucion = `${totalRedondeado} L de helado de crema (100 %). Sugerí 2-3 sabores distintos.`;
      break;
    }
    case "solo_agua": {
      distribucion = `${totalRedondeado} L de sorbetes / agua (100 %). Sugerí limón, mango y frutilla.`;
      break;
    }
    case "crema_y_agua": {
      const crema = Math.round(totalRedondeado * 0.7 * 10) / 10;
      const agua = Math.round(totalRedondeado * 0.3 * 10) / 10;
      distribucion = `${crema} L de crema (70 %) + ${agua} L de agua/sorbete (30 %).`;
      break;
    }
    case "con_sin_azucar": {
      const crema = Math.round(totalRedondeado * 0.6 * 10) / 10;
      const agua = Math.round(totalRedondeado * 0.2 * 10) / 10;
      const sinAzucar = Math.round(totalRedondeado * 0.2 * 10) / 10;
      distribucion = `${crema} L de crema (60 %) + ${agua} L de agua (20 %) + ${sinAzucar} L sin azúcar (20 %).`;
      break;
    }
    default: {
      distribucion = `${totalRedondeado} L en total. Consultá con tu heladero la distribución.`;
    }
  }

  // Consejo contextual
  let consejo = "";
  if (litrosTotales < 2) {
    consejo = "Para grupos pequeños, considerá comprar potes individuales en lugar de litros a granel.";
  } else if (i.temperatura === "calor" && invitados >= 50) {
    consejo = `Para ${invitados} personas con calor, pedí al menos ${litrosMaximo} L y asegurate de tener heladeras o freezers disponibles en el lugar.`;
  } else if (i.ninos === "si") {
    consejo = "Con niños en el evento, los sabores de agua (como limón o frutilla) suelen tener mucha salida. Considerá aumentar esa proporción.";
  } else {
    consejo = `Apuntá a ${litrosTotales} L como cantidad central. El rango seguro es ${litrosMinimo}-${litrosMaximo} L según cuánto coman tus invitados.`;
  }

  return {
    litrosTotales,
    litrosMinimo,
    litrosMaximo,
    mlPorPersona,
    distribucion,
    consejo,
  };
}
