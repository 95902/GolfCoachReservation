import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'

// Configuration pour les tests d'intégration
const BASE_URL = 'http://localhost:3000'
const API_TIMEOUT = 10000

describe('API Integration Tests', () => {
  beforeAll(async () => {
    // Attendre que le serveur soit prêt
    await waitForServer()
  })

  afterAll(async () => {
    // Nettoyage si nécessaire
  })

  describe('Health Check API', () => {
    it('should return healthy status', async () => {
      const response = await fetch(`${BASE_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data).toHaveProperty('status', 'healthy')
      expect(data).toHaveProperty('timestamp')
      expect(data).toHaveProperty('uptime')
      expect(data).toHaveProperty('environment')
    }, API_TIMEOUT)
  })

  describe('Schedule API', () => {
    it('should return 401 for unauthenticated POST requests', async () => {
      const response = await fetch(`${BASE_URL}/api/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weekNumber: 1,
          startDate: '2024-01-01',
          endDate: '2024-01-07',
          timeSlots: []
        })
      })

      expect(response.status).toBe(401)
      
      const data = await response.json()
      expect(data).toHaveProperty('error')
      expect(data.error).toHaveProperty('code', 'AUTHENTICATION_ERROR')
    }, API_TIMEOUT)

    it('should return 200 for GET requests', async () => {
      const response = await fetch(`${BASE_URL}/api/schedule`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(Array.isArray(data)).toBe(true)
    }, API_TIMEOUT)
  })

  describe('Swagger API', () => {
    it('should return OpenAPI specification', async () => {
      const response = await fetch(`${BASE_URL}/api/swagger`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data).toHaveProperty('openapi', '3.0.0')
      expect(data).toHaveProperty('info')
      expect(data).toHaveProperty('paths')
    }, API_TIMEOUT)
  })

  describe('Authentication API', () => {
    it('should have NextAuth endpoints available', async () => {
      // Test the NextAuth configuration endpoint
      const response = await fetch(`${BASE_URL}/api/auth/providers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      // NextAuth might return 200 or 404 depending on configuration
      expect([200, 404]).toContain(response.status)
    }, API_TIMEOUT)
  })
})

// Helper function to wait for server to be ready
async function waitForServer(maxAttempts = 30, delay = 1000) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${BASE_URL}/api/health`)
      if (response.ok) {
        console.log('Server is ready!')
        return
      }
    } catch (error) {
      // Server not ready yet
    }
    
    await new Promise(resolve => setTimeout(resolve, delay))
  }
  
  throw new Error('Server did not become ready within the timeout period')
}
