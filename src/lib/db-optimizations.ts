import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

// Cache simple en mémoire pour les requêtes fréquentes
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCachedData(key: string) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  return null
}

function setCachedData(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() })
}

// Optimisations pour les requêtes de planning
export const scheduleOptimizations = {
  // Récupérer les plannings avec optimisations
  async getSchedulesOptimized() {
    const cacheKey = 'schedules_all'
    const cached = getCachedData(cacheKey)
    if (cached) return cached

    const schedules = await db.weeklySchedule.findMany({
      select: {
        id: true,
        weekNumber: true,
        startDate: true,
        endDate: true,
        timeSlots: true,
        // Ne pas charger les relations lourdes si pas nécessaires
      },
      orderBy: {
        weekNumber: 'asc'
      }
    })

    setCachedData(cacheKey, schedules)
    return schedules
  },

  // Récupérer un planning spécifique avec cache
  async getScheduleByWeek(weekNumber: number) {
    const cacheKey = `schedule_week_${weekNumber}`
    const cached = getCachedData(cacheKey)
    if (cached) return cached

    const schedule = await db.weeklySchedule.findUnique({
      where: { weekNumber },
      select: {
        id: true,
        weekNumber: true,
        startDate: true,
        endDate: true,
        timeSlots: true,
      }
    })

    if (schedule) {
      setCachedData(cacheKey, schedule)
    }
    return schedule
  },

  // Créer un planning avec invalidation du cache
  async createScheduleOptimized(data: Prisma.WeeklyScheduleCreateInput) {
    const schedule = await db.weeklySchedule.create({
      data,
      select: {
        id: true,
        weekNumber: true,
        startDate: true,
        endDate: true,
        timeSlots: true,
      }
    })

    // Invalider le cache
    cache.delete('schedules_all')
    cache.delete(`schedule_week_${schedule.weekNumber}`)

    return schedule
  }
}

// Optimisations pour les utilisateurs
export const userOptimizations = {
  // Récupérer un utilisateur avec seulement les champs nécessaires
  async getUserByIdOptimized(id: string) {
    const cacheKey = `user_${id}`
    const cached = getCachedData(cacheKey)
    if (cached) return cached

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        // Ne pas charger le mot de passe si pas nécessaire
      }
    })

    if (user) {
      setCachedData(cacheKey, user)
    }
    return user
  },

  // Récupérer les utilisateurs avec pagination
  async getUsersPaginated(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit
    const cacheKey = `users_page_${page}_limit_${limit}`
    const cached = getCachedData(cacheKey)
    if (cached) return cached

    const [users, total] = await Promise.all([
      db.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.user.count()
    ])

    const result = {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }

    setCachedData(cacheKey, result)
    return result
  }
}

// Optimisations pour les réservations
export const bookingOptimizations = {
  // Récupérer les réservations avec relations optimisées
  async getBookingsOptimized(filters?: {
    userId?: string
    status?: string
    startDate?: Date
    endDate?: Date
  }) {
    const where: Prisma.BookingWhereInput = {}
    
    if (filters?.userId) where.userId = filters.userId
    if (filters?.status) where.status = filters.status as any
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {}
      if (filters.startDate) where.createdAt.gte = filters.startDate
      if (filters.endDate) where.createdAt.lte = filters.endDate
    }

    const cacheKey = `bookings_${JSON.stringify(filters || {})}`
    const cached = getCachedData(cacheKey)
    if (cached) return cached

    const bookings = await db.booking.findMany({
      where,
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        timeSlot: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            dayOfWeek: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    setCachedData(cacheKey, bookings)
    return bookings
  }
}

// Fonction pour vider le cache
export function clearCache(pattern?: string) {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key)
      }
    }
  } else {
    cache.clear()
  }
}

// Fonction pour obtenir les statistiques du cache
export function getCacheStats() {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
    memoryUsage: process.memoryUsage()
  }
}
