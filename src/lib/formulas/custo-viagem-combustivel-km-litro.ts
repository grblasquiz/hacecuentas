// Custo de viagem de carro — combustível + pedágios, com opção de ida e volta e
// divisão entre passageiros.
//   litros = distância ÷ consumo (km/l)
//   custo combustível = litros × preço do litro
//   total = custo combustível + pedágios

export interface Inputs {
  distanciaKm: number;      // distância só de ida
  consumoKmL: number;       // km por litro do carro
  precoLitro: number;       // R$/litro
  pedagios?: number;        // R$ em pedágios (só de ida)
  idaVolta?: boolean;       // dobrar distância e pedágios
  passageiros?: number;     // dividir o custo (padrão 1)
}

export interface Outputs {
  custoTotal: string;
  custoCombustivel: string;
  litros: string;
  custoPedagios: string;
  custoPorKm: string;
  custoPorPessoa: string;
  detalhe: string;
  _insight?: any;
  _chart?: any;
}

const brl = (n: number) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = (n: number, d = 2) => n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: d });

export function compute(i: Inputs): Outputs {
  const distIda = Math.max(0, Number(i.distanciaKm) || 0);
  let consumo = Number(i.consumoKmL);
  if (!isFinite(consumo) || consumo <= 0) consumo = 10;
  let preco = Number(i.precoLitro);
  if (!isFinite(preco) || preco <= 0) preco = 5.8;
  const pedagiosIda = Math.max(0, Number(i.pedagios) || 0);
  const idaVolta = i.idaVolta === true;
  let passageiros = Math.floor(Number(i.passageiros));
  if (!isFinite(passageiros) || passageiros < 1) passageiros = 1;

  const distancia = idaVolta ? distIda * 2 : distIda;
  const pedagios = idaVolta ? pedagiosIda * 2 : pedagiosIda;

  const litros = distancia / consumo;
  const custoCombustivel = litros * preco;
  const custoTotal = custoCombustivel + pedagios;
  const custoPorKm = distancia > 0 ? custoTotal / distancia : 0;
  const custoPorPessoa = custoTotal / passageiros;

  const detalhe =
    `${idaVolta ? 'Ida e volta' : 'Só ida'}: ${num(distancia, 0)} km. ` +
    `Combustível: ${num(distancia, 0)} ÷ ${num(consumo, 1)} km/l = ${num(litros, 1)} litros × ${brl(preco)} = ${brl(custoCombustivel)}. ` +
    `Pedágios: ${brl(pedagios)}. Total: ${brl(custoTotal)} (${brl(custoPorKm)}/km` +
    (passageiros > 1 ? `, ${brl(custoPorPessoa)} por pessoa dividindo entre ${passageiros}` : '') + `).`;

  return {
    custoTotal: brl(custoTotal),
    custoCombustivel: brl(custoCombustivel),
    litros: `${num(litros, 1)} L`,
    custoPedagios: brl(pedagios),
    custoPorKm: brl(custoPorKm),
    custoPorPessoa: passageiros > 1 ? brl(custoPorPessoa) : '—',
    detalhe,
    _insight: {
      title: `Custo da viagem: ${brl(custoTotal)}`,
      text:
        `Rodar **${num(distancia, 0)} km** com um carro que faz **${num(consumo, 1)} km/l**, a **${brl(preco)}/litro**, gasta **${num(litros, 1)} litros** (${brl(custoCombustivel)})` +
        (pedagios > 0 ? ` mais **${brl(pedagios)}** de pedágio` : '') +
        ` = **${brl(custoTotal)}**` +
        (passageiros > 1 ? `, ou **${brl(custoPorPessoa)}** por pessoa dividindo entre ${passageiros}.` : `.`),
      tone: 'good',
      icon: '⛽',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Combustível', value: Number(custoCombustivel.toFixed(2)) },
        { label: 'Pedágios', value: Number(pedagios.toFixed(2)) },
      ],
      prefix: 'R$ ',
      centerValue: brl(custoTotal),
      centerLabel: 'Total',
      ariaLabel: `Combustível ${brl(custoCombustivel)} e pedágios ${brl(pedagios)} somam ${brl(custoTotal)}.`,
    },
  };
}
