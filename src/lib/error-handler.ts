import { NextResponse } from 'next/server'

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
}

export interface AppError {
  code: ErrorCode
  message: string
  details?: any
  statusCode: number
  timestamp: string
  path?: string
}

export class CustomError extends Error {
  public code: ErrorCode
  public statusCode: number
  public details?: any
  public timestamp: string
  public path?: string

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: any,
    path?: string
  ) {
    super(message)
    this.name = 'CustomError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
    this.timestamp = new Date().toISOString()
    this.path = path
  }
}

export function createErrorResponse(error: unknown, path?: string): NextResponse {
  console.error('Error occurred:', error)

  if (error instanceof CustomError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          timestamp: error.timestamp,
          path: error.path || path,
        },
      },
      { status: error.statusCode }
    )
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'Une erreur interne s\'est produite',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          timestamp: new Date().toISOString(),
          path: path,
        },
      },
      { status: 500 }
    )
  }

  return NextResponse.json(
    {
      error: {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Une erreur inconnue s\'est produite',
        timestamp: new Date().toISOString(),
        path: path,
      },
    },
    { status: 500 }
  )
}

export function validateRequired(data: any, fields: string[]): void {
  const missing = fields.filter(field => !data[field])
  
  if (missing.length > 0) {
    throw new CustomError(
      ErrorCode.VALIDATION_ERROR,
      `Champs requis manquants: ${missing.join(', ')}`,
      400,
      { missingFields: missing }
    )
  }
}

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(email)) {
    throw new CustomError(
      ErrorCode.VALIDATION_ERROR,
      'Format d\'email invalide',
      400,
      { email }
    )
  }
}

export function validatePassword(password: string): void {
  if (password.length < 6) {
    throw new CustomError(
      ErrorCode.VALIDATION_ERROR,
      'Le mot de passe doit contenir au moins 6 caractères',
      400
    )
  }
}

export function handleDatabaseError(error: unknown): CustomError {
  console.error('Database error:', error)

  if (error instanceof Error) {
    if (error.message.includes('Unique constraint')) {
      return new CustomError(
        ErrorCode.VALIDATION_ERROR,
        'Cette ressource existe déjà',
        409,
        { originalError: error.message }
      )
    }

    if (error.message.includes('Foreign key constraint')) {
      return new CustomError(
        ErrorCode.VALIDATION_ERROR,
        'Référence invalide',
        400,
        { originalError: error.message }
      )
    }

    if (error.message.includes('Record to update not found')) {
      return new CustomError(
        ErrorCode.NOT_FOUND,
        'Ressource non trouvée',
        404,
        { originalError: error.message }
      )
    }
  }

  return new CustomError(
    ErrorCode.DATABASE_ERROR,
    'Erreur de base de données',
    500,
    { originalError: error instanceof Error ? error.message : 'Unknown error' }
  )
}

export function handleAuthError(error: unknown): CustomError {
  console.error('Authentication error:', error)

  if (error instanceof Error) {
    if (error.message.includes('Invalid credentials')) {
      return new CustomError(
        ErrorCode.AUTHENTICATION_ERROR,
        'Identifiants invalides',
        401
      )
    }

    if (error.message.includes('Token expired')) {
      return new CustomError(
        ErrorCode.AUTHENTICATION_ERROR,
        'Session expirée',
        401
      )
    }
  }

  return new CustomError(
    ErrorCode.AUTHENTICATION_ERROR,
    'Erreur d\'authentification',
    401
  )
}
