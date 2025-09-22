import swaggerJSDoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Golf Coach Reservation API',
      version: '1.0.0',
      description: 'API pour la gestion des réservations de cours de golf',
      contact: {
        name: 'Golf Indoor',
        email: 'contact@golfindoor.fr',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  enum: [
                    'VALIDATION_ERROR',
                    'AUTHENTICATION_ERROR',
                    'AUTHORIZATION_ERROR',
                    'NOT_FOUND',
                    'DATABASE_ERROR',
                    'INTERNAL_SERVER_ERROR',
                    'NETWORK_ERROR',
                    'RATE_LIMIT_ERROR',
                  ],
                },
                message: {
                  type: 'string',
                },
                details: {
                  type: 'object',
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                },
                path: {
                  type: 'string',
                },
              },
            },
          },
        },
        Schedule: {
          type: 'object',
          properties: {
            weekNumber: {
              type: 'integer',
              minimum: 1,
              maximum: 2,
            },
            startDate: {
              type: 'string',
              format: 'date',
            },
            endDate: {
              type: 'string',
              format: 'date',
            },
            timeSlots: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                  },
                  dayOfWeek: {
                    type: 'string',
                  },
                  startTime: {
                    type: 'string',
                  },
                  endTime: {
                    type: 'string',
                  },
                },
              },
            },
          },
          required: ['weekNumber', 'startDate', 'endDate'],
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            name: {
              type: 'string',
            },
            role: {
              type: 'string',
              enum: ['USER', 'COACH', 'ADMIN'],
            },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            userId: {
              type: 'string',
            },
            timeSlotId: {
              type: 'string',
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'CONFIRMED', 'CANCELLED'],
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/app/api/**/*.ts'], // Path to the API files
}

export const swaggerSpec = swaggerJSDoc(options)
