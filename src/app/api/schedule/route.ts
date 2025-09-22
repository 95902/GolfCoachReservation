/**
 * @swagger
 * /api/schedule:
 *   post:
 *     summary: Créer un nouveau planning hebdomadaire
 *     description: Permet aux administrateurs et coaches de créer un planning hebdomadaire
 *     tags: [Schedule]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - weekNumber
 *               - startDate
 *               - endDate
 *             properties:
 *               weekNumber:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 2
 *                 description: Numéro de la semaine (1 ou 2)
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Date de début de la semaine
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Date de fin de la semaine
 *               timeSlots:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     dayOfWeek:
 *                       type: string
 *                     startTime:
 *                       type: string
 *                     endTime:
 *                       type: string
 *     responses:
 *       200:
 *         description: Planning créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Schedule'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Accès refusé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   get:
 *     summary: Récupérer les plannings hebdomadaires
 *     description: Récupère tous les plannings hebdomadaires pour les administrateurs et coaches
 *     tags: [Schedule]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des plannings récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Schedule'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { createErrorResponse, CustomError, ErrorCode, validateRequired, handleDatabaseError } from '@/lib/error-handler'
import { apiLogger, logError, logDatabase } from '@/lib/logger'
import { recordMetrics } from '@/lib/metrics'
import { scheduleOptimizations } from '@/lib/db-optimizations'
import { scheduleSchemas, validateData } from '@/lib/validation/schemas'
import { securityMiddleware, addSecurityHeaders, sanitizeInput } from '@/lib/security'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let response: NextResponse

  // Security middleware
  const securityResponse = securityMiddleware(request)
  if (securityResponse) {
    return securityResponse
  }

  try {
    apiLogger.info('Schedule API POST called', {
      method: 'POST',
      url: '/api/schedule',
      timestamp: new Date().toISOString()
    })
    
    // Authentication check
    const session = await auth()
    if (!session || !session.user) {
      throw new CustomError(
        ErrorCode.AUTHENTICATION_ERROR,
        'Authentification requise',
        401
      )
    }

    // Check user role
    if (session.user.role !== 'ADMIN' && session.user.role !== 'COACH') {
      throw new CustomError(
        ErrorCode.AUTHORIZATION_ERROR,
        'Accès refusé. Rôle administrateur ou coach requis.',
        403
      )
    }

    const body = await request.json()
    console.log('Request body:', body)
    
    // Validate data with Zod schema
    const validation = validateData(scheduleSchemas.create, body)
    if (!validation.success) {
      throw new CustomError(
        ErrorCode.VALIDATION_ERROR,
        'Données invalides',
        400,
        { errors: validation.errors }
      )
    }

    const { weekNumber, startDate, endDate, timeSlots } = validation.data

    logDatabase('CREATE', 'weeklySchedule', {
      weekNumber: parseInt(weekNumber),
      startDate,
      endDate,
      timeSlotsCount: timeSlots?.length || 0
    })
    
    // Save to database with optimizations
    const schedule = await scheduleOptimizations.createScheduleOptimized({
      weekNumber,
      startDate,
      endDate,
      timeSlots: timeSlots || []
    })

    response = NextResponse.json({ 
      message: 'Planning enregistré avec succès',
      data: schedule
    })
    
  } catch (error) {
    logError(error, { endpoint: '/api/schedule', method: 'POST' })
    
    if (error instanceof CustomError) {
      response = createErrorResponse(error, '/api/schedule')
    } else if (error instanceof Error && error.message.includes('Prisma')) {
      const dbError = handleDatabaseError(error)
      response = createErrorResponse(dbError, '/api/schedule')
    } else {
      response = createErrorResponse(error, '/api/schedule')
    }
  } finally {
    // Record metrics
    recordMetrics(request, response!, startTime, session?.user?.id)
  }

  // Add security headers to response
  return addSecurityHeaders(response!)
}

export async function GET() {
  try {
    const session = await auth()
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'COACH')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use optimized query with caching
    const schedules = await scheduleOptimizations.getSchedulesOptimized()
    
    // Format the response to match the expected structure
    const formattedSchedules = schedules.map(schedule => ({
      weekNumber: schedule.weekNumber,
      startDate: schedule.startDate.toISOString().split('T')[0],
      endDate: schedule.endDate.toISOString().split('T')[0],
      timeSlots: schedule.scheduleSlots.map(slot => ({
        id: slot.id,
        dayOfWeek: slot.dayOfWeek.toString(),
        startTime: slot.startTime,
        endTime: slot.endTime
      }))
    }))
    
    // Ensure we have both week 1 and week 2
    const result: Array<{
      weekNumber: number;
      startDate: string;
      endDate: string;
      timeSlots: Array<{
        id: string;
        dayOfWeek: string;
        startTime: string;
        endTime: string;
      }>;
    }> = []
    for (let week = 1; week <= 2; week++) {
      const existing = formattedSchedules.find(s => s.weekNumber === week)
      if (existing) {
        result.push(existing)
      } else {
        result.push({
          weekNumber: week,
          startDate: '',
          endDate: '',
          timeSlots: []
        })
      }
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}