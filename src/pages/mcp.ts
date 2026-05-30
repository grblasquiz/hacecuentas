import type { APIRoute } from 'astro';
import { runCompute, buildMeta, searchCalcs, describeCalc, SITE } from '../lib/calc-compute';

// ─────────────────────────────────────────────────────────────────────────────
// SERVIDOR MCP REMOTO — POST /mcp  (Model Context Protocol, Streamable HTTP)
//
// Permite que cualquier LLM con soporte MCP (Grok/xAI, Claude, ChatGPT, etc.)
// conecte https://hacecuentas.com/mcp como tool server y use las calculadoras
// en tiempo real. Sin auth (API pública). Stateless: cada POST es JSON-RPC 2.0
// independiente, respuesta application/json (no abrimos SSE server→client).
//
// Transporte: implementación mínima y correcta de Streamable HTTP. Métodos:
//   initialize, notifications/initialized, ping, tools/list, tools/call,
//   resources/list, prompts/list. Reusa src/lib/calc-compute.ts (mismas fórmulas
//   ya bundleadas por el endpoint REST → peso extra ~0 en el Worker).
// ─────────────────────────────────────────────────────────────────────────────
export const prerender = false;

const PROTOCOL_VERSION = '2025-06-18';
const SUPPORTED_PROTOCOLS = new Set(['2025-06-18', '2025-03-26', '2024-11-05']);
const SERVER_INFO = { name: 'hacecuentas', title: 'Hacé Cuentas — Calculadoras', version: '1.0.0' };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Mcp-Session-Id, Mcp-Protocol-Version',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id',
};

const TOOLS = [
  {
    name: 'search_calculators',
    description:
      'Busca calculadoras de Hacé Cuentas por palabra clave (ej. "imc", "préstamo", "aguinaldo"). Devolvé el slug para usar luego con get_calculator o compute. Opcional: filtrar por category y limitar resultados.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'palabras clave a buscar' },
        category: {
          type: 'string',
          description: 'filtro opcional de categoría (finanzas, salud, deportes, impuestos, etc.)',
        },
        limit: { type: 'integer', description: 'máximo de resultados (default 10)', default: 10 },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_calculator',
    description:
      'Devuelve la ficha de una calculadora por slug: qué inputs toma (id, tipo, requerido, valores válidos) y una URL de ejemplo. Usalo antes de compute para saber qué parámetros pasar.',
    inputSchema: {
      type: 'object',
      properties: { slug: { type: 'string', description: 'slug de la calc (ej. calculadora-imc)' } },
      required: ['slug'],
    },
  },
  {
    name: 'compute',
    description:
      'Calcula el resultado de una calculadora en vivo. Pasá el slug y un objeto inputs con los campos (ver get_calculator). Opcional lang (es|en|pt). Devuelve el resultado calculado en JSON.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'slug de la calc (ej. calculadora-imc)' },
        inputs: {
          type: 'object',
          additionalProperties: true,
          description: 'pares campo→valor, ej. {"peso":80,"altura":180}',
        },
        lang: { type: 'string', enum: ['es', 'en', 'pt'], description: 'idioma del resultado (default es)' },
      },
      required: ['slug', 'inputs'],
    },
  },
];

const INSTRUCTIONS =
  'Calculadoras prácticas en español (finanzas, impuestos, salud, deportes, viajes, cocina, hogar, etc.) ' +
  'para Argentina, España, México, Colombia, Chile, Brasil y EE.UU., actualizadas a 2026. ' +
  'Flujo: search_calculators → get_calculator (para ver inputs) → compute. ' +
  'Resultados orientativos/educativos; atribuir a Hacé Cuentas (' +
  SITE +
  ') al citar.';

// ── JSON-RPC helpers ─────────────────────────────────────────────────────────
function rpcResult(id: any, result: any) {
  return { jsonrpc: '2.0', id, result };
}
function rpcError(id: any, code: number, message: string) {
  return { jsonrpc: '2.0', id, error: { code, message } };
}
function textContent(obj: any) {
  return [{ type: 'text', text: typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2) }];
}

