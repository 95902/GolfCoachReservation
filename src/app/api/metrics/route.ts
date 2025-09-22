/**
 * @swagger
 * /api/metrics:
 *   get:
 *     summary: Récupérer les métriques de performance
 *     description: Endpoint pour obtenir les métriques de performance de l'application
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métriques récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRequests:
 *                   type: number
 *                 averageResponseTime:
 *                   type: number
 *                 errorRate:
 *                   type: number
 *                 health:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                     message:
 *                       type: string
 *                 topEndpoints:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       endpoint:
 *                         type: string
 *                       count:
 *                         type: number
 *                 timestamp:
 *                   type: string
 *                   format: date-time
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
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getMetricsSummary, metricsCollector } from '@/lib/metrics'
import { createErrorResponse, CustomError, ErrorCode } from '@/lib/error-handler'

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth()
    if (!session || !session.user) {
      throw new CustomError(
        ErrorCode.AUTHENTICATION_ERROR,
        'Authentification requise',
        401
      )
    }

    // Check user role - only admins can access metrics
    if (session.user.role !== 'ADMIN') {
      throw new CustomError(
        ErrorCode.AUTHORIZATION_ERROR,
        'Accès refusé. Rôle administrateur requis.',
        403
      )
    }

    const summary = getMetricsSummary()
    
    return NextResponse.json(summary)
  } catch (error) {
    if (error instanceof CustomError) {
      return createErrorResponse(error, '/api/metrics')
    }
    
    return createErrorResponse(error, '/api/metrics')
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth()
    if (!session || !session.user) {
      throw new CustomError(
        ErrorCode.AUTHENTICATION_ERROR,
        'Authentification requise',
        401
      )
    }

    // Check user role - only admins can clear metrics
    if (session.user.role !== 'ADMIN') {
      throw new CustomError(
        ErrorCode.AUTHORIZATION_ERROR,
        'Accès refusé. Rôle administrateur requis.',
        403
      )
    }

    metricsCollector.clear()
    
    return NextResponse.json({ message: 'Métriques effacées avec succès' })
  } catch (error) {
    if (error instanceof CustomError) {
      return createErrorResponse(error, '/api/metrics')
    }
    
    return createErrorResponse(error, '/api/metrics')
  }
}
