export const runtime = 'nodejs'
export const maxDuration = 60

import { createClient } from '@/lib/supabase/server'
import { getIsPaid } from '@/lib/isPaid'
import OpenAI from 'openai'
import { RawModelResponseSchema, ExtractedFieldsSchema } from './schema'

const VALID_MAGIC_BYTES: Array<{ bytes: number[]; type: string }> = [
  { bytes: [0xff, 0xd8, 0xff], type: 'image/jpeg' },
  { bytes: [0x89, 0x50, 0x4e, 0x47], type: 'image/png' },
  { bytes: [0x47, 0x49, 0x46], type: 'image/gif' },
  { bytes: [0x52, 0x49, 0x46, 0x46], type: 'image/webp' },
]

function detectImageType(buffer: Uint8Array): string | null {
  for (const { bytes, type } of VALID_MAGIC_BYTES) {
    if (bytes.every((b, i) => buffer[i] === b)) return type
  }
  return null
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'No autenticado' }, { status: 401 })

  const isPaid = await getIsPaid(user.id)
  if (!isPaid) return Response.json({ error: 'Función premium' }, { status: 403 })

  const formData = await request.formData()
  const mode = formData.get('mode') as string

  const today = new Date().toISOString().split('T')[0]
  const systemPrompt = `You are an assistant that extracts task information from images and audio transcripts.
Today's date is ${today}.
Always write title and description in Spanish, regardless of the language of the analyzed content.

First, evaluate whether the provided content (image or transcript) can reasonably be converted into a task.
Content is viable if it contains task-related information: notes, to-do lists, documents, screenshots, whiteboards, emails, calendar entries, homework assignments, or any text describing something that needs to be done.
Content is NOT viable if it shows animals, people, landscapes, abstract art, unreadable/blurry images, or anything that has no clear connection to a task or action item. A transcript is not viable if it is off-topic, unintelligible, or contains no actionable information.

Always respond ONLY with a valid JSON object with these exact keys — no markdown, no explanation:
- "viable": boolean — true if the content can be converted into a task, false otherwise
- "title": string or null — required and max 255 chars when viable, null when not viable; always in Spanish
- "description": string or null — detailed description if available, null otherwise; always in Spanish
- "due_date": string or null — YYYY-MM-DD if a date is mentioned, null otherwise

When viable is false, title, description and due_date must all be null.`

  const client = new OpenAI()
  let userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[]

  if (mode === 'image') {
    const file = formData.get('file') as File | null
    if (!file) return Response.json({ error: 'Imagen requerida' }, { status: 400 })
    if (file.size > 5 * 1024 * 1024) return Response.json({ error: 'Imagen demasiado grande (máx 5MB)' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)
    const mediaType = detectImageType(buffer)
    if (!mediaType) return Response.json({ error: 'Formato no soportado. Usa JPEG, PNG, GIF o WebP.' }, { status: 400 })

    const base64 = Buffer.from(arrayBuffer).toString('base64')
    userContent = [
      { type: 'image_url', image_url: { url: `data:${mediaType};base64,${base64}` } },
      { type: 'text', text: 'Extract the task information from this image.' },
    ]
  } else if (mode === 'audio') {
    const transcript = formData.get('transcript') as string | null
    if (!transcript?.trim()) return Response.json({ error: 'Transcripción vacía' }, { status: 400 })
    userContent = [{ type: 'text', text: transcript }]
  } else {
    return Response.json({ error: 'Modo inválido' }, { status: 400 })
  }

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 512,
    })

    // TODO: eliminar — log de costo por consulta
    const usage = completion.usage
    if (usage) {
      const inputCost = (usage.prompt_tokens / 1_000_000) * 2.50
      const outputCost = (usage.completion_tokens / 1_000_000) * 10.00
      console.log(`[ai/analyze] tokens: ${usage.prompt_tokens} in / ${usage.completion_tokens} out | costo estimado: $${(inputCost + outputCost).toFixed(6)}`)
    }

    const raw = completion.choices[0].message.content
    if (!raw) return Response.json({ error: 'No se pudo analizar el contenido' }, { status: 422 })

    const raw_parsed = RawModelResponseSchema.safeParse(JSON.parse(raw))
    if (!raw_parsed.success) return Response.json({ error: 'Respuesta inesperada del modelo' }, { status: 422 })

    if (!raw_parsed.data.viable) {
      const notViableError = mode === 'audio'
        ? 'El audio no contiene información útil para crear una tarea. Intenta describir una actividad, recordatorio o algo pendiente por hacer.'
        : 'La imagen no es válida para crear una tarea. Intenta con una foto de una nota, lista, documento o captura de pantalla.'
      return Response.json({ error: notViableError }, { status: 422 })
    }

    const { viable: _, ...fields } = raw_parsed.data
    const parsed = ExtractedFieldsSchema.safeParse(fields)
    if (!parsed.success) return Response.json({ error: 'Respuesta inesperada del modelo' }, { status: 422 })

    return Response.json(parsed.data)
  } catch (err) {
    console.error('[ai/analyze]', err)
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return Response.json({ error: message }, { status: 500 })
  }
}
