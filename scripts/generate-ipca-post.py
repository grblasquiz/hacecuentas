#!/usr/bin/env python3
"""
Motor Discover BR — pieza mensal "IPCA de {mês}: quanto você perdeu".

Espelho do generate-inflacion-post.py (AR) mas para Brasil, com data LIVE do
Banco Central (BCB SGS série 433 = IPCA variação mensal). Discover BR = audiência
enorme mobile-first; o cluster fiscal/laboral PT já mostra tração orgânica.

Escreve em src/content/blog-pt/ → renderiza em /pt/blog/<slug>. skip-if-exists
(estabilidade de data para Discover). Lo corre o launchd (discover-motor.sh).

  python3 scripts/generate-ipca-post.py
  python3 scripts/generate-ipca-post.py --dry-run
"""
import json
import sys
import ssl
import urllib.request
from datetime import datetime
from pathlib import Path

try:
    import certifi
    _SSL = ssl.create_default_context(cafile=certifi.where())
except Exception:
    _SSL = ssl.create_default_context()

MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
         'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
BLOG = Path('src/content/blog-pt')


def fetch_ipca():
    # BCB SGS série 433 = IPCA variação mensal (%)
    url = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados/ultimos/18?formato=json'
    req = urllib.request.Request(url, headers={'User-Agent': 'hacecuentas-discover/1.0'})
    with urllib.request.urlopen(req, timeout=20, context=_SSL) as r:
        return json.loads(r.read().decode('utf-8'))


def to_float(v):
    try:
        return float(str(v).replace(',', '.'))
    except Exception:
        return None


def accumulate(vals):
    f = 1.0
    for v in vals:
        f *= (1 + (v or 0) / 100)
    return round((f - 1) * 100, 1)


def brl(n):
    # Formato BR: ponto como separador de milhar (R$75.075)
    return f'{n:,}'.replace(',', '.')


