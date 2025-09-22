import { describe, it, expect, beforeAll } from '@jest/globals'

const BASE_URL = 'http://localhost:3000'
const API_TIMEOUT = 10000

describe('Authentication Integration Tests', () => {
  beforeAll(async () => {
    // Attendre que le serveur soit prêt
    await waitForServer()
  })

  describe('Sign In Page', () => {
    it('should load sign in page', async () => {
      const response = await fetch(`${BASE_URL}/auth/signin`, {
        method: 'GET',
        headers: {
          'Accept': 'text/html',
        }
      })

      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toContain('text/html')
    }, API_TIMEOUT)
  })

  describe('Sign Up Page', () => {
    it('should load sign up page', async () => {
      const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'GET',
        headers: {
          'Accept': 'text/html',
        }
      })

      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toContain('text/html')
    }, API_TIMEOUT)
  })

  describe('NextAuth Endpoints', () => {
    it('should have NextAuth session endpoint', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/session`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      // Should return 200 with session data (even if empty)
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data).toHaveProperty('user')
    }, API_TIMEOUT)

    it('should have NextAuth providers endpoint', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/providers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data).toHaveProperty('credentials')
    }, API_TIMEOUT)

    it('should have NextAuth CSRF endpoint', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/csrf`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data).toHaveProperty('csrfToken')
    }, API_TIMEOUT)
  })

  describe('Protected Routes', () => {
    it('should redirect unauthenticated users from admin page', async () => {
      const response = await fetch(`${BASE_URL}/admin`, {
        method: 'GET',
        headers: {
          'Accept': 'text/html',
        },
        redirect: 'manual' // Don't follow redirects
      })

      // Should redirect (302) or return 401/403
      expect([302, 401, 403]).toContain(response.status)
    }, API_TIMEOUT)

    it('should redirect unauthenticated users from dashboard', async () => {
      const response = await fetch(`${BASE_URL}/dashboard`, {
        method: 'GET',
        headers: {
          'Accept': 'text/html',
        },
        redirect: 'manual'
      })

      // Should redirect (302) or return 401/403
      expect([302, 401, 403]).toContain(response.status)
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
