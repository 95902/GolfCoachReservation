/**
 * @swagger
 * /api/cache:
 *   get:
 *     summary: Récupérer les statistiques du cache
 *     description: Endpoint pour obtenir les statistiques du cache de l'application
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques du cache récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 size:
 *                   type: number
 *                 keys:
 *                   type: array
 *                   items:
 *                     type: string
 *                 memoryUsage:
 *                   type: object
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
 *   delete:
 *     summary: Vider le cache
 *     description: Endpoint pour vider le cache de l'application
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pattern
 *         schema:
 *           type: string
 *         description: Pattern pour vider seulement certaines clés du cache
 *     responses:
 *       200:
 *         description: Cache vidé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
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
import { createErrorResponse, CustomError, ErrorCode } from '@/lib/error-handler'
import { getCacheStats, clearCache } from '@/lib/db-optimizations'
import { addSecurityHeaders } from '@/lib/security'

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

    // Check user role - only admins can access cache stats
    if (session.user.role !== 'ADMIN') {
      throw new CustomError(
        ErrorCode.AUTHORIZATION_ERROR,
        'Accès refusé. Rôle administrateur requis.',
        403
      )
    }

    const stats = getCacheStats()
    
    return addSecurityHeaders(NextResponse.json(stats))
  } catch (error) {
    if (error instanceof CustomError) {
      return addSecurityHeaders(createErrorResponse(error, '/api/cache'))
    }
    
    return addSecurityHeaders(createErrorResponse(error, '/api/cache'))
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

    // Check user role - only admins can clear cache
    if (session.user.role !== 'ADMIN') {
      throw new CustomError(
        ErrorCode.AUTHORIZATION_ERROR,
        'Accès refusé. Rôle administrateur requis.',
        403
      )
    }

    const { searchParams } = new URL(request.url)
    const pattern = searchParams.get('pattern')

    clearCache(pattern || undefined)
    
    return addSecurityHeaders(NextResponse.json({ 
      message: pattern 
        ? `Cache vidé pour le pattern: ${pattern}` 
        : 'Cache vidé avec succès' 
    }))
  } catch (error) {
    if (error instanceof CustomError) {
      return addSecurityHeaders(createErrorResponse(error, '/api/cache'))
    }
    
    return addSecurityHeaders(createErrorResponse(error, '/api/cache'))
  }
}