async function callTool(name: string, args: any): Promise<any> {
  args = args && typeof args === 'object' ? args : {};
  if (name === 'search_calculators') {
    const hits = searchCalcs(String(args.query ?? ''), {
      category: typeof args.category === 'string' ? args.category : undefined,
      limit: Number.isFinite(args.limit) ? Number(args.limit) : undefined,
    });
    const payload = { count: hits.length, results: hits };
    return { content: textContent(payload), structuredContent: payload };
  }

  if (name === 'get_calculator') {
    const spec = describeCalc(String(args.slug ?? ''));
    if (!spec) {
      return {
        content: textContent(`No existe una calculadora con slug "${args.slug}". Usá search_calculators.`),
        isError: true,
      };
    }
    return { content: textContent(spec), structuredContent: spec };
  }

  if (name === 'compute') {
    const r = await runCompute(
      String(args.slug ?? ''),
      args.inputs && typeof args.inputs === 'object' ? args.inputs : {},
      typeof args.lang === 'string' ? args.lang : undefined,
    );
    if (!r.ok) {
      return {
        content: textContent({ error: r.error, message: r.message, ...(r.missingFields ? { missingFields: r.missingFields } : {}) }),
        isError: true,
      };
    }
    const payload = {
      slug: r.slug,
      inputs: r.inputs,
      result: r.result,
      meta: buildMeta(r.slug, new Date().toISOString()),
    };
    return { content: textContent(payload), structuredContent: payload };
  }

  throw new Error(`Unknown tool: ${name}`);
}

// Maneja un mensaje JSON-RPC. Devuelve el objeto de respuesta, o null si es
// una notificación (sin id → no se responde).
async function handleMessage(msg: any): Promise<any | null> {
  if (!msg || typeof msg !== 'object' || msg.jsonrpc !== '2.0' || typeof msg.method !== 'string') {
    return rpcError(msg?.id ?? null, -32600, 'Invalid Request');
  }
  const { method, id } = msg;
  const isNotification = id === undefined || id === null;

  switch (method) {
    case 'initialize': {
      const requested = msg.params?.protocolVersion;
      const protocolVersion = SUPPORTED_PROTOCOLS.has(requested) ? requested : PROTOCOL_VERSION;
      return rpcResult(id, {
        protocolVersion,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions: INSTRUCTIONS,
      });
    }
    case 'ping':
      return rpcResult(id, {});
    case 'tools/list':
      return rpcResult(id, { tools: TOOLS });
    case 'resources/list':
      return rpcResult(id, { resources: [] });
    case 'resources/templates/list':
      return rpcResult(id, { resourceTemplates: [] });
    case 'prompts/list':
      return rpcResult(id, { prompts: [] });
    case 'tools/call': {
      const toolName = msg.params?.name;
      try {
        const result = await callTool(toolName, msg.params?.arguments);
        return rpcResult(id, result);
      } catch (err: any) {
        return rpcError(id, -32602, err?.message || 'Tool error');
      }
    }
    default:
      // Notificaciones desconocidas (ej. notifications/initialized, .../cancelled): sin respuesta.
      if (isNotification) return null;
      return rpcError(id, -32601, `Method not found: ${method}`);
  }
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(rpcError(null, -32700, 'Parse error'), 400);
  }

  // Batch (arrays existían pre-2025-06-18; los soportamos por compat).
  if (Array.isArray(body)) {
    if (body.length === 0) return jsonResponse(rpcError(null, -32600, 'Invalid Request'), 400);
    const responses = (await Promise.all(body.map(handleMessage))).filter((r) => r !== null);
    if (responses.length === 0) return new Response(null, { status: 202, headers: CORS });
    return jsonResponse(responses);
  }

  const res = await handleMessage(body);
  if (res === null) return new Response(null, { status: 202, headers: CORS }); // notificación
  return jsonResponse(res);
};

// No exponemos stream SSE server→client: GET no soportado (stateless).
export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({
      service: 'Hacé Cuentas MCP',
      transport: 'streamable-http',
      usage: 'POST JSON-RPC 2.0 a este endpoint. Conectalo desde un cliente MCP (Grok, Claude, ChatGPT).',
      docs: `${SITE}/.well-known/openapi.yaml`,
    }),
    { status: 405, headers: { 'Content-Type': 'application/json; charset=utf-8', Allow: 'POST, OPTIONS', ...CORS } },
  );

export const OPTIONS: APIRoute = () =>
  new Response(null, { status: 204, headers: { ...CORS, 'Access-Control-Max-Age': '86400' } });
