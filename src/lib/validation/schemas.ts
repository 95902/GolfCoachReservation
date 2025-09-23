import { z } from 'zod'

// Schémas de validation pour les utilisateurs
export const userSchemas = {
  create: z.object({
    email: z.string().email('Format d\'email invalide'),
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    role: z.enum(['USER', 'COACH', 'ADMIN']).optional().default('USER'),
  }),

  update: z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
    email: z.string().email('Format d\'email invalide').optional(),
    role: z.enum(['USER', 'COACH', 'ADMIN']).optional(),
  }),

  login: z.object({
    email: z.string().email('Format d\'email invalide'),
    password: z.string().min(1, 'Le mot de passe est requis'),
  }),
}

// Schémas de validation pour les plannings
export const scheduleSchemas = {
  create: z.object({
    weekNumber: z.number().int().min(1).max(2, 'Le numéro de semaine doit être 1 ou 2'),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
    timeSlots: z.array(z.object({
      id: z.string().optional(),
      dayOfWeek: z.string().min(1, 'Jour de la semaine requis'),
      startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format d\'heure invalide (HH:MM)'),
      endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format d\'heure invalide (HH:MM)'),
    })).optional().default([]),
  }).refine((data) => {
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    return start < end
  }, {
    message: 'La date de début doit être antérieure à la date de fin',
    path: ['endDate']
  }),

  update: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)').optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)').optional(),
    timeSlots: z.array(z.object({
      id: z.string().optional(),
      dayOfWeek: z.string().min(1, 'Jour de la semaine requis'),
      startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format d\'heure invalide (HH:MM)'),
      endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format d\'heure invalide (HH:MM)'),
    })).optional(),
  }),
}

// Schémas de validation pour les réservations
export const bookingSchemas = {
  create: z.object({
    timeSlotId: z.string().min(1, 'ID du créneau requis'),
    userId: z.string().min(1, 'ID de l\'utilisateur requis'),
    status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED']).optional().default('PENDING'),
  }),

  update: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED']),
  }),

  query: z.object({
    userId: z.string().optional(),
    status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED']).optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)').optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)').optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional().default(1),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default(10),
  }),
}

// Schémas de validation pour les créneaux horaires
export const timeSlotSchemas = {
  create: z.object({
    dayOfWeek: z.string().min(1, 'Jour de la semaine requis'),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format d\'heure invalide (HH:MM)'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format d\'heure invalide (HH:MM)'),
    isAvailable: z.boolean().optional().default(true),
  }).refine((data) => {
    const start = data.startTime.split(':').map(Number)
    const end = data.endTime.split(':').map(Number)
    const startMinutes = start[0] * 60 + start[1]
    const endMinutes = end[0] * 60 + end[1]
    return startMinutes < endMinutes
  }, {
    message: 'L\'heure de début doit être antérieure à l\'heure de fin',
    path: ['endTime']
  }),
}

// Schémas de validation pour les paramètres de requête
export const querySchemas = {
  pagination: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default(1),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default(10),
  }),

  dateRange: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
  }).refine((data) => {
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    return start <= end
  }, {
    message: 'La date de début doit être antérieure ou égale à la date de fin',
    path: ['endDate']
  }),
}

// Fonction utilitaire pour valider les données
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map(err => `${err.path.join('.')}: ${err.message}`)
      }
    }
    return {
      success: false,
      errors: ['Erreur de validation inconnue']
    }
  }
}

// Fonction pour valider les paramètres de requête
export function validateQueryParams(schema: z.ZodSchema, searchParams: URLSearchParams) {
  const params = Object.fromEntries(searchParams.entries())
  return validateData(schema, params)
}
