import winston from 'winston'
import path from 'path'

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
}

// Tell winston that you want to link the colors
winston.addColors(colors)

// Define which logs to print based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development'
  const isDevelopment = env === 'development'
  return isDevelopment ? 'debug' : 'warn'
}

// Define different formats
const format = winston.format.combine(
  // Add the message timestamp with the preferred format
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  // Tell Winston that the logs must be colored
  winston.format.colorize({ all: true }),
  // Define the format of the message showing the timestamp, the level and the message
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
)

// Define transports
const transports = [
  // Allow the use of console to print the message
  new winston.transports.Console(),
  // Allow to print all the error level messages inside the error.log file
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'error.log'),
    level: 'error',
  }),
  // Allow to print all the error message inside the all.log file
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'all.log'),
  }),
]

// Create the logger instance
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
})

// Create logs directory if it doesn't exist
import fs from 'fs'
const logsDir = path.join(process.cwd(), 'logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

export default logger

// Specific loggers for different parts of the application
export const authLogger = logger.child({ service: 'auth' })
export const apiLogger = logger.child({ service: 'api' })
export const dbLogger = logger.child({ service: 'database' })
export const errorLogger = logger.child({ service: 'error' })

// Helper functions for common logging patterns
export const logRequest = (req: any, res: any, next?: any) => {
  const { method, url, ip } = req
  const userAgent = req.get('User-Agent') || 'Unknown'
  
  apiLogger.http(`${method} ${url} - ${ip} - ${userAgent}`)
  
  if (next) next()
}

export const logError = (error: any, context?: any) => {
  errorLogger.error('Error occurred', {
    error: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  })
}

export const logAuth = (message: string, userId?: string, details?: any) => {
  authLogger.info(message, {
    userId,
    details,
    timestamp: new Date().toISOString(),
  })
}

export const logDatabase = (operation: string, table: string, details?: any) => {
  dbLogger.info(`Database ${operation} on ${table}`, {
    operation,
    table,
    details,
    timestamp: new Date().toISOString(),
  })
}