def generate(dry=False):
    serie = fetch_ipca()
    serie = [(x['data'], to_float(x['valor'])) for x in serie if to_float(x.get('valor')) is not None]
    if not serie:
        print('✗ sem dados IPCA'); sys.exit(1)

    data, ipca_mes = serie[-1]            # data 'DD/MM/YYYY'
    mes_num = int(data[3:5]); ano = int(data[6:10])
    mes_nome = MESES[mes_num - 1]
    ipca_mes = round(ipca_mes, 2)

    ytd = accumulate([v for (d, v) in serie if int(d[6:10]) == ano and int(d[3:5]) <= mes_num])
    last12 = accumulate([v for (_d, v) in serie[-12:]])
    poder = round(100000 / (1 + last12 / 100))
    perdida = 100000 - poder
    custa = round(100000 * (1 + last12 / 100))

    rows = []
    for d, v in serie[-6:]:
        rows.append(f'<tr><td>{MESES[int(d[3:5])-1].capitalize()} {d[6:10]}</td><td>{round(v, 2)}%</td></tr>')
    tabela = ('<table><thead><tr><th>Mês</th><th>IPCA mensal (IBGE)</th></tr></thead><tbody>'
              + ''.join(rows) + '</tbody></table>')

    today = datetime.now()
    slug = f'ipca-{mes_nome}-{ano}-quanto-voce-perdeu'

    content = f'''<p>O IBGE divulgou o IPCA de <strong>{mes_nome} de {ano}</strong>: a inflação oficial do mês foi de <strong>{ipca_mes}%</strong>. No acumulado do ano são <strong>{ytd}%</strong> e em 12 meses, <strong>{last12}%</strong>. Traduzindo para o seu bolso: <strong>R$100.000</strong> guardados há um ano hoje têm o poder de compra de apenas <strong>R${brl(poder)}</strong> — você perdeu cerca de <strong>R${brl(perdida)}</strong> de valor real só pela inflação. Visto ao contrário: o que há um ano você comprava com R$100.000, hoje custa <strong>R${brl(custa)}</strong>.</p>

<h2 id="dado">IPCA de {mes_nome} de {ano}: o número</h2>
<p>IPCA mensal dos últimos 6 meses, segundo o IBGE:</p>
{tabela}
<p>Para ver quanto o seu dinheiro perdeu num período exato, ajuste contratos e investimentos pelo índice com a <a href="/pt/aluguel-reajuste-ipca-anual-contrato">calculadora de reajuste pelo IPCA</a>.</p>

<h2 id="significa">O que isso significa para o seu dinheiro</h2>
<p>A regra é simples: se o seu dinheiro rende <em>menos</em> que a inflação, você perde poder de compra mesmo que o saldo nominal cresça. Com IPCA de {ipca_mes}% no mês, qualquer aplicação precisa superar esse piso só para empatar.</p>
<ul>
<li><strong>Poupança e CDB</strong>: compare o rendimento líquido contra o IPCA. Calcule o líquido (já com IR regressivo) com a <a href="/pt/cdb-rendimento-liquido-ir-regressivo">calculadora de CDB</a> e compare poupança × CDB × Tesouro na <a href="/pt/calculadora-rentabilidade-cdb-poupanca-tesouro">comparação de rentabilidade</a>.</li>
<li><strong>Tesouro IPCA+</strong>: paga a inflação mais um juro real fixo — o jeito mais direto de garantir ganho acima do IPCA. Veja o juro real composto na <a href="/pt/tesouro-ipca-mais-juro-real-composto">calculadora do Tesouro IPCA+</a>.</li>
</ul>

<h2 id="proteger">Como se proteger da inflação</h2>
<ol>
<li><strong>Não deixe dinheiro parado</strong> em conta sem rendimento: é onde a inflação corrói mais.</li>
<li><strong>Reserva de emergência</strong> em CDB de liquidez diária ou Tesouro Selic, que ao menos acompanham os juros.</li>
<li><strong>Médio e longo prazo</strong>: Tesouro IPCA+ e fundos atrelados ao índice garantem ganho real acima da inflação.</li>
<li><strong>Meça o rendimento REAL</strong>, não o nominal: o que importa é quanto sobra depois de descontar o IPCA.</li>
</ol>
<p>Não é recomendação de investimento: é síntese de dados públicos do IBGE/BCB. Para decisões, consulte um profissional certificado (CEA/CFP).</p>'''

    post = {
        'slug': slug,
        'title': f'IPCA de {mes_nome} de {ano}: {ipca_mes}% — quanto você perdeu e como se proteger | Hacé Cuentas',
        'ogTitle': f'IPCA de {mes_nome} {ano}: quanto o seu dinheiro perdeu',
        'description': (f'A inflação (IPCA) de {mes_nome} de {ano} foi {ipca_mes}% (IBGE). Acumulado no ano {ytd}%, '
                        f'12 meses {last12}%. Quanto o seu poder de compra perdeu e como se proteger.'),
        'seoKeywords': [
            f'ipca {mes_nome} {ano}', f'inflacao brasil {ano}', 'ipca acumulado 12 meses',
            'quanto perdi com a inflacao', 'ipca vs cdb', 'tesouro ipca mais',
        ],
        'category': 'finanzas',
        'date': today.strftime('%Y-%m-%d'),
        'updatedDate': today.strftime('%Y-%m-%d'),
        'author': 'Hacé Cuentas',
        'readingTime': 4,
        'heroEmoji': '📈',
        'content': content,
        'relatedCalcs': [
            'tesouro-ipca-mais-juro-real-composto',
            'cdb-rendimento-liquido-ir-regressivo',
            'calculadora-rentabilidade-cdb-poupanca-tesouro',
            'aluguel-reajuste-ipca-anual-contrato',
        ],
        'faq': [
            {'q': f'Qual foi o IPCA de {mes_nome} de {ano}?',
             'a': f'Segundo o IBGE, o IPCA de {mes_nome} de {ano} foi de {ipca_mes}%. No acumulado do ano são {ytd}% e em 12 meses, {last12}%.'},
            {'q': 'Quanto o meu dinheiro perdeu com a inflação?',
             'a': f'Com a inflação de {last12}% em 12 meses, R$100.000 de um ano atrás equivalem hoje a cerca de R${brl(poder)} de poder de compra: você perdeu aproximadamente R${brl(perdida)} de valor real.'},
            {'q': 'Como se calcula o IPCA acumulado?',
             'a': 'Não se somam os percentuais: multiplicam-se os fatores. Cada mês multiplica (1 + IPCA/100); o acumulado é o produto menos 1. Por isso vários meses na casa de 0,5% resultam num acumulado maior que a soma simples.'},
            {'q': 'A poupança perde para a inflação?',
             'a': f'Depende do mês. É preciso comparar o rendimento da poupança contra o IPCA do período ({ipca_mes}% em {mes_nome}). Quando o rendimento é menor, você perde em termos reais mesmo com o saldo nominal crescendo.'},
            {'q': 'O que rende acima da inflação?',
             'a': 'O Tesouro IPCA+ paga a inflação mais um juro real fixo, garantindo ganho acima do índice. CDBs e fundos que superem o IPCA líquido de IR também protegem. O importante é olhar o rendimento real, não o nominal.'},
            {'q': 'De onde vem esse dado?',
             'a': 'Do IPCA oficial do IBGE, divulgado mensalmente e disponível na série 433 do Banco Central (BCB). A data de publicação acima indica quando esta matéria foi atualizada.'},
            {'q': 'Com que frequência esta matéria é atualizada?',
             'a': 'É gerada todo mês quando o IBGE divulga o IPCA do mês anterior, com o dado mais recente.'},
        ],
    }

    if dry:
        print(json.dumps(post, ensure_ascii=False, indent=2))
        print(f'\n--- {slug} | IPCA {mes_nome} {ipca_mes}% | YTD {ytd}% | 12m {last12}% | R$100k→R${brl(poder)}', file=sys.stderr)
        return

    BLOG.mkdir(parents=True, exist_ok=True)
    out = BLOG / f'{slug}.json'
    if out.exists() and '--force' not in sys.argv:
        print(f'• já existe (skip): {out}')
        return
    out.write_text(json.dumps(post, ensure_ascii=False, indent=2))
    print(f'✅ Post gerado: {out}  (IPCA {mes_nome} {ipca_mes}% · 12m {last12}% · R$100k→R${brl(poder)})')


if __name__ == '__main__':
    generate(dry='--dry-run' in sys.argv)
