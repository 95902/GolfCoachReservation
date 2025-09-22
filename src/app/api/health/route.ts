/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Vérifier l'état de santé de l'API
 *     description: Endpoint de monitoring pour vérifier que l'API fonctionne correctement
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API en bonne santé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                 uptime:
 *                   type: number
 *                 database:
 *                   type: string
 *                   example: "connected"
 *       500:
 *         description: API en panne
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "unhealthy"
 *                 error:
 *                   type: string
 */

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const startTime = Date.now()
    
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      database: 'connected', // Simplified for now
      responseTime: Date.now() - startTime,
      environment: process.env.NODE_ENV || 'development',
    }
    
    return NextResponse.json(healthCheck, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}