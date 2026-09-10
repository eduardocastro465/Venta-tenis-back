import Groq from "groq-sdk";
import { GROQ_API_KEY_1, GROQ_API_KEY_2 } from "../config.js";
import type { DatosProductoIA } from "../interface/products.interface.js";

// Rotación de API keys
const apiKeys = [
  GROQ_API_KEY_1,
  GROQ_API_KEY_2,
  //GROQ_API_KEY_3,
].filter((key): key is string => Boolean(key));

if (apiKeys.length === 0) {
  throw new Error("No hay ninguna GROQ_API_KEY_1/2/3 configurada en el .env");
}

const clientes = apiKeys.map((apiKey) => new Groq({ apiKey }));

// Round-robin simple: cada llamada usa el siguiente cliente en la lista.
let indiceActual = 0;
function obtenerSiguienteCliente(): Groq {
  const cliente = clientes[indiceActual];
  if (!cliente) {
    throw new Error("No hay cliente Groq disponible en el índice actual");
  }
  indiceActual = (indiceActual + 1) % clientes.length;
  return cliente;
}

const VISION_MODEL = "qwen/qwen3.6-27b";

// Límite real de Groq: 20MB por imagen, máx. 5 imágenes por request en este modelo.
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

const SYSTEM_PROMPT = `Eres un asistente que analiza fotos de productos para un catálogo de e-commerce.
El catálogo puede incluir cualquier tipo de producto (ropa, calzado, accesorios, electrónica, hogar, etc.), no solo moda.
Devuelve SIEMPRE un único objeto JSON válido, sin texto extra, con esta forma exacta:
{
  "nombre": string,
  "marca": string | null,
  "genero": "hombre" | "mujer" | "unisex",
  "descripcion": string,
  "talla": string,
  "categoriasSugeridas": string[]
}
Reglas:
- "nombre": corto y descriptivo, acorde al tipo de producto que sea (ej. "Tenis deportivos con agujetas", "Audífonos inalámbricos con estuche").
- "marca": solo si el logo/etiqueta es visible y legible; si no, usa null.
- "genero": solo tiene sentido en ropa, calzado y accesorios de moda. Si el producto no tiene género aplicable (electrónica, hogar, etc.), usa "unisex" por defecto.
- "descripcion": 2-3 frases en español, vendedoras pero honestas sobre lo que se ve.
- "talla": solo aplica a ropa/calzado con etiqueta de talla visible. Para productos sin talla, o si no hay etiqueta visible, pon "" (cadena vacía) — nunca inventes un valor.
- "categoriasSugeridas": 1 a 3 palabras/frases cortas describiendo el tipo de producto (ej. "tenis", "chamarras", "audífonos", "electrodomésticos").`;

function bufferAImageUrl(buffer: Buffer, mimeType: string): string {
  if (buffer.byteLength > MAX_IMAGE_BYTES) {
    throw new Error(`La imagen pesa ${buffer.byteLength} bytes, supera el límite de ${MAX_IMAGE_BYTES} de Groq`);
  }
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

export async function generarDatosProductoDesdeImagen(
  imageBuffer: Buffer,
  mimeType: string = "image/jpeg"
): Promise<DatosProductoIA> {
  return generarDatosProductoDesdeImagenes([imageBuffer], mimeType);
}

export async function generarDatosProductoDesdeImagenes(
  imageBuffers: Buffer[],
  mimeType: string = "image/jpeg"
): Promise<DatosProductoIA> {
  if (imageBuffers.length === 0) throw new Error("Se necesita al menos una imagen");
  if (imageBuffers.length > 5) throw new Error("Groq acepta máximo 5 imágenes por request");

  const contenidoImagenes = imageBuffers.map((buf) => ({
    type: "image_url" as const,
    image_url: { url: bufferAImageUrl(buf, mimeType) },
  }));

  const mensajes = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    {
      role: "user" as const,
      content: [
        { type: "text" as const, text: "Analiza estas fotos del mismo producto y genera el JSON pedido." },
        ...contenidoImagenes,
      ],
    },
  ];

  let ultimoError: unknown;
  for (let intento = 0; intento < clientes.length; intento++) {
    const indiceUsado = indiceActual;
    const cliente = obtenerSiguienteCliente();
    try {
      return await llamarGroq(cliente, mensajes);
    } catch (err: any) {
      ultimoError = err;
      if (err?.status === 429) {
        console.warn(
          `[Groq] Se acabaron los tokens/requests por minuto en la key #${indiceUsado + 1} de ${clientes.length}. ` +
          `Detalle: ${err?.error?.error?.message ?? err.message}. Reintentando con la siguiente key...`
        );
        continue;
      }
      throw err;
    }
  }
  console.error(`[Groq] Las ${clientes.length} keys están agotadas por rate limit. No se pudo generar el producto.`);
  throw ultimoError;
}

async function llamarGroq(
  groq: Groq,
  mensajes: any
): Promise<DatosProductoIA> {
  const completion = await groq.chat.completions.create({
    model: VISION_MODEL,
    messages: mensajes,
    temperature: 0.3,
    response_format: { type: "json_object" },
    reasoning_effort: "none",
    max_completion_tokens: 800,
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Groq no devolvió contenido");

  let datos: DatosProductoIA;
  try {
    datos = JSON.parse(raw);
  } catch {
    throw new Error(`Groq devolvió un JSON inválido: ${raw}`);
  }

  return datos;
}