import { z } from 'zod'
import { categories, images } from './catalog'

export const emailSchema = z.email().trim().toLowerCase().max(254)
export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1).max(128) })
export const signupSchema = loginSchema.extend({ password: z.string().min(12).max(128), name: z.string().trim().min(2).max(70) })
export const uuid = z.uuid()
export const slugSchema = z.string().min(3).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const localTime = z.string().regex(/^\d{4}-\d\d-\d\dT\d\d:\d\d$/).transform(value => new Date(value + ':00-03:00')).refine(date => Number.isFinite(date.getTime()))
export const eventSchema = z.object({
  id: uuid.optional(), slug: slugSchema, title: z.string().trim().min(3).max(95),
  category: z.enum(categories), modality: z.string().trim().min(2).max(60), description: z.string().trim().min(20).max(5000),
  city: z.string().trim().min(2).max(90), venue: z.string().trim().min(2).max(120),
  starts_at: localTime, ends_at: localTime, capacity: z.coerce.number().int().min(1).max(100000),
  price_cents: z.coerce.number().int().min(0).max(1000000).refine(value => value === 0 || value >= 100),
  image: z.enum(images), featured: z.boolean(), published: z.boolean()
}).refine(value => value.ends_at > value.starts_at, 'O encerramento deve ser posterior ao início.')

export type FormState = { message?: string; ok?: boolean }
