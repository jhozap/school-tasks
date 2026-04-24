import { z } from 'zod'

// Schema used internally to parse the raw model response (includes viability flag)
export const RawModelResponseSchema = z.object({
  viable: z.boolean(),
  title: z.string().max(255).nullable(),
  description: z.string().nullable(),
  due_date: z.string().nullable(),
})

// Schema and type for what the API returns to the client (viable stripped out)
export const ExtractedFieldsSchema = z.object({
  title: z.string().max(255),
  description: z.string().nullable(),
  due_date: z.string().nullable(),
})

export type ExtractedFields = z.infer<typeof ExtractedFieldsSchema>
