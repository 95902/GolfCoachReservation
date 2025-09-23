import { NextRequest, NextResponse } from 'next/server'

// Configuration des en-têtes de sécurité
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join('; '),
}

// Fonction pour ajouter les en-têtes de sécurité
export function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

// Fonction pour valider l'origine de la requête
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  
  // Liste des domaines autorisés
  const allowedOrigins = [
    'http://localhost:3000',
    'https://golfindoor.fr',
    'https://www.golfindoor.fr',
  ]
  
  if (origin && !allowedOrigins.includes(origin)) {
    return false
  }
  
  if (referer && !allowedOrigins.some(allowed => referer.startsWith(allowed))) {
    return false
  }
  
  return true
}

// Fonction pour valider le rate limiting (simple)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100 // 100 requêtes par fenêtre

export function checkRateLimit(request: NextRequest): { allowed: boolean; remaining: number; resetTime: number } {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const now = Date.now()
  const key = `${ip}-${Math.floor(now / RATE_LIMIT_WINDOW)}`
  
  const current = rateLimitMap.get(key) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW }
  
  if (now > current.resetTime) {
    current.count = 0
    current.resetTime = now + RATE_LIMIT_WINDOW
  }
  
  current.count++
  rateLimitMap.set(key, current)
  
  // Nettoyer les anciennes entrées
  for (const [k, v] of rateLimitMap.entries()) {
    if (now > v.resetTime) {
      rateLimitMap.delete(k)
    }
  }
  
  return {
    allowed: current.count <= RATE_LIMIT_MAX_REQUESTS,
    remaining: Math.max(0, RATE_LIMIT_MAX_REQUESTS - current.count),
    resetTime: current.resetTime
  }
}

// Fonction pour sanitiser les entrées utilisateur
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Supprimer les balises HTML
    .replace(/javascript:/gi, '') // Supprimer les URLs javascript
    .replace(/on\w+=/gi, '') // Supprimer les attributs d'événements
    .trim()
}

// Fonction pour valider les paramètres de requête
export function validateQueryParams(params: URLSearchParams, allowedParams: string[]): { valid: boolean; invalidParams: string[] } {
  const invalidParams: string[] = []
  
  for (const [key] of params.entries()) {
    if (!allowedParams.includes(key)) {
      invalidParams.push(key)
    }
  }
  
  return {
    valid: invalidParams.length === 0,
    invalidParams
  }
}

// Fonction pour générer un token CSRF
export function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Fonction pour valider un token CSRF
export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken && token.length === 64
}

// Middleware de sécurité pour les APIs
export function securityMiddleware(request: NextRequest) {
  const response = new NextResponse()
  
  // Vérifier l'origine
  if (!validateOrigin(request)) {
    return NextResponse.json(
      { error: 'Origine non autorisée' },
      { status: 403 }
    )
  }
  
  // Vérifier le rate limiting
  const rateLimit = checkRateLimit(request)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Trop de requêtes' },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetTime.toString(),
        }
      }
    )
  }
  
  // Ajouter les en-têtes de sécurité
  addSecurityHeaders(response)
  
  return null // Continuer le traitement
}
