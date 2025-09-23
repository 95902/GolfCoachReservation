import { NextRequest, NextResponse } from 'next/server'

export interface MetricsData {
  timestamp: string
  endpoint: string
  method: string
  statusCode: number
  responseTime: number
  userAgent?: string
  ip?: string
  userId?: string
  memoryUsage?: NodeJS.MemoryUsage
  cpuUsage?: NodeJS.CpuUsage
}

class MetricsCollector {
  private metrics: MetricsData[] = []
  private maxMetrics = 1000 // Keep only last 1000 metrics

  record(metric: Omit<MetricsData, 'timestamp'>) {
    const fullMetric: MetricsData = {
      ...metric,
      timestamp: new Date().toISOString(),
    }

    this.metrics.push(fullMetric)

    // Keep only the last maxMetrics entries
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }
  }

  getMetrics() {
    return this.metrics
  }

  getMetricsByEndpoint(endpoint: string) {
    return this.metrics.filter(m => m.endpoint === endpoint)
  }

  getAverageResponseTime(endpoint?: string) {
    const metrics = endpoint ? this.getMetricsByEndpoint(endpoint) : this.metrics
    if (metrics.length === 0) return 0

    const totalTime = metrics.reduce((sum, m) => sum + m.responseTime, 0)
    return totalTime / metrics.length
  }

  getErrorRate(endpoint?: string) {
    const metrics = endpoint ? this.getMetricsByEndpoint(endpoint) : this.metrics
    if (metrics.length === 0) return 0

    const errorCount = metrics.filter(m => m.statusCode >= 400).length
    return errorCount / metrics.length
  }

  getTopEndpoints(limit = 10) {
    const endpointCounts = this.metrics.reduce((acc, metric) => {
      acc[metric.endpoint] = (acc[metric.endpoint] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(endpointCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([endpoint, count]) => ({ endpoint, count }))
  }

  getHealthStatus() {
    const recentMetrics = this.metrics.filter(
      m => Date.now() - new Date(m.timestamp).getTime() < 5 * 60 * 1000 // Last 5 minutes
    )

    if (recentMetrics.length === 0) {
      return { status: 'unknown', message: 'No recent metrics' }
    }

    const averageResponseTime = this.getAverageResponseTime()
    const errorRate = this.getErrorRate()

    if (errorRate > 0.1) {
      return { status: 'unhealthy', message: `High error rate: ${(errorRate * 100).toFixed(1)}%` }
    }

    if (averageResponseTime > 2000) {
      return { status: 'degraded', message: `Slow response time: ${averageResponseTime.toFixed(0)}ms` }
    }

    return { status: 'healthy', message: 'All systems operational' }
  }

  clear() {
    this.metrics = []
  }
}

export const metricsCollector = new MetricsCollector()

export function recordMetrics(
  req: NextRequest,
  res: NextResponse,
  startTime: number,
  userId?: string
) {
  const responseTime = Date.now() - startTime
  const endpoint = req.nextUrl.pathname
  const method = req.method
  const statusCode = res.status
  const userAgent = req.headers.get('user-agent') || undefined
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined

  metricsCollector.record({
    endpoint,
    method,
    statusCode,
    responseTime,
    userAgent,
    ip,
    userId,
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
  })
}

export function getMetricsSummary() {
  const metrics = metricsCollector.getMetrics()
  const health = metricsCollector.getHealthStatus()
  const averageResponseTime = metricsCollector.getAverageResponseTime()
  const errorRate = metricsCollector.getErrorRate()
  const topEndpoints = metricsCollector.getTopEndpoints()

  return {
    totalRequests: metrics.length,
    averageResponseTime: Math.round(averageResponseTime),
    errorRate: Math.round(errorRate * 100) / 100,
    health,
    topEndpoints,
    timestamp: new Date().toISOString(),
  }
}
